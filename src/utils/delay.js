export const waitFor = async (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const randomBetween = (min, max) => {
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  const delta = upper - lower;
  return lower + Math.floor(Math.random() * (delta + 1));
};
