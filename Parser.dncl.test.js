import * as t from "https://deno.land/std/testing/asserts.ts";
import { Parser } from "./Parser.js";

const blacketmode = true;

const log = (ast) => {
  console.log(JSON.stringify(ast, null, 2));
};
const parse = (s) => {
  const p = new Parser(blacketmode);
  return p.parse(s);
};
const expression = (n) => ({
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
});
const body = (n) => ({
  type: "BlockStatement",
  body: [
    expression(n),
  ]
});

Deno.test("if endif", async () => {
  t.assertEquals(parse("if 0 { print 0 }"),   {
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

Deno.test("if else endif", async () => {
  t.assertEquals(parse("if 0 { print 0 } else { print 1 }"),
  {
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

Deno.test("if elseif else endif", async () => {
  const ast = parse("if 0 { print 0 } else if 1 { print 1 } else { print 2 }");
  //console.log(JSON.stringify(ast, null, 2));
  t.assertEquals(ast, {
      body: [
        {
          type: "IfStatement",
          test: {
            type: "Literal",
            value: 0,
          },
          consequent: body(0),
          alternate: {
            type: "IfStatement",
            test: {
              type: "Literal",
              value: 1,
            },
            consequent: body(1),
            alternate: body(2),
          },
        },
      ],
      type: "Program",
    }
  );
});

Deno.test("if elseif elseif endif", async () => {
  t.assertEquals(parse(`
  if 0 {
    print 0
  } else if 1 {
    print 1
  } else if 1 {
    print 2
  } else {
    print 3
  }
  `),   {
      body: [
        {
          "type": "IfStatement",
          "test": {
            "type": "Literal",
            "value": 0
          },
          "consequent": body(0),
          "alternate": {
            "type": "IfStatement",
            "test": {
              "type": "Literal",
              "value": 1
            },
            "consequent": body(1),
            "alternate": {
              "type": "IfStatement",
              "test": {
                "type": "Literal",
                "value": 1
              },
              "consequent": body(2),
              "alternate": body(3),
            }
          }
        },
      ],
      type: "Program",
    }
  );
});
/*
Deno.test("issues#11", async () => {
const testcode = `
if 0
  if 0
    print 1
  elseif 1
    print 2
  else
    print 12
  endif
else
  print 3
endif
`;
  const ast = parse(testcode);
  //console.log(JSON.stringify(ast, null, 2));
  t.assert(ast != null);
});


// if 0
//   if 0
//     print 1
//   else
//     if 1
//       print 2
//     endif
//   else
//     print 3
//   endif

Deno.test("elseif", async () => {
const testcode = `
if 0
  print 0
elseif 1
  print 1
elseif 2
  print 2
endif
`;
// if
//   test 0
//   con print 0
//   alt if
//     test 1
//     con print 1
//     alt if
//       test 2
//       con print 2
//       alt null
  const ast = parse(testcode);
  //console.log(JSON.stringify(ast, null, 2));
  t.assert(ast != null);
});

Deno.test("issues#11 min", async () => {
const testcode = `
if 0
  if 0
    print 0
  elseif 1
    print 1
  elseif 2
    print 2
  endif
else
  print 3
endif
`;

  const ast = parse(testcode);
  //console.log(JSON.stringify(ast, null, 2));
  t.assert(ast != null);
});


Deno.test("issues#11", async () => {
const testcode = `a=[1,4,2,7,3,8,9,5,6]
n1=-1
n2=-1
i = 0
if i>0
  if a[i]>n1
      n2=n1,n1=a[i]
  elseif a[i]>n2
      n2=a[i]
  endif
else
  n1=a[i]
endif
print n1,n2
`;
  t.assert(parse(testcode) != null);
});
*/

Deno.test("for if", async () => {
  const ast = parse("for i <- 0 to 2 { if 0 { print 0 } }");
  //log(ast)
  t.assertEquals(ast, {
    "type": "Program",
    "body": [
      {
        "type": "ForStatement",
        "init": {
          "type": "AssignmentExpression",
          "operator": "=",
          "left": {
            "type": "Identifier",
            "name": "i"
          },
          "right": {
            "type": "Literal",
            "value": 0
          }
        },
        "test": {
          "type": "BinaryExpression",
          "left": {
            "type": "Identifier",
            "name": "i"
          },
          "operator": "<=",
          "right": {
            "type": "Literal",
            "value": 2
          }
        },
        "update": {
          "type": "AssignmentExpression",
          "operator": "=",
          "left": {
            "type": "Identifier",
            "name": "i"
          },
          "right": {
            "type": "BinaryExpression",
            "left": {
              "type": "Identifier",
              "name": "i"
            },
            "operator": "+",
            "right": {
              "type": "Literal",
              "value": 1
            }
          }
        },
        "body": {
          "type": "BlockStatement",
          "body": [
            {
              "type": "IfStatement",
              "test": {
                "type": "Literal",
                "value": 0
              },
              "consequent": body(0),
              "alternate": null
            }
          ]
        }
      }
    ]
  });
});
