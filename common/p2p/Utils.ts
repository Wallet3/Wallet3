import { ClientInfo } from './Constants';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import { sha256Sync } from '../../utils/cipher';

export const globalId = sha256Sync(DeviceInfo.getUniqueIdSync()).substring(0, 24);

export function getDeviceInfo(nameSuffix?: string): ClientInfo {
  return {
    globalId,
    name: DeviceInfo.getDeviceNameSync() + (nameSuffix ? ` ${nameSuffix}` : ''),
    devtype: DeviceInfo.getDeviceType(),
    device: DeviceInfo.getDeviceId(),
    manufacturer: DeviceInfo.getManufacturerSync(),
    os: DeviceInfo.getSystemName(),
    rn_os: Platform.OS as 'ios',
    osVersion: DeviceInfo.getSystemVersion(),
  };
}

export function getDeviceBasicInfo(nameSuffix?: string) {
  return {
    name: DeviceInfo.getDeviceNameSync() + (nameSuffix ? ` ${nameSuffix}` : ''),
    devtype: DeviceInfo.getDeviceType(),
    device: DeviceInfo.getDeviceId(),
    manufacturer: DeviceInfo.getManufacturerSync(),
    os: DeviceInfo.getSystemName(),
    rn_os: Platform.OS as 'ios',
  };
}
