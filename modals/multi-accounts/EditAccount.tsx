import { Button, SafeViewContainer, TextBox } from '../../components';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { emojis, genColor } from '../../utils/emoji';

import { Account } from '../../viewmodels/account/Account';
import Avatar from '../../components/Avatar';
import { FlatGrid } from 'react-native-super-grid';
import { Ionicons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';

interface Props {
  account?: Account;
  themeColor?: string;
  onDone?: () => void;
}

export default observer(({ account, onDone }: Props) => {
  const [name, setName] = useState('');
  const [colors] = useState(
    [account?.emojiColor].concat(
      new Array(2 * Math.floor((Dimensions.get('window').width - 32) / (52 + 5)) - 1).fill(0).map(() => genColor())
    )
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(account?.emojiColor);
  const [selectedEmoji, setSelectedEmoji] = useState(account?.emojiAvatar);

  const done = () => {
    onDone?.();
  };

  return (
    <SafeViewContainer style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar
          uri={account?.avatar}
          size={37}
          emoji={selectedEmoji}
          emojiSize={16}
          backgroundColor={selectedColor}
          style={{ marginEnd: 12, marginTop: -8 }}
        />

        <TextBox
          title=""
          placeholder={`Account ${account?.index} | ${account?.displayName}`}
          defaultValue={account?.ens.name}
          onChangeText={(txt) => setName(txt)}
          style={{ flex: 1 }}
        />
      </View>

      <View style={{ flex: 1, marginBottom: 8 }}>
        <FlatGrid
          data={emojis}
          itemDimension={52}
          spacing={5}
          style={{ height: 167, marginBottom: 8, paddingVertical: 12 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              key={`${index}-${item}`}
              style={{ height: 42, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => setSelectedEmoji(item)}
            >
              <Text style={{ fontSize: 20 }}>{item}</Text>
            </TouchableOpacity>
          )}
        />

        <FlatGrid
          itemDimension={52}
          data={colors}
          bounces={false}
          spacing={0}
          contentContainerStyle={{ padding: 0 }}
          style={{ padding: 0, paddingStart: 2 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              key={`${item}-${index}`}
              style={{
                backgroundColor: item,
                width: 52,
                height: 52,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 5,
              }}
              onPress={() => {
                setSelectedIndex(index);
                setSelectedColor(item);
              }}
            >
              {selectedIndex === index ? <Ionicons name="checkmark" size={24} color={'#fff'} /> : null}
            </TouchableOpacity>
          )}
        />
      </View>

      <Button title="OK" txtStyle={{ textTransform: 'uppercase' }} onPress={done} />
    </SafeViewContainer>
  );
});
