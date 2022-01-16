import { Feather, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { borderColor, fontColor } from '../constants/styles';

import FaceID from '../assets/icons/app/FaceID.svg';
import React from 'react';

export type NumpadChar = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0' | '.' | 'del' | 'clear';

interface Props {
  onPress: (value: NumpadChar) => void;
  disableDot?: boolean;
  onBioAuth?: () => void;
  bioType?: 'fingerprint' | 'faceid';
}

export default ({ onPress, onBioAuth, disableDot, bioType }: Props) => {
  return (
    <View style={viewStyles.numpadContainer}>
      <TouchableHighlight
        style={{ ...viewStyles.keyboard, borderTopLeftRadius: 9.75 }}
        underlayColor={borderColor}
        onPress={(_) => onPress('1')}
      >
        <Text style={viewStyles.num}>1</Text>
      </TouchableHighlight>

      <TouchableHighlight style={viewStyles.keyboard} underlayColor={borderColor} onPress={(_) => onPress('2')}>
        <Text style={viewStyles.num}>2</Text>
      </TouchableHighlight>

      <TouchableHighlight
        style={{ ...viewStyles.keyboard, borderRightWidth: 0, borderTopRightRadius: 9.75 }}
        underlayColor={borderColor}
        onPress={(_) => onPress('3')}
      >
        <Text style={viewStyles.num}>3</Text>
      </TouchableHighlight>

      <TouchableHighlight style={viewStyles.keyboard} underlayColor={borderColor} onPress={(_) => onPress('4')}>
        <Text style={viewStyles.num}>4</Text>
      </TouchableHighlight>

      <TouchableHighlight style={viewStyles.keyboard} underlayColor={borderColor} onPress={(_) => onPress('5')}>
        <Text style={viewStyles.num}>5</Text>
      </TouchableHighlight>

      <TouchableHighlight
        style={{ ...viewStyles.keyboard, borderRightWidth: 0 }}
        underlayColor={borderColor}
        onPress={(_) => onPress('6')}
      >
        <Text style={viewStyles.num}>6</Text>
      </TouchableHighlight>

      <TouchableHighlight style={viewStyles.keyboard} underlayColor={borderColor} onPress={(_) => onPress('7')}>
        <Text style={viewStyles.num}>7</Text>
      </TouchableHighlight>

      <TouchableHighlight style={viewStyles.keyboard} underlayColor={borderColor} onPress={(_) => onPress('8')}>
        <Text style={viewStyles.num}>8</Text>
      </TouchableHighlight>

      <TouchableHighlight
        style={{ ...viewStyles.keyboard, borderRightWidth: 0 }}
        underlayColor={borderColor}
        onPress={(_) => onPress('9')}
      >
        <Text style={viewStyles.num}>9</Text>
      </TouchableHighlight>

      {bioType ? (
        <TouchableHighlight
          style={{ ...viewStyles.keyboard, borderBottomWidth: 0, borderBottomLeftRadius: 9.75 }}
          underlayColor={borderColor}
          onPress={(_) => onBioAuth?.()}
        >
          {bioType === 'fingerprint' ? (
            <MaterialIcons name="fingerprint" size={19} />
          ) : bioType === 'faceid' ? (
            <FaceID width={17} height={17} />
          ) : (
            <View />
          )}
        </TouchableHighlight>
      ) : (
        <TouchableHighlight
          style={{ ...viewStyles.keyboard, borderBottomWidth: 0, borderBottomLeftRadius: 9.75 }}
          underlayColor={borderColor}
          onPress={(_) => onPress('.')}
          disabled={disableDot}
        >
          {disableDot ? <View /> : <Text style={viewStyles.num}>.</Text>}
        </TouchableHighlight>
      )}

      <TouchableHighlight
        style={{ ...viewStyles.keyboard, borderBottomWidth: 0 }}
        underlayColor={borderColor}
        onPress={(_) => onPress('0')}
      >
        <Text style={viewStyles.num}>0</Text>
      </TouchableHighlight>

      <TouchableHighlight
        style={{ ...viewStyles.keyboard, borderBottomWidth: 0, borderRightWidth: 0, borderBottomRightRadius: 10 }}
        underlayColor={borderColor}
        onPress={(_) => onPress('del')}
        onLongPress={(_) => onPress('clear')}
      >
        <Feather name="delete" size={20} color={fontColor} />
      </TouchableHighlight>
    </View>
  );
};

const viewStyles = StyleSheet.create({
  numpadContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    borderColor,
    borderWidth: 1,
    overflow: 'hidden',
    flexWrap: 'wrap',
  },

  keyboard: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '33.3%',
    height: '25%',
    minHeight: 49,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor,
  },

  num: {
    fontSize: 20,
    color: fontColor,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export const DefaultNumpadHandler = (
  value: NumpadChar,
  state: string,
  setStateAction: React.Dispatch<React.SetStateAction<string>>
) => {
  if (value === 'del') {
    setStateAction(state.slice(0, -1));
    return;
  }

  if (value === 'clear') {
    setStateAction('');
    return;
  }

  if (state.length >= 6) return;

  setStateAction((pre) => pre + value);
};
