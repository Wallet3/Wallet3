import Contacts, { IContact } from '../../viewmodels/customs/Contacts';
import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { FlatList, ListRenderItemInfo, NativeSyntheticEvent, Text, TouchableHighlight, View } from 'react-native';
import { TouchableOpacity } from 'react-native';

import React, { useEffect, useRef, useState } from 'react';
import { SafeViewContainer, Skeleton, TextBox } from '../../components';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import Avatar from '../../components/Avatar';
import { BaseTransaction } from '../../viewmodels/transferring/BaseTransaction';
import Button from '../../components/Button';
import Image from 'react-native-fast-image';
import MiniScanner from './MiniScanner';
import Networks from '../../viewmodels/Networks';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { startLayoutAnimation } from '../../utils/animations';
import styles from '../styles';
import { utils } from 'ethers';

interface Props {
  vm: BaseTransaction;
  background?: string;
  onNext?: () => void;
}

export default observer(({ onNext, vm }: Props) => {
  const { t } = i18n;
  const swiper = useRef<Swiper>(null);
  const [addr, setAddr] = useState<string>();
  const [scanEnabled, setScanEnabled] = useState(false);
  const { borderColor, tintColor, isLightMode, textColor, foregroundColor, secondaryTextColor, backgroundColor } = Theme;
  const { contacts } = Contacts;

  const goToScan = () => {
    setScanEnabled(true);
    swiper.current?.scrollTo(1);
  };

  const cancelScan = () => {
    setScanEnabled(false);
    swiper.current?.scrollTo(0);
  };

  const renderContact = ({ item }: ListRenderItemInfo<IContact>) => {
    const actions = [{ title: t('button-remove'), destructive: true, systemIcon: 'trash.slash' }];

    const onActionPress = (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
      const { index } = e.nativeEvent;

      switch (index) {
        case 0:
          startLayoutAnimation();
          Contacts.remove(item);
          break;
      }
    };

    return (
      <ContextMenu actions={actions} onPress={onActionPress} previewBackgroundColor={backgroundColor}>
        <TouchableOpacity
          style={{
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 0,
            margin: 0,
            paddingVertical: 10,
          }}
          onPress={(_) => {
            setAddr(item.ens || item.address);
            vm.setTo(item.ens || item.address, item.avatar);
          }}
        >
          <View style={{ position: 'relative', marginEnd: 12 }}>
            {item.emoji ? (
              <Avatar
                size={20}
                emoji={item.emoji.icon}
                backgroundColor={item.emoji.color}
                emojiSize={8}
                emojiMarginTop={0}
                emojiMarginStart={0}
              />
            ) : (
              <FontAwesome
                name="user-circle-o"
                size={20}
                color={secondaryFontColor}
                style={{ width: 20, height: 20, opacity: 0.5 }}
              />
            )}

            {item.avatar ? (
              <Image
                source={{ uri: item.avatar }}
                style={{ position: 'absolute', width: 20, height: 20, borderRadius: 100 }}
              />
            ) : undefined}
          </View>
          <Text style={{ fontSize: 17, color: textColor, maxWidth: '90%' }} numberOfLines={1}>
            {item.ens || item.name || formatAddress(item.address)}
          </Text>
        </TouchableOpacity>
      </ContextMenu>
    );
  };

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <SafeViewContainer style={styles.container}>
        <TextBox
          title={`${t('modal-review-to')}:`}
          placeholder="0xabc..., .eth"
          defaultValue={vm.to}
          value={addr}
          textColor={textColor}
          style={{ borderColor: isLightMode ? borderColor : tintColor }}
          iconColor={isLightMode ? `${foregroundColor}80` : tintColor}
          onScanRequest={goToScan}
          onChangeText={(t) => {
            setAddr(t);
            vm.setTo(t);
          }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: secondaryTextColor }}>{t('modal-contacts-recent')}:</Text>
          {vm.isResolvingAddress ? (
            <Skeleton style={{ height: 14, width: 96 }} />
          ) : vm.isEns ? (
            <Text style={{ color: secondaryTextColor }}>{formatAddress(vm.toAddress, 7, 5)}</Text>
          ) : undefined}
        </View>

        <FlatList
          data={contacts}
          renderItem={renderContact}
          bounces={contacts.length > 7}
          style={{ flex: 1, marginHorizontal: -16 }}
          keyExtractor={(item) => `${item.ens}_${item.address}_${item.avatar}`}
          ItemSeparatorComponent={() => (
            <View style={{ backgroundColor: borderColor, height: 1, marginHorizontal: 16, opacity: 0.75 }} />
          )}
        />

        <Button
          title={t('button-next')}
          disabled={!vm.isValidAddress}
          style={{ marginTop: 12 }}
          onPress={onNext}
          themeColor={Networks.current.color}
        />
      </SafeViewContainer>

      <MiniScanner
        tipText={t('qrscan-tip-eth-address')}
        enabled={scanEnabled}
        onBack={cancelScan}
        onBarCodeScanned={({ data }) => {
          if (!utils.isAddress(data) && !data.endsWith('.eth') && !data.endsWith('.xyz')) return;

          setAddr(data);
          vm.setTo(data);
          cancelScan();
        }}
      />
    </Swiper>
  );
});
