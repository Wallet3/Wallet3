import { Text, View } from 'react-native';

import Avatar from '../../components/Avatar';
import { EOAAccount } from '../../viewmodels/account/EOAAccount';
import React from 'react';
import { thirdFontColor } from '../../constants/styles';

export default ({ account, textColor }: { account: EOAAccount; textColor?: string }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Avatar uri={account.avatar} size={20} emojiSize={8} emoji={account.emojiAvatar} backgroundColor={account.emojiColor} />

      <Text
        numberOfLines={1}
        style={{ maxWidth: 100, fontWeight: '500', marginStart: 8, color: textColor ?? thirdFontColor, fontSize: 12 }}
      >
        {account.miniDisplayName}
      </Text>
    </View>
  );
};
