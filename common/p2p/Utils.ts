import { ClientInfo } from './Constants';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export function getDeviceInfo(): ClientInfo {
  return {
    name: DeviceInfo.getDeviceNameSync(),
    devtype: DeviceInfo.getDeviceType(),
    device: DeviceInfo.getDeviceId(),
    manufacturer: DeviceInfo.getManufacturerSync(),
    os: DeviceInfo.getSystemName(),
    rn_os: Platform.OS as any,
    osVersion: DeviceInfo.getSystemVersion(),
  };
}

export function getDeviceBasicInfo() {
  return {
    devtype: DeviceInfo.getDeviceType(),
    device: DeviceInfo.getDeviceId(),
    manufacturer: DeviceInfo.getManufacturerSync(),
    os: DeviceInfo.getSystemName(),
    rn_os: Platform.OS as any,
  };
}
