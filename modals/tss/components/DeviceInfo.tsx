import { Text, View } from 'react-native';

import { ClientInfo } from '../../../common/p2p/Constants';
import Device from '../../../components/Device';
import React from 'react';
import Theme from '../../../viewmodels/settings/Theme';

export default ({ info }: { info: ClientInfo }) => {
  const { textColor, secondaryTextColor } = Theme;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Device deviceId={info.device} os={info.rn_os} style={{ width: 32, height: 42 }} />
      <View style={{ marginStart: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text numberOfLines={1} style={{ color: textColor, fontSize: 22, fontWeight: '600', marginBottom: 2 }}>
            {`${info.name}`}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: secondaryTextColor }}>{`${info.os} ${info.osVersion}`}</Text>
        </View>
      </View>
    </View>
  );
};
