import DeviceInfo from 'react-native-device-info';
import { ModalMarginScreen } from '../modals/styles';
import iosDevice from 'ios-device-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

export const DefaultCornerRadius = 20;

const iPhone = {
  'iPhone X': 39,
  'iPhone Xs': 39,
  'iPhone Xs Max': 39,
  'iPhone XR': 41.5,
  'iPhone 11': 41.5,
  'iPhone 11 Pro': 39,
  'iPhone 11 Pro Max': 39,
  'iPhone 12': 47.33,
  'iPhone 12 mini': 44,
  'iPhone 12 Pro': 47.33,
  'iPhone 12 Pro Max': 53.33,
  'iPhone 13': 47.33,
  'iPhone 13 mini': 44,
  'iPhone 13 Pro': 47.33,
  'iPhone 13 Pro Max': 53.33,
  'iPhone 14': 47.33,
  'iPhone 14 Plus': 53.33,
  'iPhone 14 Pro': 55,
  'iPhone 14 Pro Max': 55,
  'iPad Air': DefaultCornerRadius,
  'iPad Pro': DefaultCornerRadius,
};

let screenCornerRadius = 0;

export function getScreenCornerRadius(): number {
  if (screenCornerRadius) return screenCornerRadius;

  const currentDevice: string = iosDevice.generationByIdentifier(DeviceInfo.getDeviceId())?.toLowerCase() ?? '';
  if (!currentDevice) return (screenCornerRadius = DefaultCornerRadius);

  const deviceModel = Object.getOwnPropertyNames(iPhone)
    .reverse()
    .find((i) => currentDevice.includes(i.toLowerCase()))!;

  screenCornerRadius = iPhone[deviceModel] || DefaultCornerRadius;

  return screenCornerRadius - ModalMarginScreen;
}

export function getDeviceModel() {
  return iosDevice.generationByIdentifier(DeviceInfo.getDeviceId()) ?? DeviceInfo.getDeviceSync();
}

export function useScreenCornerRadius() {
  const [cornerRadius] = useState(getScreenCornerRadius());
  return cornerRadius;
}

export function useOptimizedCornerRadius() {
  const [cornerRadius] = useState(Math.max(getScreenCornerRadius() - DefaultCornerRadius, 0));
  return cornerRadius;
}

export function useOptimizedSafeBottom() {
  const { bottom } = useSafeAreaInsets();
  return bottom - 16 - ModalMarginScreen;
}
