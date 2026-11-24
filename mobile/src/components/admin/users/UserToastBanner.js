import NoticeBanner from "../../common/NoticeBanner";

import { StyleSheet } from "react-native";

import { garden } from "./theme";

export default function UserToastBanner({ toast }) {
  if (!toast?.visible) return null;

  const isError = toast.type === "error";

  return <NoticeBanner tone={isError ? "error" : "success"} message={toast.message} style={styles.toastBanner} />;
}

const styles = StyleSheet.create({
  toastBanner: {
    position: "absolute",
    top: 56,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  toastSuccess: {
    backgroundColor: garden.moss,
  },
  toastError: {
    backgroundColor: garden.terracotta,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: garden.white,
    justifyContent: "center",
    alignItems: "center",
  },
  toastText: {
    flex: 1,
    color: garden.white,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },
});
