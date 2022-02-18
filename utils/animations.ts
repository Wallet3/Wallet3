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

export const BreathAnimation = {
  0: { opacity: 1 },
  0.5: { opacity: 0.25 },
  1: { opacity: 1 },
};
