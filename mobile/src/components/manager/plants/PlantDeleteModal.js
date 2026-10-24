
import ConfirmDeleteDialog from "../../common/ConfirmDeleteDialog";

export default function PlantDeleteModal({ plant, deleting, error, onClose, onConfirm }) {
  return (
    <ConfirmDeleteDialog visible={Boolean(plant)} title="Xóa cây?" pending={deleting} error={error} onClose={onClose} onConfirm={onConfirm}>
      Bạn có chắc muốn xóa {plant?.common_name}?
    </ConfirmDeleteDialog>
  );
}
