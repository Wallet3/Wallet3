import { StyleProp, Text, TextStyle, View } from 'react-native';

import { AccountBase } from '../../viewmodels/account/AccountBase';
import Avatar from '../../components/Avatar';
import React from 'react';
import { thirdFontColor } from '../../constants/styles';

interface Props {
  account: AccountBase;
  textColor?: string;
  txtStyle?: StyleProp<TextStyle>;
}

export default ({ account, textColor, txtStyle }: Props) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Avatar uri={account.avatar} size={20} emojiSize={8} emoji={account.emojiAvatar} backgroundColor={account.emojiColor} />

      <Text
        numberOfLines={1}
        style={[
          { maxWidth: 100, fontWeight: '500', marginStart: 8, color: textColor ?? thirdFontColor, fontSize: 12 },
          txtStyle,
        ]}
      >
        {account.miniDisplayName}
      </Text>
    </View>
  );
};
