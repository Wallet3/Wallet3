import { FlatList, ListRenderItemInfo, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Langs, { Lang } from '../../viewmodels/settings/Langs';

import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeViewContainer } from '../../components';
import Theme from '../../viewmodels/settings/Theme';
import { borderColor } from '../../constants/styles';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

const ThemeItem = observer(({ item, onPress, textColor }: { onPress: () => void; item: string; textColor: string }) => {
  const { t } = i18n;

  return (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }} onPress={onPress}>
      <Text style={{ fontSize: 17, fontFamily: 'PingFangTC-Medium', color: textColor, textTransform: 'capitalize' }}>
        {t(`settings-general-theme-${item}`)}
      </Text>
      <View style={{ flex: 1 }} />
      <Feather name="check" size={17} style={{ opacity: Theme.mode === item ? 1 : 0 }} color={textColor} />
    </TouchableOpacity>
  );
});

export default observer(({ navigation }: NativeStackScreenProps<{}, never>) => {
  const { textColor, borderColor } = Theme;

  const setTheme = (item: 'light' | 'dark') => {
    Theme.setTheme(item);
    navigation?.goBack();
  };

  return (
    <SafeViewContainer paddingHeader>
      <ThemeItem textColor={textColor} onPress={() => setTheme('light')} item="light" />
      <View style={{ height: 0.333, backgroundColor: borderColor }} />
      <ThemeItem textColor={textColor} onPress={() => setTheme('dark')} item="dark" />
    </SafeViewContainer>
  );
});
