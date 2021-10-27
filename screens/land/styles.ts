import { borderColor, secondaryFontColor, themeColor } from '../../constants/styles';

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
    paddingVertical: 8,
    marginBottom: 12,
  },

  navTitle: {
    fontSize: 17,
    fontWeight: '500',
    paddingEnd: 4,
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

  borderButton: { backgroundColor: 'transparent', borderColor: themeColor, borderWidth: 1, marginBottom: 12 },
});
