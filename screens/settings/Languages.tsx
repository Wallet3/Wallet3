import { FlatList, ListRenderItemInfo, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Langs, { Lang } from '../../viewmodels/settings/Langs';

import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeViewContainer } from '../../components';
import Theme from '../../viewmodels/settings/Theme';
import { observer } from 'mobx-react-lite';

const LangItem = observer(({ item, onPress, textColor }: { onPress: () => void; item: Lang; textColor: string }) => {
  return (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }} onPress={onPress}>
      <Text style={{ fontSize: 17, fontFamily: 'PingFangTC-Medium', color: textColor }}>{item.name}</Text>
      <View style={{ flex: 1 }} />
      <Feather name="check" size={17} style={{ opacity: Langs.currentLang.value === item.value ? 1 : 0 }} color={textColor} />
    </TouchableOpacity>
  );
});

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const { textColor, borderColor } = Theme;
  const setLang = (item: Lang) => {
    Langs.setLang(item);
    navigation?.goBack();
  };

  const renderItem = ({ item }: ListRenderItemInfo<Lang>) => (
    <LangItem textColor={textColor} item={item} onPress={() => setLang(item)} />
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SafeViewContainer style={{ paddingTop: 0 }}>
        <FlatList
          data={Langs.supportedLangs}
          renderItem={renderItem}
          keyExtractor={(i) => i.value}
          ItemSeparatorComponent={() => <View style={{ height: 0.333, backgroundColor: borderColor }} />}
          style={{}}
        />
      </SafeViewContainer>
    </SafeAreaView>
  );
});
