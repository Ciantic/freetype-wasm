# FreeType library built with WASM

Exposed API of the library can be seen from
[TypeScript definitions](./dist/freetype.d.ts). Goal for the moment is not to
expose all parts of the FreeType API, but enough to render text with kerning in
Deno and browsers.

This WASM wrapper is MIT licensed, but Freetype is dual licensed, see licensing
options from [FreeType repository](https://github.com/freetype/freetype). For
WOFF2 support the library is built with
[Google's Brotli](https://github.com/google/brotli) which is MIT licensed.

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

## Usage with browsers directly

See [example.js](example/example.js) for simple example how to render.

## Usage with Node

This is an ES module, but it works with Node projects which target the web like
React or Solid apps built with Node. Since FreeType JS wrapper fetches the WASM
file it won't work automatically as the various bundlers don't understand how to
bundle the WASM file as relative path with the JS file.

Currently it's possible to use the library in Node web projects like this:

```bash
npm install freetype-wasm
```

Then import and initialize the WASM module from CDN, e.g. JSDelivr:

```javascript
import FreeTypeInit from "freetype-wasm/dist/freetype.js";

const FreeType = await FreeTypeInit({
  locateFile: (path) =>
    "https://cdn.jsdelivr.net/npm/freetype-wasm@0.0.2/dist/freetype.wasm",
});
```

## TODO

- [Variable font interface](https://freetype.org/freetype2/docs/reference/ft2-multiple_masters.html)
  not implemented yet
- Compile Freetype with Harfbuzz for ligatures and better kerning (?)
