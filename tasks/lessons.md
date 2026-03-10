# Lessons Learned

## Keep webpack loaders in sync with TypeScript version

`awesome-typescript-loader` was unmaintained and incompatible with TypeScript 5.x.
When upgrading TypeScript, verify the webpack loader supports the new version.
Prefer `ts-loader` (actively maintained) over `awesome-typescript-loader`.

**Rule:** `ts-loader@8` for webpack 4; `ts-loader@9` for webpack 5.

## webpack 4 + Node.js 17+ requires legacy OpenSSL

webpack 4 uses MD4 hashing which is unsupported in Node.js 17+.
Fix: `NODE_OPTIONS=--openssl-legacy-provider` in build scripts.
Long-term fix: upgrade to webpack 5.

## tsconfig `noEmit: true` conflicts with ts-loader

`noEmit: true` in tsconfig is useful for `tsc` type-check only (no output files).
ts-loader needs TypeScript to emit output — override via loader options:
```js
options: { compilerOptions: { noEmit: false } }
```

## Deprecated browser APIs cause TypeScript 5.x type errors

`navigator.getUserMedia`, `navigator.webkitGetUserMedia`, etc. were removed from
TypeScript DOM types. Cast to `(navigator as any)` for legacy polyfill code.
`URL.createObjectURL(MediaStream)` signature changed — cast `stream as any`.
