import { LayoutAnimation, LayoutAnimationConfig } from 'react-native';

const LayoutAnimConfig: LayoutAnimationConfig = {
  duration: 300,
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
};

const SpringLayoutAnimConfig: LayoutAnimationConfig = {
  duration: 300,
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.65,
  },
};

export function startLayoutAnimation() {
  LayoutAnimation.configureNext(LayoutAnimConfig);
}

export function startSpringLayoutAnimation() {
  LayoutAnimation.configureNext(SpringLayoutAnimConfig);
}

export const BreathAnimation = {
  0: { opacity: 1 },
  0.5: { opacity: 0.25 },
  1: { opacity: 1 },
};
