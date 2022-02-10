import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Account } from '../../viewmodels/account/Account';
import Avatar from '../../components/Avatar';
import { BlankPNG } from '../../common/Constants';
import CachedImage from 'react-native-expo-cached-image';
import CopyableText from '../../components/CopyableText';
import Networks from '../../viewmodels/Networks';
import QRCode from 'react-native-qrcode-svg';
import React from 'react';
import Theme from '../../viewmodels/settings/Theme';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

export default observer(({ account }: { account?: Account }) => {
  const { t } = i18n;
  const { backgroundColor, textColor, foregroundColor, thirdTextColor } = Theme;
  const { current } = Networks;
  const { address, avatar } = account || {};
  const ens = account?.ens.name;

  return (
    <View style={{ padding: 16, flex: 1, height: 430, backgroundColor, borderTopEndRadius: 6, borderTopStartRadius: 6 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
            <Avatar
              size={27}
              emoji={account?.emojiAvatar}
              emojiMarginStart={1}
              emojiMarginTop={1}
              backgroundColor={account?.emojiColor}
            />

            <Text
              style={{ color: thirdTextColor, fontSize: 21, fontWeight: '500', marginStart: 8, maxWidth: '72%' }}
              numberOfLines={1}
            >
              {ens || account?.nickname || `Account ${account?.index}`}
            </Text>
          </View>
          <Text style={{ color: thirdTextColor, fontSize: 15 }}>{formatAddress(address || '', 12, 5)}</Text>
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
          <CopyableText
            title={t('tip-copy-link')}
            copyText={address || ''}
            txtStyle={{ fontSize: 12, maxWidth: 185, color: thirdTextColor }}
            iconColor={thirdTextColor}
            iconStyle={{ marginHorizontal: 4, marginEnd: 0 }}
            iconSize={10}
          />

          <View style={{ width: 1, backgroundColor: thirdTextColor, height: 10, marginHorizontal: 12 }} />

          <TouchableOpacity onPress={() => Linking.openURL(`${current.explorer}/address/${address}`)}>
            <Text style={{ color: thirdTextColor, fontSize: 12 }}>Etherscan</Text>
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
