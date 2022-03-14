import { AutoSizeText, ResizeTextMode } from 'react-native-auto-size-text';
import { Button, Coin, Numpad, SafeViewContainer } from '../../components';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { numericFontFamily, secondaryFontColor } from '../../constants/styles';

import BackButton from '../components/BackButton';
import { INetwork } from '../../common/Networks';
import { IToken } from '../../common/Tokens';
import Networks from '../../viewmodels/Networks';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import numeral from 'numeral';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface SubViewProps {
  onBack?: () => void;
  onNext?: () => void;
  onTokenPress?: () => void;
  onTokenBack?: () => void;
  token: IToken;
  disableBack?: boolean;
  disableBalance?: boolean;
  disableButton?: boolean;
  max?: string;
  onMaxPress?: () => void;
  onNumChanged?: (num: string) => void;
  themeColor?: string;
  initValue?: string;
  network: INetwork;
}

export default observer((props: SubViewProps) => {
  const { t } = i18n;
  const [amount, setAmount] = useState(props.initValue ?? '0');
  const { tintColor, borderColor, isLightMode, mode } = Theme;

  const onNumPress = (num: string) => {
    if (num === '.') {
      if (amount.includes('.')) return;
      setAmount((pre) => pre + '.');
      return;
    }

    if (num === 'del') {
      setAmount((pre) => pre.slice(0, -1) || '0');
      return;
    }

    if (num === 'clear') {
      setAmount('0');
      return;
    }

    setAmount((pre) => {
      const combined = `${pre}${num}`;
      return combined.startsWith('0') && !combined.startsWith('0.') ? Number(combined).toString() : combined;
    });
  };

  useEffect(() => {
    props.onNumChanged?.(amount);
  }, [amount]);

  return (
    <SafeViewContainer style={styles.container}>
      <View style={{ ...styles.navBar }}>
        {props.disableBack ? <View /> : <BackButton onPress={props.onBack} color={Networks.current.color} />}

        <TouchableOpacity
          style={{ ...styles.navMoreButton, borderColor: isLightMode ? borderColor : tintColor }}
          onPress={props.onTokenPress}
        >
          <Text
            style={{ fontSize: 19, marginEnd: 8, color: secondaryFontColor, fontWeight: '500', maxWidth: 200 }}
            numberOfLines={1}
          >
            {props.token?.symbol}
          </Text>

          <Coin
            symbol={props.token?.symbol}
            style={{ width: 22, height: 22 }}
            forceRefresh
            iconUrl={props.token?.iconUrl}
            address={props.token.address}
            chainId={props.network.chainId}
          />
        </TouchableOpacity>
      </View>

      <AutoSizeText
        fontSize={64}
        numberOfLines={2}
        mode={ResizeTextMode.max_lines}
        adjustsFontSizeToFit
        style={{
          fontFamily: numericFontFamily,
          fontWeight: '600',
          marginBottom: -19,
          maxHeight: 89,
          textAlign: 'center',
          color: props.themeColor,
        }}
      >
        {amount}
      </AutoSizeText>

      <View style={{ flex: 1 }} />

      {props.max ? (
        <TouchableOpacity
          style={{ justifyContent: 'flex-end', flexDirection: 'row', paddingEnd: 4, paddingBottom: 6 }}
          onPress={() => {
            props.onMaxPress?.();
            setAmount(props.max ?? '0');
          }}
        >
          <Text style={{ color: secondaryFontColor }} numberOfLines={1}>
            {`Max: ${numeral(props.max).format('0,0.0000')}`}
          </Text>
        </TouchableOpacity>
      ) : undefined}

      <Numpad onPress={onNumPress} color={isLightMode ? undefined : tintColor} mode={mode} />

      <Button
        title={t('button-next')}
        onPress={props.onNext}
        disabled={props.disableButton}
        themeColor={props.themeColor}
        style={{ marginTop: 12 }}
      />
    </SafeViewContainer>
  );
});
