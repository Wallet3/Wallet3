import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import { FlatList, ListRenderItemInfo, NativeSyntheticEvent, Text, TouchableOpacity, View } from 'react-native';
import { NetworkIcons, generateNetworkIcon } from '../assets/icons/networks/color';
import { SafeViewContainer, Separator } from '../components';
import { useEffect, useRef, useState } from 'react';

import { Feather } from '@expo/vector-icons';
import { INetwork } from '../common/Networks';
import NetworkDetails from './views/NetworkDetails';
import Networks from '../viewmodels/Networks';
import React from 'react';
import { ReactiveScreen } from '../utils/device';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import Theme from '../viewmodels/settings/Theme';
import i18n from '../i18n';
import { observer } from 'mobx-react-lite';
import { startLayoutAnimation } from '../utils/animations';
import styles from './styles';

interface Props {
  onNetworkPress?: (network: INetwork) => void;
  networks?: INetwork[];
  selectedNetwork?: INetwork | null;
  title?: string;
  useContextMenu?: boolean;
  onEditing?: (editing: boolean) => void;
}

export default observer(({ title, onNetworkPress, selectedNetwork, useContextMenu, onEditing }: Props) => {
  const { t } = i18n;
  const { backgroundColor, secondaryTextColor, borderColor } = Theme;
  const [nets, setNets] = useState<INetwork[]>();
  const [editNetwork, setEditNetwork] = useState<INetwork>();
  const swiper = useRef<Swiper>(null);
  const flatList = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setTimeout(() => setNets(Networks.all), 25);
    const reset = () => {
      swiper.current?.scrollTo(0);
      onEditing?.(false);
    };

    ReactiveScreen.on('change', reset);

    return () => {
      clearTimeout(timer);
      ReactiveScreen.off('change', reset);
    };
  }, []);

  const renderItem = ({ item }: ListRenderItemInfo<INetwork>) => {
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 16 }}
        onPress={() => onNetworkPress?.(item)}
      >
        <Feather
          name="check"
          color={item.color}
          size={15}
          style={{ opacity: (selectedNetwork ?? Networks.current)?.network === item.network ? 1 : 0 }}
        />

        <View style={{ width: 32, alignItems: 'center', justifyContent: 'center', marginStart: 8 }}>
          {NetworkIcons[item.chainId] ??
            generateNetworkIcon({
              chainId: item.chainId,
              color: item.color,
              width: 32,
              height: 30,
              symbol: item.symbol,
              hideEVMTitle: true,
            })}
        </View>

        <Text style={{ fontSize: 16, marginStart: 12, fontWeight: '500', color: item.color, maxWidth: 300 }} numberOfLines={1}>
          {item.network}
        </Text>

        <View style={{ flex: 1 }} />

        {item.l2 ? (
          <View style={{ borderRadius: 5, backgroundColor: 'deepskyblue', padding: 2, paddingHorizontal: 6 }}>
            <Text style={{ fontSize: 12, color: 'white', fontWeight: '500' }}>L2</Text>
          </View>
        ) : undefined}
      </TouchableOpacity>
    );
  };

  const renderContextMenuItem = (props: ListRenderItemInfo<INetwork>) => {
    const { item } = props;
    const editableActions = [
      { title: t('button-edit'), systemIcon: 'square.and.pencil' },
      { title: t('button-remove'), destructive: true, systemIcon: 'trash.slash' },
    ];

    const viewActions = [{ title: `${t('button-edit')} RPC URLs`, systemIcon: 'square.and.pencil' }];

    const onActionPress = (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
      const { index } = e.nativeEvent;
      switch (index) {
        case 0:
          setEditNetwork(item);
          setTimeout(() => swiper.current?.scrollTo(1), 25);
          onEditing?.(true);
          break;
        case 1:
          startLayoutAnimation();
          Networks.remove(item.chainId).then(() => setNets(Networks.all));
          break;
      }
    };

    return (
      <ContextMenu
        onPress={onActionPress}
        actions={item.isUserAdded ? editableActions : viewActions}
        previewBackgroundColor={backgroundColor}
      >
        {renderItem(props)}
      </ContextMenu>
    );
  };

  const onSaveNetwork = (network: INetwork) => {
    swiper.current?.scrollTo(0);
    Networks.update(network);
    onEditing?.(false);
  };

  return (
    <SafeAreaProvider style={{ ...styles.safeArea, backgroundColor }}>
      <Swiper ref={swiper} showsPagination={false} showsButtons={false} loop={false} scrollEnabled={false}>
        <SafeViewContainer style={{ padding: 16 }}>
          <Text style={{ color: secondaryTextColor }} numberOfLines={1}>
            {title ?? t('modal-networks-switch')}
          </Text>
          <Separator style={{ marginVertical: 4, backgroundColor: borderColor }} />
          <FlatList
            ref={flatList}
            keyExtractor={(i) => `${i.chainId}`}
            data={nets}
            renderItem={useContextMenu ? renderContextMenuItem : renderItem}
            contentContainerStyle={{ paddingBottom: 36 }}
            style={{ marginHorizontal: -16, marginTop: -4, marginBottom: -36 }}
            onScrollToIndexFailed={({}) => {}}
          />
        </SafeViewContainer>

        <NetworkDetails network={editNetwork} onDone={onSaveNetwork} />
      </Swiper>
    </SafeAreaProvider>
  );
});
