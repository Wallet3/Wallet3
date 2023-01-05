import './shim';
import '@ethersproject/shims';
import 'react-native-gesture-handler';
import './configs/polyfill';
import './configs/debug';

import App from './App';
import { fetchTag } from './viewmodels/services/EtherscanPublicTag';
import { registerRootComponent } from 'expo';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// fetchTag(1, '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45');
