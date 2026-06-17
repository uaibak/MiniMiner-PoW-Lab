#!/usr/bin/env bash
set -euo pipefail

mkdir -p public/wasm

emcc src/wasm/miniminer.cpp \
  -O3 \
  -std=c++17 \
  -s STANDALONE_WASM=1 \
  -s EXPORTED_FUNCTIONS='["_malloc","_free","_miniminer_mine_batch","_miniminer_get_hash","_miniminer_get_nonce","_miniminer_get_attempts","_miniminer_engine_name"]' \
  -s EXPORTED_RUNTIME_METHODS='[]' \
  -o public/wasm/miniminer.wasm

echo "Built public/wasm/miniminer.wasm"
