import { Coin, Separator } from '../../components';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { fontColor, secondaryFontColor } from '../../constants/styles';

import App from '../../viewmodels/core/App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../../viewmodels/core/Networks';
import { RootStack } from '../navigations';
import Theme from '../../viewmodels/settings/Theme';
import { UserToken } from '../../viewmodels/services/TokensMan';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { startLayoutAnimation } from '../../utils/animations';

const DraggableToken = observer(
  ({
    drag,
    isActive,
    item,
    onValueChange,
    textColor,
    chainId,
  }: {
    item: UserToken;
    drag: any;
    isActive: boolean;
    onValueChange: (on: boolean) => void;
    textColor: string;
    chainId: number;
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
      <Coin
        chainId={chainId}
        address={item.address}
        symbol={item.symbol}
        style={{ width: 36, height: 36, marginEnd: 16 }}
        iconUrl={item.logoURI}
      />
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
  const [data, setData] = useState<UserToken[]>([]);
  const { borderColor, textColor } = Theme;
  const { current } = Networks;

  const renderItem = (props: RenderItemParams<UserToken>) => (
    <DraggableToken
      chainId={current.chainId}
      {...props}
      textColor={textColor}
      onValueChange={() => {
        currentAccount?.tokens.toggleToken(props.item);
        startLayoutAnimation();
        setData(currentAccount!.tokens.allTokens);
      }}
    />
  );

  useEffect(() => {
    setData(allTokens);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={{ paddingHorizontal: 16, color: secondaryFontColor, paddingBottom: 4 }}>{t('home-tokens-drag-tip')}</Text>
      <Separator style={{ backgroundColor: borderColor }} />
      <DraggableFlatList
        style={{ marginBottom: -37 }}
        contentContainerStyle={{ paddingBottom: 64 }}
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
