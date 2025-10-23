export const waitFor = async (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const randomBetween = (min: number, max: number): number => {
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  const delta = upper - lower;
  return lower + Math.floor(Math.random() * (delta + 1));
};
