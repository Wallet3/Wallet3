import Contacts, { IContact } from '../../viewmodels/customs/Contacts';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';

import Avatar from '../../components/Avatar';
import { FontAwesome } from '@expo/vector-icons';
import Theme from '../../viewmodels/settings/Theme';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';

export default observer(() => {
  const { textColor, secondaryTextColor } = Theme;
  const { t } = i18n;
  const [selectedContact, setSelectedContact] = useState<IContact>();

  const renderItem = ({ item }: { item: IContact }) => {
    return (
      <View
        key={item.address}
        style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}
      >
        <TouchableOpacity
          style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
          onPress={() => {
            setSelectedContact(item);
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
        keyExtractor={(i) => i.address}
      />
    </View>
  );
});
