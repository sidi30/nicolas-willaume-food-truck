export const CITIES = [
  'Orange',
  'Bagnols-sur-Cèze',
  'Uzès',
  'Rochefort-du-Gard',
  'Remoulins',
  'Saint-Victor-la-Coste',
  'Villeneuve-lès-Avignon',
  'Saint-Julien-de-Peyrolas',
  'Châteauneuf-du-Pape',
  'Tavel',
  'Courthézon',
  'Tricastin',
] as const;

export function getCities(): string[] {
  return [...CITIES];
}

export type OpenHours = { start: string; end: string };

// Simple demo schedule: same hours every day
export function getOpenHoursForCity(city: string | null, date: Date): OpenHours | null {
  if (!city) return null;
  // Example: Mon–Sat 11:00–14:00, closed Sunday
  const day = date.getDay();
  if (day === 0) return null; // Sunday closed
  return { start: '11:00', end: '14:00' };
}

export function generateSlots(date: Date, hours: OpenHours, stepMin = 15): string[] {
  const [sh, sm] = hours.start.split(':').map(Number);
  const [eh, em] = hours.end.split(':').map(Number);
  const start = new Date(date);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(date);
  end.setHours(eh, em, 0, 0);
  const out: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const hh = String(cur.getHours()).padStart(2, '0');
    const mm = String(cur.getMinutes()).padStart(2, '0');
    out.push(`${hh}:${mm}`);
    cur.setMinutes(cur.getMinutes() + stepMin);
  }
  return out;
}

export function formatEuro(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}
