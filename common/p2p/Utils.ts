import { ClientInfo } from './Constants';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import { createHash } from 'crypto';

export function getDeviceInfo(): ClientInfo {
  return {
    globalId: createHash('sha256').update(Buffer.from(DeviceInfo.getUniqueIdSync(), 'utf8')).digest('hex').substring(0, 16),
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
