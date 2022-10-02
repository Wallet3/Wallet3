# A Secure Wallet for Web3

Available on the App Store

[![Wallet 3, App Store](/assets/3rd/download-on-the-app-store.svg)](https://apps.apple.com/jp/app/wallet-3-mobile/id1597395741)

## Development Setup

Firstly, switch to ios branch.

1. Install nodejs(v16+), yarn.
2. Install dependencies with `yarn install`.
3. Copy `configs/providers.example.json` to `configs/providers.json`, `configs/secret.example.ts` to `configs/secret.ts`.
4. Fill valid provider urls in `configs/providers.json`.
5. Launch with `yarn ios`
