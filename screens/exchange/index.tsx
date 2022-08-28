import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Modalize, useModalize } from 'react-native-modalize';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AccountSelector from '../../modals/dapp/AccountSelector';
import App from '../../viewmodels/App';
import Avatar from '../../components/Avatar';
import { Button } from '../../components';
import Collapsible from 'react-native-collapsible';
import { NetworksMenu } from '../../modals';
import { Portal } from 'react-native-portalize';
import { TextInput } from 'react-native-gesture-handler';
import Theme from '../../viewmodels/settings/Theme';
import TokenBox from './TokenBox';
import { generateNetworkIcon } from '../../assets/icons/networks/white';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

export default observer(() => {
  const { backgroundColor, borderColor, shadow, mode, foregroundColor, textColor, secondaryTextColor, tintColor } = Theme;
  const { top } = useSafeAreaInsets();
  const { currentAccount } = App;
  const { t } = i18n;

  const { ref: networksRef, open: openNetworksModal, close: closeNetworksModal } = useModalize();
  const { ref: accountsRef, open: openAccountsModal, close: closeAccountsModal } = useModalize();
  const [advanced, setAdvanced] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor, paddingTop: top * 1.5, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, marginBottom: 10 }}>
        <TouchableOpacity
          onPress={() => openNetworksModal()}
          style={{
            borderRadius: 6,
            padding: 3,
            paddingHorizontal: 6,
            backgroundColor: tintColor,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {generateNetworkIcon({ chainId: 1, hideEVMTitle: true, height: 14, width: 12, color: '#fff' })}
          <Text style={{ color: 'white', fontSize: 12, marginStart: 5 }}>Ethereum</Text>
          <MaterialIcons name="keyboard-arrow-down" style={{ marginStart: 3 }} color={'#fff'} size={10} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => openAccountsModal()}
          style={{
            paddingHorizontal: 6,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Avatar
            size={22}
            backgroundColor={currentAccount?.emojiColor}
            emoji={currentAccount?.emojiAvatar}
            uri={currentAccount?.avatar}
            emojiSize={9}
          />
        </TouchableOpacity>
      </View>
      <TokenBox tokenAddress="" tokenSymbol="ETH" chainId={1} showTitle title="Max: 2.40" titleTouchable />
      <View style={{ alignItems: 'center', justifyContent: 'center', zIndex: 8 }}>
        <TouchableOpacity style={{ padding: 8, borderRadius: 180, borderWidth: 0, borderColor, backgroundColor }}>
          <Ionicons name="arrow-down-outline" size={16} color={secondaryTextColor} />
        </TouchableOpacity>
      </View>
      <TokenBox tokenAddress="" tokenSymbol="USDC" chainId={1} showTitle title="To (estimated)" />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, alignItems: 'center' }}>
        <Text style={{ color: secondaryTextColor, fontSize: 12, marginStart: 6 }}>1 ETH ≈ 10,000 USDC</Text>

        <TouchableOpacity style={{ padding: 6 }} onPress={() => setAdvanced(!advanced)}>
          <Ionicons name="settings-outline" size={19} color={foregroundColor} />
        </TouchableOpacity>
      </View>

      <Collapsible collapsed={!advanced} style={{ paddingBottom: 32 }}>
        <Text style={{ color: textColor }}>Slippage tolerance:</Text>
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <TouchableOpacity style={{ ...styles.slippage }}>
            <Text style={{ color: secondaryTextColor }}>0.5 %</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ ...styles.slippage }}>
            <Text style={{ color: secondaryTextColor }}>1 %</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ ...styles.slippage }}>
            <Text style={{ color: secondaryTextColor }}>2 %</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <View style={{ ...styles.slippage, marginEnd: 0 }}>
            <TextInput
              placeholder="5"
              style={{ minWidth: 25, textAlign: 'center', paddingEnd: 4, maxWidth: 64 }}
              keyboardType="number-pad"
            />
            <Text style={{ color: secondaryTextColor }}>%</Text>
            <Ionicons name="pencil" color={secondaryTextColor} size={12} style={{ marginStart: 8 }} />
          </View>
        </View>
      </Collapsible>

      <Button title="Approve" />

      <Portal>
        <Modalize ref={networksRef} adjustToContentHeight disableScrollIfPossible>
          <NetworksMenu
            title={t('modal-dapp-switch-network', { app: 'Exchange' })}
            // selectedNetwork={appNetwork}
            // onNetworkPress={(network) => updateDAppNetworkConfig(network)}
          />
        </Modalize>

        <Modalize
          ref={accountsRef}
          adjustToContentHeight
          disableScrollIfPossible
          modalStyle={{ borderTopStartRadius: 7, borderTopEndRadius: 7 }}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <SafeAreaProvider style={{ backgroundColor, borderTopStartRadius: 6, borderTopEndRadius: 6 }}>
            <AccountSelector
              single
              accounts={App.allAccounts}
              selectedAccounts={[currentAccount?.address || '']}
              style={{ padding: 16, height: 430 }}
              expanded
              // themeColor={appNetwork?.color}
              onDone={([account]) => {}}
            />
          </SafeAreaProvider>
        </Modalize>
      </Portal>
    </View>
  );
});

const styles = StyleSheet.create({
  slippage: {
    padding: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 25,
    marginEnd: 12,
    borderColor: Theme.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
