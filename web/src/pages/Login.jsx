import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { useAuth } from "../auth/Auth";
import { Field, Notice } from "../components/UI";
export default function Login() {
  const { user, login, ready } = useAuth();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const lock = useRef(false);
  if (!ready) return <div className="loading">Đang tải…</div>;
  if (user) return <Navigate to={"/" + user.role} replace />;
  return (
    <div className="login">
      <section className="login-intro">
        <div className="brand">
          <Leaf /> Plantify
        </div>
        <div>
          <p>KHÔNG GIAN QUẢN LÝ</p>
          <h1>
            Chăm chút dữ liệu.
            <br />
            Nuôi dưỡng trải nghiệm.
          </h1>
          <p>Quản lý người dùng, danh mục cây và các hoạt động của Plantify.</p>
        </div>
        <small>Dành cho Admin và Manager</small>
      </section>
      <section className="login-form">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (lock.current) return;
            lock.current = true;
            setBusy(true);
            setError("");
            try {
              await login(email.trim(), password);
            } catch (e) {
              setError(e.message);
            } finally {
              lock.current = false;
              setBusy(false);
            }
          }}
        >
          <p className="eyebrow">PLANTIFY CONSOLE</p>
          <h1>Đăng nhập</h1>
          <p className="muted">Sử dụng tài khoản quản trị của bạn.</p>
          <Field label="Địa chỉ email">
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Mật khẩu">
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Notice>{error}</Notice>
          <button className="primary" disabled={busy}>
            {busy ? "Đang đăng nhập…" : "Đăng nhập vào quản lý"}
          </button>
        </form>
      </section>
    </div>
  );
}
