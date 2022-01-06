import App from '../../../viewmodels/App';

export class InpageProvider {
  handle(payload: { method: string; params: any[] | any }) {
    const { method, params } = payload;

    switch (method) {
      case 'eth_accounts':
        return this.eth_accounts();
    }
  }

  eth_accounts() {
    if (!App.currentWallet) return [];

    return [App.currentWallet?.currentAccount?.address];
  }
}
