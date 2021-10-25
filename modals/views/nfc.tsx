import React, { useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { fontColor, secondaryFontColor } from '../../constants/styles';

import BackButton from '../components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import { observer } from 'mobx-react-lite';
import styles from '../styles';

interface SubViewProps {
  onBack?: () => void;

  onQRPress?: () => void;
}

const NFCView = observer((props: SubViewProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <BackButton onPress={props.onBack} />

        <TouchableOpacity style={styles.navMoreButton} onPress={props.onQRPress}>
          <Ionicons name="qr-code-outline" size={17} color={secondaryFontColor} />
          <Text style={{ fontSize: 19, marginStart: 8, color: secondaryFontColor, fontWeight: '500' }}>QRCode</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: fontColor, fontSize: 17 }}>Put phones nearby</Text>
      </View>
    </View>
  );
});

const QRView = observer((props: SubViewProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <BackButton onPress={props.onBack} />
      </View>
    </View>
  );
});

interface Props {
  onBack?: () => void;
}

export default observer((props: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper ref={swiper} scrollEnabled={false} showsButtons={false} showsPagination={false} loop={false}>
      <NFCView onBack={props.onBack} onQRPress={() => swiper.current?.scrollTo(1)} />
      <QRView onBack={() => swiper.current?.scrollTo(0)} />
    </Swiper>
  );
});
