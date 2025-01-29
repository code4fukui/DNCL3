export const sleep = (ms, signal) => {
  return new Promise((resolve, reject) => {
    let abortfunc;
    const timer = setTimeout(() => {
      resolve();
      signal?.removeEventListener("abort", abortfunc);
    }, ms);

    abortfunc = () => {
      clearTimeout(timer);
      reject(new Error("sleep aborted"));
      signal?.removeEventListener("abort", abortfunc);
    };
    signal?.addEventListener("abort", abortfunc);
  });
};
