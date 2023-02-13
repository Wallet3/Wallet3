import DeviceInfo from 'react-native-device-info';
import iosDevice from 'ios-device-list';

export const DefaultCornerRadius = 18;

const iPhone = {
  'iPhone X': 39,
  'iPhone Xs': 39,
  'iPhone Xs Max': 39,
  'iPhone 11 Pro': 39,
  'iPhone 11 Pro Max': 39,
  'iPhone XR': 41.5,
  'iPhone 11': 41.5,
  'iPhone 12 mini': 44,
  'iPhone 12': 47.33,
  'iPhone 12 Pro': 47.33,
  'iPhone 12 Pro Max': 53.33,
  'iPhone 13 mini': 44,
  'iPhone 13': 47.33,
  'iPhone 13 Pro': 47.33,
  'iPhone 13 Pro Max': 53.33,
  'iPhone 14': 47.33,
  'iPhone 14 Pro': 55,
  'iPhone 14 Pro Max': 55,
  'iPad Air': DefaultCornerRadius,
  'iPad Pro': DefaultCornerRadius,
};

let screenCornerRadius = 0;

export function getScreenCornerRadius() {
  // return 55;
  if (screenCornerRadius) return screenCornerRadius;

  const currentDevice: string = iosDevice.generationByIdentifier(DeviceInfo.getDeviceId())?.toLowerCase() ?? '';
  if (!currentDevice) return (screenCornerRadius = DefaultCornerRadius);

  console.log(
    currentDevice,
    Object.getOwnPropertyNames(iPhone).find((i) => currentDevice.includes(i.toLowerCase()))
  );

  screenCornerRadius =
    iPhone[Object.getOwnPropertyNames(iPhone).find((i) => currentDevice.includes(i.toLowerCase()))!] || DefaultCornerRadius;
  return screenCornerRadius;
}
