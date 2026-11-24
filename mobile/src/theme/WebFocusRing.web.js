import { useEffect } from "react";
import { colors } from "./colors";

// Chỉ bổ sung focus bàn phím bên trong app và portal Paper, không đổi layout/global reset.
export default function WebFocusRing() {
  useEffect(() => {
    const sheet = document.createElement("style");
    sheet.dataset.plantifyFocus = "true";
    sheet.textContent = `
      #plantify-app :is(button, [role="button"], [role="checkbox"], [role="link"], a):focus-visible {
        outline: 2px solid ${colors.primary};
        outline-offset: 2px;
        box-shadow: inset 0 0 0 2px ${colors.white}, inset 0 0 0 4px ${colors.primary};
      }
    `;
    document.head.appendChild(sheet);
    return () => sheet.remove();
  }, []);
  return null;
}
