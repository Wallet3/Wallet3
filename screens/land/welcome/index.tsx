import {} from 'react-native';

import { Text, View } from 'react-native-animatable';

import { Button } from '../../../components';
import React from 'react';
import { StyleSheet } from 'react-native';
import { themeColor } from '../../../constants/styles';
import { useFonts } from 'expo-font';

interface Props {
  onImportWallet?: () => void;
  onCreateWallet?: () => void;
}

export default (props: Props) => {
  const [loaded] = useFonts({
    Questrial: require('../../../assets/fonts/Questrial.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <View style={{ padding: 16, alignItems: 'center', flex: 1, paddingBottom: 0 }}>
      <View style={{ flex: 1 }} />
      <Text animation="fadeInUp" style={{ fontFamily: 'Questrial', fontWeight: '600', fontSize: 42, color: '#6186ff' }}>
        Wallet 3
      </Text>
      <View style={{ flex: 1 }} />

      <View style={{ width: '100%' }}>
        <View animation="fadeInUp" delay={300}>
          <Button
            title="Import a wallet"
            onPress={props.onImportWallet}
            style={styles.button}
            txtStyle={{ color: themeColor, textTransform: 'none' }}
          />
        </View>

        <View animation="fadeInUp" delay={500}>
          <Button title="Create a new wallet" onPress={props.onCreateWallet} txtStyle={{ textTransform: 'none' }} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: { backgroundColor: 'transparent', borderColor: themeColor, borderWidth: 1, marginBottom: 12 },
});
