import { Button, SafeViewContainer, TextBox } from '../../components';
import React, { useState } from 'react';

import { Account } from '../../viewmodels/account/Account';
import { View } from 'react-native';
import { observer } from 'mobx-react-lite';

interface Props {
  account?: Account;
  themeColor?: string;
  onDone?: () => void;
}

export default observer(({ account, onDone }: Props) => {
  const [name, setName] = useState('');

  const done = () => {
    onDone?.();
  };

  return (
    <SafeViewContainer style={{ padding: 16 }}>
      <TextBox title='' placeholder={`Account ${account?.index} | ${account?.displayName}`} defaultValue={account?.ens.name} onChangeText={(txt) => setName(txt)} />
      <View style={{ flex: 1 }}></View>
      <Button title="OK" txtStyle={{ textTransform: 'uppercase' }} onPress={done} />
    </SafeViewContainer>
  );
});
