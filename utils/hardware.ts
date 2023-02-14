import DeviceInfo from 'react-native-device-info';
import iosDevice from 'ios-device-list';

export const DefaultCornerRadius = 20;

const iPhone = {
  'iPhone X': 39,
  'iPhone Xs': 39,
  'iPhone Xs Max': 39,
  'iPhone 11 Pro': 39,
  'iPhone 11 Pro Max': 39,
  'iPhone XR': 41.5,
  'iPhone 11': 41.5,
  'iPhone 12 mini': 44,
  'iPhone 12': 42,
  'iPhone 12 Pro': 42,
  'iPhone 12 Pro Max': 53.33,
  'iPhone 13 mini': 44,
  'iPhone 13': 42,
  'iPhone 13 Pro': 42,
  'iPhone 13 Pro Max': 53.33,
  'iPhone 14': 42,
  'iPhone 14 Pro': 55,
  'iPhone 14 Pro Max': 55,
  'iPad Air': DefaultCornerRadius,
  'iPad Pro': DefaultCornerRadius,
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
