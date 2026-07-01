#!/usr/bin/env bash
set -euo pipefail

if [ -x /opt/homebrew/bin/python3 ]; then
  export PATH="/opt/homebrew/bin:$PATH"
  export EM_PYTHON="${EM_PYTHON:-/opt/homebrew/bin/python3}"
fi

EMSCRIPTEN_LIBEXEC="${EMSCRIPTEN_LIBEXEC:-/opt/homebrew/Cellar/emscripten/5.0.7/libexec}"
if [ -x "$EMSCRIPTEN_LIBEXEC/llvm/bin/clang" ]; then
  export EM_LLVM_ROOT="$EMSCRIPTEN_LIBEXEC/llvm/bin"
  export PATH="$EMSCRIPTEN_LIBEXEC/llvm/bin:$PATH"
fi

if [ -x "$EMSCRIPTEN_LIBEXEC/binaryen/bin/wasm-opt" ]; then
  export EM_BINARYEN_ROOT="$EMSCRIPTEN_LIBEXEC/binaryen"
  export PATH="$EMSCRIPTEN_LIBEXEC/binaryen/bin:$PATH"
fi

export EM_CACHE="${EM_CACHE:-$(pwd)/.emscripten-cache}"
export EM_CONFIG="${EM_CONFIG:-$(pwd)/.emscripten-config}"

mkdir -p public/wasm
mkdir -p "$EM_CACHE"

printf "%s\n" \
  "LLVM_ROOT = '$EMSCRIPTEN_LIBEXEC/llvm/bin'" \
  "BINARYEN_ROOT = '$EMSCRIPTEN_LIBEXEC/binaryen'" \
  "NODE_JS = ['$(command -v node)']" \
  "CACHE = '$EM_CACHE'" \
  "FROZEN_CACHE = False" \
  > "$EM_CONFIG"

emcc src/wasm/miniminer.cpp \
  --cache "$EM_CACHE" \
  -O3 \
  -std=c++17 \
  --no-entry \
  -s STANDALONE_WASM=1 \
  -s EXPORTED_FUNCTIONS='["_malloc","_free","_miniminer_mine_batch","_miniminer_get_hash","_miniminer_get_nonce","_miniminer_get_attempts","_miniminer_engine_name"]' \
  -s EXPORTED_RUNTIME_METHODS='[]' \
  -o public/wasm/miniminer.wasm

echo "Built public/wasm/miniminer.wasm"
