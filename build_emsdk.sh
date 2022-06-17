#!/bin/bash

(
    cd emsdk || exit
    ./emsdk install latest
    ./emsdk activate latest
)