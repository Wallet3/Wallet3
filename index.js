import './shim';
import '@ethersproject/shims';
import 'react-native-gesture-handler';
import './configs/polyfill';
import './configs/debug';

import App from './App';
import { initWaku } from './viewmodels/tss/Waku';
import { registerRootComponent } from 'expo';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

initWaku();
