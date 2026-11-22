import api from "./api";
import { Platform } from "react-native";
import { getSessionContext } from "./sessionAccess";

export default async function saveCatalogEntry(method, url, data, photo) {
  const sessionContext = getSessionContext();
  if (!photo) return (await api[method](url, data, { sessionContext })).data;
  const body = new FormData();
  body.append("payload", JSON.stringify(data));
  if (Platform.OS === "web") {
    const blob = await (await fetch(photo.uri)).blob();
    body.append("photo", blob, photo.fileName || "photo.jpg");
  } else {
    body.append("photo", {
      uri: photo.uri,
      name: photo.fileName || "photo.jpg",
      type: photo.mimeType || "image/jpeg",
    });
  }
  const response = await api[method](url, body, {
    sessionContext,
    headers: { "Content-Type": Platform.OS === "web" ? false : "multipart/form-data" },
  });
  return response.data;
}
