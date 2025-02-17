export const obj2s = (o, nest = 0) => {
  if (o === null) {
    return "null";
  } else if (o === undefined) {
    return "undefined";
  } else if (Array.isArray(o)) {
    const res = [];
    for (const i of o) {
      res.push(obj2s(i, nest + 1));
    }
    return "[" + res.join(", ") + "]";
  } else if (typeof o == "object") {
    const res = [];
    for (const name in o) {
      res.push(name + ": " + obj2s(o[name], nest + 1));
    }
    return "{ " + res.join(", ") + " }";
  } else if (typeof o == "string") {
    return nest == 0 ? o : `"${o}"`;
  } else {
    return o.toString();
  }
};
