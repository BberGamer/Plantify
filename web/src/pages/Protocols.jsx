import { useState } from "react";
import { api, allItems, itemsOf, params } from "../services/api";
import useResource from "../hooks/useResource";
import {
  ActionForm,
  Badge,
  Field,
  Notice,
  Pager,
  Table,
} from "../components/UI";
const idOf = (x) => (typeof x === "object" ? x._id : x);
const newStage = () => ({
  title: "",
  start_day: 1,
  end_day: 1,
  time: "08:00",
  instructions: [],
  dosage_note: "",
  important_note: "",
});
export default function Protocols() {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [version, setVersion] = useState(0),
    [draft, setDraft] = useState(null),
    [error, setError] = useState(""),
    [opening, setOpening] = useState(false);
  const state = useResource(
    "/treatments/manager" + params({ page, limit: 20, search }),
    version,
  );
  const reload = () => setVersion((v) => v + 1);
  const open = async (row) => {
    setOpening(true);
    try {
      const [detail, plants, diseases] = await Promise.all([
        row
          ? api("/treatments/manager/" + row._id)
          : Promise.resolve({
              protocol_name: "",
              description: "",
              disease_id: "",
              plant_ids: [],
              duration_days: 7,
              status: "draft",
              stages: [newStage()],
              approved_instructions: [],
              safety_guidelines: [],
            }),
        allItems("/plants/manager"),
        allItems("/diseases/manager"),
      ]);
      setDraft({
        values: {
          ...detail,
          disease_id: idOf(detail.disease_id || ""),
          plant_ids: (detail.plant_ids || []).map(idOf),
        },
        plants: itemsOf(plants),
        diseases: itemsOf(diseases),
      });
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setOpening(false);
    }
  };
  return (
    <>
      <p className="eyebrow">MANAGER / ĐIỀU TRỊ</p>
      <div className="page-heading">
        <h1>Phác đồ điều trị</h1>
        <button
          className="primary"
          disabled={opening}
          onClick={() => open(null)}
        >
          + Tạo phác đồ
        </button>
      </div>
      <Notice>{error}</Notice>
      <div className="toolbar">
        <input
          aria-label="Tìm phác đồ"
          placeholder="Tìm tên phác đồ…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <button onClick={reload}>Tải lại</button>
      </div>
      <div className="panel">
        <Table
          {...state}
          rows={itemsOf(state.data)}
          columns={[
            {
              title: "Tên phác đồ",
              render: (r) => <strong>{r.protocol_name}</strong>,
            },
            { title: "Bệnh", render: (r) => r.disease_id?.disease_name },
            { title: "Thời lượng", render: (r) => r.duration_days + " ngày" },
            { title: "Trạng thái", render: (r) => <Badge value={r.status} /> },
            {
              title: "Thao tác",
              render: (r) => (
                <button disabled={opening} onClick={() => open(r)}>
                  Xem / Chỉnh sửa
                </button>
              ),
            },
          ]}
        />
        <Pager data={state.data} page={page} setPage={setPage} />
      </div>
      {draft ? (
        <ProtocolForm
          initial={draft}
          onClose={() => setDraft(null)}
          onSaved={reload}
        />
      ) : null}
    </>
  );
}
function ProtocolForm({ initial, onClose, onSaved }) {
  const [values, setValues] = useState(initial.values),
    [document, setDocument] = useState(null),
    [generating, setGenerating] = useState(false),
    [error, setError] = useState("");
  const change = (k, v) => setValues((old) => ({ ...old, [k]: v }));
  const stageChange = (i, k, v) =>
    change(
      "stages",
      values.stages.map((s, index) => (index === i ? { ...s, [k]: v } : s)),
    );
  return (
    <ActionForm
      title={values._id ? "Chỉnh sửa phác đồ" : "Tạo phác đồ điều trị"}
      onClose={onClose}
      externalBusy={generating}
      onSubmit={async () => {
        if (generating) throw new Error("Vui lòng đợi tạo bản nháp AI.");
        const keys = [
          "disease_id",
          "plant_ids",
          "protocol_name",
          "description",
          "duration_days",
          "stages",
          "approved_instructions",
          "safety_guidelines",
          "status",
        ];
        const body = Object.fromEntries(keys.map((k) => [k, values[k]]));
        if (body.status === "deprecated")
          throw new Error("Phác đồ đã ngừng sử dụng.");
        await api(
          "/treatments/manager" + (values._id ? "/" + values._id : ""),
          { method: values._id ? "PUT" : "POST", body },
        );
        onSaved();
      }}
    >
      <Field label="Tên phác đồ">
        <input
          required
          value={values.protocol_name}
          onChange={(e) => change("protocol_name", e.target.value)}
        />
      </Field>
      <Field label="Mô tả">
        <textarea
          required
          value={values.description}
          onChange={(e) => change("description", e.target.value)}
        />
      </Field>
      <div className="form-grid">
        <Field label="Bệnh cây">
          <select
            required
            value={values.disease_id}
            onChange={(e) => change("disease_id", e.target.value)}
          >
            <option value="">Chọn bệnh</option>
            {initial.diseases.map((d) => (
              <option key={d._id} value={d._id}>
                {d.disease_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cây áp dụng">
          <select
            multiple
            required
            value={values.plant_ids}
            onChange={(e) =>
              change(
                "plant_ids",
                Array.from(e.target.selectedOptions, (o) => o.value),
              )
            }
          >
            {initial.plants.map((p) => (
              <option key={p._id} value={p._id}>
                {p.common_name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <section className="inset">
        <h3>Tạo phác đồ bằng AI</h3>
        <p>
          Chọn bệnh và cây áp dụng trước. Có thể đính kèm DOCX. Theo luồng hiện
          tại, thao tác này lưu ngay phác đồ mới và ngừng sử dụng phác đồ đã
          duyệt cùng cây/bệnh. Hãy kiểm tra trước khi xác nhận.
        </p>
        <input
          aria-label="Tài liệu DOCX"
          type="file"
          accept=".docx"
          onChange={(e) => setDocument(e.target.files[0] || null)}
        />
        <button
          type="button"
          disabled={
            generating || !values.disease_id || !values.plant_ids.length
          }
          onClick={async () => {
            if (
              !window.confirm(
                "Tạo và lưu phác đồ AI mới theo cây/bệnh đã chọn?",
              )
            )
              return;
            setGenerating(true);
            setError("");
            try {
              const body = new FormData();
              body.append("disease_id", values.disease_id);
              body.append("plant_ids", JSON.stringify(values.plant_ids));
              if (document) body.append("document", document);
              const result = await api("/treatments/manager/ai-draft", {
                method: "POST",
                body,
              });
              setValues((old) => ({
                ...old,
                ...result,
                _id: result._id,
                disease_id: idOf(result.disease_id),
                plant_ids: result.plant_ids.map(idOf),
              }));
              onSaved();
            } catch (e) {
              setError(e.message);
            } finally {
              setGenerating(false);
            }
          }}
        >
          {generating ? "Đang tạo phác đồ…" : "Tạo và lưu phác đồ AI"}
        </button>
        <Notice>{error}</Notice>
      </section>
      <div className="form-grid">
        <Field label="Thời lượng (ngày)">
          <input
            type="number"
            required
            min="1"
            max="365"
            value={values.duration_days}
            onChange={(e) => change("duration_days", Number(e.target.value))}
          />
        </Field>
        <Field label="Trạng thái">
          <select
            value={values.status}
            onChange={(e) => change("status", e.target.value)}
          >
            <option value="draft">Bản nháp</option>
            <option value="approved">Đã duyệt</option>
            {values.status === "deprecated" ? (
              <option value="deprecated">Ngừng sử dụng</option>
            ) : null}
          </select>
        </Field>
      </div>
      <h3>Các giai đoạn</h3>
      {values.stages.map((stage, i) => (
        <section className="inset" key={i}>
          <h4>Giai đoạn {i + 1}</h4>
          <Field label="Tên giai đoạn">
            <input
              required
              value={stage.title}
              onChange={(e) => stageChange(i, "title", e.target.value)}
            />
          </Field>
          <div className="form-grid">
            {["start_day", "end_day", "time"].map((k) => (
              <Field
                key={k}
                label={
                  {
                    start_day: "Từ ngày",
                    end_day: "Đến ngày",
                    time: "Giờ thực hiện",
                  }[k]
                }
              >
                <input
                  required
                  type={k === "time" ? "time" : "number"}
                  min="1"
                  max={values.duration_days}
                  value={stage[k]}
                  onChange={(e) =>
                    stageChange(
                      i,
                      k,
                      k === "time" ? e.target.value : Number(e.target.value),
                    )
                  }
                />
              </Field>
            ))}
          </div>
          {["instructions", "dosage_note", "important_note"].map((k) => (
            <Field
              key={k}
              label={
                {
                  instructions: "Hướng dẫn (mỗi dòng một mục)",
                  dosage_note: "Liều lượng",
                  important_note: "Lưu ý",
                }[k]
              }
            >
              <textarea
                required={k === "instructions"}
                value={
                  Array.isArray(stage[k]) ? stage[k].join("\n") : stage[k] || ""
                }
                onChange={(e) =>
                  stageChange(
                    i,
                    k,
                    k === "instructions"
                      ? e.target.value.split("\n")
                      : e.target.value,
                  )
                }
              />
            </Field>
          ))}
          <button
            type="button"
            disabled={values.stages.length === 1}
            onClick={() =>
              change(
                "stages",
                values.stages.filter((_, index) => index !== i),
              )
            }
          >
            Bỏ giai đoạn
          </button>
        </section>
      ))}
      <button
        type="button"
        onClick={() => change("stages", [...values.stages, newStage()])}
      >
        + Thêm giai đoạn
      </button>
      {["approved_instructions", "safety_guidelines"].map((k) => (
        <Field
          key={k}
          label={
            k === "approved_instructions"
              ? "Hướng dẫn đã duyệt (mỗi dòng một mục)"
              : "An toàn (mỗi dòng một mục)"
          }
        >
          <textarea
            value={(values[k] || []).join("\n")}
            onChange={(e) => change(k, e.target.value.split("\n"))}
          />
        </Field>
      ))}
      {values._id && values.status !== "deprecated" ? (
        <button
          type="button"
          className="danger"
          onClick={async () => {
            if (!window.confirm("Ngừng sử dụng phác đồ này?")) return;
            try {
              await api("/treatments/manager/" + values._id + "/deprecate", {
                method: "PATCH",
              });
              onSaved();
              onClose();
            } catch (e) {
              setError(e.message);
            }
          }}
        >
          Ngừng sử dụng
        </button>
      ) : null}
    </ActionForm>
  );
}
