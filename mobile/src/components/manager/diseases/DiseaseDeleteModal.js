
import ConfirmDeleteDialog from "../../common/ConfirmDeleteDialog";

export default function DiseaseDeleteModal({ disease, deleting, error, onClose, onConfirm }) {
  return (
    <ConfirmDeleteDialog visible={Boolean(disease)} title="Xóa bệnh cây?" pending={deleting} error={error} onClose={onClose} onConfirm={onConfirm}>
      Bạn có chắc muốn xóa “{disease?.disease_name}”? Bệnh sẽ được gỡ khỏi tất cả cây liên quan. Thao tác này không thể hoàn tác.
    </ConfirmDeleteDialog>
  );
}
