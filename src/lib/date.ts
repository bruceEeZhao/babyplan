/** 本地日期键（YYYY-MM-DD），避免时区偏移导致日期错位 */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 日期键 → UTC 零点 Date（写入 PG date 列时日期不偏移） */
export function dateKeyToDate(key: string): Date {
  return new Date(`${key}T00:00:00Z`);
}
