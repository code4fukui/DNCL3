export const obj = (n) => {
  return {
    a: n * 2,
    b: () => "[" + n + "]",
  };
};
export const obj2 = {
  create: () => {
    return {
      getKey: () => 123,
    };
  }
};
