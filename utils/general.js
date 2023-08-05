export function date30DaysAgo() {
  const today = new Date();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = new Date(today.getTime() - 30 * millisecondsPerDay);

  const year = thirtyDaysAgo.getFullYear();
  const month = String(thirtyDaysAgo.getMonth() + 1).padStart(2, "0");
  const day = String(thirtyDaysAgo.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
