import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Leaf,
  Menu,
  Users,
  Wallet,
  Sprout,
  Bug,
  MessageSquare,
  FileText,
  UserRound,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../auth/Auth";
const menus = {
  admin: [
    ["", "Tổng quan", LayoutDashboard],
    ["users", "Người dùng", Users],
    ["finance", "Tài chính", Wallet],
  ],
  manager: [
    ["", "Tổng quan", LayoutDashboard],
    ["plants", "Cây trồng", Sprout],
    ["diseases", "Bệnh cây", Bug],
    ["protocols", "Phác đồ điều trị", FileText],
    ["feedback", "Đóng góp ý kiến", MessageSquare],
  ],
};
export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false),
    [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className={
        "shell " + (collapsed ? "collapsed " : "") + (open ? "menu-open" : "")
      }
    >
      <a className="skip" href="#content">
        Đến nội dung
      </a>
      {open ? (
        <button
          className="scrim"
          aria-label="Đóng menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside>
        <Link className="brand" to={"/" + user.role}>
          <Leaf />
          <span>
            Plantify
            <small>
              {user.role === "admin" ? "Admin Console" : "Manager Console"}
            </small>
          </span>
        </Link>
        <div className="nav-label">KHÔNG GIAN QUẢN LÝ</div>
        <nav>
          {[...menus[user.role], ["profile", "Hồ sơ", UserRound]].map(
            ([path, label, Icon]) => (
              <NavLink
                end={!path}
                key={path}
                to={"/" + user.role + (path ? "/" + path : "")}
                onClick={() => setOpen(false)}
                title={label}
              >
                <Icon size={19} />
                <span>{label}</span>
              </NavLink>
            ),
          )}
        </nav>
        <div className="account">
          <div className="avatar">{user.fullName?.slice(0, 1)}</div>
          <div>
            <strong>{user.fullName}</strong>
            <small>{user.email}</small>
          </div>
          <button
            title="Đăng xuất"
            aria-label="Đăng xuất"
            onClick={() => logout().catch(() => {})}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            aria-label="Mở hoặc thu gọn menu"
            aria-expanded={open || !collapsed}
            onClick={() => {
              setOpen(!open);
              setCollapsed(!collapsed);
            }}
          >
            <Menu size={20} />
          </button>
          <span>
            Quản lý hệ thống <span className="separator">/</span>{" "}
            <strong>
              {user.role === "admin" ? "Quản trị viên" : "Quản lý nội dung"}
            </strong>
          </span>
          <span className="environment">PLANTIFY</span>
        </header>
        <main id="content">
          <Outlet />
        </main>
        <div className="footnote">Plantify · Không gian quản lý</div>
      </div>
    </div>
  );
}
