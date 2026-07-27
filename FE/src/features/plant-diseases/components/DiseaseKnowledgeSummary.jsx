// DiseaseKnowledgeSummary.jsx - Tóm tắt kiến thức bệnh trong bảng quản lý

const formatKnowledgeList = (value) => (
  Array.isArray(value) ? value.join(", ") : value
);

const KNOWLEDGE_ROWS = [
  {
    key: "symptoms",
    label: "Triệu chứng",
    labelClassName: "text-amber-700",
    getValue: (disease) => disease.symptoms,
  },
  {
    key: "causes",
    label: "Nguyên nhân",
    labelClassName: "text-rose-700",
    getValue: (disease) => disease.causes,
  },
  {
    key: "treatments",
    label: "Điều trị",
    labelClassName: "text-blue-700",
    getValue: (disease) => disease.treatments ?? disease.treatment,
  },
  {
    key: "preventions",
    label: "Phòng ngừa",
    labelClassName: "text-emerald-700",
    getValue: (disease) => disease.preventions ?? disease.prevention,
  },
];

/**
 * Hiển thị bốn nhóm kiến thức bệnh theo dạng nhãn - nội dung.
 */
export function DiseaseKnowledgeSummary({ disease }) {
  return (
    <div className="space-y-1.5 py-1 text-xs leading-5">
      {KNOWLEDGE_ROWS.map((row) => {
        const value = formatKnowledgeList(row.getValue(disease));

        return (
          <p key={row.key} className="line-clamp-2 break-words" title={value}>
            <span className={`font-semibold ${row.labelClassName}`}>
              {row.label}:
            </span>{" "}
            <span className="text-muted-foreground">
              {value || "Chưa có thông tin"}
            </span>
          </p>
        );
      })}
    </div>
  );
}
