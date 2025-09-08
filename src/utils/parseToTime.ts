export function parseToTime(dateStr: string): Date | null {
    if (!dateStr) return null;
    const [h, m, s] = dateStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, s || 0, 0);
    return d;
}
