import api from "./api";
import { Platform } from "react-native";
import { getSessionContext } from "./sessionAccess";

export default async function saveCatalogEntry(method, url, data) {
  const sessionContext = getSessionContext();
  const payload = { ...data };
  const files = data.image_urls?.flatMap((row) => row.photo ? [row.photo] : []) || [];
  if (data.image_urls)
    payload.image_urls = data.image_urls.map((row) => row.photo ? null : row.image_url);
  if (!files.length)
    return (await api[method](url, payload, { sessionContext })).data;

  const body = new FormData();
  body.append("payload", JSON.stringify(payload));
  for (const asset of files) {
    if (Platform.OS === "web") {
      const blob = asset.file || await (await fetch(asset.uri)).blob();
      body.append("photos", blob, asset.fileName || "photo.jpg");
    } else {
      body.append("photos", {
        uri: asset.uri,
        name: asset.fileName || "photo.jpg",
        type: asset.mimeType || "image/jpeg",
      });
    }
  }
  const response = await api[method](url, body, {
    sessionContext,
    timeout: 90000,
    headers: {
      "Content-Type": Platform.OS === "web" ? false : "multipart/form-data",
    },
  });
  return response.data;
}
