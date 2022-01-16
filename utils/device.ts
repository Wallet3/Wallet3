import { Dimensions } from 'react-native';

export const isPortrait = () => {
  const dim = Dimensions.get('window');
  return dim.height >= dim.width;
};
