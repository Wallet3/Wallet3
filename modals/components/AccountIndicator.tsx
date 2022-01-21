import { Text, View } from 'react-native';

import { Account } from '../../viewmodels/account/Account';
import Avatar from '../../components/Avatar';
import React from 'react';
import { formatAddress } from '../../utils/formatter';
import { thirdFontColor } from '../../constants/styles';

export default ({ account }: { account: Account }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Avatar uri={account.avatar} size={20} emojiSize={8} emoji={account.emojiAvatar} backgroundColor={account.emojiColor} />

      <Text numberOfLines={1} style={{ maxWidth: 100, marginStart: 6, color: thirdFontColor, fontSize: 14 }}>
        {account.miniDisplayName}
      </Text>
    </View>
  );
};
