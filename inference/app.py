import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from starlette.exceptions import HTTPException

from .config import Settings
from .predictor import InferenceError, PlantClassifier


LOGGER = logging.getLogger(__name__)


def error_response(status, code, message):
    return JSONResponse(
        status_code=status,
        content={"success": False, "message": message, "data": None, "code": code},
    )


class UploadBodyLimit:
    """Giới hạn cả request trước khi multipart parser tạo file tạm."""

    def __init__(self, app, max_bytes):
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope["method"] != "POST" or scope["path"] != "/predict":
            return await self.app(scope, receive, send)
        headers = dict(scope.get("headers", []))
        try:
            length = int(headers.get(b"content-length", b"0"))
            if length < 0:
                raise ValueError
        except ValueError:
            return await error_response(400, "INVALID_REQUEST", "Content-Length không hợp lệ.")(scope, receive, send)
        if length > self.max_bytes:
            return await error_response(413, "IMAGE_TOO_LARGE", "Ảnh tải lên quá lớn.")(scope, receive, send)
        content = bytearray()
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            chunk = message.get("body", b"")
            if len(content) + len(chunk) > self.max_bytes:
                return await error_response(413, "IMAGE_TOO_LARGE", "Ảnh tải lên quá lớn.")(scope, receive, send)
            content.extend(chunk)
            if not message.get("more_body", False):
                break
        delivered = False

        async def bounded_receive():
            nonlocal delivered
            if not delivered:
                delivered = True
                return {"type": "http.request", "body": bytes(content), "more_body": False}
            return await receive()

        await self.app(scope, bounded_receive, send)


def create_app(settings=None, predictor_factory=PlantClassifier):
    settings = settings or Settings.from_env()

    @asynccontextmanager
    async def lifespan(app):
        app.state.classifier = await run_in_threadpool(predictor_factory, settings)
        try:
            yield
        finally:
            app.state.classifier = None

    app = FastAPI(title="Plantify Inference", version="1.0.0", lifespan=lifespan)
    app.state.classifier = None
    app.add_middleware(UploadBodyLimit, max_bytes=settings.max_file_bytes + 64 * 1024)

    @app.exception_handler(InferenceError)
    async def handle_inference_error(request, exc):
        return error_response(exc.status, exc.code, exc.message)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request, exc):
        return error_response(422, "INVALID_UPLOAD", "Gửi đúng một file ảnh với tên trường photo.")

    @app.exception_handler(HTTPException)
    async def handle_http_error(request, exc):
        if exc.status_code == 404:
            return error_response(404, "NOT_FOUND", "Endpoint không tồn tại.")
        return error_response(exc.status_code, "INVALID_REQUEST", "Yêu cầu không hợp lệ.")

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request, exc):
        LOGGER.error("Lỗi suy luận không dự kiến", exc_info=(type(exc), exc, exc.__traceback__))
        return error_response(500, "INFERENCE_FAILED", "Không thể phân tích ảnh. Vui lòng thử lại.")

    @app.get("/health")
    async def health():
        classifier = app.state.classifier
        if classifier is None:
            raise InferenceError(503, "MODEL_NOT_READY", "Model chưa sẵn sàng.")
        return {"success": True, "message": "Model đã sẵn sàng.",
                "data": {"status": "ready", "model": classifier.info}}

    @app.post("/predict")
    async def predict(request: Request, photo: UploadFile = File(description="Ảnh JPEG/PNG/WebP, tối đa 10 MiB")):
        form = await request.form()
        try:
            if len(form.multi_items()) != 1 or len(form.getlist("photo")) != 1:
                raise InferenceError(422, "INVALID_UPLOAD", "Chỉ gửi đúng một file ảnh trong trường photo.")
            classifier = app.state.classifier
            if classifier is None:
                raise InferenceError(503, "MODEL_NOT_READY", "Model chưa sẵn sàng.")
            content = await photo.read(settings.max_file_bytes + 1)
            data = await run_in_threadpool(classifier.predict, content, photo.content_type)
            return {"success": True, "message": "Phân tích ảnh thành công.", "data": data}
        finally:
            await form.close()

    return app


app = create_app()
