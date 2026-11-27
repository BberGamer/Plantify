export const gardenToday = () =>
  new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
export const shiftDay = (day, amount) =>
  new Date(Date.parse(day) + amount * 86400000).toISOString().slice(0, 10);
