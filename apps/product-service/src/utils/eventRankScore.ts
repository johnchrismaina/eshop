// utils/eventRankScore.ts
export function calculateEventRankScore(event: any): number {
  const dealScore = event.Deal?.dealScore ?? 0;

  const ticketAvailabilityFactor =
    event.total_tickets > 0
      ? (event.available_tickets / event.total_tickets) * 100
      : 0;

  const daysUntilStart =
    (event.start_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  const dateProximityFactor =
    daysUntilStart > 0 ? 100 / (daysUntilStart + 1) : 0;

  const hoursOld = (Date.now() - event.createdAt.getTime()) / (1000 * 60 * 60);
  const freshnessBoost = Math.max(0, 50 - hoursOld);

  return (
    dealScore * 0.5 +
    ticketAvailabilityFactor * 0.2 +
    dateProximityFactor * 0.2 +
    freshnessBoost * 0.1
  );
}
