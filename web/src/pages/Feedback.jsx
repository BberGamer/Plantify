import { useEffect, useState } from "react";
import { api, itemsOf, params } from "../services/api";
import useResource from "../hooks/useResource";
import {
  ActionForm,
  Badge,
  Field,
  Notice,
  Pager,
  Table,
  date,
} from "../components/UI";
function ProtectedImage({ path }) {
  const [url, setUrl] = useState(""),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let object;
    api(path, { blob: true, signal: controller.signal })
      .then((blob) => {
        if (!controller.signal.aborted) {
          object = URL.createObjectURL(blob);
          setUrl(object);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => {
      controller.abort();
      if (object) URL.revokeObjectURL(object);
    };
  }, [path]);
  return url ? (
    <a href={url} target="_blank" rel="noreferrer">
      <img
        className="feedback-image"
        alt="Ảnh đóng góp hoặc lịch sử liên kết"
        src={url}
      />
    </a>
  ) : (
    <span>{failed ? "Không tải được ảnh" : "Đang tải ảnh…"}</span>
  );
}
export default function Feedback() {
  const [filters, setFilters] = useState({
      type: "",
      status: "",
      email: "",
      from: "",
      to: "",
    }),
    [query, setQuery] = useState({}),
    [page, setPage] = useState(1),
    [version, setVersion] = useState(0),
    [detail, setDetail] = useState(null),
    [error, setError] = useState("");
  const state = useResource(
    "/feedback/manager" + params({ ...query, page, limit: 20 }),
    version,
  );
  return (
    <>
      <p className="eyebrow">MANAGER / PHẢN HỒI</p>
      <h1>Đóng góp ý kiến</h1>
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(filters);
          setPage(1);
          setVersion((v) => v + 1);
        }}
      >
        <select
          aria-label="Loại đóng góp"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">Tất cả loại</option>
          <option value="diagnosis_feedback">Feedback chẩn đoán</option>
          <option value="proactive_feedback">Feedback chủ động</option>
        </select>
        <select
          aria-label="Trạng thái"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Tất cả trạng thái</option>
          {["pending", "accepted", "rejected"].map((s) => (
            <option key={s} value={s}>
              {
                {
                  pending: "Chờ xử lý",
                  accepted: "Đã tiếp nhận",
                  rejected: "Từ chối",
                }[s]
              }
            </option>
          ))}
        </select>
        <input
          aria-label="Email người gửi"
          type="email"
          placeholder="Email người gửi"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <input
          aria-label="Từ ngày"
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />
        <input
          aria-label="Đến ngày"
          type="date"
          value={filters.to}
          min={filters.from}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />
        <button className="primary">Lọc / Tải lại</button>
      </form>
      <Notice>{error}</Notice>
      <div className="panel">
        <Table
          {...state}
          rows={itemsOf(state.data)}
          columns={[
            {
              title: "Loại",
              render: (r) =>
                r.type === "diagnosis_feedback"
                  ? "Feedback chẩn đoán"
                  : "Feedback chủ động",
            },
            {
              title: "Người gửi",
              render: (r) => (
                <>
                  {r.sender?.fullName}
                  <small>{r.sender?.email}</small>
                </>
              ),
            },
            { title: "Mô tả", render: (r) => r.description },
            { title: "Trạng thái", render: (r) => <Badge value={r.status} /> },
            { title: "Ngày gửi", render: (r) => date(r.created_at) },
            {
              title: "Chi tiết",
              render: (r) => (
                <button
                  onClick={async () => {
                    try {
                      setDetail(await api("/feedback/manager/" + r._id));
                      setError("");
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  Xem / Phản hồi
                </button>
              ),
            },
          ]}
        />
        <Pager data={state.data} page={page} setPage={setPage} />
      </div>
      {detail ? (
        <Review
          key={detail._id}
          detail={detail}
          onClose={() => setDetail(null)}
          onSaved={() => setVersion((v) => v + 1)}
        />
      ) : null}
    </>
  );
}
function Review({ detail, onClose, onSaved }) {
  const [status, setStatus] = useState(
      detail.status === "pending" ? "accepted" : detail.status,
    ),
    [response, setResponse] = useState(detail.response || "");
  return (
    <ActionForm
      title="Chi tiết đóng góp"
      onClose={onClose}
      submit="Gửi phản hồi"
      onSubmit={async () => {
        await api("/feedback/manager/" + detail._id + "/review", {
          method: "PATCH",
          body: { status, response, review_count: detail.review_count },
        });
        onSaved();
      }}
    >
      <p>
        <strong>{detail.sender?.fullName}</strong> · {detail.sender?.email}
      </p>
      <p>{detail.description}</p>
      <Badge value={detail.status} />
      <div className="image-grid">
        {Array.from({ length: detail.image_count }, (_, i) => (
          <ProtectedImage
            key={i}
            path={"/feedback/manager/" + detail._id + "/images/" + i}
          />
        ))}
      </div>
      {detail.diagnosis_id ? (
        <section className="inset">
          <h3>Lịch sử nhận diện / chẩn đoán liên kết</h3>
          <p>Mã: {detail.diagnosis_id}</p>
          {detail.diagnosis ? (
            <>
              <p>
                {detail.diagnosis.prediction?.disease_name ||
                  detail.diagnosis.prediction?.plant_name ||
                  detail.diagnosis.plant_name ||
                  detail.diagnosis.disease_name ||
                  "Kết quả đã lưu"}
              </p>
              <p>Loại kết quả: {detail.diagnosis.result_kind === "plant" ? "Nhận diện cây" : "Chẩn đoán bệnh"}</p>
              <p>Ngày thực hiện: {date(detail.diagnosis.created_at)}</p>
              {typeof detail.diagnosis.confidence === "number" ? <p>Độ tin cậy: {(detail.diagnosis.confidence * 100).toFixed(1)}%</p> : null}
              <ProtectedImage
                path={"/feedback/manager/" + detail._id + "/history-image"}
              />
            </>
          ) : (
            <p>Lịch sử không còn khả dụng.</p>
          )}
        </section>
      ) : null}
      <Field label="Kết quả xử lý">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="accepted">Đã tiếp nhận</option>
          <option value="rejected">Từ chối</option>
        </select>
      </Field>
      <Field label="Nội dung phản hồi">
        <textarea
          required
          maxLength={1000}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
        />
      </Field>
      {detail.review_history?.length ? (
        <details>
          <summary>Lịch sử xử lý</summary>
          {detail.review_history.map((r, i) => (
            <p key={i}>
              {date(r.reviewed_at)} · {r.manager_name} · {r.response}
            </p>
          ))}
        </details>
      ) : null}
    </ActionForm>
  );
}
