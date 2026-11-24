import { useState } from "react";
import { useAuth } from "../auth/Auth";
import { api } from "../services/api";
import { ActionForm, Field } from "../components/UI";
export default function Profile() {
  const { user, setUser } = useAuth();
  const [edit, setEdit] = useState(false),
    [draft, setDraft] = useState({
      fullName: user.fullName,
      phone: user.phone || "",
    });
  return (
    <>
      <p className="eyebrow">TÀI KHOẢN</p>
      <h1>Hồ sơ của tôi</h1>
      <div className="panel profile">
        <div className="avatar large">{user.fullName?.slice(0, 1)}</div>
        <h2>{user.fullName}</h2>
        <p>{user.email}</p>
        <p>{user.phone || "Chưa cập nhật số điện thoại"}</p>
        <p className="muted">Vai trò: {user.role}</p>
        <button className="primary" onClick={() => setEdit(true)}>
          Chỉnh sửa hồ sơ
        </button>
      </div>
      {edit ? (
        <ActionForm
          title="Chỉnh sửa hồ sơ"
          onClose={() => setEdit(false)}
          onSubmit={async () => {
            const result = await api("/auth/me", {
              method: "PATCH",
              body: draft,
            });
            setUser(result.user || result);
          }}
        >
          {["fullName", "phone"].map((k) => (
            <Field
              label={k === "fullName" ? "Họ tên" : "Số điện thoại"}
              key={k}
            >
              <input
                required={k === "fullName"}
                value={draft[k]}
                onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
              />
            </Field>
          ))}
        </ActionForm>
      ) : null}
    </>
  );
}
