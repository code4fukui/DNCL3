import * as t from "https://deno.land/std/testing/asserts.ts";
import { obj2s } from "./obj2s.js";

Deno.test("test", () => {
  t.assertEquals(obj2s(null), "null");
  t.assertEquals(obj2s(undefined), "undefined");
  t.assertEquals(obj2s(0), "0");
  t.assertEquals(obj2s(1.5), "1.5");
  t.assertEquals(obj2s([1, 2]), "[1, 2]");
  //t.assertEquals(obj2s([1, 2]), "1 2");
  //t.assertEquals(obj2s([1, 2], false), "[1, 2]");
  //t.assertEquals(obj2s(["a", "b"]), "a b");
  //t.assertEquals(obj2s(["a", "b"], false), `["a", "b"]`);
  t.assertEquals(obj2s(["a", "b"]), `["a", "b"]`);
  t.assertEquals(obj2s({ a: 1, b: 2 }), "{ a: 1, b: 2 }");
  //t.assertEquals(obj2s("s"), '"s"');
  t.assertEquals(obj2s("s"), "s");
  t.assertEquals(obj2s({ a: "s", b: 2 }), '{ a: "s", b: 2 }');
});
Deno.test("repeat", () => {
  const o = {
    a: 100,
  };
  o.b = o;
  const ar = [o, o];
  t.assertEquals(obj2s(o), "{ a: 100, b: [object 0] }");
  t.assertEquals(obj2s(ar), "[{ a: 100, b: [object 1] }, [object 1]]");
});
