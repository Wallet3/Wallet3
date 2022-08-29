import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Modalize, useModalize } from 'react-native-modalize';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { observer } from 'mobx-react-lite';
import Collapsible from 'react-native-collapsible';
import { TextInput } from 'react-native-gesture-handler';
import { Portal } from 'react-native-portalize';
import { generateNetworkIcon } from '../../assets/icons/networks/white';
import { Button } from '../../components';
import Avatar from '../../components/Avatar';
import i18n from '../../i18n';
import { NetworksMenu } from '../../modals';
import AccountSelector from '../../modals/dapp/AccountSelector';
import App from '../../viewmodels/App';
import Theme from '../../viewmodels/settings/Theme';
import Swap from '../../viewmodels/Swap';
import TokenBox from './TokenBox';
import { utils } from 'ethers';
import Networks from '../../viewmodels/Networks';
import Swiper from 'react-native-swiper';
import { ContactsPad, SendAmount, ReviewPad, Passpad } from '../../modals/views';
import Success from '../../modals/views/Success';
import Authentication from '../../viewmodels/Authentication';
import modalStyles from '../../modals/styles';
import { styles } from '../../constants/styles';
import TxRequest from '../../modals/compositions/TxRequest';
import { RawTransactionRequest } from '../../viewmodels/transferring/RawTransactionRequest';

export default observer(() => {
  const { backgroundColor, borderColor, shadow, mode, foregroundColor, textColor, secondaryTextColor, tintColor } = Theme;
  const { top } = useSafeAreaInsets();
  const { currentAccount } = App;
  const { t } = i18n;

  const { ref: networksRef, open: openNetworksModal, close: closeNetworksModal } = useModalize();
  const { ref: accountsRef, open: openAccountsModal, close: closeAccountsModal } = useModalize();
  const { ref: swapApproveRef, open: openSwapApproveModal, close: closeSwapApproveModal } = useModalize();
  const { ref: swapRef, open: openSwapModal, close: closeSwapModal } = useModalize();
  const [advanced, setAdvanced] = useState(false);

  const [approved, setApproved] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const swiper = useRef<Swiper>(null);
  const [active] = useState({ index: 0 });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor, paddingTop: top * 1.25, paddingHorizontal: 16 }}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={false}
    >
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
          {generateNetworkIcon({
            chainId: Networks.current.chainId,
            hideEVMTitle: true,
            height: 14,
            width: 12,
            color: '#fff',
          })}
          <Text style={{ color: 'white', fontSize: 12, marginStart: 5 }}>{Networks.current.network}</Text>
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
      {Swap.from && (
        <TokenBox
          value={Swap.fromAmount}
          tokens={Swap.fromList}
          onTokenSelected={(t) => Swap.selectFrom(t)}
          onChangeText={(t) => Swap.setFromAmount(t)}
          token={Swap.from}
          chainId={Networks.current.chainId}
          showTitle
          title={`Max: ${utils.formatUnits(Swap.max, Swap.from?.decimals || 0)}`}
          titleTouchable
          onTitlePress={() => {
            const value = utils.formatUnits(Swap.max, Swap.from?.decimals);
            Swap.setFromAmount(value);
          }}
        />
      )}
      <View style={{ alignItems: 'center', justifyContent: 'center', zIndex: 8 }}>
        <TouchableOpacity
          onPress={(_) => {
            Swap.interchange();
            Swap.fromAmount = '';
          }}
          style={{ padding: 8, borderRadius: 180, borderWidth: 0, borderColor, backgroundColor }}
        >
          <Ionicons name="arrow-down-outline" size={16} color={secondaryTextColor} />
        </TouchableOpacity>
      </View>
      {Swap.for && (
        <TokenBox
          value={Swap.forAmount}
          tokens={Swap.forList}
          onTokenSelected={(t) => Swap.selectFor(t)}
          token={Swap.for}
          chainId={Networks.current.chainId}
          showTitle
          title="To (estimated)"
        />
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, alignItems: 'center' }}>
        <Text style={{ color: secondaryTextColor, fontSize: 12, marginStart: 6 }}>1 ETH ≈ 10,000 USDC</Text>

        <TouchableOpacity style={{ padding: 6 }} onPress={() => setAdvanced(!advanced)}>
          <Ionicons name="settings-outline" size={19} color={foregroundColor} />
        </TouchableOpacity>
      </View>
      <Collapsible collapsed={!advanced} style={{ paddingBottom: 32 }}>
        <Text style={{ color: textColor }}>Slippage tolerance:</Text>
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <TouchableOpacity onPress={() => Swap.setSlippage(0.5)} style={{ ...innerStyles.slippage }}>
            <Text style={{ color: secondaryTextColor }}>0.5 %</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Swap.setSlippage(1)} style={{ ...innerStyles.slippage }}>
            <Text style={{ color: secondaryTextColor }}>1 %</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Swap.setSlippage(2)} style={{ ...innerStyles.slippage }}>
            <Text style={{ color: secondaryTextColor }}>2 %</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <View style={{ ...innerStyles.slippage, marginEnd: 0 }}>
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

      {!Swap.approved && (
        <Button
          style={{ backgroundColor: Networks.current.color }}
          title={t('tx-type-approve')}
          disabled={!Swap.fromAmount || Swap.approving || Swap.fromList.length === 0}
          onPress={openSwapApproveModal}
        />
      )}

      {Swap.approved && (
        <Button
          style={{ backgroundColor: Networks.current.color }}
          title={t('home-tab-exchange')}
          disabled={!Swap.isValid || Swap.swapping}
          onPress={openSwapModal}
        />
      )}

      <Portal>
        <Modalize ref={networksRef} adjustToContentHeight disableScrollIfPossible>
          <NetworksMenu
            title={t('modal-dapp-switch-network', { app: 'Exchange' })}
            selectedNetwork={Networks.current}
            onNetworkPress={(network) => {
              closeNetworksModal();
              Networks.switch(network);
            }}
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
              themeColor={Networks.current.color}
              onDone={([account]) => {}}
            />
          </SafeAreaProvider>
        </Modalize>

        <Modalize
          key="SwapApprove"
          ref={swapApproveRef}
          adjustToContentHeight
          disableScrollIfPossible
          modalStyle={styles.modalStyle}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
          onClosed={() => {}}
        >
          <SafeAreaProvider style={{ ...modalStyles.safeArea, backgroundColor }}>
            {approved ? (
              <Success />
            ) : (
              <TxRequest
                vm={Swap.approveTx()}
                themeColor={Networks.current.color}
                bioType={Authentication.biometricType}
                onApprove={Swap.approve}
                onReject={closeSwapApproveModal}
              />
            )}
          </SafeAreaProvider>
        </Modalize>

        <Modalize
          key="Swap"
          ref={swapRef}
          adjustToContentHeight
          disableScrollIfPossible
          modalStyle={styles.modalStyle}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
          onClosed={() => {}}
        >
          <SafeAreaProvider style={{ ...modalStyles.safeArea, backgroundColor }}>
            {swapped ? (
              <Success />
            ) : (
              <TxRequest
                vm={Swap.swapTx()}
                themeColor={Networks.current.color}
                bioType={Authentication.biometricType}
                onApprove={Swap.swap}
                onReject={closeSwapModal}
              />
            )}
          </SafeAreaProvider>
        </Modalize>
      </Portal>
    </ScrollView>
  );
});

const innerStyles = StyleSheet.create({
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
