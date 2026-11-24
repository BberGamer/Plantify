export function notificationRoute(item) {
  if (!item?.target_available) return "/customer/notifications";
  if (item.type === "feedback_reply" && item.feedback_id)
    return {
      pathname: "/customer/feedback/[id]",
      params: { id: item.feedback_id },
    };
  if (item.type === "care")
    return {
      pathname: "/customer/care",
      params: { plantId: item.user_plant_id, date: item.occurrence_date },
    };
  if (item.type === "treatment" || !item.type)
    return {
      pathname: "/customer/treatments/TreatmentList",
      params: { treatmentId: item.treatment_schedule_id },
    };
  return "/customer/notifications";
}
