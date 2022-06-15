#!/bin/bash

if [ -z ${EMSDK+x} ]; then
    source "./emsdk/emsdk_env.sh"
fi

emcc src/ft.cpp \
    "$EMSDK/upstream/emscripten/cache/sysroot/lib/libfreetype.a" \
    "$EMSDK/upstream/emscripten/cache/sysroot/lib/libbrotlidec-static.a" \
    "$EMSDK/upstream/emscripten/cache/sysroot/lib/libbrotlicommon-static.a" \
    -o example/ft.html -iwithsysroot/include/freetype2 \
    -O3 \
    -lembind \
    -s EXPORT_ES6=1 \
    -s MODULARIZE=1