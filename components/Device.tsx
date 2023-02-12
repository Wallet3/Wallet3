import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import FastImage from 'react-native-fast-image';
import iosDevice from 'ios-device-list';

const iPhoneX = require('../assets/devices/iPhone_X.png');

const iPhone11 = require('../assets/devices/iPhone_11.png');
const iPhone12 = require('../assets/devices/iPhone_12.png');
const iPhone13 = require('../assets/devices/iPhone_13.png');
const iPhone14Pro = require('../assets/devices/iPhone_14_Pro.png');
const iPadClassic = require('../assets/devices/iPad_Classic.png');
const iPadPro = require('../assets/devices/iPad_Pro.png');
const iPhoneSE = require('../assets/devices/iPhone_SE.png');
const AndroidPhone = require('../assets/devices/Android.png');

const Devices = new Map([
  ['iphone x', iPhoneX],
  ['iphone xs', iPhoneX],
  ['iphone xs max', iPhoneX],
  ['iphone 11', iPhone11],
  ['iphone 11 pro', iPhone11],
  ['iphone 11 pro max', iPhone11],
  ['iphone 12', iPhone12],
  ['iphone 12 mini', iPhone12],
  ['iphone 12 pro', iPhone12],
  ['iphone 12 pro max', iPhone12],
  ['iphone 13', iPhone13],
  ['iphone 13 mini', iPhone13],
  ['iphone 13 pro', iPhone13],
  ['iphone 13 pro max', iPhone13],
  ['iphone 14', iPhone13],
  ['iphone 14 pro', iPhone14Pro],
  ['iphone 14 pro max', iPhone14Pro],
  ['iphone se', iPhoneSE],
  ['ipad air', iPadPro],
  ['ipad pro', iPadPro],
  ['ios', iPhoneX],
  ['android', AndroidPhone],
]);

const keys = Array.from(Devices.keys());

export default ({ os, deviceId, style }: { os: 'ios' | 'android'; deviceId: string; style?: StyleProp<ViewStyle> }) => {
  const [device] = useState(
    Devices.get(keys.find((k) => (iosDevice.generationByIdentifier(deviceId)?.toLowerCase() ?? os).includes(k))!)
  );

  return (
    <View style={{ ...(style as any), position: 'relative' }}>
      <FastImage source={device} style={style as any} resizeMode="contain" />
      {/* <View style={{ position: 'absolute', top: '38%', alignContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
        {os === 'ios' ? (
          <Ionicons name="logo-apple" size={10} color="#fff" />
        ) : os === 'android' ? (
          <FontAwesome5 name="android" size={10} color="#3DDC84" />
        ) : undefined}
      </View> */}
    </View>
  );
};
