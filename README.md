# FreeType library built with WASM

It works, more how to instructions will be forthcoming.

## Steps to compile

```bash
./deps.sh # install dependencies
./build_emsdk.sh
./build_brotli.sh
./build_freetype.sh
./build.sh # Builds the WASM library
```

Build.sh generates `example/freetype.js` making the example directory
functional.

## TODO

- Bundle ft.js to NPM or Deno.land/x
- [Variable font interface](https://freetype.org/freetype2/docs/reference/ft2-multiple_masters.html) not implemented yet
- Compile Freetype with Harfbuzz for ligatures (?)
