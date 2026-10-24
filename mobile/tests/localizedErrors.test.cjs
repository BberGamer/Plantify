// localizedErrors.test.cjs - Kiểm tra lỗi kỹ thuật không lọt ra giao diện và phản hồi API.
const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const loadPureModule = require("./helpers/loadPureModule.cjs");
const getErrorMessage = loadPureModule(path.join(__dirname, "../src/utils/getErrorMessage.js")).default;
const errorHandler = require("../../backend/src/middlewares/error.middleware");

test("network and timeout failures produce Vietnamese messages", () => {
  for (const error of [new Error("Network Error"), new Error("Failed to fetch"), { code: "ERR_NETWORK" }]) {
    assert.equal(getErrorMessage(error), "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
  }
  for (const error of [new Error("timeout of 30000ms exceeded"), { code: "ECONNABORTED" }, { code: "ETIMEDOUT" }]) {
    assert.equal(getErrorMessage(error), "Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.");
  }
});

test("localized business errors remain readable, while unknown technical errors use the operation fallback", () => {
  assert.equal(getErrorMessage({ response: { status: 400, data: { message: "Mã xác thực đã hết hạn." } } }), "Mã xác thực đã hết hạn.");
  assert.equal(getErrorMessage(new Error("Không tải lại được")), "Không tải lại được");
  assert.equal(getErrorMessage(new Error("Cannot read properties of undefined"), "Không thể tải danh sách cây."), "Không thể tải danh sách cây.");
  assert.equal(getErrorMessage("Request failed with status code 401", "Đăng nhập thất bại"), "Đăng nhập thất bại");
  assert.equal(getErrorMessage(null, "Không thể lưu hồ sơ."), "Không thể lưu hồ sơ.");
});

test("server failures never display library messages on the client", () => {
  assert.equal(getErrorMessage({ response: { status: 500, data: { message: "MongoServerError: duplicate key" } } }), "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.");
});

test("API errors hide internal details and preserve localized business failures", (t) => {
  t.mock.method(console, "error", () => {});
  const respond = (error) => {
    const result = {};
    const response = {
      status(status) { result.status = status; return this; },
      json(body) { result.body = body; return this; },
    };
    errorHandler(error, { method: "POST", url: "/auth/login" }, response, () => {});
    return result;
  };
  const internal = respond(new Error("SMTP authentication failed: internal-server.example"));
  assert.equal(internal.status, 500);
  assert.equal(internal.body.message, "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.");
  assert.equal(internal.body.data, null);
  const business = respond(Object.assign(new Error("Tài khoản đã bị khóa."), { statusCode: 403 }));
  assert.equal(business.status, 403);
  assert.equal(business.body.message, "Tài khoản đã bị khóa.");
  const english = respond(Object.assign(new Error("Invalid request payload"), { statusCode: 400 }));
  assert.equal(english.status, 400);
  assert.equal(english.body.message, "Yêu cầu chưa hợp lệ. Vui lòng kiểm tra lại thông tin.");
  for (const [details, status] of [[{ name: "CastError" }, 400], [{ name: "ValidationError" }, 400], [{ code: 11000 }, 500]]) {
    const result = respond(Object.assign(new Error("Technical database details"), details));
    assert.equal(result.status, status);
    assert.ok(/[\u00C0-\u024F\u1E00-\u1EFF]/.test(result.body.message));
    assert.ok(!result.body.message.includes("Technical"));
  }
});
