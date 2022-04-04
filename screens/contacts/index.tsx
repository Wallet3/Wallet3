import Contacts, { IContact } from '../../viewmodels/customs/Contacts';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';

import Avatar from '../../components/Avatar';
import ContactDetails from './ContactDetails';
import { FontAwesome } from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';
import { Portal } from 'react-native-portalize';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeViewContainer } from '../../components';
import Theme from '../../viewmodels/settings/Theme';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { styles } from '../../constants/styles';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

export default observer(() => {
  const { textColor, secondaryTextColor } = Theme;
  const { t } = i18n;
  const [selectedContact, setSelectedContact] = useState<IContact>();
  const { ref: accountModal, open: openAccountModal, close: closeAccountModal } = useModalize();
  const [editing, setEditing] = useState(false);

  const renderItem = ({ item }: { item: IContact }) => {
    return (
      <View
        key={`${item.address}-${item.name}`}
        style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}
      >
        <TouchableOpacity
          style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
          onPress={() => {
            setSelectedContact(item);
            setTimeout(() => openAccountModal(), 5);
          }}
        >
          <View style={{ marginEnd: 12 }}>
            <FontAwesome
              name="user-circle-o"
              size={32}
              color={secondaryTextColor}
              style={{ opacity: 0.5, position: 'absolute' }}
            />
            <Avatar size={32} emoji={item.emoji?.icon} backgroundColor={item.emoji?.color} uri={item.avatar} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: textColor, fontSize: 17 }} numberOfLines={1}>
              {item.name || item.ens || formatAddress(item.address)}
            </Text>

            <Text style={{ color: secondaryTextColor, fontSize: 12 }} numberOfLines={1}>
              {item.name || item.ens ? formatAddress(item.address) : t('contacts-no-more-info')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ padding: 12, marginEnd: -12 }}
          onPress={() => {
            setSelectedContact(item);
          }}
        >
          <FontAwesome name="trash-o" size={19} color={textColor} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={Contacts.sorted}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 8 }}
        keyExtractor={(i) => `${i.address}-${i.name}`}
      />

      <Portal>
        <Modalize
          ref={accountModal}
          modalHeight={430}
          withHandle={!editing}
          closeOnOverlayTap={!editing}
          disableScrollIfPossible
          modalStyle={styles.modalStyle}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          <SafeAreaProvider>
            <ContactDetails
              contact={selectedContact}
              onEditing={setEditing}
              onSave={() => {
                closeAccountModal();
                Contacts.saveContact(selectedContact!);
              }}
            />
          </SafeAreaProvider>
        </Modalize>
      </Portal>
    </View>
  );
});
