import * as Animatable from 'react-native-animatable';

import React, { useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import BackButton from '../components/BackButton';
import IPhone from '../../assets/icons/app/IPhone.svg';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import { observer } from 'mobx-react-lite';
import { secondaryFontColor } from '../../constants/styles';
import styles from '../styles';

interface SubViewProps {
  onBack?: () => void;
  onQRPress?: () => void;
}

const NFCView = observer((props: SubViewProps) => {
  const phone1TranslateAnimation = {
    0: {
      opacity: 0,
      transform: [{ rotateZ: '180deg' }, { translateY: 90 }],
    },
    0.15: {
      opacity: 1,
      transform: [{ rotateZ: '180deg' }, { translateY: 30 }],
    },
    1: {
      transform: [{ rotateZ: '180deg' }, { translateY: 30 }],
    },
  };

  const phone2TranslateAnimation = {
    0: {
      opacity: 0,
      transform: [{ translateY: 90 }],
    },
    0.15: {
      opacity: 1,
      transform: [{ translateY: 30 }],
    },
    1: {
      transform: [{ translateY: 30 }],
    },
  };

  const waveAnimation = {
    0: {
      opacity: 0.2,
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
    },
    0.7: {
      opacity: 1,
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 2,
    },
    1: {
      opacity: 0,
      width: 300,
      height: 300,
      borderRadius: 150,
      borderWidth: 2,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <BackButton onPress={props.onBack} />

        <TouchableOpacity style={styles.navMoreButton} onPress={props.onQRPress}>
          <Ionicons name="qr-code-outline" size={17} color={secondaryFontColor} />
          <Text style={{ fontSize: 19, marginStart: 8, color: secondaryFontColor, fontWeight: '500' }}>QRCode</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <View style={{ flexDirection: 'row', alignSelf: 'center', justifyContent: 'center' }}>
            <Animatable.View
              animation={phone1TranslateAnimation}
              easing="ease-out-cubic"
              duration={12 * 1000}
              style={{
                marginEnd: 2,
                position: 'relative',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2,
              }}
            >
              <IPhone width={82} style={{ opacity: 1, zIndex: 5 }} />
              <Animatable.View
                iterationCount={'infinite'}
                animation={waveAnimation}
                duration={2.5 * 1000}
                style={{
                  borderColor: 'aliceblue',
                  position: 'absolute',
                }}
              />
            </Animatable.View>

            <Animatable.View
              animation={phone2TranslateAnimation}
              easing="ease-out-cubic"
              duration={12 * 1000}
              style={{ marginStart: 2, position: 'relative', justifyContent: 'center', alignItems: 'center' }}
            >
              <Animatable.View
                iterationCount={'infinite'}
                animation={waveAnimation}
                duration={3 * 1000}
                delay={1 * 1000}
                style={{
                  borderColor: 'aliceblue',
                  position: 'absolute',
                }}
              />
              <IPhone width={82} />
            </Animatable.View>
          </View>
        </View>

        <Animatable.Text style={{ color: secondaryFontColor, fontSize: 17, textAlign: 'center', marginTop: 16 }}>
          Put phones nearby
        </Animatable.Text>
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
