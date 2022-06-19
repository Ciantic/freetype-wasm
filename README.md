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

Build.sh generates `dist/freetype.js`, and `dist/freetype.wasm` making the
example directory functional.

## Run tests with deno

```bash
./test.sh
```

## Usage with browsers and Deno directly

You need to do this inside a module to initiate the wrapper:

```javascript
import FreeTypeInit from "https://cdn.jsdelivr.net/npm/freetype-wasm@0.0.3/dist/freetype.js";
const FreeType = await FreeTypeInit();
// ...
```

See [example.js](example/example.js) for how to render text to canvas.

## Usage with Node web apps like React

Library works with Node projects which target the web like React. Since FreeType
JS wrapper fetches the WASM file asynchronously it might not work automatically
as the various bundlers have different ways to configure the depenencies.

Currently it's possible to use the library in Node web projects like this:

```bash
npm install freetype-wasm
```

Then import and initialize the WASM module from CDN, e.g. JSDelivr:

```javascript
import FreeTypeInit from "freetype-wasm/dist/freetype.js";
const FreeType = await FreeTypeInit({
  locateFile: (path) =>
    "https://cdn.jsdelivr.net/npm/freetype-wasm@0.0.3/dist/freetype.wasm",
});

```

Depending on your bundler you might get URL to the bundled WASM file also. I haven't tried with Create React App template, but it could be similar as next example with Vite.

## Usage with Vite bundler like in Solid

```bash
npm install freetype-wasm
```

Then fetch the URL for your bundler using special import with `?url` suffix:

```typescript
import FreeTypeInit from "freetype-wasm/dist/freetype.js";
import wasmUrl from "freetype-wasm/dist/freetype.wasm?url";
const Freetype = await FreeTypeInit({
  locateFile: (path) => wasmUrl,
});

```

## TODO

- [Variable font interface](https://freetype.org/freetype2/docs/reference/ft2-multiple_masters.html)
  not implemented yet
- Compile Freetype with Harfbuzz for ligatures and better kerning (?)
