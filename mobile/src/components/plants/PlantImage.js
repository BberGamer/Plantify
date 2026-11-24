import ImageWithFallback from "../common/ImageWithFallback";
export default function PlantImage(props) {
  return <ImageWithFallback {...props} placeholderIcon="leaf-outline" placeholderLabel="Ảnh cây chưa khả dụng" />;
}
