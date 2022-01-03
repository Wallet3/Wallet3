# A Secure Wallet for Web3

Available on the App Store

[![Wallet 3, App Store](/assets/3rd/download-on-the-app-store.svg)](https://apps.apple.com/jp/app/wallet-3-mobile/id1597395741)

## Development Setup

1. Install Nodejs(16), yarn.
2. Install dependencies with `yarn install`.
3. Copy `configs/providers.example.json` to `configs/providers.json`, `secret.example.ts` to `secret.ts`.
4. Fill valid provider urls in `configs/providers.json`.
5. Create empty files (`InjectWalletConnectObserver.ts` and `InjectInpageProvider.ts`) in `screens/browser/scripts`, and set content to `export default '';`.
6. Launch with `yarn ios`
