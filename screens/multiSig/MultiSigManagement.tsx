import { ButtonV2, Loader, SafeViewContainer } from '../../components';
import { FlatList, Text, View } from 'react-native';
import React, { useState } from 'react';
import { openGlobalPasspad, openShardsDistributors } from '../../common/Modals';

import App from '../../viewmodels/core/App';
import IllustrationUpgrade from '../../assets/illustrations/misc/upgrade.svg';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../../viewmodels/settings/Theme';
import UpgradeWallet from './UpgradeWallet';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { secureColor } from '../../constants/styles';
import { sleep } from '../../utils/async';

export default observer(() => {
  const { currentWallet } = App;
  return currentWallet?.isMultiSig ? <SafeViewContainer>{}</SafeViewContainer> : <UpgradeWallet />;
});
