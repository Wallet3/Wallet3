import { borderColor, secondaryFontColor } from '../constants/styles';

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safeArea: {
    height: 439,
    flex: 1,
  },

  container: {
    padding: 16,
    height: 420,
  },

  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },

  navTitle: {
    fontSize: 22,
    fontWeight: '500',
    paddingEnd: 4,
    color: borderColor,
  },

  navMoreButton: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: borderColor,
    padding: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
  },
});
