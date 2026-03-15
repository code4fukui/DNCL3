# DNCL3

The DNCL3 is a procedure description language designed for algorithm and programming education in high schools.

## Demo
- DNCL3 runtime environment: [DNCL3 Runtime](https://code4fukui.github.io/DNCL3/)
- Example of embedding DNCL3 in HTML: [DNCL on web](https://code4fukui.github.io/DNCL3/dnclweb.html)

## Features
- Supports variables, arithmetic/logical operations, conditional statements, and loops
- Allows defining and calling functions, including with Japanese names
- Provides built-in functions for input, output, and utility operations
- Supports multi-dimensional arrays
- Includes a command line interface (CLI) for execution

## Requirements
DNCL3 runs in a browser environment or can be executed using Deno.

## Usage
To run DNCL3 code in the browser:
```html
<script type="module" src="https://code4fukui.github.io/DNCL3/web.js"></script>
<script type="text/dncl">
  // DNCL3 code here
</script>
```

To run DNCL3 code using the CLI:
```sh
deno -A https://code4fukui.github.io/DNCL3/cli.js examples/bmi.dncl
```

## License
DNCL3 is an open-source project released under an unspecified license.