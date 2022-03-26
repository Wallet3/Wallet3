import { DecodedFunc } from '../../viewmodels/hubs/EtherscanHub';
import React from 'react';
import { observer } from 'mobx-react-lite';

interface Props {
  onBack?: () => void;
  decodedFunc?: DecodedFunc;
  themeColor?: string;
}

export default observer(({}: Props) => {
  return <></>;
});
