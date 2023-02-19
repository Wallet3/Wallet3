import App from '../../viewmodels/core/App';
import MultiSigMan from './MultiSigMan';
import { MultiSigWallet } from '../../viewmodels/wallet/MultiSigWallet';
import React from 'react';
import UpgradeWallet from './UpgradeWallet';
import { observer } from 'mobx-react-lite';

export default observer(() => {
  const { currentWallet } = App;
  return currentWallet?.isMultiSig ? <MultiSigMan wallet={currentWallet as MultiSigWallet} /> : <UpgradeWallet />;
});
