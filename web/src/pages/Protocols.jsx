import { useEffect, useRef, useState } from "react";
import { api, allItems } from "../services/api";
import { Field, Notice } from "../components/UI";

const maxDocumentBytes = 10 * 1024 * 1024;

export default function Protocols() {
  const [catalog, setCatalog] = useState(null);
  const [version, setVersion] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [diseaseId, setDiseaseId] = useState("");
  const [plantIds, setPlantIds] = useState([]);
  const [document, setDocument] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    let current = true;
    setLoadError("");
    Promise.all([allItems("/diseases/manager"), allItems("/plants/manager")])
      .then(([diseases, plants]) => {
        if (!current) return;
        setCatalog({
          diseases: diseases.filter((disease) => disease.status === "active"),
          plants: plants.filter((plant) => plant.is_published),
        });
      })
      .catch((failure) => {
        if (current) setLoadError(failure.message);
      });
    return () => { current = false; };
  }, [version]);

  const disease = catalog?.diseases.find((item) => item._id === diseaseId);
  const linked = new Set((disease?.plant_ids ?? disease?.plants ?? []).map((plant) => plant._id || plant));
  const plants = (catalog?.plants ?? []).filter((plant) => linked.has(plant._id));
  const canSubmit = !!disease && plantIds.length > 0 && !!document && !busy;

  function chooseDocument(event) {
    const file = event.target.files[0];
    setError("");
    setDocument(null);
    if (!file) return;
    if (!/\.docx$/i.test(file.name) || !file.size || file.size > maxDocumentBytes) {
      event.target.value = "";
      setError("Chỉ nhận file DOCX có nội dung, tối đa 10 MB.");
      return;
    }
    setDocument(file);
  }

  async function submit(event) {
    event.preventDefault();
    if (!canSubmit || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("disease_id", diseaseId);
      body.append("plant_ids", JSON.stringify(plantIds));
      body.append("document", document);
      const created = await api("/treatments/manager/ai-draft", { method: "POST", body });
      if (!created?._id) throw new Error("Dữ liệu phác đồ trả về không hợp lệ.");
      setResult(created);
    } catch (failure) {
      setError(failure.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  function reset() {
    setDiseaseId("");
    setPlantIds([]);
    setDocument(null);
    setResult(null);
    setError("");
  }

  return (
    <>
      <h1>Tạo phác đồ từ DOCX</h1>
      <p className="muted">AI đọc tài liệu, tạo và kích hoạt phác đồ cho cây và bệnh đã chọn.</p>
      {loadError ? (
        <>
          <Notice>{loadError}</Notice>
          <button onClick={() => setVersion((value) => value + 1)}>Tải lại danh mục</button>
        </>
      ) : !catalog ? (
        <p role="status">Đang tải danh mục cây và bệnh…</p>
      ) : result ? (
        <section className="panel protocol-upload" role="status">
          <h2>Đã tạo và kích hoạt phác đồ</h2>
          <p><strong>{result.protocol_name}</strong></p>
          <p>{result.description}</p>
          <p>{result.duration_days} ngày · {result.stages?.length ?? 0} công việc</p>
          <button onClick={reset}>Tạo phác đồ khác</button>
        </section>
      ) : (
        <form className="panel protocol-upload" onSubmit={submit}>
          <fieldset disabled={busy}>
            <Field label="Bệnh cây">
              <select value={diseaseId} required onChange={(event) => {
                setDiseaseId(event.target.value);
                setPlantIds([]);
                setError("");
              }}>
                <option value="">Chọn bệnh</option>
                {catalog.diseases.map((item) => (
                  <option key={item._id} value={item._id}>{item.disease_name}</option>
                ))}
              </select>
            </Field>
            <fieldset className="protocol-plants">
              <legend>Cây áp dụng</legend>
              {!disease ? <p>Chọn bệnh để xem cây đã liên kết.</p> : !plants.length ? (
                <p>Bệnh này chưa liên kết với cây đang công khai.</p>
              ) : plants.map((plant) => (
                <label key={plant._id}>
                  <input type="checkbox" checked={plantIds.includes(plant._id)}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setPlantIds((current) => checked
                        ? [...current, plant._id] : current.filter((id) => id !== plant._id));
                    }} />
                  {plant.common_name}
                </label>
              ))}
            </fieldset>
            <Field label="Tài liệu DOCX">
              <input type="file" accept=".docx" required onChange={chooseDocument} />
            </Field>
            <p className="muted">Tệp tối đa 10 MB. Ghi rõ tần suất, liều lượng và lưu ý an toàn trong tài liệu.</p>
            <Notice>{error}</Notice>
            <button className="primary" disabled={!canSubmit}>
              {busy ? "Đang đọc DOCX và tạo phác đồ…" : "Đọc DOCX và tạo phác đồ"}
            </button>
          </fieldset>
        </form>
      )}
    </>
  );
}
