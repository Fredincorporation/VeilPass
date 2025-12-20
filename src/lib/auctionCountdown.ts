export function computeTimeLeft(endRaw: string | Date | null | undefined, createdRaw?: string | Date | null, durationHours?: number | null) {
  const now = Date.now();
  const endDate = endRaw ? new Date(endRaw) : null;
  const createdDate = createdRaw ? new Date(createdRaw) : null;

  if (!endDate) {
    return { timeLeft: 'Unknown', progress: 0 };
  }

  const timeRemainingMs = Math.max(0, endDate.getTime() - now);

  // Determine total duration in ms. Prefer explicit duration_hours if present.
  let totalDurationMs: number | null = null;
  if (typeof durationHours === 'number' && !isNaN(durationHours)) {
    totalDurationMs = durationHours * 60 * 60 * 1000;
  } else if (createdDate) {
    totalDurationMs = Math.max(1, endDate.getTime() - createdDate.getTime());
  }

  if (timeRemainingMs <= 0) {
    return { timeLeft: 'Ended', progress: 100 };
  }

  const seconds = Math.floor((timeRemainingMs / 1000) % 60);
  const minutes = Math.floor((timeRemainingMs / (1000 * 60)) % 60);
  const hours = Math.floor((timeRemainingMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));

  let timeLeftStr = '';
  if (days > 0) timeLeftStr = `${days}d ${hours}h`;
  else if (hours > 0) timeLeftStr = `${hours}h ${minutes}m`;
  else timeLeftStr = `${minutes}m ${seconds}s`;

  let progress = 0;
  if (totalDurationMs && totalDurationMs > 0) {
    progress = Math.max(0, Math.min(100, ((totalDurationMs - timeRemainingMs) / totalDurationMs) * 100));
  }

  return { timeLeft: timeLeftStr, progress };
}

export default computeTimeLeft;
