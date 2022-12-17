import { Button, Coin, Separator, TextBox } from '../../../components';
import { FlatList, ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';

import { ERC20Token } from '../../../models/ERC20';
import { IToken } from '../../../common/tokens';
import Theme from '../../../viewmodels/settings/Theme';
import { formatCurrency } from '../../../utils/formatter';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { startLayoutAnimation } from '../../../utils/animations';
import { utils } from 'ethers';

interface Props {
  tokens: IToken[];
  selectedToken?: IToken;
  chainId: number;
  themeColor?: string;
  onTokenSelected?: (token: IToken) => void;
  onAddTokenRequested?: (token: ERC20Token) => void;
}

export default observer((props: Props) => {
  const { textColor, borderColor, secondaryTextColor, isLightMode, foregroundColor, tintColor, backgroundColor } = Theme;
  const [filterTxt, setFilterTxt] = useState('');
  const [userToken, setUserToken] = useState<ERC20Token>();
  const flatList = useRef<FlatList>(null);
  const { t } = i18n;

  const handleInput = async (txt: string) => {
    if (!utils.isAddress(txt)) {
      setFilterTxt(txt.toLowerCase());
      return;
    }

    setFilterTxt('');

    const token = new ERC20Token({ contract: txt, chainId: props.chainId, owner: txt });

    try {
      await Promise.all([token.getDecimals(), token.getSymbol()]);
    } catch (error) {
      setUserToken(undefined);
      return;
    }

    startLayoutAnimation();
    setUserToken(token);
  };

  const renderItem = ({ item }: ListRenderItemInfo<IToken>) => {
    const opacity = props.selectedToken?.address === item.address ? 0.25 : 1;

    return (
      <TouchableOpacity
        onPress={() => props.onTokenSelected?.(item)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          margin: 0,
          padding: 8,
          paddingVertical: 12,
        }}
      >
        <Coin
          address={item.address}
          chainId={1}
          symbol={item.symbol}
          size={29}
          style={{ marginEnd: 12, opacity }}
          iconUrl={item.logoURI}
          forceRefresh
        />
        <Text style={{ fontSize: 19, color: textColor, opacity }} numberOfLines={1}>
          {item.symbol}
        </Text>

        <View style={{ flex: 1 }} />

        <Text style={{ fontSize: 19, color: secondaryTextColor, opacity }}>{formatCurrency(item.amount || 0, '')}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ padding: 16, paddingBottom: 0 }}>
      <TextBox
        iconColor={isLightMode ? `${foregroundColor}80` : tintColor}
        style={{ marginBottom: 16 }}
        placeholder={t('exchange-add-token-placeholder')}
        onChangeText={(t) => handleInput(t)}
      />

      {userToken ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingStart: 8,
            paddingEnd: 0,
            paddingTop: 0,
            paddingBottom: 12,
            backgroundColor,
          }}
        >
          <Coin forceRefresh size={29} address={userToken.address} symbol={userToken.symbol} chainId={userToken.chainId} />
          <Text style={{ marginStart: 12, fontSize: 19 }}>{userToken.symbol}</Text>
          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={{ paddingHorizontal: 6, paddingVertical: 4 }}
            onPress={() => {
              props.onAddTokenRequested?.(userToken);
              setUserToken(undefined);

              try {
                flatList.current?.scrollToEnd({ animated: true });
              } catch (error) {}
            }}
          >
            <Text style={{ fontSize: 20, color: props.themeColor, fontWeight: '500', textTransform: 'uppercase' }}>
              {t('exchange-add-token-button')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : undefined}

      <Text style={{ marginBottom: 4, color: secondaryTextColor, paddingHorizontal: 8 }}>{t('exchange-tokens')}</Text>
      <Separator style={{ borderColor }} />

      <FlatList
        ref={flatList}
        data={filterTxt ? props.tokens.filter((t) => t.symbol.toLowerCase().includes(filterTxt)) : props.tokens}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 }}
        style={{ marginHorizontal: -16, height: 420 }}
      />
    </View>
  );
});
