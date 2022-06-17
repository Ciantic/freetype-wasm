#!/bin/bash

if [ -z ${EMSDK+x} ]; then
    source "./emsdk/emsdk_env.sh" || exit
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
printf '%s\n/*\n%s\n\n%s\n%s\n*/\n%s\n' \
    "/// <reference types=\"./freetype.d.ts\" />" \
    "Freetype WASM library: https://github.com/Ciantic/freetype-wasm" \
    "$(cat freetype2/LICENSE.TXT)" \
    "$(cat brotli/LICENSE)" \
    "$(cat example/freetype.js)" \
    >example/freetype.js
