export const checkFloat = (s) => {
  const floatRegex = /^[+-]?(?:\d*\.\d+|\d+\.\d*|\d+)$/;
  return floatRegex.test(s);
};
