import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  UserPlus
} from "lucide-react";
import { AdminUsersCreateDialogView } from "@/features/auth/components/admin-users-create/AdminUsersCreateDialogView";

function AdminUsersCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  createUserForm,
  onFormChange,
  onRoleChange,
  submitting,
  showPassword,
  onToggleShowPassword,
  showConfirmPassword,
  onToggleShowConfirmPassword
}) {
  return (
    <AdminUsersCreateDialogView createUserForm={createUserForm} onFormChange={onFormChange} onOpenChange={onOpenChange} onRoleChange={onRoleChange} onSubmit={onSubmit} onToggleShowConfirmPassword={onToggleShowConfirmPassword} onToggleShowPassword={onToggleShowPassword} open={open} showConfirmPassword={showConfirmPassword} showPassword={showPassword} submitting={submitting} />
  );
}

export { AdminUsersCreateDialog };
