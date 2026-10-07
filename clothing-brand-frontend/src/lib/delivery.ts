// Delivery estimate shown on product pages: dispatch in 2–3 working days,
// then 4–8 working days in transit. Sundays are not working days.
const DISPATCH = [2, 3] as const;
const TRANSIT = [4, 8] as const;

const addWorkingDays = (from: Date, days: number) => {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) left -= 1;
  }
  return d;
};

const fmt = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export const deliveryWindow = (now = new Date()) => {
  const earliest = addWorkingDays(now, DISPATCH[0] + TRANSIT[0]);
  const latest = addWorkingDays(now, DISPATCH[1] + TRANSIT[1]);
  return { earliest, latest, label: `${fmt(earliest)} – ${fmt(latest)}` };
};
