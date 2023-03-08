import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

const App = `Wallet3/${DeviceInfo.getVersion() || '0.0.0'}`;
const AndroidUA = `Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.5563.57 Mobile Safari/537.36 ${App}`;

const iOSTabletUA = `Mozilla/5.0 (iPad; CPU OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1 ${App}`;
const iOSPhoneUA = `Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1 ${App}`;

export const UA = isIOS ? (DeviceInfo.isTablet() ? iOSTabletUA : iOSPhoneUA) : AndroidUA;
