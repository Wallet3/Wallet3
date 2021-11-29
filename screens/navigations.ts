import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type LandScreenStack = {
  Welcome: undefined;
  ImportWallet: undefined;
  CreateWallet: undefined;
  Backup: undefined;
  SetupPasscode: undefined;
  Home: undefined;
  QRScan: undefined;
  Root: undefined;
};

export type RootStack = {
  Root: undefined;
  Tokens: undefined;
};

export type RootNavigationProps = NativeStackNavigationProp<RootStack>;
