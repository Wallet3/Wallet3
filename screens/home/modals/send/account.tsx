import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { ListRenderItemInfo, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { borderColor, secondaryFontColor } from '../../../../constants/styles';

import Button from '../../../../components/button';
import { FlatList } from 'react-native-gesture-handler';
import { formatAddress } from '../../../../utils/formatter';

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
}

export default (props: Props) => {
  const addrRef = useRef<TextInput>(null);
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
        <Text style={{ fontSize: 18 }} numberOfLines={1}>
          {formatAddress(item)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ padding: 16, paddingBottom: 24 }}>
      <View
        style={{
          flexDirection: 'row',
          position: 'relative',
          height: 42,
          borderColor,
          borderWidth: 1,
          borderRadius: 10,
          padding: 8,
          paddingStart: 12,
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 18, color: secondaryFontColor, marginEnd: 12 }}>To:</Text>
        <TextInput ref={addrRef} style={{ fontSize: 20, flex: 1 }} value={addr} onChangeText={(t) => setAddr(t)} />

        <TouchableOpacity>
          <Ionicons name="copy-outline" size={20} style={{ marginStart: 12, opacity: 0.5 }} />
        </TouchableOpacity>
      </View>

      <Text style={{ color: secondaryFontColor }}>Recent contacts:</Text>

      <FlatList
        data={data}
        renderItem={renderAddress}
        style={{ maxHeight: 250, marginHorizontal: -16, paddingHorizontal: 16 }}
        keyExtractor={(item) => item}
        ItemSeparatorComponent={() => <View style={{ backgroundColor: borderColor, height: 1 }} />}
      />

      <Button title="Next" style={{ marginTop: 12 }} disabled onPress={props?.onNext} />
    </View>
  );
};
