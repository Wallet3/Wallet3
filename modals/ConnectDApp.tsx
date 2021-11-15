import Loading from './views/Loading';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';
import { SafeViewContainer } from '../components';
import styles from './styles';

export default () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <Loading />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
