//import { sleep } from "https://js.sabae.cc/sleep.js";
import { sleep } from "./sleep.js";
import { checkFloat } from "./checkFloat.js";
import { obj2s } from "./obj2s.js";

const DEFAULT_MAX_LOOP = 1000;

const makeURL = (fn) => {
  if (globalThis.Deno) {
    return "file://" + Deno.realPathSync(fn); // on Deno console
  }
  return new URL(fn, location.href).href;
};

const isUpperAlphabet = (c) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(c) >= 0;

const isConstantName = (s) => {
  for (const c of s) {
    if (!isUpperAlphabet(c) && c != "_") return false;
  }
  return true;
};

class Return {
  constructor(val) {
    this.val = val;
  }
  getValue() {
    return this.val;
  }
}

class Break {
}

class Scope {
  constructor(parent = null) {
    this.vars = {};
    this.parent = parent;
  }
  isDefined(name) {
    for (let scope = this; scope; scope = scope.parent) {
      if (scope.vars[name] !== undefined) {
        return true;
      }
    }
    return false;
  }
  getVar(name) {
    for (let scope = this; scope; scope = scope.parent) {
      if (scope.vars[name] !== undefined) {
        return scope.vars[name];
      }
    }
    throw new Error("定義されていない変数 " + name + " が使われました");
  }
  getVarObject(name) {
    const v = this.getVar(name);
    if (typeof v == "string") return v;
    if (typeof v == "object") return v;
    const v2 = new Array();
    v2.defaultValue = v;
    this.setVar(name, v2);
    return v2;
  }
  setVar(name, o, forcelocal = false) {
    if (!forcelocal) {
      for (let scope = this; scope; scope = scope.parent) {
        if (scope.vars[name] !== undefined) {
          scope.vars[name] = o;
          return;
        }
      }
    }
    this.vars[name] = o;
  }
  getLevel() {
    let res = 0;
    for (let scope = this; scope; scope = scope.parent) {
      res++;
    }
    return res;
  }
}

export class Runtime {
  constructor(ast, callbackoutput, callbackinput) {
    this.callbackoutput = callbackoutput;
    this.callbackinput = callbackinput;
    this.ast = ast;
    this.pc = 0;
  }
  async getArrayIndex(ast, scope) {
    const prop = await this.calcExpression(ast, scope);
    if (prop < 0 || typeof prop == "string" && parseInt(prop).toString() != prop) {
      throw new Error("配列には0または正の整数のみ指定可能です");
    }
    return prop;
  }
  getFunc(scope, cmd) {
    if (cmd.callee.type == "Identifier") {
      const name = cmd.callee.name;
      if (!scope.isDefined(name)) {
        throw new Error("定義されていない関数 " + name + " が使われました");
      }
      const func = scope.getVar(name);
      return { parent: null, name, func };
    } else if (cmd.callee.type == "MemberExpression") {
      if (cmd.callee.object.type != "Identifier") throw new Error("未対応です");
      if (cmd.callee.property.type != "Identifier") throw new Error("未対応です");
      if (cmd.callee.computed != false) throw new Error("未対応です");
      const name = cmd.callee.object.name;
      if (!scope.isDefined(name)) {
        throw new Error("定義されていない関数 " + name + " が使われました");
      }
      const parent = scope.getVar(name);
      const func = parent[cmd.callee.property.name];
      return { parent, name, func };
    } else {
      throw new Error("サポートしていないtypeです " + cmd.callee.type);
    }
  }
  async runBlock(ast, scope) {
    const body = ast.type == "BlockStatement" || 
      ast.type == "Program" ? ast.body :
      ast.type == "SequenceExpression" ? ast.expressions : [ast];
    for (const cmd of body) {
      this.checkAbort();
      if (this.pc++ % 100 == 0) {
        await sleep(1, this.signal);
      }
      //console.log(cmd)
      if (cmd.type == "ExpressionStatement") {
        await this.runBlock(cmd.expression, scope);
      } else if (cmd.type == "AssignmentExpression") {
        const name = this.getVarName(cmd.left);
        if (scope.isDefined(name) && isConstantName(name)) {
          throw new Error("定数には再代入できません");
        }
        if (cmd.left.type == "Identifier") {
          scope.setVar(name, await this.calcExpression(cmd.right, scope));
        } else if (cmd.left.type == "MemberExpression") {
          const idxes = [];
          let ast = cmd.left;
          for (;;) {
            if (ast.type == "MemberExpression") {
              if (ast.computed == false) {
                idxes.unshift(ast.property.name);
              } else {
                idxes.unshift(await this.calcExpression(ast.property, scope));
              }
              ast = ast.object;
            } else if (ast.type == "Identifier") {
              const name = ast.name;
              if (!scope.isDefined(name)) {
                scope.setVar(name, []);
              }
              const v = scope.getVarObject(name);
              if (idxes.length == 0) {
                throw new Error("no indexes!?");
                //return v;
              } else if (idxes.length == 1 && typeof v == "string") {
                throw new Error("文字列の要素への代入には未対応です");
                /*
                const idx = idxes[0];
                console.log("set str", v, idx)
                if (idx >= 0 && idx < v.length) {
                  return v[idx];
                } else {
                  return "";
                }
                */
              }
              const val = await this.calcExpression(cmd.right, scope);
              if (idxes.length == 1) {
                v[idxes[0]] = val;
              } else {
                const idx = idxes[0];
                if (v[idx] === undefined) {
                  //console.log("1", typeof idx == "number", idx)
                  v[idx] = typeof idx == "number" ? [] : {};
                }
                let ret = v[idx];
                for (let i = 1; i < idxes.length - 1; i++) {
                  const idx = idxes[i];
                  if (ret[idx] === undefined) {
                    //console.log("2", typeof idx == "number", idx)
                    ret[idx] = typeof idx == "number" ? [] : {};
                  }
                  ret = ret[idx];
                }
                ret[idxes[idxes.length - 1]] = val;
              }
              break;
            } else throw new Error("非対応の type です " + ast.type);
          }
        } else {
          throw new Error("非対応の type です " + cmd.left.type);
        }
      } else if (cmd.type == "CallExpression") {
        const { parent, name, func } = this.getFunc(scope, cmd);
        // console.log(cmd.callee);
        if (typeof func == "object") {
          if (ast.arguments.length != func.params.length) {
            throw new Error("引数の数が合っていません 機能名: " + name);
          }
          const scope2 = new Scope(scope);
          for (let i = 0; i < ast.arguments.length; i++) {
            const localvarname = func.params[i].name;
            scope2.setVar(localvarname, await this.calcExpression(ast.arguments[i], scope), true);
          }
          try {
            this.checkMaxCall(name);
            await this.runBlock(func.body, scope2);
            //throw new Error("関数が値を返しませんでした");
          } catch (e) {
            if (!(e instanceof Return)) {
              throw e;
            }
          }
        } else if (typeof func == "function") {
          const params = [];
          for (let i = 0; i < ast.arguments.length; i++) {
            params.push(await this.calcExpression(ast.arguments[i], scope));
          }
          //await func(...params);
          await func.apply(parent, params);
        } else {
          new Error("関数ではないものが関数として呼び出されました")
        }
      } else if (cmd.type == "IfStatement") {
        const cond = await this.calcExpression(cmd.test, scope);
        if (cond) {
          await this.runBlock(cmd.consequent, scope);
        } else if (cmd.alternate) {
          await this.runBlock(cmd.alternate, scope);
        }
      } else if (cmd.type == "WhileStatement") {
        try {
          for (let i = 0;; i++) {
            const cond = await this.calcExpression(cmd.test, scope);
            if (!cond) break;
            await this.runBlock(cmd.body, scope);
            this.checkMaxLoop(i);
          }
        } catch (e) {
          if (!(e instanceof Break)) {
            throw e;
          }
        }
      } else if (cmd.type == "DoWhileStatement") {
        try {
          for (let i = 0;; i++) {
            await this.runBlock(cmd.body, scope);
            const cond = await this.calcExpression(cmd.test, scope);
            if (!cond) break;
            this.checkMaxLoop(i);
          }
        } catch (e) {
          if (!(e instanceof Break)) {
            throw e;
          }
        }
      } else if (cmd.type == "ForStatement") {
        await this.runBlock(cmd.init, scope);
        try {
          for (let i = 0;; i++) {
            const cond = await this.calcExpression(cmd.test, scope);
            if (!cond) break;
            await this.runBlock(cmd.body, scope);
            await this.runBlock(cmd.update, scope);
            this.checkMaxLoop(i);
          }
        } catch (e) {
          if (!(e instanceof Break)) {
            throw e;
          }
        }
      } else if (cmd.type == "FunctionDeclaration") {
        const name = cmd.id.name;
        if (scope.isDefined(name)) {
          throw new Error("すでに宣言済みに名前では関数を定義できません");
        }
        scope.setVar(name, cmd);
      } else if (cmd.type == "ReturnStatement") {
        if (cmd.argument !== undefined) {
          const val = await this.calcExpression(cmd.argument, scope);
          throw new Return(val);
        } else {
          throw new Return();
        }
      } else if (cmd.type == "BreakStatement") {
        throw new Break();
      } else if (cmd.type == "VariableDeclaration") {
        const varnames = cmd.declarations[0].id.properties.map(i => i.key.name);
        const fn = cmd.declarations[0].init.argument.source.value.value;
        const module = await import(makeURL(fn));
        for (const varname of varnames) {
          scope.setVar(varname, module[varname]);
        }
      } else {
        throw new Error("対応していない expression type が使われました。 " + cmd.type);
      }
    }
  }
  checkMaxLoop(i) {
    if (!this.maxloop) return;
    if (i >= this.maxloop) {
      throw new Error(this.maxloop + "回の繰り返し上限に達しました");
    }
  }
  checkMaxCall(funcname) {
    if (!this.maxloop) return;
    if (this.callcount[funcname] == undefined) {
      this.callcount[funcname] = 1;
    } else {
      this.callcount[funcname]++;
    }
    if (this.callcount[funcname] >= this.maxloop) {
      throw new Error(funcname + "の呼び出し回数が、" + this.maxloop + "回の繰り返し上限に達しました");
    }
  }
  checkAbort() {
    //console.log(this.signal?.aborted);
    if (this.signal?.aborted) {
      throw new Error("abort: ", this.signal.reason);
    }
  }
  async run(maxloop = DEFAULT_MAX_LOOP, signal = null) {
    this.maxloop = parseInt(maxloop);
    this.signal = signal;
    if (isNaN(this.maxloop)) throw new Error("maxloopが不正です");
    this.callcount = {};
    this.scope = new Scope();
    const vars = this.scope.vars;
    vars.print = async (...args) => {
      const s = args.map(i => obj2s(i)).join(" ");
      if (this.callbackoutput) {
        await this.callbackoutput(s);
      } else {
        console.log(s);
      }
    };
    vars.input = async (s) => {
      const toint = (s) => {
        if (s == null) return "";
        if (!checkFloat(s)) return s;
        return parseFloat(s);
      };
      if (this.callbackinput) {
        return toint(await this.callbackinput(s));
      } else {
        return toint(prompt(s));
      }
    };
    await this.runBlock(this.ast, this.scope);
    //console.log(this.vars);
  }
  getVarName(ast) {
    for (;;) {
      if (ast.type == "Identifier") return ast.name;
      else if (ast.type == "MemberExpression") ast = ast.object;
      else throw new Error("非対応の type です " + ast.type);
    }
  }
  async calcExpression(ast, scope) {
    if (ast.type == "Literal") {
      return ast.value;
    } else if (ast.type == "Identifier") {
      if (!scope.isDefined(ast.name)) {
        //console.log("var", this.vars)
        throw new Error("初期化されていない変数 " + ast.name + " が使われました");
      }
      return scope.getVar(ast.name);
    } else if (ast.type == "MemberExpression") {
      const idxes = [];
      for (;;) {
        if (ast.type == "MemberExpression") {
          if (ast.computed == false) {
            idxes.unshift(ast.property.name);
          } else {
            idxes.unshift(await this.calcExpression(ast.property, scope));
          }
          ast = ast.object;
        } else if (ast.type == "Identifier") {
          const name = ast.name;
          if (!scope.isDefined(name)) {
            throw new Error("初期化されていない配列 " + name + " が使われました");
          }
          const v = scope.getVarObject(name);
          if (idxes.length == 0) {
            return v;
          } else if (idxes.length == 1 && typeof v == "string") {
            const idx = idxes[0];
            if (idx == "length") {
              return v.length;
            } else if (idx >= 0 && idx < v.length) {
              return v[idx];
            } else {
              return "";
            }
          }
          const idx = idxes[0];
          if (v[idx] === undefined) {
            return v.defaultValue;
          }
          let ret = v[idx];
          for (let i = 1; i < idxes.length; i++) {
            const idx = idxes[i];
            if (ret[idx] === undefined) {
              return v.defaultValue;
            }
            ret = ret[idx];
          }
          if (ret === undefined) {
            return v.defaultValue;
          }
          return ret;
        } else throw new Error("非対応の type です " + ast.type);
      }
    } else if (ast.type == "UnaryExpression") {
      const n = await this.calcExpression(ast.argument, scope);
      if (ast.operator == "not") {
        return !n;
      } else if (ast.operator == "-") {
        return -n;
      } else {
        throw new Error("対応していない演算子 " + ast.operator + " です");
      }
    } else if (ast.type == "ArrayExpression") {
      const res = [];
      for (const i of ast.elements) {
        res.push(await this.calcExpression(i, scope));
      }
      return res;
    } else if (ast.type == "ObjectExpression") {
      const res = {};
      for (const i of ast.properties) {
        res[i.key.name] = await this.calcExpression(i.value, scope);
      }
      return res;
    } else if (ast.type == "BinaryExpression" || ast.type == "LogicalExpression") {
      const n = await this.calcExpression(ast.left, scope);
      const m = await this.calcExpression(ast.right, scope);
      const op = ast.operator;
      if (typeof n == "string" || typeof m == "string") {
        if (op != "+" && op != "==" && op != "!=") throw new Error("文字列では使用できない演算子です: " + op);
      }
      if (op == "+") {
        return n + m;
      } else if (op == "-") {
        return n - m;
      } else if (op == "*") {
        return n * m;
      } else if (op == "/") {
        return n / m;
      } else if (op == "%") {
        return n % m;
      } else if (op == "//") {
        return Math.floor(n / m);
      } else if (op == "==") {
        return n == m;
      } else if (op == "!=") {
        return n != m;
      } else if (op == "<") {
        return n < m;
      } else if (op == "<=") {
        return n <= m;
      } else if (op == ">") {
        return n > m;
      } else if (op == ">=") {
        return n >= m;
      } else if (op == "and") {
        return n && m;
      } else if (op == "or") {
        return n || m;
      } else {
        throw new Error("対応していない演算子が使われました");
      }
    } else if (ast.type == "CallExpression") {
      const { parent, name, func } = this.getFunc(scope, ast);
      //const name = ast.callee.name;
      /*
      if (name == "input") {
        if (ast.arguments.length > 1) {
          throw new Error("引数の数が合っていません");
        }
        const q = ast.arguments.length ? await this.calcExpression(ast.arguments[0], scope) : "入力してください";
        const s = await this.input(q);
        if (s == null) return "";
        const f = parseFloat(s);
        if (!isNaN(f) && f.toString() == s) return f;
        return s;
      }
      */
      if (!scope.isDefined(name)) {
        throw new Error("定義されていない関数 " + name + " が使われました");
      }
      //const func = scope.getVar(name);
      if (typeof func == "object") {
        if (ast.arguments.length != func.params.length) {
          throw new Error("引数の数が合っていません");
        }
        const scope2 = new Scope(scope);
        //console.log(scope2.getLevel());
        for (let i = 0; i < ast.arguments.length; i++) {
          const localvarname = func.params[i].name;
          scope2.setVar(localvarname, await this.calcExpression(ast.arguments[i], scope), true);
        }
        try {
          this.checkMaxCall(name);
          await this.runBlock(func.body, scope2);
          throw new Error("関数が値を返しませんでした");
        } catch (e) {
          if (e instanceof Return) {
            const val = e.getValue();
            if (val === undefined) throw new Error("関数が値を返しませんでした");
            return val;
          }
          throw e;
        }
      } else if (typeof func == "function") {
        const params = [];
        for (let i = 0; i < ast.arguments.length; i++) {
          params.push(await this.calcExpression(ast.arguments[i], scope));
        }
        //return await func(...params);
        return await func.apply(parent, params);
      } else {
        new Error("関数ではないものが関数として呼び出されました")
      }
    } else {
      throw new Error("対応していない expression type が使われました。 " + ast.type);
    }
  }
  getVars() {
    const vars = this.scope.vars;
    const res = {};
    for (const name in vars) {
      const o = vars[name];
      if (name == "print" || name == "input") continue;
      if (typeof o == "object" && o.type == "FunctionDeclaration") {
        res[name] = "[function]";
      } else if (typeof o == "function") {
        res[name] = "[function in js]";
      } else {
        res[name] = obj2s(o);
      }
    }
    const res2 = [];
    res2.push("vars {");
    for (const name in res) {
      res2.push("  " + name + ": " + res[name] + ",");
    }
    res2.push("}");
    return res2.join("\n");
  }
}
