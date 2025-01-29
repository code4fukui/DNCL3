import { Runtime } from "./Runtime.js";
import { Parser } from "./Parser.js";

export class DNCL3 {
  constructor(s, callbackoutput, callbackinput, blacketmode = true) {
    this.callbackoutput = callbackoutput;
    this.callbackinput = callbackinput;
    this.parser = new Parser(blacketmode);
    //this.parseTokens(s); // for debug
    this.ast = this.parser.parse(s);
  }
  parseTokens(s) {
    return this.parser.parseTokens(s);
  }
  run(maxloop, signal) {
    this.runtime = new Runtime(this.ast, this.callbackoutput, this.callbackinput);
    return this.runtime.run(maxloop, signal);
  }
  getVars() {
    return this.runtime.getVars();
  }
}
