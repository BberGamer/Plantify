// DiseaseKnowledgeFields.jsx - Nhóm field kiến thức chăm sóc của bệnh cây
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const KNOWLEDGE_FIELDS = [
  {
    field: "symptoms",
    label: "Triệu chứng",
    placeholder: "Xuất hiện đốm nâu trên lá\nMép lá chuyển vàng",
  },
  {
    field: "causes",
    label: "Nguyên nhân",
    placeholder: "Nấm phát triển khi độ ẩm cao\nLá thường xuyên bị đọng nước",
  },
  {
    field: "treatment",
    label: "Cách điều trị",
    placeholder: "Cắt bỏ lá bệnh\nĐặt cây ở nơi thông thoáng",
  },
  {
    field: "prevention",
    label: "Phòng ngừa",
    placeholder: "Tưới nước ở gốc\nKhử trùng dụng cụ cắt tỉa",
  },
];

/**
 * Hiển thị bốn danh sách kiến thức, mỗi dòng tương ứng một phần tử.
 */
export function DiseaseKnowledgeFields({ form, onFieldChange }) {
  return (
    <section className="space-y-4 border-t pt-5">
      <div>
        <h3 className="text-sm font-semibold">Kho kiến thức chăm sóc</h3>
        <p className="text-xs text-muted-foreground">
          Mỗi dòng được lưu thành một phần tử riêng để frontend render trực tiếp.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {KNOWLEDGE_FIELDS.map((item) => (
          <div key={item.field} className="space-y-2">
            <Label htmlFor={`md-${item.field}`}>{item.label}</Label>
            <Textarea
              id={`md-${item.field}`}
              value={form[item.field]}
              onChange={(event) => onFieldChange(item.field, event.target.value)}
              placeholder={item.placeholder}
              rows={4}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
