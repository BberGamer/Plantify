import { useState } from "react";
import { gardenToday } from "../utils/gardenDate";

export default function useCareScheduleForm({ plants, plantId, onSave }) {
  const [selectedPlant, setSelectedPlant] = useState(plantId || "");
  const [action, setAction] = useState("watering");
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(gardenToday);
  const [end, setEnd] = useState("");
  const [hasEnd, setHasEnd] = useState(false);
  const [time, setTime] = useState("08:00");
  const [repeat, setRepeat] = useState("1");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const available = plants.filter((p) => !plantId || p._id === plantId);
  const selected = available.find((p) => p._id === selectedPlant);
  async function save() {
    const validDate = (value) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value;
    if (!selected || selected.active_treatment)
      return setFormError("Hãy chọn một cây không trong đợt điều trị.");
    if (!validDate(start) || (hasEnd && (!validDate(end) || end < start)))
      return setFormError(
        "Ngày cần có dạng YYYY-MM-DD; ngày kết thúc từ ngày bắt đầu trở đi.",
      );
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
      return setFormError("Nhập giờ hợp lệ, ví dụ 08:00 hoặc 17:30.");
    if (!/^\d+$/.test(repeat) || +repeat < 1 || +repeat > 365)
      return setFormError("Chu kỳ lặp từ 1 đến 365 ngày.");
    setFormError("");
    const ok = await onSave({
      user_plant_id: selectedPlant,
      action_type: action,
      title: title.trim() || (action === "watering" ? "Tưới nước" : "Bón phân"),
      start_date: start,
      end_date: hasEnd ? end : null,
      time,
      repeat_every_days: +repeat,
      notes,
    });
    if (ok) {
      setTitle("");
      setNotes("");
      setFormError("");
    }
  }
  return {
    selectedPlant,
    setSelectedPlant,
    action,
    setAction,
    title,
    setTitle,
    start,
    setStart,
    end,
    setEnd,
    hasEnd,
    setHasEnd,
    time,
    setTime,
    repeat,
    setRepeat,
    notes,
    setNotes,
    formError,
    available,
    selected,
    save,
  };
}
