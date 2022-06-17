#!/bin/bash

if [ -z ${EMSDK+x} ]; then
    source "./emsdk/emsdk_env.sh"
fi

mkdir -p freetype2/build
(
    cd freetype2/build || exit
    emcmake cmake \
        -D BROTLIDEC_LIBRARIES="$EMSDK/upstream/emscripten/cache/sysroot/lib/libbrotlidec-static.a" \
        -D FT_DISABLE_ZLIB=TRUE \
        -D FT_DISABLE_BZIP2=TRUE \
        -D FT_DISABLE_PNG=TRUE \
        -D FT_DISABLE_HARFBUZZ=TRUE \
        -D FT_REQUIRE_BROTLI=TRUE \
        ..
    emmake make
    emmake make install
)