import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
export const labels = {
  pending: "Chờ xử lý",
  success: "Thành công",
  rejected: "Từ chối",
  expired: "Hết hạn",
  accepted: "Đã tiếp nhận",
  review: "Cần đối soát",
  credited: "Đã cộng ví",
  already_processed: "Đã xử lý",
  active: "Đang hoạt động",
  inactive: "Đã ẩn",
  approved: "Đã duyệt",
  deprecated: "Ngừng sử dụng",
};
export const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );
export const date = (value) =>
  value
    ? new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
    : "—";
export function Badge({ value }) {
  return (
    <span className={"badge " + value}>{labels[value] || value || "—"}</span>
  );
}
export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Notice({ children }) {
  return children ? (
    <div className="notice" role="alert">
      {children}
    </div>
  ) : null;
}
export function Table({ columns, rows, loading, error }) {
  if (loading)
    return (
      <div className="empty" role="status">
        Đang tải dữ liệu…
      </div>
    );
  if (error) return <Notice>{error}</Notice>;
  if (!rows.length)
    return <div className="empty">Chưa có dữ liệu phù hợp.</div>;
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.title}>{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id}>
              {columns.map((c) => (
                <td key={c.title}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Pager({ data, page, setPage }) {
  const pages = data?.totalPages ?? data?.pagination?.totalPages ?? 1;
  return (
    <div className="pager">
      <span>{data?.total ?? data?.pagination?.totalUsers ?? "—"} bản ghi</span>
      <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
        Trước
      </button>
      <span>
        Trang {page}/{Math.max(1, pages)}
      </span>
      <button disabled={page >= pages} onClick={() => setPage(page + 1)}>
        Sau
      </button>
    </div>
  );
}
export function Modal({ title, onClose, children, busy }) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    element.showModal();
    return () => {
      if (element.open) element.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <header>
        <h2>{title}</h2>
        <button disabled={busy} aria-label="Đóng" onClick={onClose}>
          <X size={18} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function ActionForm({
  title,
  onClose,
  onSubmit,
  children,
  submit = "Lưu thay đổi",
  externalBusy = false,
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false);
  return (
    <Modal title={title} onClose={onClose} busy={busy || externalBusy}>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (lock.current || externalBusy) return;
          lock.current = true;
          setBusy(true);
          setError("");
          try {
            await onSubmit();
            onClose();
          } catch (e) {
            setError(e.message);
          } finally {
            lock.current = false;
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={busy || externalBusy}>
          {children}
          <Notice>{error}</Notice>
          <footer>
            <button type="button" disabled={externalBusy} onClick={onClose}>
              Hủy
            </button>
            <button className="primary" disabled={busy || externalBusy}>
              {busy ? "Đang xử lý…" : submit}
            </button>
          </footer>
        </fieldset>
      </form>
    </Modal>
  );
}
