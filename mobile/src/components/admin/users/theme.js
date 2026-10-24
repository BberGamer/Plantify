import { getRoleLabel } from "../../../constants/roles";
import { colors } from "../../../theme/colors";

// Bang mau "khu vuon" dung chung cho man hinh quan ly nguoi dung
export const garden = {
  forest: colors.primary, // #144D37 - mau la dam
  forestDark: colors.primaryDark,
  moss: colors.primaryLight, // #247855
  sprout: "#3FA673",
  mint: colors.lightMint, // #EDF7F1
  sage: "#DCEBE1",
  cream: "#F6F8F1", // nen giay tai che
  bark: "#7A5230", // mau vo cay
  barkBg: "#F5EDE4",
  terracotta: "#B4532A", // mau chau dat nung
  terracottaBg: "#FBEDE6",
  sun: "#B7791F",
  sunBg: "#FDF5E3",
  ink: colors.textPrimary,
  inkSoft: "#4B6357",
  muted: "#7C8B83",
  line: "#E1EAE3",
  white: "#FFFFFF",
  overlay: "rgba(13, 56, 39, 0.55)",
};

// Moi vai tro gan voi mot hinh anh cay: mam non - cay hoa - cay co thu
export const ROLE_META = {
  customer: {
    label: getRoleLabel("customer"),
    hint: "Người trồng cây",
    icon: "leaf",
    color: garden.moss,
    bg: garden.mint,
  },
  manager: {
    label: getRoleLabel("manager"),
    hint: "Người chăm vườn",
    icon: "flower",
    color: garden.sun,
    bg: garden.sunBg,
  },
  admin: {
    label: getRoleLabel("admin"),
    hint: "Người giữ rừng",
    icon: "shield-checkmark",
    color: garden.forest,
    bg: garden.sage,
  },
};

export const getRoleMeta = (role) => ROLE_META[role] || ROLE_META.customer;

// Hinh chiec la: bo tron 2 goc doi dien
export const leafShape = (size, tight = 0.18) => ({
  width: size,
  height: size,
  borderTopLeftRadius: size / 2,
  borderBottomRightRadius: size / 2,
  borderTopRightRadius: size * tight,
  borderBottomLeftRadius: size * tight,
});
