# Build FreeType wasm library

You might need C++ build tools like `cmake` to build the emsdk.

```bash
./deps.sh # install dependencies
./build_emsdk.sh
./build_brotli.sh
./build_freetype.sh
./build.sh # Builds the WASM library
```

Build.sh generates `dist/freetype.js`, and `dist/freetype.wasm` making the
example directory functional.
