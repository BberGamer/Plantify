import { useEffect, useRef, useState } from "react";
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
const careKeys = {
  light: "Ánh sáng",
  water: "Tưới nước",
  temperature: "Nhiệt độ",
  humidity: "Độ ẩm",
  soil: "Đất trồng",
  fertilizer: "Phân bón",
};
const idOf = (value) => (typeof value === "object" ? value?._id : value);
export default function Catalog({ kind }) {
  const plant = kind === "plants",
    title = plant ? "Cây trồng" : "Bệnh cây";
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [version, setVersion] = useState(0),
    [draft, setDraft] = useState(null),
    [error, setError] = useState(""),
    [opening, setOpening] = useState(false);
  const state = useResource(
    "/" + kind + "/manager" + params({ page, limit: 20, search }),
    version,
  );
  const reload = () => setVersion((v) => v + 1);
  async function open(row) {
    setError("");
    setOpening(true);
    try {
      const [detail, labels, categories, plants] = await Promise.all([
        row ? api("/" + kind + "/manager/" + row._id) : Promise.resolve({}),
        api("/" + kind + "/manager/ai-labels"),
        plant ? api("/plants/categories") : Promise.resolve([]),
        plant ? Promise.resolve([]) : allItems("/plants/manager"),
      ]);
      setDraft({
        id: row?._id,
        values: {
          ...(plant
            ? {
                common_name: "",
                scientific_name: "",
                category_id: "",
                botanical_family: "",
                description: "",
                is_published: true,
                care_requirements: {},
              }
            : {
                disease_name: "",
                scientific_name: "",
                pathogen_type: "other",
                typical_symptoms: "",
                environmental_cause: "",
                status: "active",
                plant_ids: [],
              }),
          ...detail,
          ...(plant
            ? { category_id: idOf(detail.category_id) || "" }
            : {
                plant_ids: (detail.plants || detail.plant_ids || []).map(idOf),
              }),
        },
        labels,
        categories: itemsOf(categories),
        plants: itemsOf(plants),
        selected: labels
          .filter(
            (l) => row && l[plant ? "plant_id" : "disease_id"] === row._id,
          )
          .map((l) => l.class_id),
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setOpening(false);
    }
  }
  return (
    <>
      <p className="eyebrow">MANAGER / DANH MỤC</p>
      <div className="page-heading">
        <h1>{title}</h1>
        <button
          className="primary"
          disabled={opening}
          onClick={() => open(null)}
        >
          + Thêm {plant ? "cây" : "bệnh"}
        </button>
      </div>
      <Notice>{error}</Notice>
      <div className="toolbar">
        <input
          aria-label="Tìm kiếm"
          placeholder={"Tìm " + title.toLowerCase() + "…"}
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
              title: "Ảnh",
              render: (r) => (
                <CatalogImage
                  src={plant ? r.plant_image : r.disease_image_url}
                  name={r.common_name || r.disease_name}
                />
              ),
            },
            {
              title: plant ? "Tên cây" : "Tên bệnh",
              render: (r) => (
                <>
                  <strong>{r.common_name || r.disease_name}</strong>
                  <small>{r.scientific_name}</small>
                </>
              ),
            },
            {
              title: plant ? "Họ thực vật" : "Triệu chứng",
              render: (r) => r.botanical_family || r.typical_symptoms || "—",
            },
            {
              title: "Trạng thái",
              render: (r) => (
                <Badge
                  value={
                    plant ? (r.is_published ? "active" : "inactive") : r.status
                  }
                />
              ),
            },
            {
              title: "Thao tác",
              render: (r) => (
                <button disabled={opening} onClick={() => open(r)}>
                  Chỉnh sửa
                </button>
              ),
            },
          ]}
        />
        <Pager data={state.data} page={page} setPage={setPage} />
      </div>
      {draft ? (
        <CatalogForm
          key={draft.id || "new"}
          kind={kind}
          initial={draft}
          onClose={() => setDraft(null)}
          onSaved={reload}
        />
      ) : null}
    </>
  );
}
function CatalogForm({ kind, initial, onClose, onSaved }) {
  const plant = kind === "plants";
  const [values, setValues] = useState(initial.values),
    [selected, setSelected] = useState(initial.selected),
    [deleting, setDeleting] = useState(false),
    [error, setError] = useState("");
  const imageKey = plant ? "plant_image" : "disease_image_url";
  const savedImages =
    initial.values.image_urls ?? [initial.values[imageKey]].filter(Boolean);
  const [images, setImages] = useState(() =>
    savedImages.map((image_url, key) => ({ image_url, key })),
  );
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const nextImageKey = useRef(images.length);

  function addFiles(event) {
    const files = Array.from(event.target.files);
    event.target.value = "";
    setImageError("");
    if (images.filter((row) => row.photo).length + files.length > 6) {
      setImageError("Mỗi lần lưu tải lên tối đa 6 ảnh mới.");
      return;
    }
    if (
      files.some(
        (file) =>
          file.size > 10 * 1024 * 1024 ||
          (file.type && !["image/jpeg", "image/png"].includes(file.type)),
      )
    ) {
      setImageError("Vui lòng chọn ảnh JPG hoặc PNG, tối đa 10 MB mỗi tệp.");
      return;
    }
    const added = files.map((photo) => ({
      photo,
      key: nextImageKey.current++,
    }));
    setImages((current) => [...current, ...added]);
  }

  function addUrl() {
    const value = imageUrl.trim();
    let url;
    try {
      url = new URL(value);
    } catch {}
    if (
      !url ||
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      setImageError("Ảnh phải có đường dẫn HTTP hoặc HTTPS hợp lệ.");
      return;
    }
    const key = nextImageKey.current++;
    setImages((current) =>
      current.some((row) => row.image_url === value)
        ? current
        : [...current, { image_url: value, key }],
    );
    setImageUrl("");
    setImageError("");
  }
  const change = (key, value) => setValues((v) => ({ ...v, [key]: value }));
  const fields = plant
    ? {
        common_name: "Tên cây",
        scientific_name: "Tên khoa học",
        botanical_family: "Họ thực vật",
        description: "Mô tả",
      }
    : {
        disease_name: "Tên bệnh",
        scientific_name: "Tên khoa học",
        typical_symptoms: "Triệu chứng",
        environmental_cause: "Nguyên nhân môi trường",
      };
  return (
    <ActionForm
      title={
        (initial.id ? "Chỉnh sửa " : "Thêm ") +
        (plant ? "cây trồng" : "bệnh cây")
      }
      onClose={onClose}
      externalBusy={deleting}
      onSubmit={async () => {
        const keys = plant
          ? [
              "common_name",
              "scientific_name",
              "botanical_family",
              "description",
              "category_id",
              "is_published",
              "care_requirements",
            ]
          : [
              "disease_name",
              "scientific_name",
              "typical_symptoms",
              "environmental_cause",
              "pathogen_type",
              "status",
              "plant_ids",
            ];
        const body = Object.fromEntries(keys.map((k) => [k, values[k]]));
        body.ai_class_ids = selected;
        const files = images.flatMap((row) => (row.photo ? [row.photo] : []));
        const imageUrls = images.map((row) =>
          row.photo ? null : row.image_url,
        );
        if (
          imageUrls.length !== savedImages.length ||
          imageUrls.some((url, index) => url !== savedImages[index])
        )
          body.image_urls = imageUrls;
        let payload = body;
        if (files.length) {
          payload = new FormData();
          payload.append("payload", JSON.stringify(body));
          files.forEach((file) => payload.append("photos", file));
        }
        await api(
          "/" + kind + "/manager" + (initial.id ? "/" + initial.id : ""),
          { method: initial.id ? "PUT" : "POST", body: payload },
        );
        onSaved();
      }}
    >
      <div className="form-grid">
        {Object.entries(fields).map(([k, label]) => (
          <Field key={k} label={label}>
            {[
              "description",
              "typical_symptoms",
              "environmental_cause",
            ].includes(k) ? (
              <textarea
                required={k === "typical_symptoms"}
                value={values[k] || ""}
                onChange={(e) => change(k, e.target.value)}
              />
            ) : (
              <input
                required={
                  k === "common_name" ||
                  k === "disease_name" ||
                  (plant && k === "scientific_name")
                }
                value={values[k] || ""}
                onChange={(e) => change(k, e.target.value)}
              />
            )}
          </Field>
        ))}
      </div>
      {plant ? (
        <>
          <Field label="Danh mục">
            <select
              required
              value={values.category_id}
              onChange={(e) => change("category_id", e.target.value)}
            >
              <option value="">Chọn danh mục</option>
              {initial.categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.category_name || c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hiển thị">
            <select
              value={String(values.is_published)}
              onChange={(e) =>
                change("is_published", e.target.value === "true")
              }
            >
              <option value="true">Công khai</option>
              <option value="false">Ẩn</option>
            </select>
          </Field>
          <div className="form-grid">
            {Object.entries(careKeys).map(([k, label]) => (
              <Field key={k} label={label}>
                <input
                  value={values.care_requirements?.[k] || ""}
                  onChange={(e) =>
                    change("care_requirements", {
                      ...values.care_requirements,
                      [k]: e.target.value,
                    })
                  }
                />
              </Field>
            ))}
          </div>
        </>
      ) : (
        <>
          <Field label="Loại tác nhân">
            <select
              value={values.pathogen_type}
              onChange={(e) => change("pathogen_type", e.target.value)}
            >
              {[
                "fungus",
                "bacteria",
                "virus",
                "pest",
                "nematode",
                "physiological",
                "other",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Trạng thái">
            <select
              value={values.status}
              onChange={(e) => change("status", e.target.value)}
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Ẩn</option>
            </select>
          </Field>
          <Field label="Cây liên quan">
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
        </>
      )}
      <section className="inset">
        <h3>{plant ? "Ảnh cây trồng" : "Ảnh bệnh cây"}</h3>
        <div className="image-grid">
          {images.map((row, index) => (
            <CatalogImageRow
              key={row.key}
              index={index}
              row={row}
              onCover={() =>
                setImages((items) => [
                  row,
                  ...items.filter((item) => item.key !== row.key),
                ])
              }
              onRemove={() =>
                setImages((items) =>
                  items.filter((item) => item.key !== row.key),
                )
              }
            />
          ))}
        </div>
        <Field label="Thêm ảnh JPG hoặc PNG (6 ảnh mới mỗi lần lưu, 10 MB mỗi ảnh)">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png"
            onChange={addFiles}
          />
        </Field>
        <Field label="Đường dẫn ảnh">
          <input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
        </Field>
        <button type="button" disabled={!imageUrl.trim()} onClick={addUrl}>
          Thêm đường dẫn
        </button>
        <Notice>{imageError}</Notice>
      </section>
      <h3>Nhãn AI nhận diện</h3>
      <p className="muted">
        Chọn nhãn đã có chủ sẽ chuyển liên kết sang bản ghi này. Nhãn bệnh cần
        được gán cây trước. Thêm danh mục không làm model học thêm class.
      </p>
      <div className="label-list">
        {initial.labels.map((l) => (
          <label key={l.class_id}>
            <input
              type="checkbox"
              checked={selected.includes(l.class_id)}
              onChange={(e) =>
                setSelected((s) =>
                  e.target.checked
                    ? [...s, l.class_id]
                    : s.filter((id) => id !== l.class_id),
                )
              }
            />
            <span>
              {l.class_name}
              <small>
                {l.plant_name || "Chưa gán cây"}
                {l.disease_name ? " · " + l.disease_name : ""}
              </small>
            </span>
          </label>
        ))}
      </div>
      {initial.id ? (
        <>
          <Notice>{error}</Notice>
          <button
            type="button"
            className="danger"
            disabled={deleting}
            onClick={async () => {
              if (
                !window.confirm(
                  "Xóa bản ghi này? Các liên kết đang sử dụng có thể ngăn việc xóa.",
                )
              )
                return;
              setDeleting(true);
              try {
                await api("/" + kind + "/manager/" + initial.id, {
                  method: "DELETE",
                });
                onSaved();
                onClose();
              } catch (e) {
                setError(e.message);
              } finally {
                setDeleting(false);
              }
            }}
          >
            Xóa {plant ? "cây" : "bệnh"}
          </button>
        </>
      ) : null}
    </ActionForm>
  );
}
function CatalogImageRow({ row, index, onCover, onRemove }) {
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (!row.photo) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(row.photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [row.photo]);
  const label = index === 0 ? "Ảnh bìa" : `Ảnh ${index + 1}`;
  return (
    <div className="inset">
      <CatalogImage src={preview || row.image_url} name={label} />
      <p>{label}</p>
      {index > 0 && (
        <button type="button" onClick={onCover}>
          Đặt làm ảnh bìa
        </button>
      )}
      <button type="button" className="danger" onClick={onRemove}>
        Xóa ảnh
      </button>
    </div>
  );
}
function CatalogImage({ src, name }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? (
    <img
      src={src}
      alt={name || "Ảnh danh mục"}
      onError={() => setFailed(true)}
      style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 12 }}
    />
  ) : (
    <span className="muted">{src ? "Không tải được ảnh" : "Chưa có ảnh"}</span>
  );
}
