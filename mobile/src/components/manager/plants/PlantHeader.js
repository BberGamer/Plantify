import ListHeader from "../../common/ListHeader";
export default function PlantHeader({ count, total }) {
  return <ListHeader title="Cây trồng" count={total} subtitle={`Hiển thị ${count}/${total} cây trồng`} />;
}
