import { Button, SafeViewContainer } from '../../components';
import { Text, View } from 'react-native';

import { BigNumber } from 'ethers';
import { DecodedFunc } from '../../viewmodels/hubs/EtherscanHub';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import Theme from '../../viewmodels/settings/Theme';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface Props {
  onBack?: () => void;
  decodedFunc?: DecodedFunc;
  themeColor?: string;
}

export default observer(({ onBack, decodedFunc, themeColor }: Props) => {
  const { borderColor, thirdTextColor } = Theme;

  const txtStyle = { color: thirdTextColor };
  const tableHeaderTxtStyle: any = { ...txtStyle, fontSize: 12, fontWeight: '600' };

  return (
    <SafeViewContainer>
      <View
        style={{
          ...styles.modalTitleContainer,
          justifyContent: 'flex-start',
          borderBottomWidth: 0,
          borderBottomColor: borderColor,
        }}
      >
        <Ionicons name="code-slash-outline" size={20} color={themeColor} />
        <Text style={{ ...styles.modalTitle, color: themeColor, marginStart: 8 }}>Decoded Function Call</Text>
      </View>

      <ScrollView
        style={{ flex: 1, borderWidth: 1, borderColor, borderRadius: 10, marginBottom: 12 }}
        bounces={false}
        contentContainerStyle={{ padding: 10, paddingVertical: 8 }}
      >
        <Text style={txtStyle}>{`Function:`}</Text>
        <Text style={{ ...txtStyle, marginTop: 2 }}>{`${decodedFunc?.fullFunc}`}</Text>
        <Text style={{ ...txtStyle, marginTop: 20 }}>{`Method ID:`}</Text>
        <Text style={{ ...txtStyle, marginTop: 2, marginBottom: 20 }}>{`${decodedFunc?.methodID}`}</Text>

        <Text style={{ ...txtStyle, marginBottom: 4 }}>Decoded Input Data:</Text>
        <View style={{ flexDirection: 'row', marginBottom: 2 }}>
          <Text style={{ ...tableHeaderTxtStyle, width: 24 }}>#</Text>
          <Text style={{ ...tableHeaderTxtStyle, width: 72 }}>Name</Text>
          <Text style={{ ...tableHeaderTxtStyle, width: 72 }}>Type</Text>
          <Text style={{ ...tableHeaderTxtStyle, flex: 1 }}>Value</Text>
        </View>

        {decodedFunc?.inputs.map((input, index) => {
          const param = decodedFunc?.params[index];

          return (
            <View
              key={`${index}_${input.name}`}
              style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cccccc25', paddingVertical: 4 }}
            >
              <Text style={{ ...txtStyle, width: 24 }}>{index}</Text>
              <Text style={{ ...txtStyle, width: 72 }} numberOfLines={1}>
                {input.name}
              </Text>
              <Text style={{ ...txtStyle, width: 72 }} numberOfLines={1}>
                {input.type}
              </Text>
              <Text style={{ ...txtStyle, flex: 1 }} numberOfLines={1}>
                {param?.toString?.()}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <Button title="OK" txtStyle={{ textTransform: 'none' }} themeColor={themeColor} onPress={onBack} />
    </SafeViewContainer>
  );
});
