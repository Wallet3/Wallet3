import * as Animatable from 'react-native-animatable';

import { Button, Skeleton } from '../../components';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Modalize, useModalize } from 'react-native-modalize';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import AccountSelector from '../../modals/dapp/AccountSelector';
import App from '../../viewmodels/App';
import Avatar from '../../components/Avatar';
import Collapsible from 'react-native-collapsible';
import { IToken } from '../../common/tokens';
import { NetworksMenu } from '../../modals';
import { Portal } from 'react-native-portalize';
import { ReactiveScreen } from '../../utils/device';
import { TextInput } from 'react-native-gesture-handler';
import Theme from '../../viewmodels/settings/Theme';
import TokenBox from './components/TokenBox';
import TokenSelector from './components/TokenSelector';
import VM from '../../viewmodels/defi/exchange/Curve';
import { formatCurrency } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/white';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { rotate } from '../../common/Animation';

export default observer(() => {
  const { backgroundColor, borderColor, foregroundColor, textColor, secondaryTextColor } = Theme;
  const { top } = useSafeAreaInsets();
  const { userSelectedNetwork } = VM;

  const { t } = i18n;

  const { ref: networksRef, open: openNetworksModal, close: closeNetworksModal } = useModalize();
  const { ref: accountsRef, open: openAccountsModal, close: closeAccountsModal } = useModalize();
  const { ref: fromSelectorRef, open: openFromModal, close: closeFromTokens } = useModalize();
  const { ref: toSelectorRef, open: openToModal, close: closeToTokens } = useModalize();

  const [advanced, setAdvanced] = useState(false);

  useEffect(() => {
    VM.init();
  }, []);

  const getColor = (slippage: number, defaultColor = borderColor) =>
    slippage === VM.slippage ? userSelectedNetwork.color : defaultColor;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor, paddingTop: top * 1.25, paddingHorizontal: 16 }}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={false}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginVertical: 8,
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss();
            openNetworksModal();
          }}
          style={{
            borderRadius: 6,
            padding: 4,
            paddingHorizontal: 6,
            backgroundColor: VM.userSelectedNetwork.color,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {generateNetworkIcon({
            chainId: VM.userSelectedNetwork.chainId,
            hideEVMTitle: true,
            height: 14,
            width: 12,
            color: '#fff',
          })}
          <Text style={{ color: 'white', fontSize: 12, marginStart: 5 }}>{VM.userSelectedNetwork.network}</Text>
          <MaterialIcons name="keyboard-arrow-down" style={{ marginStart: 3 }} color={'#fff'} size={10} />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {VM.pendingTxs.length > 0 ? (
            <View style={{ marginEnd: 16, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: userSelectedNetwork.color, marginEnd: 8, fontWeight: '500' }}>
                {VM.pendingTxs.length}
              </Text>

              <Animatable.View animation={rotate} iterationCount="infinite" easing="linear" duration={2000}>
                <Ionicons name="sync" size={14} color={userSelectedNetwork.color} />
              </Animatable.View>
            </View>
          ) : undefined}

          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              openAccountsModal();
            }}
            style={{
              paddingHorizontal: 6,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Avatar
              size={26}
              backgroundColor={VM.account?.emojiColor}
              emoji={VM.account?.emojiAvatar}
              uri={VM.account?.avatar}
              emojiSize={9}
            />
          </TouchableOpacity>
        </View>
      </View>
      <TokenBox
        tokenAddress={VM.swapFrom?.address!}
        tokenSymbol={VM.swapFrom?.symbol || ''}
        chainId={VM.userSelectedNetwork.chainId}
        showTitle
        title={`Balance: ${formatCurrency(VM.swapFrom?.amount || 0, '')}`}
        titleTouchable
        onTokenPress={() => openFromModal()}
        onTextInputChanged={(t) => VM.setSwapAmount(t)}
        onTitlePress={() => {
          VM.setSwapAmount(VM.swapFrom?.amount!);
          return VM.swapFrom?.amount!;
        }}
      />
      <View style={{ alignItems: 'center', justifyContent: 'center', zIndex: 8 }}>
        <TouchableOpacity
          style={{ padding: 8, borderRadius: 180, borderWidth: 0, borderColor, backgroundColor }}
          onPress={() => VM.switchSwapTo(VM.swapFrom!)}
        >
          <Ionicons name="arrow-down-outline" size={16} color={secondaryTextColor} />
        </TouchableOpacity>
      </View>
      <TokenBox
        tokenAddress={VM.swapTo?.address!}
        tokenSymbol={VM.swapTo?.symbol || ''}
        chainId={VM.userSelectedNetwork.chainId}
        showTitle
        title="To (estimated)"
        editable={false}
        textValue={VM.swapToAmount!}
        onTokenPress={() => openToModal()}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, alignItems: 'center' }}>
        {VM.calculating ? (
          <Skeleton style={{ height: 14 }} />
        ) : VM.swapFromAmount && VM.exchangeRate ? (
          <Text style={{ color: secondaryTextColor, fontSize: 12, marginStart: 6, fontWeight: '500' }}>
            {`1 ${VM.swapFrom?.symbol} ≈ ${formatCurrency(VM.exchangeRate, '')} ${VM.swapTo?.symbol}`}
          </Text>
        ) : (
          <View />
        )}

        <TouchableOpacity style={{ padding: 6 }} onPress={() => setAdvanced(!advanced)}>
          <Ionicons name="settings-outline" size={19} color={foregroundColor} />
        </TouchableOpacity>
      </View>

      <Collapsible collapsed={!advanced} style={{ paddingBottom: 24 }}>
        <Text style={{ color: textColor, marginStart: 6 }}>Slippage tolerance:</Text>
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <TouchableOpacity style={{ ...styles.slippage, borderColor: getColor(0.5) }} onPress={() => VM.setSlippage(0.5)}>
            <Text style={{ color: getColor(0.5, secondaryTextColor) }}>0.5 %</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ ...styles.slippage, borderColor: getColor(1) }} onPress={() => VM.setSlippage(1)}>
            <Text style={{ color: getColor(1, secondaryTextColor) }}>1 %</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ ...styles.slippage, borderColor: getColor(2) }} onPress={() => VM.setSlippage(2)}>
            <Text style={{ color: getColor(2, secondaryTextColor) }}>2 %</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <View
            style={{
              ...styles.slippage,
              marginEnd: 0,
              borderColor: VM.slippage > 2 ? userSelectedNetwork.color : borderColor,
            }}
          >
            <TextInput
              placeholder="5"
              style={{
                minWidth: 25,
                textAlign: 'center',
                paddingEnd: 4,
                maxWidth: 64,
                color: VM.slippage > 2 ? userSelectedNetwork.color : textColor,
              }}
              keyboardType="number-pad"
              value={`${VM.slippage}`}
              onChangeText={(txt) => VM.setSlippage(Number(txt))}
            />
            <Text style={{ color: VM.slippage > 2 ? userSelectedNetwork.color : secondaryTextColor }}>%</Text>
            <Ionicons
              name="pencil"
              color={VM.slippage > 2 ? userSelectedNetwork.color : secondaryTextColor}
              size={12}
              style={{ marginStart: 8 }}
            />
          </View>
        </View>
      </Collapsible>

      {VM.needApproval ? (
        <Button
          title="Approve"
          themeColor={VM.userSelectedNetwork.color}
          disabled={!VM.swapFromAmount || VM.checkingApproval || !VM.isValidFromAmount}
          onPress={() => {
            Keyboard.dismiss();
            VM.approve();
          }}
        />
      ) : (
        <Button
          title="Swap"
          themeColor={VM.userSelectedNetwork.color}
          disabled={!VM.exchangeRate || VM.checkingApproval || VM.calculating || !VM.isValidFromAmount}
          onPress={() => {
            Keyboard.dismiss();
            VM.swap();
          }}
        />
      )}

      <View style={{ flex: 1, minHeight: ReactiveScreen.height * 0.39 }} />

      <View style={{ flexDirection: 'row', justifyContent: 'center', display: 'none' }}>
        <Text style={{ color: secondaryTextColor, fontSize: 10 }}>Powered by</Text>
      </View>

      <Portal>
        <Modalize ref={networksRef} adjustToContentHeight disableScrollIfPossible>
          <NetworksMenu
            title={t('modal-dapp-switch-network', { app: 'Exchange' })}
            networks={VM.networks}
            selectedNetwork={VM.userSelectedNetwork}
            onNetworkPress={(network) => {
              VM.switchNetwork(network);
              closeNetworksModal();
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
              selectedAccounts={[VM.account?.address || '']}
              style={{ padding: 16, height: 430 }}
              expanded
              themeColor={VM.userSelectedNetwork.color}
              onDone={([account]) => {
                closeAccountsModal();
                VM.switchAccount(account);
              }}
            />
          </SafeAreaProvider>
        </Modalize>

        <Modalize
          ref={fromSelectorRef}
          adjustToContentHeight
          disableScrollIfPossible
          modalStyle={{ borderTopStartRadius: 7, borderTopEndRadius: 7 }}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <SafeAreaProvider style={{ backgroundColor, borderTopStartRadius: 6, borderTopEndRadius: 6, height: '100%' }}>
            <TokenSelector
              tokens={VM.tokens}
              selectedToken={VM.swapFrom as IToken}
              onTokenSelected={(t) => {
                VM.switchSwapFrom(t as any);
                closeFromTokens();
              }}
            />
          </SafeAreaProvider>
        </Modalize>

        <Modalize
          ref={toSelectorRef}
          adjustToContentHeight
          disableScrollIfPossible
          modalStyle={{ borderTopStartRadius: 7, borderTopEndRadius: 7 }}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <SafeAreaProvider style={{ backgroundColor, borderTopStartRadius: 6, borderTopEndRadius: 6 }}>
            <TokenSelector
              tokens={VM.tokens}
              selectedToken={VM.swapTo as IToken}
              onTokenSelected={(t) => {
                VM.switchSwapTo(t as any);
                closeToTokens();
              }}
            />
          </SafeAreaProvider>
        </Modalize>
      </Portal>
    </ScrollView>
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
