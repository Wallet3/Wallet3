import DeviceInfo from 'react-native-device-info';
import iosDevice from 'ios-device-list';

export const DefaultCornerRadius = 20;
const Margin = 6;

const iPhone = {
  'iPhone X': 39 - Margin,
  'iPhone Xs': 39 - Margin,
  'iPhone Xs Max': 39 - Margin,
  'iPhone 11 Pro': 39 - Margin,
  'iPhone 11 Pro Max': 39 - Margin,
  'iPhone XR': 41.5 - Margin,
  'iPhone 11': 41.5 - Margin,
  'iPhone 12 mini': 44 - Margin,
  'iPhone 12': 47.33 - Margin,
  'iPhone 12 Pro': 47.33 - Margin,
  'iPhone 12 Pro Max': 53.33 - Margin,
  'iPhone 13 mini': 44 - Margin,
  'iPhone 13': 47.33 - Margin,
  'iPhone 13 Pro': 47.33 - Margin,
  'iPhone 13 Pro Max': 53.33 - Margin,
  'iPhone 14': 47.33 - Margin,
  'iPhone 14 Pro': 55 - Margin,
  'iPhone 14 Pro Max': 55 - Margin,
  'iPad Air': DefaultCornerRadius - Margin,
  'iPad Pro': DefaultCornerRadius - Margin,
};

let screenCornerRadius = 0;

export function getScreenCornerRadius() {
  if (screenCornerRadius) return screenCornerRadius;

  const currentDevice: string = iosDevice.generationByIdentifier(DeviceInfo.getDeviceId())?.toLowerCase() ?? '';
  if (!currentDevice) return (screenCornerRadius = DefaultCornerRadius);

  return (
    iPhone[Object.getOwnPropertyNames(iPhone).find((i) => currentDevice.includes(i.toLowerCase()))!] || DefaultCornerRadius
  );
}

export function getDeviceModel() {
  return iosDevice.generationByIdentifier(DeviceInfo.getDeviceId()) ?? DeviceInfo.getDeviceSync();
}
