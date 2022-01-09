import { borderColor, fontColor, secondaryFontColor } from '../constants/styles';

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safeArea: {
    height: 439,
    flex: 1,
  },

  container: {
    padding: 16,
    flex: 1,
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

  reviewItemsContainer: {
    borderWidth: 1,
    borderColor,
    borderRadius: 10,
    marginTop: 10,
  },

  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },

  reviewItemTitle: {
    fontSize: 17,
    color: secondaryFontColor,
    fontWeight: '500',
  },

  reviewItemValue: {
    fontSize: 17,
    color: fontColor,
    fontWeight: '500',
  },

  gasItem: {
    flexDirection: 'row',
    padding: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gasGweiLabel: {
    fontSize: 8,
    color: secondaryFontColor,
    textAlign: 'right',
  },

  gasItemText: {
    marginStart: 6,
  },
});
