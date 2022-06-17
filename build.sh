#!/bin/bash

set -e

if [ -z ${EMSDK+x} ]; then
    source "./emsdk/emsdk_env.sh"
fi

emcc src/ft.cpp \
    "$EMSDK/upstream/emscripten/cache/sysroot/lib/libfreetype.a" \
    "$EMSDK/upstream/emscripten/cache/sysroot/lib/libbrotlidec-static.a" \
    "$EMSDK/upstream/emscripten/cache/sysroot/lib/libbrotlicommon-static.a" \
    -iwithsysroot/include/freetype2 \
    -O3 \
    -lembind \
    -s EXPORT_ES6=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME=FreeType \
    -s SINGLE_FILE=1 \
    -o example/freetype.js

# Prepend texts to the built file
printf '%s\n/*!\n%s\n%s\n\n%s\n%s\n\n%s\n%s\n*/\n%s\n' \
    "/// <reference types=\"./freetype.d.ts\" />" \
    "Freetype WASM library MIT license:" \
    "https://github.com/Ciantic/freetype-wasm" \
    "Uses Freetype, see licensing options from:" \
    "https://github.com/freetype/freetype/blob/master/LICENSE.TXT" \
    "Uses Brotli for WOFF2 fonts, MIT license:" \
    "https://github.com/google/brotli/blob/master/LICENSE" \
    "$(cat example/freetype.js)" \
    > example/freetype.js

echo "✅ Build finished"