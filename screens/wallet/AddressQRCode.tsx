import * as ExpoLinking from 'expo-linking';

import { EvilIcons, Feather, Ionicons } from '@expo/vector-icons';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';

import { Account } from '../../viewmodels/account/Account';
import Avatar from '../../components/Avatar';
import { BlankPNG } from '../../common/Constants';
import CachedImage from 'react-native-expo-cached-image';
import CopyableText from '../../components/CopyableText';
import Networks from '../../viewmodels/Networks';
import QRCode from 'react-native-qrcode-svg';
import Theme from '../../viewmodels/settings/Theme';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

export default observer(({ account }: { account?: Account }) => {
  const { t } = i18n;
  const { backgroundColor, thirdTextColor } = Theme;
  const { current } = Networks;
  const { address, avatar } = account || {};
  const ens = account?.ens.name;
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [etherscan] = useState(ExpoLinking.parse(current.explorer).hostname?.split('.')[0]);

  const prefixedAddress = current?.addrPrefix ? `${current?.addrPrefix}${address?.substring(2)}` : address;

  return (
    <View style={{ padding: 16, flex: 1, height: 430, backgroundColor, borderTopEndRadius: 6, borderTopStartRadius: 6 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <View style={{ alignItems: 'center', marginTop: -16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
            <Avatar
              size={27}
              emoji={account?.emojiAvatar}
              emojiMarginStart={1}
              emojiMarginTop={1}
              backgroundColor={account?.emojiColor}
            />

            <CopyableText
              iconStyle={{ display: 'none' }}
              copyText={ens || account?.nickname || `Account ${(account?.index ?? 0) + 1}`}
              txtStyle={{ color: thirdTextColor, fontSize: 21, fontWeight: '500', marginStart: 8 }}
            />
          </View>

          <CopyableText
            copyText={prefixedAddress || ''}
            iconSize={10}
            iconColor={thirdTextColor}
            iconStyle={{ marginStart: 5 }}
            txtLines={2}
            txtStyle={{ fontSize: 15, color: thirdTextColor, maxWidth: 225 }}
            title={
              showFullAddress ? address : formatAddress(prefixedAddress || '', 10 + (current?.addrPrefix?.length ?? 0), 5)
            }
          />
        </View>

        <View
          style={{
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
            borderRadius: 15,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,
            elevation: 5,
          }}
        >
          <QRCode
            value={address}
            size={180}
            backgroundColor="transparent"
            enableLinearGradient
            logoBorderRadius={7}
            logo={{ uri: BlankPNG }}
            logoSize={29}
            linearGradient={['rgb(134, 65, 244)', 'rgb(66, 194, 244)']}
          />

          {avatar ? (
            <CachedImage source={{ uri: avatar }} style={viewStyles.avatar} />
          ) : (
            <Image source={require('../../assets/icon.png')} style={viewStyles.avatar} />
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => Linking.openURL(`${current.explorer}/address/${address}`)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text style={{ color: thirdTextColor, fontSize: 12, marginEnd: 6, textTransform: 'capitalize' }}>{etherscan}</Text>
            <Ionicons name="open-outline" size={11} color={thirdTextColor} />
          </TouchableOpacity>

          <View style={{ height: 10, width: 1, backgroundColor: thirdTextColor, marginHorizontal: 8 }} />

          <TouchableOpacity onPress={() => setShowFullAddress(!showFullAddress)}>
            <Text style={{ color: thirdTextColor, fontSize: 12 }}>{t('misc-show-full-address')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const viewStyles = StyleSheet.create({
  avatar: {
    width: 24,
    height: 24,
    position: 'absolute',
    backgroundColor: 'rgb(134, 194, 244)',
    borderRadius: 6,
  },
});
