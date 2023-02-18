import App from '../../viewmodels/core/App';
import React from 'react';
import { SafeViewContainer } from '../../components';
import UpgradeWallet from './UpgradeWallet';
import { observer } from 'mobx-react-lite';

export default observer(() => {
  const { currentWallet } = App;
  return currentWallet?.isMultiSig ? <SafeViewContainer>{}</SafeViewContainer> : <UpgradeWallet />;
});
