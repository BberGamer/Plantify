import EmptyState from "../../common/EmptyState";
export default function UserEmptyState({ title = "Không tìm thấy người dùng", subtitle = "Không tìm thấy người dùng phù hợp. Hãy thử đổi từ khóa hoặc bộ lọc nhé." }) {
  return <EmptyState icon="people-outline" title={title} description={subtitle} />;
}
