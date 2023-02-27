import { MaterialIcons, Octicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { ClientInfo } from '../../../common/p2p/Constants';
import Device from '../../../components/Device';
import Theme from '../../../viewmodels/settings/Theme';
import dayjs from 'dayjs';
import { formatAddress } from '../../../utils/formatter';
import iosDevice from 'ios-device-list';
import { verifiedColor } from '../../../constants/styles';

interface Props {
  info: ClientInfo;
  mainAddress?: string;
  verified?: boolean;
  light?: boolean;
  lastUsedAt?: number;
}

export default ({ info, verified, light, lastUsedAt, mainAddress }: Props) => {
  const { textColor, secondaryTextColor } = Theme;
  if (!info) return null;

  const [generation] = useState(iosDevice.generationByIdentifier(info.device));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <Device deviceId={info.device} os={info.rn_os} style={{ width: light ? 27 : 32, height: light ? 39 : 42 }} />

      <View style={{ marginHorizontal: 12, flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text numberOfLines={1} style={{ color: textColor, fontSize: light ? 18 : 22, fontWeight: '600', marginEnd: 8 }}>
            {`${info.name || generation}`}
          </Text>

          {verified && <MaterialIcons name="verified" color={verifiedColor} size={19} style={{}} />}
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: secondaryTextColor }} numberOfLines={1}>
            {`${mainAddress ? `${formatAddress(mainAddress, 6, 4, '...')}, ` : ''}${`${generation}` || ''}${
              info.osVersion ? `,  ${info.os} ${info.osVersion}` : ''
            }`.trim()}
          </Text>

          <Text>{lastUsedAt ? dayjs(lastUsedAt).format('YYYY-mm-dd') : undefined}</Text>
        </View>
      </View>
    </View>
  );
};
