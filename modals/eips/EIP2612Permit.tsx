import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BigNumber, constants, utils } from 'ethers';
import { Coin, Skeleton } from '../../components';
import React, { useEffect, useState } from 'react';

import AddressRiskIndicator from '../components/AddressRiskIndicator';
import { EIP2612 } from '../../eips/eip2612';
import { ERC20Token } from '../../models/ERC20';
import Image from 'react-native-fast-image';
import { Ionicons } from '@expo/vector-icons';
import Networks from '../../viewmodels/core/Networks';
import { PageMetadata } from '../../screens/browser/Web3View';
import Theme from '../../viewmodels/settings/Theme';
import { formatAddress } from '../../utils/formatter';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { openBrowserAsync } from 'expo-web-browser';
import styles from '../styles';
import { warningColor } from '../../constants/styles';

interface Props {
  eip2612: EIP2612;
  metadata?: PageMetadata;
  onDangerous?: () => void;
}

export default ({ eip2612, metadata, onDangerous }: Props) => {
  const { textColor, borderColor, secondaryTextColor, tintColor, foregroundColor } = Theme;
  const { t } = i18n;
  const [network] = useState(Networks.find(eip2612.domain.chainId)!);
  const [isUint256Max] = useState(BigNumber.from(eip2612.message.value).eq(constants.MaxUint256));
  const [decimals, setDecimals] = useState(-1);
  const [symbol, setSymbol] = useState('');
  const [dangerous, setDangerous] = useState(false);

  const reviewItemStyle = { ...styles.reviewItem, borderColor };
  const reviewItemsContainer = { ...styles.reviewItemsContainer, borderColor };
  const reviewItemValueStyle = { ...styles.reviewItemValue, color: textColor };

  useEffect(() => {
    const erc20 = new ERC20Token({
      contract: eip2612.domain.verifyingContract,
      chainId: network.chainId,
      owner: constants.AddressZero,
    });

    Promise.all([erc20.getSymbol(), erc20.getDecimals()])
      .then(([symbol, decimals]) => {
        setSymbol(symbol);
        setDecimals(decimals);
      })
      .catch();
  }, []);

  return (
    <View style={{ ...reviewItemsContainer }}>
      <View style={reviewItemStyle}>
        <Text style={styles.reviewItemTitle}>DApp</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={{ uri: metadata?.icon }} style={{ width: 19, height: 19, marginEnd: 5, borderRadius: 3 }} />
          <Text style={{ ...reviewItemValueStyle, maxWidth: 180 }} numberOfLines={1}>
            {metadata?.title || metadata?.name}
          </Text>
        </View>
      </View>

      <View style={reviewItemStyle}>
        <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-type')}</Text>
        <Text style={reviewItemValueStyle} numberOfLines={1}>
          {t('tx-type-approve')}
        </Text>
      </View>

      <View style={{ ...reviewItemStyle }}>
        <Text style={styles.reviewItemTitle}>{t('modal-dapp-request-max-approve')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isUint256Max && <Ionicons name="warning" color="crimson" size={15} style={{ marginEnd: 4 }} />}

          {decimals < 0 ? (
            <Skeleton style={{ width: 52, height: 17, marginStart: 4 }} />
          ) : (
            <TextInput
              numberOfLines={1}
              editable={false}
              defaultValue={isUint256Max ? 'Unlimited' : utils.formatUnits(eip2612.message.value, decimals)}
              keyboardType="decimal-pad"
              selectTextOnFocus
              textAlign="right"
              style={{
                ...reviewItemValueStyle,
                maxWidth: 120,
                color: isUint256Max ? 'crimson' : textColor,
                marginEnd: 8,
                minWidth: 52,
              }}
            />
          )}

          <Coin
            symbol={symbol}
            size={20}
            address={eip2612.domain.verifyingContract}
            chainId={Number(eip2612.domain.chainId)}
          />

          <Text style={{ ...reviewItemValueStyle, marginStart: 4, maxWidth: 64 }} numberOfLines={1}>
            {symbol || eip2612.domain.name}
          </Text>
        </View>
      </View>

      <View style={reviewItemStyle}>
        <Text style={styles.reviewItemTitle}>{t('modal-dapp-approve-to')}</Text>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}
          onPress={() => openBrowserAsync(`${network?.explorer}/address/${eip2612.message.spender}`)}
        >
          <Text style={{ ...reviewItemValueStyle, color: dangerous ? warningColor : textColor }} numberOfLines={1}>
            {formatAddress(eip2612.message.spender, 7, 5)}
          </Text>

          <Ionicons name="search-outline" size={15} color={dangerous ? warningColor : textColor} style={{ marginStart: 6 }} />

          <AddressRiskIndicator
            chainId={network.chainId}
            address={eip2612.message.spender}
            containerStyle={{ position: 'absolute', bottom: -11.5, right: 0 }}
            onDangerous={() => {
              setDangerous(true);
              onDangerous?.();
            }}
          />
        </TouchableOpacity>
      </View>

      <View style={{ ...reviewItemStyle, borderBottomWidth: 0 }}>
        <Text style={styles.reviewItemTitle}>{t('modal-review-network')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {generateNetworkIcon({ ...network, width: 15, style: { marginEnd: 6 } })}

          <Text style={{ ...reviewItemValueStyle, color: network?.color }} numberOfLines={1}>
            {network?.network?.split(' ')?.[0]}
          </Text>

          {decimals < 0 ? <ActivityIndicator size="small" style={{ marginStart: 5 }} /> : undefined}
        </View>
      </View>
    </View>
  );
};
