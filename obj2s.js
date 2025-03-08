export const obj2s = (o) => {
  const objs = [];
  const f = (o, nest = 0) => {
    if (o === null) {
      return "null";
    } else if (o === undefined) {
      return "undefined";
    } else if (typeof o == "string") {
      return nest == 0 ? o : `"${o}"`;
    } else if (typeof o == "number" || typeof o == "boolean") {
      return o.toString();
    } else {
      const idx = objs.indexOf(o);
      if (idx == -1) {
        objs.push(o);
      } else {
        return "[object " + idx + "]";
      }
      if (Array.isArray(o)) {
        const res = [];
        for (const i of o) {
          res.push(f(i, nest + 1));
        }
        return "[" + res.join(", ") + "]";
      } else if (typeof o == "object") {
        const res = [];
        for (const name in o) {
          res.push(name + ": " + f(o[name], nest + 1));
        }
        return "{ " + res.join(", ") + " }";
      }
    }
  };
  return f(o);
};
