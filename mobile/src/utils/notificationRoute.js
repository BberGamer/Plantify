export function notificationRoute(item) {
  if (!item?.target_available) return "/customer/notifications";
  if (item.type === "care") return {
    pathname: "/customer/care",
    params: { plantId: item.user_plant_id, date: item.occurrence_date },
  };
  return {
    pathname: "/customer/treatments/TreatmentList",
    params: { treatmentId: item.treatment_schedule_id },
  };
}
