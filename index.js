import './shim';
import 'react-native-gesture-handler';
import './configs/polyfill';
import './configs/debug';

import App from './App';
import { Asset } from 'expo';
import { registerRootComponent } from 'expo';
Asset;


// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
