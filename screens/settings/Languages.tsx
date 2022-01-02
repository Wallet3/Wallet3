import { FlatList, ListRenderItemInfo, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Langs, { Lang } from '../../viewmodels/settings/Langs';

import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeViewContainer } from '../../components';
import { borderColor } from '../../constants/styles';
import { observer } from 'mobx-react-lite';

const LangItem = observer(({ item, onPress }: { onPress: () => void; item: Lang }) => {
  return (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }} onPress={onPress}>
      <Text style={{ fontSize: 17 }}>{item.name}</Text>
      <View style={{ flex: 1 }} />
      <Feather name="check" size={17} style={{ opacity: Langs.currentLang.value === item.value ? 1 : 0 }} />
    </TouchableOpacity>
  );
});

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const setLang = (item: Lang) => {
    Langs.setLang(item);
    navigation?.goBack();
  };

  const renderItem = ({ item }: ListRenderItemInfo<Lang>) => <LangItem item={item} onPress={() => setLang(item)} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeViewContainer style={{ paddingTop: 0 }}>
        <FlatList
          data={Langs.supportedLangs}
          renderItem={renderItem}
          keyExtractor={(i) => i.value}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: borderColor }} />}
          style={{ backgroundColor: '#fff' }}
        />
      </SafeViewContainer>
    </SafeAreaView>
  );
});
