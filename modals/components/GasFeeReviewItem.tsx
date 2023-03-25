import { Text, TouchableOpacity, View } from 'react-native';

import AnimatedNumber from '../../components/AnimatedNumber';
import { BaseTransaction } from '../../viewmodels/transferring/BaseTransaction';
import Currency from '../../viewmodels/settings/Currency';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import Theme from '../../viewmodels/settings/Theme';
import { observer } from 'mobx-react-lite';
import styles from '../styles';
import { t } from 'i18n-js';

interface Props {
  vm: BaseTransaction;
  onGasPress?: () => void;
}

export default observer(({ vm, onGasPress }: Props) => {
  const { secondaryTextColor } = Theme;

  return (
    <View
      style={{
        ...styles.reviewItemsContainer,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingStart: 16,
      }}
    >
      <Text style={styles.reviewItemTitle}>{t('modal-review-fee')}</Text>

      <TouchableOpacity
        onPress={onGasPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          paddingVertical: 12,
          paddingEnd: 14,
          justifyContent: 'flex-end',
          width: '75%',
        }}
      >
        {!vm.feeToken?.isStable && (
          <Text style={{ ...styles.reviewItemTitle, fontSize: 15 }}>
            {`(${Currency.tokenToUSD(vm.estimatedRealFee, vm.feeTokenSymbol).toFixed(2)} USD)`}
          </Text>
        )}

        <AnimatedNumber
          style={{ ...styles.reviewItemValue, marginStart: 2, marginEnd: 5 }}
          numberOfLines={1}
          value={vm.txFee}
          formatter={(val) => val.toFixed(5)}
        />

        <Text style={styles.reviewItemValue}>{vm.feeTokenSymbol}</Text>

        <MaterialIcons
          name="keyboard-arrow-right"
          size={15}
          color={secondaryTextColor}
          style={{ marginStart: 4, marginBottom: -1 }}
        />
      </TouchableOpacity>
    </View>
  );
});
