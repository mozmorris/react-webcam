# Technical Debt

## Tooling age

| Package | Current | Status |
|---|---|---|
| webpack | 4.46 | EOL — webpack 5 released Oct 2020 |
| webpack-cli | 3.3 | Very old — current is v5 |
| @types/react | ^16.9 | React 16 types — current React is 19 |
| eslint | ^6.3 | Very old — current is v9 |
| @typescript-eslint/* | ^2.1 | Very old — current is v8 |
| ts-jest | ^27 | Old — current is v29 |

## Node.js compatibility workaround

`NODE_OPTIONS=--openssl-legacy-provider` is a workaround for webpack 4 on Node.js 17+.
Upgrading to webpack 5 would eliminate this need.

## Deprecated browser API polyfill

The `polyfillGetUserMedia()` function in `src/react-webcam.tsx` references removed
browser APIs (`navigator.getUserMedia`, etc.) with `as any` casts. These APIs have
been universally replaced by `navigator.mediaDevices.getUserMedia` — the polyfill
could eventually be removed.
