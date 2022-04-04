import { AntDesign, EvilIcons, FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Button, SafeViewContainer } from '../../components';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import Avatar from '../../components/Avatar';
import { IContact } from '../../viewmodels/customs/Contacts';
import React from 'react';
import Theme from '../../viewmodels/settings/Theme';
import { formatAddress } from '../../utils/formatter';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';

export default observer(
  ({ contact, onEditing, onSave }: { contact?: IContact; onEditing?: (focus: boolean) => void; onSave?: () => void }) => {
    const { thirdTextColor, tintColor, secondaryTextColor } = Theme;
    const { t } = i18n;
    const titleStyle = { ...styles.itemTitle, color: secondaryTextColor };
    const textInputStyle = { ...styles.textInput, color: secondaryTextColor };

    return (
      <SafeViewContainer style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <View>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 24,
                color: thirdTextColor,
                textShadowColor: tintColor,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 0.1,
              }}
            >
              {contact?.name || contact?.ens || formatAddress(contact?.address || '', 7, 5)}
            </Text>

            <Text style={{ fontSize: 12.5, color: secondaryTextColor }} numberOfLines={1}>
              {contact?.name || contact?.ens ? formatAddress(contact?.address) : ''}
            </Text>
          </View>

          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <EvilIcons
              name="user"
              size={55}
              color={secondaryTextColor}
              style={{ opacity: 0.5, position: 'absolute', marginStart: -10 }}
            />
            <Avatar size={42} emoji={contact?.emoji?.icon} backgroundColor={contact?.emoji?.color} uri={contact?.avatar} />
          </View>
        </View>

        <View style={styles.itemContainer}>
          <View style={styles.itemTitleContainer}>
            <Ionicons name="people-outline" size={21} color={secondaryTextColor} />
            <Text style={titleStyle}>{t('contacts-detail-name')}</Text>
          </View>

          <TextInput
            style={textInputStyle}
            numberOfLines={1}
            defaultValue={contact?.name || contact?.ens}
            placeholder={t('contacts-detail-tap-to-edit')}
            placeholderTextColor="#dfdfdfc0"
            onFocus={() => onEditing?.(true)}
            onBlur={() => onEditing?.(false)}
            onChangeText={(text) => runInAction(() => (contact!.name = text))}
          />
        </View>

        <View style={styles.itemContainer}>
          <View style={styles.itemTitleContainer}>
            <Ionicons name="call-outline" size={21} color={secondaryTextColor} />
            <Text style={titleStyle}>{t('contacts-detail-telephone')}</Text>
          </View>

          <TextInput
            style={textInputStyle}
            numberOfLines={1}
            defaultValue={contact?.more?.tel}
            placeholder={t('contacts-detail-tap-to-edit')}
            placeholderTextColor="#dfdfdfc0"
            onFocus={() => onEditing?.(true)}
            onBlur={() => onEditing?.(false)}
            onChangeText={(text) => runInAction(() => (contact!.more!.tel = text))}
          />
        </View>

        <View style={styles.itemContainer}>
          <View style={styles.itemTitleContainer}>
            <Ionicons name="at-outline" size={21} color={secondaryTextColor} placeholderTextColor="#dfdfdfc0" />
            <Text style={titleStyle}>{t('contacts-detail-email')}</Text>
          </View>

          <TextInput
            style={textInputStyle}
            numberOfLines={1}
            defaultValue={contact?.more?.email}
            placeholder={t('contacts-detail-tap-to-edit')}
            placeholderTextColor="#dfdfdfc0"
            keyboardType="email-address"
            onFocus={() => onEditing?.(true)}
            onBlur={() => onEditing?.(false)}
            onChangeText={(text) => runInAction(() => (contact!.more!.email = text))}
          />
        </View>

        <View style={styles.itemContainer}>
          <View style={styles.itemTitleContainer}>
            <Ionicons name="document-text-outline" size={21} color={secondaryTextColor} />
            <Text style={titleStyle}>{t('contacts-detail-note')}</Text>
          </View>

          <TextInput
            style={textInputStyle}
            numberOfLines={1}
            defaultValue={contact?.more?.note}
            placeholder={t('contacts-detail-tap-to-edit')}
            placeholderTextColor="#dfdfdfc0"
            onFocus={() => onEditing?.(true)}
            onBlur={() => onEditing?.(false)}
            onChangeText={(text) => runInAction(() => (contact!.more!.note = text))}
          />
        </View>

        <View style={{ flex: 1 }} />

        <Button onPress={onSave} themeColor={tintColor} title={t('button-save')} />
      </SafeViewContainer>
    );
  }
);

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    // paddingBottom: 6,
    // borderBottomColor: '#dfdfdf70',
    // borderBottomWidth: 1,
  },

  itemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  itemTitle: {
    marginStart: 10,
    fontSize: 16,
    fontWeight: '500',
  },

  textInput: {
    fontSize: 17,
    minWidth: 150,
    textAlign: 'right',
  },
});
