import { Button, SafeViewContainer } from '../../components';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { borderColor, fontColor, secondaryFontColor, themeColor } from '../../constants/styles';

import { Feather } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';

export default observer(
  ({
    accounts,
    selectedAccounts,
    onDone,
  }: {
    accounts: string[];
    selectedAccounts: string[];
    onDone: (selectedAccounts: string[]) => void;
  }) => {
    const [selected, setSelected] = useState(selectedAccounts);

    const toggleNetwork = (account: string) => {
      if (selected.includes(account)) {
        if (selected.length === 1) return;
        setSelected(selected.filter((id) => id !== account));
      } else {
        setSelected([...selected, account]);
      }
    };

    const renderItem = ({ item }: { item: string }) => {
      return (
        <TouchableOpacity
          onPress={() => toggleNetwork(item)}
          style={{
            flexDirection: 'row',
            padding: 4,
            alignItems: 'center',
            paddingVertical: 12,
            flex: 1,
          }}
        >
          <Feather name="check" color={themeColor} size={15} style={{ opacity: selected.includes(item) ? 1 : 0 }} />

          <Text style={{ color: fontColor, fontSize: 16, fontWeight: '500' }}>{item}</Text>
        </TouchableOpacity>
      );
    };

    return (
      <SafeViewContainer style={{ flex: 1 }}>
        <View style={{ borderBottomColor: borderColor, borderBottomWidth: 1, paddingBottom: 2 }}>
          <Text style={{ color: secondaryFontColor }}>Select accounts:</Text>
        </View>

        <FlatList
          data={accounts}
          renderItem={renderItem}
          keyExtractor={(i) => i}
          contentContainerStyle={{ paddingBottom: 8 }}
          style={{ flex: 1, marginHorizontal: -16, paddingHorizontal: 16, marginBottom: 12 }}
        />

        <Button title="Done" disabled={selected.length === 0} onPress={() => onDone(selected)} />
      </SafeViewContainer>
    );
  }
);
