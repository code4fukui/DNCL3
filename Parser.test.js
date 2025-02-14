import * as t from "https://deno.land/std/testing/asserts.ts";
import { Parser } from "./Parser.js";

const blacketmode = false;

const parse = (s) => {
  const p = new Parser(blacketmode);
  return p.parse(s);
};
const body = (n) => ({
  type: "BlockStatement",
  body: [
    {
      expression: {
        arguments: [
          {
            type: "Literal",
            value: n,
          },
        ],
        callee: {
          name: "print",
          type: "Identifier",
        },
        type: "CallExpression",
      },
      type: "ExpressionStatement",
    },
  ]
});

Deno.test("if", async () => {
  t.assertEquals(parse("if 0\nprint 0\nendif"),   {
      body: [
        {
          type: "IfStatement",
          test: {
            type: "Literal",
            value: 0,
          },
          consequent: body(0),
          alternate: null,
        },
      ],
      type: "Program",
    }
  );
});
Deno.test("if else", async () => {
  t.assertEquals(parse("if 0\nprint 0\nelse\nprint 1\nendif"),   {
      body: [
        {
          type: "IfStatement",
          test: {
            type: "Literal",
            value: 0,
          },
          consequent: body(0),
          alternate: body(1),
        },
      ],
      type: "Program",
    }
  );
});
Deno.test("if elseif endif", async () => {
  t.assertEquals(parse("if 0\nprint 0\nelseif 1\nprint 1\nelse\nprint 2\nendif"),   {
      body: [
        {
          type: "IfStatement",
          test: {
            type: "Literal",
            value: 0,
          },
          consequent: body(0),
          alternate: {
            type: "BlockStatement",
            body: [
              {
                type: "IfStatement",
                test: {
                  type: "Literal",
                  value: 1,
                },
                consequent: body(1),
                alternate: body(2),
              },
            ],
          },
        },
      ],
      type: "Program",
    }
  );
});
Deno.test("if elseif elseif endif", async () => {
  t.assertEquals(parse("if 0\nprint 0\nelseif 1\nprint 1\nelseif 1\nprint 2\nelse\nprint 3\nendif"),   {
      body: [
        {
          type: "IfStatement",
          test: {
            type: "Literal",
            value: 0,
          },
          consequent: body(0),
          alternate: {
            type: "BlockStatement",
            body: [
              {
                type: "IfStatement",
                test: {
                  type: "Literal",
                  value: 1,
                },
                consequent: body(1),
                alternate: {
                  type: "BlockStatement",
                  body: [
                    {
                      type: "IfStatement",
                      test: {
                        type: "Literal",
                        value: 1,
                      },
                      consequent: body(2),
                      alternate: body(3),
                    },
                  ],
                }
              },
            ],
          },
        },
      ],
      type: "Program",
    }
  );
});
