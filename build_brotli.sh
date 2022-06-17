#!/bin/bash

if [ -z ${EMSDK+x} ]; then
    source "./emsdk/emsdk_env.sh" || exit
fi

mkdir -p brotli/buildc
(
    cd brotli/buildc || exit
    emcmake cmake ..
    emmake make
    emmake make install
)