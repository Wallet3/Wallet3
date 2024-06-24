import Passpad, { PasspadProps } from './Passpad';

import Packing from './Packing';
import React from 'react';
import { SafeViewContainer } from '../../components';
import Theme from '../../viewmodels/settings/Theme';

interface Props extends PasspadProps {
  busy?: boolean;
}

export default (props: Props) => {
  const { backgroundColor } = Theme;

  return (
    <SafeViewContainer>{props.busy ? <Packing /> : <Passpad {...props} style={{ backgroundColor }} />}</SafeViewContainer>
  );
};
