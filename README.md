# MiniMiner PoW Lab

MiniMiner PoW Lab is a browser-based Proof-of-Work blockchain mining simulator built for education, demos, and portfolio presentation. It simulates wallets, transactions, pending transactions, blocks, mining rewards, difficulty, validation, tamper detection, benchmark runs, local persistence, and an optional C++ WebAssembly mining engine.

This app simulates Proof-of-Work mining and does not mine real cryptocurrency.

## Tech Stack

- React + Vite
- JavaScript
- Tailwind CSS
- Zustand for state management
- localStorage persistence
- Recharts for benchmark charts
- crypto-js SHA-256 hashing for the JavaScript miner
- C++ WebAssembly mining engine source with JavaScript fallback

## Quick Start

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173/
```

## Production Build

```bash
npm run build
npm run preview
```

## C++ WebAssembly Miner

The app works immediately with the JavaScript miner. A C++ mining engine is also included in `src/wasm/miniminer.cpp`.

To compile the WebAssembly binary, install Emscripten first.

On macOS:

```bash
brew install emscripten
```

Then run:

```bash
npm run wasm:build
npm run dev
```

The build script writes:

```text
public/wasm/miniminer.wasm
```

When that file exists, the app attempts to use the C++ WebAssembly miner through `src/wasm/minerWasm.js`. If the binary is missing or cannot load, the app falls back to the JavaScript miner automatically.

Mining progress and block details show the active engine:

```text
javascript
wasm-cpp
```

## Educational Purpose

MiniMiner is designed to teach blockchain concepts without touching real cryptocurrency networks. It helps demonstrate:

- how wallets and addresses can identify participants
- how transactions move simulated coins
- why pending transactions are not confirmed until mined
- how blocks link together through previous hashes
- how Proof-of-Work searches for a valid nonce
- why higher difficulty needs more attempts
- how mining rewards mint new simulated coins
- why tampering breaks validation
- why blockchains are append-only histories, not magical trusted databases

## Pages

### Dashboard

The Dashboard gives a quick view of the current simulation:

- total blocks
- total wallets
- pending transaction count
- current mining difficulty
- latest block hash
- chain validity status
- latest mining result
- average hash rate

It also includes a visible educational note that the app does not mine real cryptocurrency.

### Wallets

The Wallets page lets users create simulated wallets.

Features:

- create wallet with a name
- generate a unique `MM-...` wallet address
- prevent duplicate wallet names
- show all wallets
- show each wallet balance
- keep the `SYSTEM` wallet as the genesis/system wallet
- prevent deleting wallets individually
- reset wallets only through reset simulation

Wallet balances are derived from confirmed blockchain transactions. They are not manually trusted values.

Wallet object:

```js
{
  id,
  name,
  address,
  balance,
  createdAt
}
```

### Transactions

The Transactions page lets users create simulated transfers between wallets.

Validation rules:

- sender must exist
- receiver must exist
- sender and receiver must be different
- amount must be positive
- sender must have enough available balance
- `SYSTEM` cannot be used manually as a sender

Valid transactions are added to the pending transaction pool. They become confirmed only after mining.

The page shows:

- pending transactions
- confirmed transactions
- transaction status
- transaction amount
- sender and receiver addresses
- clear error messages for invalid transactions

Transaction object:

```js
{
  id,
  from,
  to,
  amount,
  timestamp,
  status
}
```

### Mine

The Mine page mines all pending transactions into a new block.

Mining behavior:

- user selects a miner wallet
- all pending transactions are included
- a reward transaction from `SYSTEM` is added
- the selected miner receives the reward
- pending transactions clear after successful mining
- wallet balances update from confirmed chain data
- only one mining job can run at a time
- mining can be stopped
- the UI stays responsive during mining

Live mining progress shows:

- current nonce
- current hash
- attempts
- elapsed time
- hashes per second
- active engine, either `javascript` or `wasm-cpp`

The mining loop uses batches and yields back to the browser between batches. This keeps the app safe for normal browser use.

### Explorer

The Explorer page shows every block in the blockchain.

Each block can be expanded to inspect:

- block index
- timestamp
- previous hash
- current hash
- nonce
- difficulty
- miner address
- transactions
- mining attempts
- hash rate
- mining engine

Block object:

```js
{
  index,
  timestamp,
  transactions,
  previousHash,
  nonce,
  hash,
  difficulty,
  minerAddress,
  miningStats
}
```

### Validate

The Validate page runs blockchain validation and explains the result.

Validation checks:

- genesis block exists
- genesis block is well formed
- every block hash matches its contents
- every block hash satisfies its difficulty
- every `previousHash` matches the previous block
- every transaction has required fields
- every transaction amount is positive
- non-system wallet balances never go negative
- tampering is detected

Validation result shape:

```js
{
  valid: true,
  reason: 'Blockchain is valid.',
  blockIndex: null
}
```

or:

```js
{
  valid: false,
  reason: 'Block hash does not match its contents.',
  blockIndex: 2
}
```

### Tamper Demo

The Validate page also includes a tamper demo.

Users can intentionally edit the amount of a confirmed transaction inside an old block. The block is not removed from the chain. Instead:

- the tampered block remains visible
- validation fails
- the app explains why the chain is invalid
- reset simulation can restore a clean chain

This is intentional. The educational goal is to show that blockchains detect tampering rather than silently deleting history.

### Benchmark

The Benchmark page mines dummy blocks at difficulty 2, 3, 4, and 5.

It displays:

- difficulty
- attempts
- time taken
- hashes per second
- benchmark table
- Recharts bar chart

This makes difficulty and hash rate easier to compare.

### Settings

The Settings page manages simulation configuration and persistence.

Features:

- set mining difficulty from 1 to 5
- show warning at difficulty 5
- explain that higher difficulty means more leading zeroes and more attempts
- configure mining reward amount
- export simulation as JSON
- import simulation from JSON
- reset simulation

Persisted data:

- blockchain
- wallets
- pending transactions
- difficulty
- mining reward
- mining history
- latest mining result

## Proof-of-Work Explanation

Each mined block stores a nonce. Mining means repeatedly changing the nonce and hashing the block payload:

```text
SHA256(blockData + nonce)
```

A block is valid only when its hash starts with the configured number of leading zeroes.

Examples:

```text
difficulty = 2
valid hash = 00abc...

difficulty = 4
valid hash = 0000abc...

difficulty = 5
valid hash = 00000abc...
```

Higher difficulty means fewer hashes qualify, so the miner usually needs more attempts.

## Mining Rewards

Mining rewards are special transactions from:

```text
SYSTEM
```

Default reward:

```text
50 MMC
```

The reward is configurable in Settings. Rewards are only created during mining. Users cannot manually send transactions from `SYSTEM`.

## Balance Rules

Balances are calculated from confirmed blockchain transactions.

Rules:

- confirmed incoming transactions increase balance
- confirmed outgoing transactions decrease balance
- pending outgoing transactions reduce available balance for new transactions
- a wallet cannot send more than it has available
- balances should never go negative during validation
- the UI does not manually trust a stored wallet balance field

## Difficulty Recommendations

The simulator allows difficulty 1 through 5.

Recommended values:

- `1`: instant demos
- `2`: quick classroom testing
- `3`: visible mining work
- `4`: default educational setting
- `5`: slower, use carefully on mobile or older browsers

Difficulty above 5 is intentionally not exposed in the UI because browser mining can become slow.

## Data Persistence

The app stores simulation state in localStorage under:

```text
miniminer-pow-lab
```

Use Settings to:

- export JSON backup
- import JSON backup
- reset the entire simulation

Reset simulation clears the chain, wallets, pending transactions, difficulty, reward, and mining history back to defaults.

## Project Structure

```text
src/
  main.jsx
  App.jsx
  routes/
    routes.js
  pages/
    Dashboard.jsx
    Wallets.jsx
    Transactions.jsx
    Mine.jsx
    Explorer.jsx
    Validate.jsx
    Benchmark.jsx
    Settings.jsx
  components/
    Navbar.jsx
    StatCard.jsx
    BlockCard.jsx
    TransactionCard.jsx
    WalletCard.jsx
    MiningProgress.jsx
  core/
    block.js
    blockchain.js
    transaction.js
    wallet.js
    miner.js
    validation.js
    hash.js
    simulation.js
  store/
    useMinerStore.js
  utils/
    format.js
    storage.js
  wasm/
    README.md
    miniminer.cpp
    minerWasm.js
scripts/
  build-wasm.sh
```

## Important Core Functions

Implemented core functions include:

- `createGenesisBlock()`
- `calculateHash(block)`
- `createWallet(name)`
- `createTransaction(from, to, amount)`
- `addTransaction(transaction, wallets, pendingTransactions, balances)`
- `mineBlock(input, callbacks)`
- `validateBlock(block, previousBlock)`
- `validateChain(chain)`
- `calculateBalances(chain, pendingTransactions)`
- `exportSimulation(state)`
- `importSimulation(json)`
- `resetSimulation()`
- `runBenchmark(onResult)`

## Core Files

### `src/core/hash.js`

Provides stable JSON stringification and SHA-256 hashing. Stable stringification matters because block hashes must be reproducible from the same block contents.

### `src/core/block.js`

Creates the genesis block and calculates block hashes.

### `src/core/blockchain.js`

Creates initial simulation state, validates pending transactions before they enter the mempool, and calculates derived balances.

### `src/core/miner.js`

Main mining interface used by the app:

```js
mineBlock(input, callbacks)
```

It attempts to use the C++ WebAssembly miner first. If WASM is unavailable, it uses the JavaScript mining loop.

### `src/core/validation.js`

Validates the full blockchain and individual blocks.

### `src/core/simulation.js`

Exports, imports, and resets simulation data.

### `src/store/useMinerStore.js`

Zustand store that coordinates UI actions, persistence, mining jobs, transactions, settings, and reset/import/export actions.

## C++ WASM Files

### `src/wasm/miniminer.cpp`

Contains the C++ SHA-256 batch mining engine. It exposes a small C ABI for WebAssembly:

- `miniminer_mine_batch(...)`
- `miniminer_get_hash()`
- `miniminer_get_nonce()`
- `miniminer_get_attempts()`
- `miniminer_engine_name()`

The C++ miner mines bounded batches instead of running forever. JavaScript remains responsible for progress updates, cancellation, and yielding to the browser.

### `src/wasm/minerWasm.js`

Loads `public/wasm/miniminer.wasm`, passes block payloads into WebAssembly memory, calls the C++ batch miner, and returns results in the same shape as the JavaScript miner.

### `scripts/build-wasm.sh`

Compiles the C++ source with Emscripten:

```bash
npm run wasm:build
```

## Common Workflow

1. Create at least one normal wallet on the Wallets page.
2. Go to Mine.
3. Select that wallet as the miner.
4. Mine a block to receive the first reward.
5. Create another wallet.
6. Send coins on the Transactions page.
7. Mine again to confirm the pending transaction.
8. Inspect the block in Explorer.
9. Run Validate to confirm the chain is valid.
10. Use the tamper demo to edit an old transaction.
11. Run Validate again to see the chain fail.

## Troubleshooting

### React DevTools Message

This browser console message is normal in development:

```text
Download the React DevTools for a better development experience
```

It is not an app error.

### WebAssembly Miner Not Active

If the mining engine shows `javascript`, the WASM binary is probably missing.

Run:

```bash
npm run wasm:build
npm run dev
```

If `npm run wasm:build` fails, confirm Emscripten is installed and `emcc` is available:

```bash
emcc --version
```

### Difficulty 5 Takes Too Long

Difficulty 5 can take noticeably longer. Stop mining from the Mine page, lower difficulty in Settings, and try again.

### Tampered Chain Stays Invalid

That is expected. A tampered block is not automatically removed. Use Reset Simulation to return to a clean chain.

## Safety Notes

- This app does not connect to cryptocurrency networks.
- It does not create real wallets.
- It does not mine real coins.
- It runs all simulation state locally in the browser.
- Mining is intentionally bounded and UI-friendly for educational use.

## License

Use this project for learning, demos, and portfolio work.
