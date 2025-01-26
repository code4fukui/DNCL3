import { Runtime } from "./Runtime.js";
import { Parser } from "./Parser.js";

export class DNCL3 {
  constructor(s, callbackoutput, callbackinput) {
    this.callbackoutput = callbackoutput;
    this.callbackinput = callbackinput;
    //const blacketmode = false; // Wirth
    const blacketmode = true; // DNCL3
    this.parser = new Parser(blacketmode);
    //this.parseTokens(s); // for debug
    this.ast = this.parser.parse(s);
  }
  parseTokens(s) {
    return this.parser.parseTokens(s);
  }
  run(maxloop) {
    this.runtime = new Runtime(this.ast, this.callbackoutput, this.callbackinput);
    return this.runtime.run(maxloop);
  }
  getVars() {
    return this.runtime.getVars();
  }
}
