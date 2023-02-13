import { MaterialIcons, Octicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { ClientInfo } from '../../../common/p2p/Constants';
import Device from '../../../components/Device';
import React from 'react';
import Theme from '../../../viewmodels/settings/Theme';
import iosDevice from 'ios-device-list';
import { verifiedColor } from '../../../constants/styles';

export default ({ info, verified }: { info: ClientInfo; verified?: boolean }) => {
  const { textColor, secondaryTextColor } = Theme;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <Device deviceId={info.device} os={info.rn_os} style={{ width: 32, height: 42 }} />

      <View style={{ marginStart: 16, flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text numberOfLines={1} style={{ color: textColor, fontSize: 22, fontWeight: '600', marginEnd: 6 }}>
            {`${info.name || iosDevice.generationByIdentifier(info.device)}`}
          </Text>

          {verified && <MaterialIcons name="verified" color={verifiedColor} size={19} />}
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: secondaryTextColor }} numberOfLines={1}>
            {`${`${iosDevice.generationByIdentifier(info.device)},` || ''} ${info.os} ${info.osVersion || ''}`.trim()}
          </Text>
        </View>
      </View>
    </View>
  );
};
