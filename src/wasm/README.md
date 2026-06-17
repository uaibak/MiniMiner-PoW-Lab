# C++ WebAssembly Mining Engine

MiniMiner PoW Lab includes a C++ Proof-of-Work batch miner in `src/wasm/miniminer.cpp`.

The React app calls the shared mining interface in `src/core/miner.js`:

```js
mineBlock(input, callbacks)
```

When `public/wasm/miniminer.wasm` exists, the app loads it through `src/wasm/minerWasm.js` and mines nonce batches in C++. If the binary is missing, the app falls back to the JavaScript miner so development still works.

## Build

Install Emscripten first, then run:

```bash
npm run wasm:build
```

That command compiles:

```text
src/wasm/miniminer.cpp -> public/wasm/miniminer.wasm
```

## Exported C API

The C++ module exposes a tiny ABI:

- `miniminer_mine_batch(payload, payloadLength, difficulty, startNonce, batchSize)`
- `miniminer_get_hash()`
- `miniminer_get_nonce()`
- `miniminer_get_attempts()`
- `miniminer_engine_name()`

The module intentionally mines bounded batches, not infinite loops. JavaScript stays in charge of cancellation, progress callbacks, and yielding to the browser.
