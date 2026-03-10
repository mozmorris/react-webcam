# Tasks

## Fix yarn build failure

- [x] Replace `awesome-typescript-loader` with `ts-loader@8` in `package.json`
- [x] Update `webpack.config.js` loader rule
- [x] Add `NODE_OPTIONS=--openssl-legacy-provider` to build scripts (webpack 4 + Node.js 22 compatibility)
- [x] Fix TypeScript 5.x type errors in `src/react-webcam.tsx` (deprecated browser APIs)
- [x] Override `noEmit: false` in ts-loader options (tsconfig has `noEmit: true` for `tsc` type-check)
- [x] Verify `npm run build` succeeds
- [x] Verify `npm test` passes

## Result

Build and tests pass. `dist/react-webcam.js` produced successfully.
