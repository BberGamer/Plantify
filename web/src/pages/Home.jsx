import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "../auth/Auth";
export default function Home() {
  const { user } = useAuth();
  const entries =
    user.role === "admin"
      ? [
          ["users", "Người dùng", "Quản lý tài khoản và quyền truy cập."],
          [
            "finance",
            "Tài chính",
            "Theo dõi đơn nạp, giao dịch và đối soát SePay.",
          ],
        ]
      : [
          ["plants", "Cây trồng", "Cập nhật danh mục và liên kết nhãn AI."],
          ["diseases", "Bệnh cây", "Quản lý triệu chứng và các cây liên quan."],
          [
            "protocols",
            "Phác đồ điều trị",
            "Tải DOCX để tạo phác đồ điều trị.",
          ],
          ["feedback", "Đóng góp ý kiến", "Tiếp nhận phản hồi từ người dùng."],
        ];
  return (
    <>
      <p className="eyebrow">PLANTIFY / TỔNG QUAN</p>
      <h1>Xin chào, {user.fullName}</h1>
      <p className="muted">Chọn khu vực để bắt đầu công việc hôm nay.</p>
      <div className="home-grid">
        {entries.map(([path, title, description], i) => (
          <Link className="home-card" to={path} key={path}>
            <span className="card-number">0{i + 1}</span>
            <ArrowUpRight />
            <h2>{title}</h2>
            <p>{description}</p>
            <span>Mở khu vực quản lý →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
