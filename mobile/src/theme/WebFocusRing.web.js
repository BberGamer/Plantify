import { useEffect } from "react";
import { colors } from "./colors";

// Thiết lập ngôn ngữ và viền focus bên trong app web.
export default function WebFocusRing() {
  useEffect(() => {
    const html = document.documentElement;
    const previousLanguage = html.lang;
    html.lang = "vi";
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
    return () => {
      sheet.remove();
      html.lang = previousLanguage;
    };
  }, []);
  return null;
}
