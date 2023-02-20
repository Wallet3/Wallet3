import { ClientInfo } from './Constants';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import { createHash } from 'crypto';
import { sha256Sync } from '../../utils/cipher';

export function getDeviceInfo(): ClientInfo {
  return {
    globalId: sha256Sync(DeviceInfo.getUniqueIdSync()).substring(0, 24),
    name: DeviceInfo.getDeviceNameSync(),
    devtype: DeviceInfo.getDeviceType(),
    device: DeviceInfo.getDeviceId(),
    manufacturer: DeviceInfo.getManufacturerSync(),
    os: DeviceInfo.getSystemName(),
    rn_os: Platform.OS as 'ios',
    osVersion: DeviceInfo.getSystemVersion(),
  };
}

export function getDeviceBasicInfo() {
  return {
    name: DeviceInfo.getDeviceNameSync(),
    devtype: DeviceInfo.getDeviceType(),
    device: DeviceInfo.getDeviceId(),
    manufacturer: DeviceInfo.getManufacturerSync(),
    os: DeviceInfo.getSystemName(),
    rn_os: Platform.OS as 'ios',
  };
}
