import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { ListRenderItemInfo, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeViewContainer, Skeleton, TextBox } from '../../components';
import { borderColor, fontColor, secondaryFontColor } from '../../constants/styles';

import Button from '../../components/Button';
import { FlatList } from 'react-native-gesture-handler';
import Networks from '../../viewmodels/Networks';
import { Transferring } from '../../viewmodels/Transferring';
import { formatAddress } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

const data = [
  'rsa.eth',
  'vitalik.eth',
  '0x00192Fb10dF37c9FB26829eb2CC623cd1BF599E8',
  'pixlpa.eth',
  '0x1B99d91C3416bD3e6E6dc75d81ABfD360e7733F3',
  'solemnstranger.eth',
  '0xd24400ae8BfEBb18cA49Be86258a3C749cf46853',
  '0x96a29A8B1F9dC2546D5995874d23630B27E0b9d7',
  'mangimi.eth',
];

interface Props {
  onNext?: () => void;
  vm: Transferring;
}

export default observer(({ onNext, vm }: Props) => {
  const [addr, setAddr] = useState('');

  const renderAddress = ({ item }: ListRenderItemInfo<string>) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 0,
          margin: 0,
          paddingVertical: 10,
        }}
        onPress={(_) => setAddr(item)}
      >
        <FontAwesome name="user-circle-o" size={20} color={secondaryFontColor} style={{ opacity: 0.5, marginEnd: 12 }} />
        <Text style={{ fontSize: 17, color: fontColor }} numberOfLines={1}>
          {formatAddress(item)}
        </Text>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    vm.setTo(addr);
  }, [addr]);

  return (
    <SafeViewContainer style={styles.container}>
      <TextBox
        title="To:"
        value={addr}
        onChangeText={(t) => {
          setAddr(t);
        }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: secondaryFontColor }}>Recent contacts:</Text>
        {vm.isResolvingAddress ? (
          <Skeleton style={{ height: 14, width: 96 }} />
        ) : vm.isEns ? (
          <Text style={{ color: secondaryFontColor }}>{formatAddress(vm.toAddress, 7, 5)}</Text>
        ) : undefined}
      </View>

      <FlatList
        data={data}
        renderItem={renderAddress}
        style={{ flex: 1, marginHorizontal: -16, paddingHorizontal: 16 }}
        keyExtractor={(item) => item}
        ItemSeparatorComponent={() => <View style={{ backgroundColor: borderColor, height: 1 }} />}
      />

      <Button
        title="Next"
        disabled={!vm.isValidAddress}
        style={{ marginTop: 12 }}
        onPress={onNext}
        themeColor={Networks.current.color}
      />
    </SafeViewContainer>
  );
});
