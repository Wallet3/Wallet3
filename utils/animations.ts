import { LayoutAnimation, LayoutAnimationConfig } from 'react-native';

export const LayoutAnimConfig: LayoutAnimationConfig = {
  duration: 300,
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
};

export function startLayoutAnimation() {
  LayoutAnimation.configureNext(LayoutAnimConfig);
}
