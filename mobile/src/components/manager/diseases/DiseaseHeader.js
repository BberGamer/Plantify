import ListHeader from "../../common/ListHeader";
export default function DiseaseHeader({ count, total }) {
  return <ListHeader title="Bệnh cây" count={total} subtitle={`Hiển thị ${count}/${total} bệnh cây`} />;
}
