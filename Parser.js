const reserved = [
  //"print", "?",
  // "input", // ? == print
  "if", "then", "else", "elseif",
  "while", "do", "until", "for", "to", "step", "break",
  "function", "return", "from",
  "and", "or", "not",
];
const reserved_none_blacketmode = [
  "endif",
  "next",
  "end",
];

const isNumber = (c) => "0123456789".indexOf(c) >= 0;
const isOperator = (c) => "+-*/%=!<>,".indexOf(c) >= 0;
const isWhite = (c) => " \t\n".indexOf(c) >= 0;

export class Parser {
  constructor(blacketmode) {
    this.blacketmode = blacketmode;
    if (blacketmode) {
      this.reserved = [...reserved];
    } else {
      this.reserved = [...reserved, ...reserved_none_blacketmode];
    }
  }
  parse(s) {
    this.s = s.replaceAll("\r", "");
    this.p = 0;
    const body = [];
    while (this.parseCommand(body));
    const ast = { "type": "Program", body };
    return ast;
  }
  parseTokens(s) {
    this.s = s.replaceAll("\r", "");
    this.p = 0;
    for (;;) {
      const c = this.getToken(true);
      console.log(c);
      if (c.type == "eof") break;
    }
  }
  getChar() {
    const res = this.s[this.p];
    this.p++;
    return res;
  }
  ungetChar() {
    this.p--;
  }
  getCharNotWhite() {
    for (;;) {
      const c = this.getChar();
      if (c === undefined) return c;
      if (!isWhite(c)) return c;
    }
  }
  checkEOL() {
    let p = this.p;
    for (;;) {
      const c = this.s[p++];
      if (c === undefined || c == "\n") break;
      if (!isWhite(c)) return false;
    }
    this.p = p;
    return true;
  }
  getToken(reteol = false) {
    const STATE_FIRST = 0;
    const STATE_WORD = 1;
    const STATE_STRING = 2;
    const STATE_COMMENT = 3;
    const STATE_COMMENT_SINGLE = 4;
    const STATE_COMMENT_MULTI = 5;
    const STATE_COMMENT_MULTI2 = 6;
    const STATE_NUMBER = 7;
    const STATE_OPERATOR = 8;
    let state = STATE_FIRST;
    const res = [];
    const pos = this.p;
    for (;;) {
      const c = this.getChar();
      if (state == STATE_FIRST) {
        if (reteol && c == "\n") {
          return { pos, type: "eol" };
        } else if (c == " " || c == "\t" || c == "\n") {
          continue;
        } else if (c === undefined) {
          return { pos, type: "eof" };
        } else if (c == "?") {
          return { pos, type: "var", name: "print" };
        } else if (c == "#") {
          state = STATE_COMMENT;
        } else if (c == "{" || c == "}" || c == "(" || c == ")" || c == "[" || c == "]") {
          return { pos, type: c };
        } else if (c == '"') {
          state = STATE_STRING;
        } else if (isNumber(c) || c == ".") {
          res.push(c);
          state = STATE_NUMBER;
        } else if (isOperator(c)) {
          res.push(c);
          state = STATE_OPERATOR;
        } else {
          res.push(c);
          state = STATE_WORD;
        }
      } else if (state == STATE_WORD) {
        if (c == " " || c == "\t" || c == "\n" || isOperator(c) || c == "(" || c == ")" || c == "[" || c == "]" || c === undefined) {
          this.p--;
          const w = res.join("");
          if (this.reserved.indexOf(w) >= 0) {
            return { pos, type: w };
          } else {
            return { pos, type: "var", name: w };
          }
        } else {
          res.push(c);
        }
      } else if (state == STATE_STRING) {
        if (c == '"') {
          const w = res.join("");
          return { pos, type: "string", value: w };
        } else if (c == "\n" || c === undefined) {
          throw new Error("文字列が閉じられていません");
        } else {
          res.push(c);
        }
      } else if (state == STATE_COMMENT) {
        if (c == "=") {
          state = STATE_COMMENT_MULTI;
        } else {
          this.p--;
          state = STATE_COMMENT_SINGLE;
        }
      } else if (state == STATE_COMMENT_SINGLE) {
        if (c == "\n") {
          return { pos, type: "eol" };
        } else if (c === undefined) {
          return { pos, type: "eof" };
        }
      } else if (state == STATE_COMMENT_MULTI) {
        if (c == "=") {
          state = STATE_COMMENT_MULTI2;
        } else if (c === undefined) {
          return { pos, type: "eof" };
        }
      } else if (state == STATE_COMMENT_MULTI2) {
        if (c == "#") {
          return { pos, type: "eol" };
        } else if (c === undefined) {
         return { pos, type: "eof" };
        } else {
          state = STATE_COMMENT_MULTI;
        }
      } else if (state == STATE_NUMBER) {
        if (isNumber(c) || c == ".") {
          res.push(c);
        } else {
          this.p--;
          const w = res.join("");
          return { pos, type: "num", value: parseFloat(w) };
        }
      } else if (state == STATE_OPERATOR) {
        if (isOperator(c)) {
          res.push(c);
        } else {
          this.p--;
          const w = res.join("");
          return { pos, type: "operator", operator: w };
        }
      }
    }
  }
  backToken(token) {
    this.p = token.pos;
  }
  getExpression1() {
    let res = this.getValue();
    for (;;) {
      const op = this.getToken();
      if (op.type != "operator" || (
          op.operator != "*" &&
          op.operator != "/" &&
          op.operator != "%" &&
          op.operator != "//"
      )) {
        this.backToken(op);
        return res;
      }
      const v2 = this.getValue();
      const o = op.operator;
      if (o != "*" && o != "/" && o != "%" && o != "//") throw new Error("非対応の演算子が使われています: " + o);
      res = {
        type: "BinaryExpression",
        left: res,
        operator: o,
        right: v2,
      };
    }
  }
  getExpression() {
    let res = this.getExpression1();
    for (;;) {
      const op = this.getToken();
      if (op.type != "operator" || op.operator == ",") {
        this.backToken(op);
        return res;
      }
      const v2 = this.getExpression1();
      if (op.operator == "+") {
        res = {
          type: "BinaryExpression",
          left: res,
          operator: "+",
          right: v2,
        };
      } else {
        if (typeof res == "string" || typeof v2 == "string") throw new Error("文字列では使用できない演算子です");
        if (op.operator == "-") {
          res = {
            type: "BinaryExpression",
            left: res,
            operator: "-",
            right: v2,
          };
        } else {
          //throw new Error("未対応の演算子です : " + op.operator);
          this.backToken(op);
          return res;
        }
      }
    }
  }
  /*
  parseExpression0() {
    let startp = this.p;
    for (;;) {
      const token = this.getToken(true);
      if (token.operator == "," || token.type == "{" || token.type == "}" || token.type == "eof" || token.type == "eol") {
        this.backToken(token);
        const exp = this.s.substring(startp, this.p) || '""';
        //console.log(exp);
        const ast = parseModule(exp);
        return ast.body[0].expression;
      }
    }
  }
  */
  getValue() {
    const t1 = this.getToken();
    if (t1.type == "(") {
      const res = this.getExpression();
      const t2 = this.getToken();
      if (t2.type != ")") throw new Error("カッコが閉じられていません");
      return res;
    }
    if (t1.type == "[") {
      const elements = [];
      for (;;) {
        const t2 = this.getToken();
        if (t2.type == "]") break;
        this.backToken(t2);
        elements.push(this.getExpression());
        const t3 = this.getToken();
        if (t3.type == "]") break;
        if (t3.type != "operator" && t3.operator != ",") throw new Error("配列の定義は , で区切る必要があります");
      }
      return {
        type: "ArrayExpression",
        elements,
      };
    }
    if (t1.type == "num" || t1.type == "string") {
      return {
        type: "Literal",
        value: t1.value,
      };
    } else if (t1.type == "operator" && t1.operator == "-") {
      return {
        type: "UnaryExpression",
        operator: "-",
        argument: this.getValue(),
      };
    } else if (t1.type == "var") {
      const chk = this.getToken();
      if (chk.type != "(") {
        this.backToken(chk);
        return this.parseVar(t1.name);
      }
      // function call
      const args = [];
      const chk1 = this.getToken();
      if (chk1.type != ")") {
        this.backToken(chk1);
        for (;;) {
          args.push(this.getExpression());
          const chk2 = this.getToken();
          if (chk2.type == ")") break;
          if (chk2.type != "operator" && chk2.operator != ",") throw new Error("関数呼び出しのパラメータは , 区切りが必要です");
        }
      }
      return {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: t1.name,
        },
        arguments: args,
      };

      /*
    } else if (t1.operator == "-") {
      const t2 = this.getToken();
      if (t2.type == "num") {
        return {
          type: "Literal",
          value: -t2.value,
        };
      } else {
        throw new Error("式ではないものが指定されています : " + t1.type);
      }
      */
    } else {
      throw new Error("式ではないものが指定されています : " + t1.type);
    }
  }
  getConditionValue1() {
    const t1 = this.getToken();
    if (t1.type == "(") {
      const res = this.getCondition();
      const t2 = this.getToken();
      if (t2.type != ")") throw new Error("カッコが閉じられていません");
      return res;
    } else {
      this.backToken(t1);
    }
    //const v1 = this.getValue();
    const v1 = this.getExpression();
    const op = this.getToken();
    if (op.type != "operator") {
      this.backToken(op);
      return v1;
    }
    //const v2 = this.getValue();
    const v2 = this.getExpression();
    if (["=", "==", "!=", ">", "<", ">=", ">=", "<="].indexOf(op.operator) == -1) {
      throw new Error("条件式で未対応の演算子です : " + op.operator);
    }
    return {
      type: "BinaryExpression",
      left: v1,
      operator: op.operator == "=" ? "==" : op.operator,
      right: v2,
    };
  }
  getConditionValue() {
    const chknot = this.getToken();
    let flg = true;
    if (chknot.type == "not") {
      flg = false;
    } else {
      this.backToken(chknot);
    }
    const n = this.getConditionValue1();
    if (flg) {
      return n;
    } else {
      return {
        type: "UnaryExpression",
        operator: "not",
        argument: n,
      };
    }
  }
  getConditionAnd() {
    let res = this.getConditionValue();
    for (;;) {
      const op = this.getToken();
      if (op.type != "and") {
        this.backToken(op);
        return res;
      }
      const v2 = this.getConditionValue();
      if (op.type == "and") {
        res = {
          type: "BinaryExpression",
          left: res,
          operator: "and",
          right: v2,
        };
      } else {
        throw new Error("未対応の演算子です : " + op.operator);
      }
    }
  }
  getCondition() {
    let res = this.getConditionAnd();
    for (;;) {
      const op = this.getToken();
      if (op.type != "or") {
        this.backToken(op);
        return res;
      }
      const v2 = this.getConditionAnd();
      if (op.type == "or") {
        res = {
          type: "BinaryExpression",
          left: res,
          operator: "or",
          right: v2,
        };
      } else {
        throw new Error("未対応の演算子です : " + op.operator);
      }
    }
  }
  parseVar(name) {
    let op = this.getToken();

    const array = [];
    for (;;) {
      if (op.type != "[") {
        this.backToken(op);
        break;
      }
      const idx = this.getExpression();
      const op2 = this.getToken();
      if (op2.type != "]") throw new Error("配列の要素指定が ] で囲われていません");
      array.push(idx);
      op = this.getToken();
    }
    if (array.length == 0) {
      return {
        type: "Identifier",
        name: name,
      };
    }
    let left = {
      type: "MemberExpression",
      object: {
        type: "Identifier",
        name: name,
      },
      property: array[0],
      computed: true,
      //optional: false,
    };
    for (let i = 1; i < array.length; i++) {
      left = {
        type: "MemberExpression",
        object: left,
        property: array[i],
        computed: true,
        //optional: false,
      };
    }
    return left;
  }
  parseCommand(body, forcetoken) {
    const token = forcetoken || this.getToken();
    //console.log("parseCommand", token);
    if (token.type == "eof") return false;
    if (this.blacketmode) {
      if (token.type == "}") {
        this.backToken(token);
        return false;
      }
    } else {
      if (["endif", "else", "elseif", "next", "until", "end"].indexOf(token.type) >= 0) {
        this.backToken(token);
        return false;
      }
    }
    if (token.type == "var") {
      if (token.name == "print") {
        const res = [];
        const chk = this.getToken(true);
        if (chk.type == "eol" || chk.type == "eof") {
          this.backToken(chk);
        } else {
          this.backToken(chk);
          for (;;) {
            res.push(this.getExpression());
            const op = this.getToken();
            if (op.type == "eol" || op.type == "eof") {
              this.backToken(op);
              break;
            }
            if (op.operator != ",") {
              this.backToken(op);
              break;
              //throw new Error("表示はコンマ区切りのみ対応しています");
            }
          }
        }
        body.push({
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: {
              type: "Identifier",
              name: "print",
            },
            arguments: res,
          },
        });
      } else {

        // [var] = [expression]
        // [var] <- [expression]
        // [var][idx] <= [expression]
        // [function]([params])
        // x [function] [params] // paramsで括弧付きのものがあると破天
        const chk = this.getToken();
        if (chk.type == "(") { // function
          const params = [];
          const chk = this.getToken();
          if (chk.type != ")") {
            this.backToken(chk);
            for (;;) {
              params.push(this.getExpression());
              const cma = this.getToken();
              if (cma.type == ")") break;
              if (cma.type != "operator" && cma.operator != ",") {
                //throw new Error("引数の区切り , が必要です");
                throw new Error(`function call arguments must separete by ","`);
              }
            }
          }
          body.push({
            type: "ExpressionStatement",
            expression: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: token.name,
              },
              arguments: params,
            },
          });
        } else { // var
          this.backToken(chk);
          let token2 = token;
          const res = [];
          for (;;) {
            const left = this.parseVar(token2.name);

            const c = this.getCharNotWhite();
            if (c == "=" || c == "<") {
              if (c == "<") {
                const c2 = this.getChar();
                if (c2 != "-") {
                  throw new Error("代入は変数の後に <- または = が必要です");
                }
              }
            }
            /*
            const op = this.getToken();
            if (op.type != "operator" || op.operator != "=") {
              //throw new Error("代入は変数の後に = で続ける必要があります");
              throw new Error(`assign operation must have "="`);
            }
            */
            const right = this.getExpression();
            res.push({
              type: "AssignmentExpression",
              operator: "=",
              left,
              right,
            });
            //if (isConstantName(token2.name) && this.vars[token2.name] !== undefined) throw new Error("定数には再代入できません");
            //this.vars[token2.name] = val;

            const op2 = this.getToken();
            if (op2.type == "eol" || op2.type == "eof") {
              this.backToken(op2);
              break;
            }
            if (op2.operator != ",") {
              //throw new Error("代入はコンマ区切りのみ対応しています");
              this.backToken(op2);
              break;
            }
            token2 = this.getToken();
            if (token2.type != "var") {
              //throw new Error("コンマ区切りで続けられるのは代入文のみです");
              throw new Error("only assign operation after comma");
            }
          }
          if (res.length == 1) {
            body.push({
              type: "ExpressionStatement",
              expression: res[0],
            });
          } else {
            body.push({
              type: "ExpressionStatement",
              expression: {
                type: "SequenceExpression",
                expressions: res,
              }
            });
          }
        }  
      }
    } else if (token.type == "if") {
      const cond = this.getCondition();
      if (this.blacketmode) {
        const tthen = this.getToken();
        if (tthen.type != "{") {
          throw new Error(`if文の条件の後に"{"がありません`);
          //throw new Error(`missing "{" after if`);
        }
      }
      const then = [];
      for (;;) {
        if (!this.parseCommand(then)) {
          const endblacket = this.getToken();
          if (this.blacketmode) {
            if (endblacket.type != "}") {
              throw new Error(`"}"で閉じられていません`);
              //throw new Error(`missing "}"`);
            }
            break;
          } else {
            if (endblacket.type != "endif" && endblacket.type != "else" && endblacket.type != "elseif") {
              //throw new Error("if must have endif, else or elseif");
              throw new Error("if には endif、else、elseif のいずれかが必要です");
            }
            if (endblacket.type != "endif") {
              this.backToken(endblacket);
            }
            break;
          }
        }
      }
      const telse = this.getToken();
      if (telse.type == "elseif") {
        const bodyelse = [];
        const forcetoken = { type: "if" };
        this.parseCommand(bodyelse, forcetoken);
        body.push({
          type: "IfStatement",
          test: cond,
          consequent: {
            type: "BlockStatement",
            body: then,
          },
          alternate: bodyelse[0],
        });
      } else if (telse.type == "else") {
        if (this.blacketmode) {
          const telse2 = this.getToken();
          if (telse2.type == "if") {
            this.backToken(telse2);
            const bodyelse = [];
            this.parseCommand(bodyelse);
            body.push({
              type: "IfStatement",
              test: cond,
              consequent: {
                type: "BlockStatement",
                body: then,
              },
              alternate: bodyelse[0],
            });        
            return true;
          }
          if (telse2.type != "{") throw new Error(`else文の条件の後に"{"がありません`);
        }
        const bodyelse = [];
        for (;;) {
          if (!this.parseCommand(bodyelse)) {
            const endblacket = this.getToken();
            if (this.blacketmode) {
              if (endblacket.type != "}") {
                throw new Error(`"}"で閉じられていません`);
                //throw new Error(`missing "}"`);
              }
            } else {
              if (endblacket.type != "endif") {
                //throw new Error("else must have endif");
                throw new Error("else には endif が必要です");
              }
              //this.backToken(endblacket);
            }
            break;
          }
        }
        body.push({
          type: "IfStatement",
          test: cond,
          consequent: {
            type: "BlockStatement",
            body: then,
          },
          alternate: {
            type: "BlockStatement",
            body: bodyelse,
          },
        });        
      } else {
        this.backToken(telse);
        body.push({
          type: "IfStatement",
          test: cond,
          consequent: {
            type: "BlockStatement",
            body: then,
          },
          alternate: null,
        });
      }
    } else if (token.type == "while") {
      const cond = this.getCondition();
      //console.log("tthen", tthen);
      if (this.blacketmode) {
        const tthen = this.getToken();
        if (tthen.type != "{") throw new Error(`while文の条件の後に"{"がありません`);
      }
      const then = [];
      for (;;) {
        if (!this.parseCommand(then)) {
          const endblacket = this.getToken();
          if (this.blacketmode) {
            if (endblacket.type != "}") {
              throw new Error(`while文が"}"で閉じられていません`);
            }
          } else {
            if (endblacket.type != "next") {
              //throw new Error(`while must have next`);
              throw new Error("while には next が必要です");
            }
          }
          break;
        }
      }
      body.push({
        type: "WhileStatement",
        test: cond,
        body: {
          type: "BlockStatement",
          body: then,
        }
      });
    } else if (token.type == "do") {
      if (this.blacketmode) {
        const tthen = this.getToken();
        if (tthen.type != "{") throw new Error(`do文の条件の後に"{"がありません`);
      }
      const then = [];
      for (;;) {
        if (!this.parseCommand(then)) {
          const endblacket = this.getToken();
          if (this.blacketmode) {
            if (endblacket.type != "}") throw new Error(`do文が"}"で閉じられていません`);
          } else {
            if (endblacket.type != "until") throw new Error(`do must have until`);
            this.backToken(endblacket);
          }
          break;
        }
      }
      const whileoruntil = this.getToken();
      if (this.blacketmode && whileoruntil.type == "while") {
        const cond = this.getCondition();
        body.push({
          type: "DoWhileStatement",
          body: {
            type: "BlockStatement",
            body: then,
          },
          test: cond,
        });
      } else if (whileoruntil.type == "until") {
        const cond = this.getCondition();
        body.push({
          type: "DoWhileStatement",
          body: {
            type: "BlockStatement",
            body: then,
          },
          test: {
            type: "UnaryExpression",
            operator: "not",
            argument: cond,
          },
        });
      } else {
        if (this.blacketmode) {
          throw new Error("do文の後は while または until が必要です");
        } else {
          //throw new Error("do must have until");
          throw new Error("do には until が必要です");
        }
      }
    } else if (token.type == "for") {
      const varname = this.getToken();
      if (varname.type != "var") {
        throw new Error("for文の後は変数名が必要です");
        //throw new Error("need var name after for");
      }
      const eq = this.getToken();
      if (eq.operator != "=" && eq.operator != "<-") {
        throw new Error("for文の変数名の後は <- または = が必要です");
        //throw new Error("need = after for var name");
      }
      const initval = this.getExpression();
      const to = this.getToken();
      if (to.type != "to") {
        throw new Error("for文の初期変数設定の後は to が必要です");
        //throw new Error("need to after for initial assign");
      }
      const endval = this.getExpression();
      const chkstep = this.getToken();
      let step = {
        type: "Literal",
        value: 1,
      };
      if (chkstep.type != "step") {
        this.backToken(chkstep);
      } else {
        step = this.getExpression();
        if (!(
          step.type == "Literal" ||
          step.type == "UnaryExpression" && step.operator == "-" && step.argument.type == "Literal"
        )) {
          throw new Error("stepには数値のみ指定可能です");
          //throw new Error("step must be literal");
        }
      }
      if (this.blacketmode) {
        const tthen = this.getToken();
        if (tthen.type != "{") throw new Error(`for文の後に"{"がありません`);
      }
      const then = [];
      for (;;) {
        if (!this.parseCommand(then)) {
          const endblacket = this.getToken();
          if (this.blacketmode) {
            if (endblacket.type != "}") throw new Error(`for文が"}"で閉じられていません`);
          } else {
            if (endblacket.type != "next") throw new Error(`for には next が必要です`);
          }
          break;
        }
      }
      const astvar = {
        type: "Identifier",
        name: varname.name,
      };
      const stepval = step.type == "Literal" ? step.value : -step.argument.value;
      body.push({
        type: "ForStatement",
        init: {
          type: "AssignmentExpression",
          operator: "=",
          left: astvar,
          right: initval,
        },
        test: {
          type: "BinaryExpression",
          left: astvar,
          operator: stepval > 0 ? "<=" : ">=",
          right: endval,
        },
        update: {
          type: "AssignmentExpression",
          operator: "=",
          left: astvar,
          right: {
            type: "BinaryExpression",
            left: astvar,
            operator: "+",
            right: step,
          },
        },
        body: {
          type: "BlockStatement",
          body: then,
        },
      });
    } else if (token.type == "function") {
      const varname = this.getToken();
      if (varname.type != "var") throw new Error("function文の後は関数名が必要です");
      const blacket = this.getToken();
      if (blacket.type == "from" || blacket.operator == ",") {
        // import function from other file
        const funcnames = [varname.name];
        if (blacket.type != "from") {
          for (;;) {
            const b = this.getToken();
            if (b.type == "from") break;
            if (b.type != "var") {
              throw new Error("関数名ではないものが指定されました");
            }
            funcnames.push(b.name);
            const b2 = this.getToken();
            if (b2.type == "from") break;
            if (b2.operator != ",") {
              throw new Error("外部functionを使うには from が必要です");
            }
          }
        }
        const fntoken = this.getToken();
        if (fntoken.type != "string") {
          throw new Error("外部functionを使うには from の後に参照ファイル名またはURLが必要です");
        }
        const properties = funcnames.map(name => ({
          type: "Property",
          method: false,
          shorthand: true,
          computed: false,
          key: {
            "type": "Identifier",
            name,
          },
          kind: "init",
          value: {
            type: "Identifier",
            name,
          },
        }));
        body.push({
          type: "VariableDeclaration",
          declarations: [
            {
              type: "VariableDeclarator",
              id: {
                type: "ObjectPattern",
                properties,
              },
              init: {
                type: "AwaitExpression",
                argument: {
                  type: "ImportExpression",
                  source: {
                    type: "Literal",
                    value: fntoken,
                  }
                }
              },
            }
          ],
          kind: "const"
        })
        return true;
      }
      if (blacket.type != "(") throw new Error("関数名の後は ( が必要です");
      const params = [];
      const chk = this.getToken();
      if (chk.type != ")") {
        this.backToken(chk);
        for (;;) {
          const chk = this.getToken();
          if (chk.type != "var") throw new Error("引数名がありません");
          params.push(chk.name);
          const cma = this.getToken();
          if (cma.type == ")") break;
          if (cma.type != "operator" && cma.operator != ",") throw new Error("引数の区切り , が必要です");
        }
      }
      if (this.blacketmode) {
        const b2 = this.getToken();
        if (b2.type != "{") throw new Error("関数の中身記述に { が必要です");
      }
      const body2 = [];
      for (;;) {
        if (!this.parseCommand(body2)) {
          const endblacket = this.getToken();
          if (this.blacketmode) {
            if (endblacket.type != "}") {
              throw new Error(`関数が"}"で閉じられていません`);
            }
          } else {
            if (endblacket.type != "end") {
              //throw new Error(`function must have end`);
              throw new Error(`function には end が必要です`);
            }
          }
          break;
        }
      }
      body.push({
        type: "FunctionDeclaration",
        id: {
          type: "Identifier",
          name: varname.name,
        },
        params: params.map(i => ({ type: "Identifier", name: i })),
        body: {
          type: "BlockStatement",
          body: body2,
        }
      });
    } else if (token.type == "return") {
      body.push({
        type: "ReturnStatement",
        argument: this.getExpression(),
      });
    } else if (token.type == "break") {
      body.push({
        type: "BreakStatement",
      });
    } else {
      //throw new Error("対応していない type " + token.type + " です");
    }
    //console.log(token);
    return true;
  }
}