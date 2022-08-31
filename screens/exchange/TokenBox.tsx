import { MaterialIcons } from '@expo/vector-icons';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Menu, MenuItem } from 'react-native-material-menu';
import { IToken } from '../../common/tokens';
import { Coin } from '../../components';
import Theme from '../../viewmodels/settings/Theme';

interface Props {
  busy?: boolean;
  showTitle?: boolean;
  title?: string;
  titleTouchable?: boolean;
  onTitlePress?: () => void;
  onTokenSelected: (toekn: IToken) => void;
  onChangeText?: ((text: string) => void) | undefined;
  token?: IToken;
  tokens: IToken[];
  chainId: number;
  value: string;
}

export default observer((props: Props) => {
  const { borderColor, textColor, secondaryTextColor } = Theme;

  const [visible, setVisible] = useState(false);

  const hideMenu = () => setVisible(false);

  const showMenu = () => setVisible(true);

  const TokenLabel = ({ address, symbol, showArrow }: { address: string; symbol: string; showArrow?: boolean }) => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Coin address={address} symbol={symbol} chainId={props.chainId} size={25} />
        <Text style={{ fontSize: 20, marginStart: 10, fontWeight: '500', color: textColor }}>{symbol}</Text>
        {showArrow && <MaterialIcons name="keyboard-arrow-down" style={{ marginStart: 4 }} color={textColor} size={16} />}
      </View>
    );
  };

  return (
    <View style={{ borderWidth: 1, borderRadius: 10, borderColor, padding: 8, paddingHorizontal: 16 }}>
      {props.showTitle ? (
        <TouchableOpacity
          style={{ flexDirection: 'row', paddingBottom: 6 }}
          onPress={props.onTitlePress}
          disabled={!props.titleTouchable}
        >
          <Text style={{ fontSize: 12, color: secondaryTextColor }}>{props?.title}</Text>
        </TouchableOpacity>
      ) : undefined}

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
        <TextInput
          onChangeText={props.onChangeText}
          style={{ flex: 1, fontSize: 22 }}
          keyboardType="decimal-pad"
          defaultValue="0.00"
          value={props.value}
        />
        <View style={{ marginTop: -30 }}>
          <Menu
            visible={visible}
            anchor={
              <TouchableOpacity onPress={showMenu}>
                {props.token && <TokenLabel address={props.token.address} symbol={props.token.symbol} showArrow />}
              </TouchableOpacity>
            }
            onRequestClose={hideMenu}
          >
            {props.tokens.map((t) => {
              return (
                <MenuItem
                  key={t.address}
                  style={{ marginStart: 8 }}
                  onPress={() => {
                    hideMenu();
                    props.onTokenSelected(t);
                  }}
                >
                  <TokenLabel address={t.address} symbol={t.symbol} />
                </MenuItem>
              );
            })}
          </Menu>
        </View>
      </View>
    </View>
  );
});
