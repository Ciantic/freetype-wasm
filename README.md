# FreeType library built with WASM

It works, more how to instructions will be forthcoming.

## Steps to compile

1. Download emsdk to directory `emsdk`.
2. [Clone and build brotli](https://github.com/google/brotli) to directory `brotli`.
3. [Clone and build freetype2](https://github.com/freetype/freetype) to directory `freetype2`.
4. Build the freetype library
5. Run `build.sh` to build the wasm library file to `example` directory.

## Build the brotli (woff2 support) library instructions

Download brotli to directory `brotli`, and call `./build_brotli.sh`. It installs brotli to emsdk's sysroot: `./emsdk/upstream/emscripten/cache/sysroot/lib`.

## Build the freetype library instructions

Download freetype2 to directory `freetype2`., and call `./build_freetype.sh`. It installs Freetype library as linkable to the emsdk's directory `./emsdk/upstream/emscripten/cache/sysroot/lib/libfreetype.a`.

## TODO

- Bundle ft.wasm and ft.js with the example
- [Variable font interface](https://freetype.org/freetype2/docs/reference/ft2-multiple_masters.html) not implemented yet
- Compile Freetype with Brotli for woff2, Harfbuzz for ligatures
