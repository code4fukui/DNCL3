import * as t from "https://deno.land/std/testing/asserts.ts";
import { checkFloat } from "./checkFloat.js";

const check = (s, b) => {
  const b2 = checkFloat(s);
  if (b != b2) console.log(s, "must be", b);
  t.assertEquals(b, b2);
}

Deno.test("checkFloat", () => {
  check(null, false);
  check(undefined, false);
  check("9", true);
  check("0", true);
  check("9.", true);
  check("9.a", false);
  check("a", false);
  check("0.1", true);
  check(".1", true);
  check("-0.1", true);
  check("+0.1", true);
  check("+-0.1", false);
  check(".1000", true);
  check("a.1000", false);
  check("1e1", false);
});
