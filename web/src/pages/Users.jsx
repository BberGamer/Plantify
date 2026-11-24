import { useState } from "react";
import useResource from "../hooks/useResource";
import { api, itemsOf, params } from "../services/api";
import { ActionForm, Badge, Field, Pager, Table } from "../components/UI";
export default function Users() {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [role, setRole] = useState(""),
    [version, setVersion] = useState(0),
    [draft, setDraft] = useState(null);
  const state = useResource(
    "/users" + params({ page, limit: 20, search, role }),
    version,
  );
  const reload = () => setVersion((v) => v + 1);
  return (
    <>
      <p className="eyebrow">ADMIN / TÀI KHOẢN</p>
      <div className="page-heading">
        <h1>Người dùng</h1>
        <button
          className="primary"
          onClick={() =>
            setDraft({
              fullName: "",
              email: "",
              phone: "",
              password: "",
              role: "customer",
              status: true,
            })
          }
        >
          + Thêm tài khoản
        </button>
      </div>
      <div className="toolbar">
        <input
          aria-label="Tìm người dùng"
          placeholder="Tìm họ tên, email, số điện thoại…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          aria-label="Vai trò"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả vai trò</option>
          {["customer", "manager", "admin"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <button onClick={reload}>Tải lại</button>
      </div>
      <div className="panel">
        <Table
          {...state}
          rows={itemsOf(state.data)}
          columns={[
            {
              title: "Người dùng",
              render: (r) => (
                <>
                  <strong>{r.fullName}</strong>
                  <small>{r.email}</small>
                </>
              ),
            },
            { title: "Số điện thoại", render: (r) => r.phone || "—" },
            { title: "Vai trò", render: (r) => r.role },
            {
              title: "Trạng thái",
              render: (r) => <Badge value={r.status ? "active" : "inactive"} />,
            },
            {
              title: "Thao tác",
              render: (r) => (
                <button
                  disabled={r.role === "admin"}
                  onClick={() => setDraft({ ...r, reason: "" })}
                >
                  Chỉnh sửa
                </button>
              ),
            },
          ]}
        />
        <Pager data={state.data} page={page} setPage={setPage} />
      </div>
      {draft ? (
        <ActionForm
          title={draft._id ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
          onClose={() => setDraft(null)}
          onSubmit={async () => {
            const body = draft._id
              ? {
                  fullName: draft.fullName,
                  phone: draft.phone,
                  role: draft.role,
                  status: draft.status,
                  ...(!draft.status ? { reason: draft.reason } : {}),
                }
              : {
                  fullName: draft.fullName,
                  email: draft.email,
                  phone: draft.phone,
                  password: draft.password,
                  role: draft.role,
                };
            await api("/users" + (draft._id ? "/" + draft._id : ""), {
              method: draft._id ? "PATCH" : "POST",
              body,
            });
            reload();
          }}
        >
          {[
            "fullName",
            "email",
            "phone",
            ...(!draft._id ? ["password"] : []),
          ].map((key, i) => (
            <Field
              key={key}
              label={
                {
                  fullName: "Họ tên",
                  email: "Email",
                  phone: "Số điện thoại",
                  password: "Mật khẩu",
                }[key]
              }
            >
              <input
                disabled={draft._id && key === "email"}
                required={key !== "phone"}
                type={
                  key === "password"
                    ? "password"
                    : key === "email"
                      ? "email"
                      : "text"
                }
                value={draft[key] || ""}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              />
            </Field>
          ))}
          <Field label="Vai trò">
            <select
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            >
              {["customer", "manager", "admin"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          {draft._id ? (
            <>
              <Field label="Trạng thái">
                <select
                  value={String(draft.status)}
                  onChange={(e) =>
                    setDraft({ ...draft, status: e.target.value === "true" })
                  }
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Khóa tài khoản</option>
                </select>
              </Field>
              {!draft.status ? (
                <Field label="Lý do khóa">
                  <textarea
                    required
                    maxLength={500}
                    value={draft.reason}
                    onChange={(e) =>
                      setDraft({ ...draft, reason: e.target.value })
                    }
                  />
                </Field>
              ) : null}
            </>
          ) : null}
        </ActionForm>
      ) : null}
    </>
  );
}
