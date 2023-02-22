import { Button, SafeViewContainer } from '../../components';
import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';

export default observer(({ onDone }: { onDone: () => void }) => {
  const color = 'crimson';
  const { t } = i18n;
  const navigation = useNavigation<any>();
  const { backgroundColor } = Theme;

  const goToBackup = () => {
    navigation.navigate('Backup');
  };

  return (
    <SafeViewContainer style={{ padding: 16, flex: 1 }}>
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Ionicons name="warning" size={100} color={color} />
        <Text style={{ color }}>{t('tip-backup-secret-key')}</Text>
      </View>

      <Button
        themeColor={color}
        title={t('land-create-backup-now')}
        style={{ marginBottom: 12 }}
        txtStyle={{ textTransform: 'none' }}
        onPress={() => {
          onDone();
          goToBackup();
        }}
      />

      <Button
        themeColor={color}
        reverse
        onPress={onDone}
        title={t('land-create-backup-later')}
        txtStyle={{ textTransform: 'none' }}
      />
    </SafeViewContainer>
  );
});
