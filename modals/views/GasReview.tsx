import { Button, SafeViewContainer } from '../../components';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import AnimateNumber from 'react-native-animate-number';
import BackButton from '../components/BackButton';
import { BaseTransaction } from '../../viewmodels/BaseTransaction';
import Fire from '../../assets/icons/app/fire.svg';
import React from 'react';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface GasProps {
  onBack?: () => void;
  vm: BaseTransaction;
}

export default observer(({ onBack, vm }: GasProps) => {
  return (
    <SafeViewContainer style={styles.container}>
      <View style={styles.navBar}>
        <BackButton onPress={onBack} />

        <Text style={styles.navTitle}>Tx Fee</Text>
      </View>

      <View style={styles.reviewItemsContainer}>
        <View style={{ ...styles.reviewItem, paddingBottom: 12 }}>
          <Text style={styles.reviewItemTitle}>Gas Limit</Text>

          <TextInput
            keyboardType="number-pad"
            placeholder="21000"
            textAlign="right"
            style={{ ...styles.reviewItemValue, fontSize: 20 }}
            maxLength={12}
            value={`${vm.gasLimit}`}
            onChangeText={(txt) => vm.setGasLimit(txt)}
          />
        </View>

        <View style={{ ...styles.reviewItem, paddingBottom: 12 }}>
          <Text style={styles.reviewItemTitle}>Max Gas Price</Text>

          <View style={{ marginBottom: -8 }}>
            <TextInput
              keyboardType="decimal-pad"
              placeholder="20.00"
              textAlign="right"
              maxLength={12}
              style={{ ...styles.reviewItemValue, fontSize: 20 }}
              value={`${Number(vm.maxGasPrice.toFixed(5))}`}
              onChangeText={(txt) => vm.setMaxGasPrice(txt)}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              {vm.network.eip1559 ? <Fire width={8} height={8} style={{ marginEnd: 3 }} /> : undefined}
              {vm.network.eip1559 ? (
                <AnimateNumber
                  style={styles.gasGweiLabel}
                  value={vm.nextBlockBaseFee}
                  formatter={(val) => `${val.toFixed(6)} Gwei`}
                />
              ) : (
                <Text style={styles.gasGweiLabel}>Gwei</Text>
              )}
            </View>
          </View>
        </View>

        {vm.network.eip1559 ? (
          <View style={{ ...styles.reviewItem, paddingBottom: 12 }}>
            <Text style={styles.reviewItemTitle}>Priority Price</Text>

            <View style={{ marginBottom: -8 }}>
              <TextInput
                keyboardType="decimal-pad"
                placeholder="1.00"
                textAlign="right"
                maxLength={12}
                style={{ ...styles.reviewItemValue, fontSize: 20 }}
                value={`${vm.maxPriorityPrice.toFixed(6)}`}
                onChangeText={(txt) => vm.setPriorityPrice(txt)}
              />
              <Text style={{ ...styles.gasGweiLabel, marginTop: -2 }}>Gwei</Text>
            </View>
          </View>
        ) : undefined}

        <View style={{ ...styles.reviewItem, borderBottomWidth: 0, paddingBottom: 12 }}>
          <Text style={styles.reviewItemTitle}>Nonce</Text>

          <TextInput
            keyboardType="number-pad"
            placeholder="0"
            textAlign="right"
            style={{ ...styles.reviewItemValue, fontSize: 20 }}
            maxLength={12}
            value={`${vm.nonce}`}
            onChangeText={(txt) => vm.setNonce(txt)}
          />
        </View>
      </View>

      <View style={{ ...styles.reviewItemsContainer, flexDirection: 'row' }}>
        <TouchableOpacity style={styles.gasItem} onPress={() => vm.setGas('rapid')}>
          <Ionicons name="rocket" size={12} color="tomato" />
          <Text style={{ ...styles.gasItemText, color: 'tomato' }}>Rapid</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gasItem} onPress={() => vm.setGas('fast')}>
          <Ionicons name="car-sport" size={13} color="dodgerblue" />
          <Text style={{ ...styles.gasItemText, color: 'dodgerblue' }}>Fast</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gasItem} onPress={() => vm.setGas('standard')}>
          <FontAwesome5 name="walking" size={12} color="darkorchid" />
          <Text style={{ ...styles.gasItemText, color: 'darkorchid' }}>Standard</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}></View>

      <Button title="OK" txtStyle={{ textTransform: 'uppercase' }} onPress={onBack} themeColor={vm.network.color} />
    </SafeViewContainer>
  );
});
