import { ButtonV2, NullableImage, SafeViewContainer } from '../../components';
import {
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from '@expo/vector-icons';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderColor, secondaryFontColor, secureColor } from '../../constants/styles';

import { Account } from '../../viewmodels/account/Account';
import AccountSelector from '../../modals/dapp/AccountSelector';
import App from '../../viewmodels/core/App';
import Button from '../../modals/tss/components/Button';
import Collapsible from 'react-native-collapsible';
import { DrawerActions } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import IllustrationNoData from '../../assets/illustrations/misc/nodata.svg';
import MessageKeys from '../../common/MessageKeys';
import { MetamaskDApp } from '../../viewmodels/walletconnect/MetamaskDApp';
import MetamaskDAppsHub from '../../viewmodels/walletconnect/MetamaskDAppsHub';
import { Modalize } from 'react-native-modalize';
import NetworkSelector from '../../modals/dapp/NetworkSelector';
import Networks from '../../viewmodels/core/Networks';
import { Portal } from 'react-native-portalize';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import WalletConnectHub from '../../viewmodels/walletconnect/WalletConnectHub';
import { WalletConnect as WalletConnectLogo } from '../../assets/3rd';
import { WalletConnect_v1 } from '../../viewmodels/walletconnect/WalletConnect_v1';
import { WalletConnect_v2 } from '../../viewmodels/walletconnect/WalletConnect_v2';
import i18n from '../../i18n';
import modalStyle from '../../modals/styles';
import { observer } from 'mobx-react-lite';
import { startLayoutAnimation } from '../../utils/animations';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

export default observer(() => {
  const { secondaryTextColor } = Theme;
  const { currentWallet } = App;
  const { t } = i18n;

  return (
    <SafeViewContainer>
      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: secondaryTextColor, fontWeight: '500' }}>My MultiSig Wallet</Text>
        <Collapsible collapsed={false} style={{ flex: 1 }}>
          {}
        </Collapsible>

        {!currentWallet?.isMultiSig && (
          <ButtonV2
            title={t('button-upgrade')}
            style={{ marginTop: 16 }}
            themeColor={secureColor}
            icon={() => <Ionicons name="arrow-up-circle-outline" color="#fff" size={21} />}
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: secondaryTextColor, fontWeight: '500' }}>Paired Wallets</Text>
        <View style={{ flex: 1 }} />
        <ButtonV2
          title={t('button-start-pairing')}
          icon={() => <MaterialIcons name="phonelink-ring" color="#fff" size={21} />}
        />
      </View>
    </SafeViewContainer>
  );
});
