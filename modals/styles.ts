import { borderColor, fontColor, secondaryFontColor } from '../constants/styles';

import { StyleSheet } from 'react-native';

const containerTopBorderRadius = {
  borderTopStartRadius: 16,
  borderTopEndRadius: 16,
};

export default StyleSheet.create({
  safeArea: {
    height: 445,
    flex: 1,
    ...containerTopBorderRadius,
  },

  containerTopBorderRadius: containerTopBorderRadius,

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
    color: `${borderColor}99`,
  },

  modalTitleContainer: {
    paddingBottom: 5,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: '500',
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
    overflow: 'hidden',
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

  gasSpeedItem: {
    flexDirection: 'row',
    padding: 8,
    paddingHorizontal: 10,
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

  horizontalTokenList: {
    marginVertical: -4.5,
  },
});
