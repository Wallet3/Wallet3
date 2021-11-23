import CurrencyViewmodel, { Currency } from '../../viewmodels/Currency';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeViewContainer } from '../../components';
import { borderColor } from '../../constants/styles';
import { observer } from 'mobx-react-lite';

const CurrencyItem = observer(({ item, onPress }: { item: Currency; onPress: () => void }) => {
  return (
    <TouchableOpacity style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center' }} onPress={onPress}>
      <Text style={{ fontSize: 17, marginEnd: 12 }}>{item.symbol}</Text>
      <Text style={{ fontSize: 17 }}>{`${item.currency}`}</Text>
      <View style={{ flex: 1 }} />
      <Feather
        name="check"
        size={17}
        style={{ opacity: CurrencyViewmodel.currentCurrency.currency === item.currency ? 1 : 0 }}
      />
    </TouchableOpacity>
  );
});

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const renderItem = ({ item }: { item: Currency }) => (
    <CurrencyItem item={item} onPress={() => CurrencyViewmodel.setCurrency(item)} />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeViewContainer style={{ paddingTop: 0 }}>
        <FlatList
          data={CurrencyViewmodel.supportedCurrencies}
          renderItem={renderItem}
          keyExtractor={(i) => i.currency}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: borderColor }} />}
        />
      </SafeViewContainer>
    </SafeAreaView>
  );
});
