// MiniMiner PoW Lab C++ mining engine.
//
// This file is designed for WebAssembly builds with Emscripten. It mines a
// bounded nonce batch so JavaScript can keep yielding to the browser between
// calls and preserve the same safe UI behavior as the JS miner.

#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <string>

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

namespace {

char g_hash[65] = {0};
uint32_t g_nonce = 0;
uint32_t g_attempts = 0;

constexpr uint32_t k[64] = {
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b,
    0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
    0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7,
    0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152,
    0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
    0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
    0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08,
    0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f,
    0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2};

uint32_t rotr(uint32_t value, uint32_t bits) {
  return (value >> bits) | (value << (32 - bits));
}

void sha256_bytes(const uint8_t *data, size_t length, uint8_t out[32]) {
  uint32_t h[8] = {0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
                   0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19};

  const uint64_t bit_length = static_cast<uint64_t>(length) * 8;
  const size_t padded_length = ((length + 9 + 63) / 64) * 64;
  uint8_t *message = static_cast<uint8_t *>(std::calloc(padded_length, 1));
  if (!message) {
    std::memset(out, 0, 32);
    return;
  }

  std::memcpy(message, data, length);
  message[length] = 0x80;
  for (int i = 0; i < 8; ++i) {
    message[padded_length - 1 - i] = static_cast<uint8_t>(bit_length >> (8 * i));
  }

  for (size_t offset = 0; offset < padded_length; offset += 64) {
    uint32_t w[64] = {0};
    for (int i = 0; i < 16; ++i) {
      const size_t j = offset + i * 4;
      w[i] = (static_cast<uint32_t>(message[j]) << 24) |
             (static_cast<uint32_t>(message[j + 1]) << 16) |
             (static_cast<uint32_t>(message[j + 2]) << 8) |
             static_cast<uint32_t>(message[j + 3]);
    }

    for (int i = 16; i < 64; ++i) {
      const uint32_t s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >> 3);
      const uint32_t s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >> 10);
      w[i] = w[i - 16] + s0 + w[i - 7] + s1;
    }

    uint32_t a = h[0];
    uint32_t b = h[1];
    uint32_t c = h[2];
    uint32_t d = h[3];
    uint32_t e = h[4];
    uint32_t f = h[5];
    uint32_t g = h[6];
    uint32_t hh = h[7];

    for (int i = 0; i < 64; ++i) {
      const uint32_t s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const uint32_t ch = (e & f) ^ (~e & g);
      const uint32_t temp1 = hh + s1 + ch + k[i] + w[i];
      const uint32_t s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const uint32_t maj = (a & b) ^ (a & c) ^ (b & c);
      const uint32_t temp2 = s0 + maj;

      hh = g;
      g = f;
      f = e;
      e = d + temp1;
      d = c;
      c = b;
      b = a;
      a = temp1 + temp2;
    }

    h[0] += a;
    h[1] += b;
    h[2] += c;
    h[3] += d;
    h[4] += e;
    h[5] += f;
    h[6] += g;
    h[7] += hh;
  }

  std::free(message);

  for (int i = 0; i < 8; ++i) {
    out[i * 4] = static_cast<uint8_t>(h[i] >> 24);
    out[i * 4 + 1] = static_cast<uint8_t>(h[i] >> 16);
    out[i * 4 + 2] = static_cast<uint8_t>(h[i] >> 8);
    out[i * 4 + 3] = static_cast<uint8_t>(h[i]);
  }
}

void to_hex(const uint8_t bytes[32], char out[65]) {
  constexpr char digits[] = "0123456789abcdef";
  for (int i = 0; i < 32; ++i) {
    out[i * 2] = digits[(bytes[i] >> 4) & 0x0f];
    out[i * 2 + 1] = digits[bytes[i] & 0x0f];
  }
  out[64] = '\0';
}

bool satisfies_difficulty(const char *hash, uint32_t difficulty) {
  for (uint32_t i = 0; i < difficulty; ++i) {
    if (hash[i] != '0') {
      return false;
    }
  }
  return true;
}

std::string make_input(const char *payload, int payload_length, uint32_t nonce) {
  std::string input(payload, payload + payload_length);
  input.push_back(':');
  input += std::to_string(nonce);
  return input;
}

} // namespace

extern "C" {

EMSCRIPTEN_KEEPALIVE
int miniminer_mine_batch(const char *payload, int payload_length, uint32_t difficulty,
                         uint32_t start_nonce, uint32_t batch_size) {
  g_attempts = 0;
  g_nonce = start_nonce;

  for (uint32_t i = 0; i < batch_size; ++i) {
    const uint32_t nonce = start_nonce + i;
    const std::string input = make_input(payload, payload_length, nonce);
    uint8_t digest[32];
    sha256_bytes(reinterpret_cast<const uint8_t *>(input.data()), input.size(), digest);
    to_hex(digest, g_hash);

    g_attempts += 1;
    g_nonce = nonce;

    if (satisfies_difficulty(g_hash, difficulty)) {
      return 1;
    }
  }

  return 0;
}

EMSCRIPTEN_KEEPALIVE
const char *miniminer_get_hash() {
  return g_hash;
}

EMSCRIPTEN_KEEPALIVE
uint32_t miniminer_get_nonce() {
  return g_nonce;
}

EMSCRIPTEN_KEEPALIVE
uint32_t miniminer_get_attempts() {
  return g_attempts;
}

EMSCRIPTEN_KEEPALIVE
const char *miniminer_engine_name() {
  return "MiniMiner C++ WebAssembly Engine";
}

}
