import { Button, SafeViewContainer } from '../../components';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Account } from '../../viewmodels/account/Account';
import Avatar from '../../components/Avatar';
import { INetwork } from '../../common/Networks';
import { Ionicons } from '@expo/vector-icons';
import { NullableImage } from '../../components';
import Theme from '../../viewmodels/settings/Theme';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { thirdFontColor } from '../../constants/styles';

interface Props {
  account?: Account;
  network: INetwork;
  onAccountsPress?: () => void;
  onNetworksPress?: () => void;
  appName?: string;
  appIcon?: string;
  appDesc?: string;
  appUrl?: string;
  onConnect?: () => void;
  onReject?: () => void;
  disableNetworksButton?: boolean;
  disableAccountsButton?: boolean;
  isVerified?: boolean;
  themeColor: string;
  isRisky?: boolean;
}

export default observer(
  ({
    account,
    network,
    onAccountsPress,
    onNetworksPress,
    appName,
    appIcon,
    appDesc,
    appUrl,
    onConnect,
    onReject,
    disableNetworksButton,
    disableAccountsButton,
    isVerified,
    themeColor,
    isRisky,
  }: Props) => {
    const { t } = i18n;
    const [shortAppName] = useState((appName?.split?.(' ')?.[0] || '').replace(/\,|\:/, ''));
    const { backgroundColor } = Theme;

    return (
      <SafeViewContainer style={{ flex: 1, alignItems: 'center', paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ paddingVertical: 6, flexDirection: 'row', alignItems: 'center' }}
            onPress={onAccountsPress}
            disabled={disableAccountsButton}
          >
            <Avatar
              size={24}
              emojiSize={9}
              emoji={account?.emojiAvatar}
              backgroundColor={account?.emojiColor}
              uri={account?.avatar}
            />

            <Text style={{ color: thirdFontColor, maxWidth: 125, marginStart: 8 }} numberOfLines={1}>
              {account?.miniDisplayName}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNetworksPress}
            disabled={disableNetworksButton}
            style={{
              padding: 6,
              paddingHorizontal: 12,
              borderColor: `${network.color}90`,
              borderWidth: 1,
              borderRadius: 100,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {generateNetworkIcon({
              chainId: network.chainId,
              width: 16,
              height: 16,
              color: network.color,
              hideEVMTitle: true,
              symbol: network.symbol,
            })}

            <Text style={{ color: network.color, marginStart: 6, maxWidth: 120 }} numberOfLines={1}>
              {`${network.network.split(' ')[0]}`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <NullableImage
          size={72}
          uri={appIcon}
          text={appName}
          fontSize={36}
          imageRadius={5}
          fontStyle={{ marginTop: 2, marginStart: 2 }}
          containerStyle={{ marginBottom: 20 }}
          imageBackgroundColor={backgroundColor}
        />

        <Text style={{ ...viewStyles.txt, fontSize: 24, fontWeight: '500', opacity: 1 }} numberOfLines={1}>
          {shortAppName.length > 2 ? shortAppName : appName}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          {isVerified ? <Ionicons name="shield-checkmark" color="#76B947" size={14} /> : undefined}
          <Text style={{ ...viewStyles.txt, marginBottom: 0, marginStart: 6 }} numberOfLines={1}>
            {appUrl}
          </Text>
        </View>

        {appDesc ? (
          <Text style={{ ...viewStyles.txt, fontSize: 15 }} numberOfLines={2}>
            {appDesc}
          </Text>
        ) : undefined}

        <View style={{ flex: 1 }} />

        <View style={{ width: '100%' }}>
          <Button title={t('button-connect')} onPress={onConnect} themeColor={themeColor} />
          <Button title={t('button-reject')} themeColor={themeColor} onPress={onReject} style={{ marginTop: 12 }} reverse />
        </View>
      </SafeViewContainer>
    );
  }
);

const viewStyles = StyleSheet.create({
  txt: {
    color: thirdFontColor,
    opacity: 0.75,
    fontSize: 17,
    maxWidth: '100%',
    marginBottom: 12,
    textAlign: 'center',
  },
});
