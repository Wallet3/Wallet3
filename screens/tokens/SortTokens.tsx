import { Coin, Separator } from '../../components';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import React, { useState } from 'react';
import { SafeAreaView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { fontColor, secondaryFontColor } from '../../constants/styles';

import App from '../../viewmodels/App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../../viewmodels/Networks';
import { RootStack } from '../navigations';
import Theme from '../../viewmodels/settings/Theme';
import { UserToken } from '../../viewmodels/services/TokensMan';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

const DraggableToken = observer(
  ({
    drag,
    isActive,
    item,
    onValueChange,
    textColor,
  }: {
    item: UserToken;
    drag: any;
    isActive: boolean;
    onValueChange: (on: boolean) => void;
    textColor: string;
  }) => (
    <TouchableOpacity
      onLongPress={drag}
      disabled={isActive}
      onPress={() => onValueChange(!item.shown)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <Coin symbol={item.symbol} style={{ width: 36, height: 36, marginEnd: 16 }} iconUrl={item.iconUrl} />
      <Text style={{ fontSize: 18, color: textColor }}>{item.symbol}</Text>
      <View style={{ flex: 1 }} />
      <Switch value={item.shown} onValueChange={(on) => onValueChange(on)} trackColor={{ true: Networks.current.color }} />
    </TouchableOpacity>
  )
);

export default observer(({ navigation }: NativeStackScreenProps<RootStack, 'Tokens'>) => {
  const { t } = i18n;
  const { currentAccount } = App;
  const { allTokens } = currentAccount?.tokens ?? { allTokens: [] };
  const [data, setData] = useState(allTokens);
  const { borderColor, textColor } = Theme;

  const renderItem = (props: RenderItemParams<UserToken>) => (
    <DraggableToken {...props} onValueChange={() => currentAccount?.tokens.toggleToken(props.item)} textColor={textColor} />
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={{ paddingHorizontal: 16, color: secondaryFontColor, paddingBottom: 4 }}>{t('home-tokens-drag-tip')}</Text>
      <Separator style={{ backgroundColor: borderColor }} />
      <DraggableFlatList
        style={{ marginBottom: -36 }}
        contentContainerStyle={{ paddingBottom: 42 }}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.address}
        onDragEnd={({ data }) => {
          currentAccount?.tokens.sortTokens(data);
          setData(data);
        }}
      />
    </SafeAreaView>
  );
});
