# FreeType library built with WASM

It works, more how to instructions will be forthcoming.

## Steps to compile

1. Download emsdk to directory `emsdk` with emsdk.
2. Download freetype2 to directory `freetype2`.
3. Build the freetype library (see below)
4. Run `build.sh` to build the wasm library file to `example` directory.

## Build the freetype library instructions

Following installs Freetype library as linkable to the emsdk's directory
`./emsdk/upstream/emscripten/cache/sysroot/lib/libfreetype.a`.

```bash
source "./emsdk/emsdk_env.sh"
sudo apt install cmake
cd freetype2
mkdir build
cd build
emcmake cmake ..
emmake make
emmake make install
```

## TODO

- Bundle ft.wasm and ft.js with the example
- [Variable font interface](https://freetype.org/freetype2/docs/reference/ft2-multiple_masters.html) not implemented yet
- Compile Freetype with Brotli for woff2, Harfbuzz for ligatures
