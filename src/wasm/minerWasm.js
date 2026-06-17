import { blockPayload } from '../core/block';
import { stableStringify } from '../core/hash';

const WASM_URL = '/wasm/miniminer.wasm';
let wasmModulePromise = null;

function yieldToBrowser() {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

function readCString(memory, pointer) {
  const bytes = new Uint8Array(memory.buffer);
  let end = pointer;
  while (bytes[end] !== 0) end += 1;
  return new TextDecoder().decode(bytes.subarray(pointer, end));
}

async function loadWasmModule() {
  if (wasmModulePromise) return wasmModulePromise;

  wasmModulePromise = (async () => {
    const response = await fetch(WASM_URL);
    if (!response.ok) {
      throw new Error('MiniMiner WASM binary is not available.');
    }

    const imports = {
      env: {
        emscripten_notify_memory_growth: () => {},
      },
      wasi_snapshot_preview1: {
        proc_exit: () => {},
      },
    };

    const { instance } = await WebAssembly.instantiateStreaming(response, imports);
    const exports = instance.exports;

    if (
      !exports.memory ||
      !exports.malloc ||
      !exports.free ||
      !exports.miniminer_mine_batch ||
      !exports.miniminer_get_hash ||
      !exports.miniminer_get_nonce ||
      !exports.miniminer_get_attempts
    ) {
      throw new Error('MiniMiner WASM exports are incomplete.');
    }

    return exports;
  })();

  return wasmModulePromise;
}

export async function isWasmMinerAvailable() {
  try {
    await loadWasmModule();
    return true;
  } catch {
    return false;
  }
}

export async function mineBlockWithWasm(input, callbacks = {}) {
  const wasm = await loadWasmModule();
  const {
    transactions,
    previousHash,
    difficulty,
    minerAddress,
    index = 1,
    batchSize = 10000,
    timestamp = new Date().toISOString(),
  } = input;

  const encoder = new TextEncoder();
  const startedAt = performance.now();
  let attempts = 0;
  let nonce = 0;
  let currentHash = '';

  const block = {
    index,
    timestamp,
    transactions,
    previousHash,
    nonce,
    hash: '',
    difficulty: Number(difficulty),
    minerAddress,
    miningStats: null,
  };

  const payload = stableStringify(blockPayload(block));
  const payloadBytes = encoder.encode(payload);
  const payloadPointer = wasm.malloc(payloadBytes.length);
  new Uint8Array(wasm.memory.buffer, payloadPointer, payloadBytes.length).set(payloadBytes);

  try {
    while (true) {
      if (callbacks.shouldStop?.()) {
        const elapsedMs = performance.now() - startedAt;
        return {
          stopped: true,
          block: null,
          stats: {
            attempts,
            elapsedMs,
            hashRate: elapsedMs > 0 ? attempts / (elapsedMs / 1000) : 0,
            stopped: true,
            engine: 'wasm-cpp',
          },
        };
      }

      const found = wasm.miniminer_mine_batch(
        payloadPointer,
        payloadBytes.length,
        Number(difficulty),
        nonce,
        batchSize,
      );
      const batchAttempts = wasm.miniminer_get_attempts();
      attempts += batchAttempts;
      nonce = wasm.miniminer_get_nonce() + 1;
      currentHash = readCString(wasm.memory, wasm.miniminer_get_hash());

      if (found) {
        const elapsedMs = performance.now() - startedAt;
        const foundNonce = wasm.miniminer_get_nonce();
        const miningStats = {
          attempts,
          elapsedMs,
          hashRate: elapsedMs > 0 ? attempts / (elapsedMs / 1000) : attempts,
          stopped: false,
          engine: 'wasm-cpp',
        };

        return {
          stopped: false,
          block: {
            ...block,
            nonce: foundNonce,
            hash: currentHash,
            miningStats,
          },
          stats: miningStats,
        };
      }

      const elapsedMs = performance.now() - startedAt;
      callbacks.onProgress?.({
        nonce,
        currentHash,
        attempts,
        elapsedMs,
        hashRate: elapsedMs > 0 ? attempts / (elapsedMs / 1000) : 0,
        engine: 'wasm-cpp',
      });

      await yieldToBrowser();
    }
  } finally {
    wasm.free(payloadPointer);
  }
}
