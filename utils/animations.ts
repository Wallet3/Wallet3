import { LayoutAnimation } from 'react-native';

export const LayoutAnimConfig = {
  duration: 300,
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    duration: 300,
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity,
  },
};
