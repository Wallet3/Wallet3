import App from '../App';
import Database from '../../models/Database';

class InpageDAppHub {
  get inpageDApps() {
    return Database.inpageDApps;
  }

  handle(origin: string, payload: { method: string; params: any[] | any }) {
    const { method, params } = payload;

    switch (method) {
      case 'eth_accounts':
        return this.eth_accounts(origin);
    }
  }

  private async eth_accounts(origin: string) {
    if (!App.currentWallet) return [];

    const dapp = await this.inpageDApps.findOne({ where: { origin } });
    if (dapp) return [dapp.lastUsedAccount];

    return [App.currentWallet?.currentAccount?.address];
  }
}

export default new InpageDAppHub();
