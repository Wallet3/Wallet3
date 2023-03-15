import * as Animatable from 'react-native-animatable';
import * as ExpoLinking from 'expo-linking';

import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';

import { AccountBase } from '../../viewmodels/account/AccountBase';
import Avatar from '../../components/Avatar';
import { BlankPNG } from '../../common/Constants';
import CachedImage from 'react-native-fast-image';
import CopyableText from '../../components/CopyableText';
import { Ionicons } from '@expo/vector-icons';
import Networks from '../../viewmodels/core/Networks';
import QRCode from 'react-native-qrcode-svg';
import Theme from '../../viewmodels/settings/Theme';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { isIOS } from '../../utils/platform';
import modalStyle from '../../modals/styles';
import { observer } from 'mobx-react-lite';
import { openInappBrowser } from '../../modals/app/InappBrowser';
import { setStringAsync } from 'expo-clipboard';

export default observer(({ account }: { account?: AccountBase }) => {
  const { t } = i18n;
  const { backgroundColor, thirdTextColor } = Theme;
  const { current } = Networks;
  const { address, avatar } = account || {};
  const ens = account?.ens.name;
  const [showFullAddress, setShowFullAddress] = useState(false);
  const explorerView = useRef<Animatable.View>(null);

  const [etherscan] = useState(
    ExpoLinking.parse(current.explorer)
      .hostname?.split('.')
      .filter((i) => i.length > 3)[0]
  );

  const prefixedAddress = current?.addrPrefix ? `${current?.addrPrefix}${address?.substring(2)}` : address;

  return (
    <View style={{ padding: 16, flex: 1, height: 430 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <View style={{ alignItems: 'center', marginTop: -16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12, maxWidth: '70%' }}>
            <Avatar
              size={27}
              emoji={account?.emojiAvatar}
              emojiMarginStart={1}
              emojiMarginTop={1}
              emojiSize={11}
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
            iconSize={12}
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
          style={[
            isIOS
              ? {
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.23,
                  shadowRadius: 2.62,
                  elevation: 5,
                }
              : {},
            {
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 24,
              borderRadius: 15,
            },
          ]}
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
          <Animatable.View ref={explorerView as any}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', margin: -16, padding: 16 }}
              onPress={() => openInappBrowser(`${current.explorer}/address/${address}`, 'wallet')}
              onLongPress={() => {
                setStringAsync(`${current.explorer}/address/${address}`);
                explorerView.current?.flash?.();
              }}
            >
              <Text style={{ color: thirdTextColor, fontSize: 12, marginEnd: 6, textTransform: 'capitalize' }}>
                {etherscan}
              </Text>
              <Ionicons name="open-outline" size={11} color={thirdTextColor} />
            </TouchableOpacity>
          </Animatable.View>

          <View style={{ height: 10, width: 1, backgroundColor: thirdTextColor, marginHorizontal: 8 }} />

          <TouchableOpacity onPress={() => setShowFullAddress(!showFullAddress)} style={{ margin: -16, padding: 16 }}>
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
