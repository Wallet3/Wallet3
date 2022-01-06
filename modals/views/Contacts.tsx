import Contacts, { IContact } from '../../viewmodels/customs/Contacts';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { ListRenderItemInfo, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeViewContainer, Skeleton, TextBox } from '../../components';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import Button from '../../components/Button';
import { FlatList } from 'react-native-gesture-handler';
import Image from 'react-native-expo-cached-image';
import Networks from '../../viewmodels/Networks';
import { TokenTransferring } from '../../viewmodels/transferring/TokenTransferring';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  onNext?: () => void;
  vm: TokenTransferring;
}

export default observer(({ onNext, vm }: Props) => {
  const { t } = i18n;
  const [addr, setAddr] = useState<string>();

  const renderContact = ({ item }: ListRenderItemInfo<IContact>) => {
    return (
      <TouchableOpacity
        style={{
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
          <FontAwesome
            name="user-circle-o"
            size={20}
            color={secondaryFontColor}
            style={{ width: 20, height: 20, opacity: 0.5 }}
          />
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={{ position: 'absolute', width: 20, height: 20, borderRadius: 100 }} />
          ) : undefined}
        </View>
        <Text style={{ fontSize: 17, color: fontColor }} numberOfLines={1}>
          {item.ens || formatAddress(item.address)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeViewContainer style={styles.container}>
      <TextBox
        title={`${t('modal-review-to')}:`}
        placeholder="0xabc..., .eth"
        defaultValue={vm.to}
        value={addr}
        onChangeText={(t) => {
          setAddr(t);
          vm.setTo(t);
        }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: secondaryFontColor }}>{t('modal-contacts-recent')}:</Text>
        {vm.isResolvingAddress ? (
          <Skeleton style={{ height: 14, width: 96 }} />
        ) : vm.isEns ? (
          <Text style={{ color: secondaryFontColor }}>{formatAddress(vm.toAddress, 7, 5)}</Text>
        ) : undefined}
      </View>

      <FlatList
        data={Contacts.contacts}
        renderItem={renderContact}
        style={{ flex: 1, marginHorizontal: -16, paddingHorizontal: 16 }}
        keyExtractor={(item) => `${item.ens}_${item.address}_${item.avatar}`}
        ItemSeparatorComponent={() => <View style={{ backgroundColor: borderColor, height: 1 }} />}
      />

      <Button
        title={t('button-next')}
        disabled={!vm.isValidAddress}
        style={{ marginTop: 12 }}
        onPress={onNext}
        themeColor={Networks.current.color}
      />
    </SafeViewContainer>
  );
});
