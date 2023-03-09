import { StyleSheet } from 'react-native';
import { thirdFontColor } from '../../../constants/styles';

export default StyleSheet.create({
  illustrationContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 36,
  },

  txt: {
    fontSize: 15,
    marginBottom: 8,
    marginHorizontal: 12,
    color: thirdFontColor,
    textAlign: 'center',
  },
});
