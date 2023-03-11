import ToggleSwitch, { ToggleSwitchProps } from 'toggle-switch-react-native';

import { Switch } from 'react-native';
import { isAndroid } from '../utils/platform';

export default (props: ToggleSwitchProps) => {
  return isAndroid ? (
    <ToggleSwitch {...props} />
  ) : (
    <Switch value={props.isOn} onValueChange={props.onToggle} trackColor={{ true: props.onColor }} />
  );
};
