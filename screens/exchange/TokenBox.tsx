import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Coin } from '../../components';
import React from 'react';
import { observer } from 'mobx-react-lite';

interface Props {
  busy?: boolean;
  showMaxBalance?: boolean;
  maxBalance?: string;
  onMaxBalancePress?: () => void;
  tokenAddress: string;
  tokenSymbol: string;
  chainId: number;
}

export default observer((props: Props) => {
  return (
    <View style={{}}>
      {props.showMaxBalance ? (
        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={props.onMaxBalancePress}>
          <Text>Max: {props.maxBalance}</Text>
        </TouchableOpacity>
      ) : undefined}

      <View style={{ flexDirection: 'row' }}>
        <TextInput style={{}} />

        <View>
          <Coin address={props.tokenAddress} symbol={props.tokenSymbol} chainId={props.chainId} />
          <Text>{props.tokenSymbol}</Text>
        </View>
      </View>
    </View>
  );
});
