# FreeType library built with WASM

Exposed API of the library can be seen from [TypeScript definitions](./dist/freetype.d.ts). Goal for the moment is not to expose all parts of the FreeType API, but enough to render text with kerning in Deno and browsers.

This WASM wrapper is MIT licensed, but Freetype is dual licensed, see licensing options from [FreeType repository](https://github.com/freetype/freetype). For  WOFF2 support the library is built with [Google's Brotli](https://github.com/google/brotli) which is MIT licensed.

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

## Run tests with deno

```bash
./test.sh
```

## TODO

- Bundle freetype.js and wasm to NPM or Deno.land/x
- [Variable font interface](https://freetype.org/freetype2/docs/reference/ft2-multiple_masters.html) not implemented yet
- Compile Freetype with Harfbuzz for ligatures and better kerning (?)
