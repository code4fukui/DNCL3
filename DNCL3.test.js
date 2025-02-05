import * as t from "https://deno.land/std/testing/asserts.ts";
import { DNCL3 } from "./DNCL3.js";

const run = async (s) => {
  const res = [];
  const dncl3 = new DNCL3(s, (s) => res.push(s));
  await dncl3.run();
  return res;
};
Deno.test("print", async () => {
  t.assertEquals(await run("print 3"), ["3"]);
  t.assertEquals(await run(`print "ABC"`), ["ABC"]);
  t.assertEquals(await run(`print "ABC", 3`), ["ABC 3"]);
});
Deno.test("var", async () => {
  t.assertEquals(await run("a = 1\nb = 2\nc = a + b\nprint c"), ["3"]);
  t.assertEquals(await run(`a = "1"\nb = "2"\nc = a + b\nprint c`), ["12"]);
});
Deno.test("const", async () => {
  t.assertEquals(await run("A = 1\nprint A"), ["1"]);
  t.assertRejects(async () => await run("A = 1\nA = 2"));
  t.assertEquals(await run("Aa = 1\nAa = 2\nprint Aa"), ["2"]);
});
Deno.test("array", async () => {
  t.assertEquals(await run("a = 1\nprint a"), ["1"]); // var ok
  t.assertEquals(await run("a = [1]\nprint a[0]"), ["1"]); // 1D array
  t.assertEquals(await run("a = [[1]]\nprint a[0][0]"), ["1"]);
  t.assertEquals(await run("a = [[1, 2, 3], [10, 20, 30]]\nprint a[0][0]"), ["1"]);
  t.assertEquals(await run("a = [[1, 2, 3], [10, 20, 30]]\nprint a[1][0]"), ["10"]);
  t.assertEquals(await run("a = [[1, 2, 3], [10, 20, 30]]\nprint a[0][0], a[1][2]"), ["1 30"]);
});
Deno.test("array assign", async () => {
  t.assertEquals(await run("a[0] = 1\nprint a[0]"), ["1"]); // 1D array
  t.assertEquals(await run("a = [[1, 2, 3], [10, 20, 30]]\na[0][0] = 100\nprint a[0][0]"), ["100"]);
});
Deno.test("array default value", async () => {
  t.assertEquals(await run("a <- 1\nprint a[0]"), ["1"]); // 1D array
  t.assertEquals(await run("a <- 1\nprint a[0][3]"), ["1"]); // 2D array
  t.assertEquals(await run("a <- 1\nprint a[0][3][5]"), ["1"]); // 3D array
  t.assertEquals(await run("a <- 1\nprint a[0][3][5][6]"), ["1"]); // 3D array
});
