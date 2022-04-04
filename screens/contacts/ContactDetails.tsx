import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
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
      <SafeViewContainer style={{ padding: 16, height: 430 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
          <View>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 27,
                color: thirdTextColor,
                textShadowColor: tintColor,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 1.5,
              }}
            >
              {contact?.name || contact?.ens || formatAddress(contact?.address || '', 7, 5)}
            </Text>

            <Text style={{ fontSize: 12.5, color: secondaryTextColor }} numberOfLines={1}>
              {contact?.name || contact?.ens ? formatAddress(contact?.address) : ''}
            </Text>
          </View>

          <View>
            <FontAwesome
              name="user-circle-o"
              size={48}
              color={secondaryTextColor}
              style={{ opacity: 0.5, position: 'absolute' }}
            />
            <Avatar size={48} emoji={contact?.emoji?.icon} backgroundColor={contact?.emoji?.color} uri={contact?.avatar} />
          </View>
        </View>

        <View style={styles.itemContainer}>
          <View style={styles.itemTitleContainer}>
            <Ionicons name="people-outline" size={21} color={secondaryTextColor} />
            <Text style={titleStyle}>Name</Text>
          </View>

          <TextInput
            style={textInputStyle}
            numberOfLines={1}
            defaultValue={contact?.name || contact?.ens}
            placeholder="Tap to edit"
            placeholderTextColor="#dfdfdfc0"
            onFocus={() => onEditing?.(true)}
            onBlur={() => onEditing?.(false)}
            onChangeText={(text) => runInAction(() => (contact!.name = text))}
          />
        </View>

        <View style={styles.itemContainer}>
          <View style={styles.itemTitleContainer}>
            <Ionicons name="call-outline" size={21} color={secondaryTextColor} />
            <Text style={titleStyle}>Telephone</Text>
          </View>

          <TextInput
            style={textInputStyle}
            numberOfLines={1}
            defaultValue={contact?.more?.tel}
            placeholder="Tap to edit"
            placeholderTextColor="#dfdfdfc0"
            onFocus={() => onEditing?.(true)}
            onBlur={() => onEditing?.(false)}
            onChangeText={(text) => runInAction(() => (contact!.more!.tel = text))}
          />
        </View>

        <View style={styles.itemContainer}>
          <View style={styles.itemTitleContainer}>
            <Ionicons
              name="at-outline"
              size={21}
              color={secondaryTextColor}
              placeholder="Tap to edit"
              placeholderTextColor="#dfdfdfc0"
            />
            <Text style={titleStyle}>Mail</Text>
          </View>

          <TextInput
            style={textInputStyle}
            numberOfLines={1}
            defaultValue={contact?.more?.email}
            placeholder="Tap to edit"
            placeholderTextColor="#dfdfdfc0"
            onFocus={() => onEditing?.(true)}
            onBlur={() => onEditing?.(false)}
            onChangeText={(text) => runInAction(() => (contact!.more!.email = text))}
          />
        </View>

        <View style={styles.itemContainer}>
          <View style={styles.itemTitleContainer}>
            <Ionicons name="document-text-outline" size={21} color={secondaryTextColor} />
            <Text style={titleStyle}>Note</Text>
          </View>

          <TextInput
            style={textInputStyle}
            numberOfLines={1}
            defaultValue={contact?.more?.note}
            placeholder="Tap to edit"
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
