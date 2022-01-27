import CurrencyViewmodel, { Currency } from '../../viewmodels/settings/Currency';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeViewContainer } from '../../components';
import Theme from '../../viewmodels/settings/Theme';
import { borderColor } from '../../constants/styles';
import { observer } from 'mobx-react-lite';

const CurrencyItem = observer(({ item, onPress, textColor }: { item: Currency; onPress: () => void; textColor: string }) => {
  return (
    <TouchableOpacity style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center' }} onPress={onPress}>
      <Text style={{ fontSize: 17, marginEnd: 12, color: textColor }}>{item.symbol}</Text>
      <Text style={{ fontSize: 17, color: textColor }}>{`${item.currency}`}</Text>
      <View style={{ flex: 1 }} />
      <Feather
        name="check"
        size={17}
        color={textColor}
        style={{ opacity: CurrencyViewmodel.currentCurrency.currency === item.currency ? 1 : 0 }}
      />
    </TouchableOpacity>
  );
});

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const { textColor } = Theme;
  const setCurrency = (item: Currency) => {
    CurrencyViewmodel.setCurrency(item);
    navigation?.goBack();
  };

  const renderItem = ({ item }: { item: Currency }) => (
    <CurrencyItem textColor={textColor} item={item} onPress={() => setCurrency(item)} />
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SafeViewContainer style={{ paddingTop: 0 }}>
        <FlatList
          data={CurrencyViewmodel.supportedCurrencies}
          renderItem={renderItem}
          keyExtractor={(i) => i.currency}
          ItemSeparatorComponent={() => <View style={{ height: 0.333, backgroundColor: borderColor }} />}
        />
      </SafeViewContainer>
    </SafeAreaView>
  );
});
