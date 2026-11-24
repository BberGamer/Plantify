import { useState } from "react";
import { api, itemsOf, params } from "../services/api";
import useResource from "../hooks/useResource";
import {
  ActionForm,
  Badge,
  Field,
  Pager,
  Table,
  date,
  money,
} from "../components/UI";
export default function Finance() {
  const [kind, setKind] = useState("orders"),
    [filter, setFilter] = useState(""),
    [userId, setUserId] = useState(""),
    [queryUser, setQueryUser] = useState(""),
    [page, setPage] = useState(1),
    [version, setVersion] = useState(0),
    [draft, setDraft] = useState(null);
  const state = useResource(
    "/commerce/admin/" +
      kind +
      params({
        page,
        [kind === "transactions" ? "type" : "status"]: filter,
        ...(kind !== "events" ? { user_id: queryUser } : {}),
      }),
    version,
  );
  const reload = () => setVersion((v) => v + 1);
  const options =
    kind === "orders"
      ? ["pending", "success", "rejected"]
      : kind === "events"
        ? ["review", "credited", "already_processed"]
        : ["topup", "purchase", "adjustment"];
  return (
    <>
      <p className="eyebrow">ADMIN / TÀI CHÍNH</p>
      <div className="page-heading">
        <h1>Tài chính</h1>
        <button
          className="primary"
          onClick={() =>
            setDraft({
              kind: "adjustment",
              user_id: "",
              amount: 10000,
              reason: "",
              request_key: crypto.randomUUID(),
            })
          }
        >
          Cộng số dư
        </button>
      </div>
      <div className="tabs">
        {[
          ["orders", "Đơn nạp"],
          ["transactions", "Lịch sử giao dịch"],
          ["events", "Đối soát SePay"],
        ].map(([key, label]) => (
          <button
            className={kind === key ? "selected" : ""}
            key={key}
            onClick={() => {
              setKind(key);
              setPage(1);
              setFilter("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="toolbar">
        <select
          aria-label="Bộ lọc trạng thái"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả</option>
          {options.map((s) => (
            <option key={s} value={s}>
              {
                {
                  pending: "Chờ xử lý",
                  success: "Thành công",
                  rejected: "Từ chối",
                  review: "Cần đối soát",
                  credited: "Đã cộng",
                  already_processed: "Đã xử lý",
                  topup: "Nạp ví",
                  purchase: "Mua VIP",
                  adjustment: "Admin cộng tiền",
                }[s]
              }
            </option>
          ))}
        </select>
        {kind !== "events" ? (
          <form
            className="inline"
            onSubmit={(e) => {
              e.preventDefault();
              setQueryUser(userId);
              setPage(1);
            }}
          >
            <input
              aria-label="ID người dùng"
              placeholder="Lọc theo ID người dùng"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <button>Lọc</button>
          </form>
        ) : null}
        <button onClick={reload}>Tải lại</button>
      </div>
      <div className="panel">
        <Table
          {...state}
          rows={itemsOf(state.data)}
          columns={[
            {
              title: "Đơn / giao dịch",
              render: (r) => (
                <>
                  <strong>{r.code || r.plan || r.provider_id || r.type}</strong>
                  <small>{r.user_id || r.order_id || "—"}</small>
                </>
              ),
            },
            {
              title: "Số tiền",
              render: (r) => <strong>{money(r.amount)}</strong>,
            },
            {
              title: "Trạng thái",
              render: (r) => <Badge value={r.status || "success"} />,
            },
            {
              title: "Thời gian",
              render: (r) => date(r.created_at || r.createdAt),
            },
            {
              title: "Nội dung / lý do",
              render: (r) => r.reason || r.content || "—",
            },
            {
              title: "Xử lý",
              render: (r) =>
                kind === "orders" && r.status === "pending" ? (
                  <button
                    onClick={() =>
                      setDraft({
                        ...r,
                        kind: "review",
                        status: "success",
                        reason: "",
                      })
                    }
                  >
                    Duyệt đơn
                  </button>
                ) : (
                  <span className="muted">Đã ghi nhận</span>
                ),
            },
          ]}
        />
        <Pager data={state.data} page={page} setPage={setPage} />
      </div>
      {draft ? (
        <ActionForm
          title={
            draft.kind === "review"
              ? "Xử lý đơn " + draft.code
              : "Cộng số dư thủ công"
          }
          onClose={() => setDraft(null)}
          onSubmit={async () => {
            await api(
              "/commerce/admin/" +
                (draft.kind === "review"
                  ? "orders/" + draft._id
                  : "adjustments"),
              {
                method: draft.kind === "review" ? "PATCH" : "POST",
                body:
                  draft.kind === "review"
                    ? { status: draft.status, reason: draft.reason }
                    : {
                        user_id: draft.user_id,
                        amount: Number(draft.amount),
                        reason: draft.reason,
                        request_key: draft.request_key,
                      },
              },
            );
            reload();
          }}
        >
          {draft.kind === "review" ? (
            <>
              <p>
                Đơn đã xử lý không thể thay đổi lại. Chỉ xác nhận thành công khi
                đã kiểm tra tiền thực nhận.
              </p>
              <Field label="Kết quả">
                <select
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({ ...draft, status: e.target.value })
                  }
                >
                  <option value="success">
                    Thành công · cộng {money(draft.amount)}
                  </option>
                  <option value="rejected">Từ chối</option>
                </select>
              </Field>
            </>
          ) : (
            <>
              <Field label="ID người dùng">
                <input
                  required
                  pattern="[a-fA-F0-9]{24}"
                  value={draft.user_id}
                  onChange={(e) =>
                    setDraft({ ...draft, user_id: e.target.value })
                  }
                />
              </Field>
              <Field label="Số tiền (VND)">
                <input
                  type="number"
                  required
                  min="10000"
                  max="10000000"
                  step="1"
                  value={draft.amount}
                  onChange={(e) =>
                    setDraft({ ...draft, amount: e.target.value })
                  }
                />
              </Field>
            </>
          )}
          <Field label="Lý do bắt buộc">
            <textarea
              required
              minLength={5}
              maxLength={500}
              value={draft.reason}
              onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
            />
          </Field>
        </ActionForm>
      ) : null}
    </>
  );
}
