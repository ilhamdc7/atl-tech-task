export const formatter = (state) => {
  const minutes = Math.floor(state / 60);
  const seconds = state % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
  return formatted;
};
