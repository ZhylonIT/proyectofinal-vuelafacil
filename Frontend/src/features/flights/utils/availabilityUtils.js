export function isDateRangeAvailable(destination, startIso, endIso) {
  if (!startIso || !endIso) return true; // Si no hay fechas, no filtrar

  const start = new Date(startIso + 'T00:00:00');
  const end = new Date(endIso + 'T00:00:00');
  const dayMs = 86400000;

  for (let t = start.getTime(); t <= end.getTime(); t += dayMs) {
    const d = new Date(t);
    const day = d.getDate();
    // Misma lógica que el calendario
    if ((day % 2 === 0 && day < 15) || day === 22 || day === 23) {
      return false;
    }
  }
  return true;
}