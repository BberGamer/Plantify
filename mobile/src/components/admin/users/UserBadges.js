import StatusPill from "../../common/StatusBadge";
import { garden, getRoleMeta } from "./theme";
export function RoleBadge({ role }) {
  const meta = getRoleMeta(role);
  return <StatusPill label={meta.label} icon={meta.icon} tone={{ color: meta.color, background: meta.bg }} />;
}
export function StatusBadge({ status }) {
  const isActive = status !== false;
  return <StatusPill label={isActive ? "Hoạt động" : "Bị khóa"}
    icon={isActive ? "checkmark-circle-outline" : "lock-closed-outline"}
    tone={{ color: isActive ? garden.moss : garden.terracotta, background: isActive ? garden.mint : garden.terracottaBg }} />;
}
export function GoogleBadge() {
  return <StatusPill label="Google" icon="logo-google" tone={{ color: garden.bark, background: garden.barkBg }} />;
}
