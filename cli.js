import { DNCL3 } from "./DNCL3.js";

let blacketmode = true;
let fn = null;
for (const a of Deno.args) {
  if (a.startsWith("-")) {
    if (a == "--wirth") {
      blacketmode = false;
    } else if (a == "--dncl3") {
      blacketmode = true;
    }
  } else {
    fn = a;
  }
}
const s = await Deno.readTextFile(fn);
new DNCL3(s, null, null, blacketmode).run();
