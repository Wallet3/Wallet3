import { Animated, FlatList, Text, View } from 'react-native';
import { BottomTabScreenProps, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useCallback, useRef, useState } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { action, makeObservable, observable } from 'mobx';

import { Browser } from '.';
import { FlatGrid } from 'react-native-super-grid';
import { Ionicons } from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';
import { PageMetadata } from './Web3View';
import { Portal } from 'react-native-portalize';
import { SafeViewContainer } from '../../components';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ViewShot from 'react-native-view-shot';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';

class StateViewModel {
  tabBarHidden = false;
  pageState = new Map<number, PageMetadata | undefined>();
  tabCount = 1;

  constructor() {
    makeObservable(this, { tabCount: observable, setTabCount: action });
  }

  setTabCount(count: number) {
    this.tabCount = count;
  }
}

export default observer((props: BottomTabScreenProps<{}, never>) => {
  const { navigation } = props;
  const swiper = useRef<Swiper>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [counts, setCounts] = useState(1);
  const [state] = useState(new StateViewModel());
  const { backgroundColor } = Theme;

  const [tabBarHeight] = useState(useBottomTabBarHeight());
  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  const { ref: tabsRef, open: openTabs } = useModalize();

  const generateBrowserTab = (index: number, props: BottomTabScreenProps<{}, never>, onNewTab: () => void) => (
    <Browser
      {...props}
      tabIndex={index}
      onPageLoaded={(index, meta) => state.pageState.set(index, meta)}
      onNewTab={onNewTab}
      globalState={state}
      onOpenTabs={openTabs}
      onTakeOff={() => hideTabBar()}
      onHome={() => {
        showTabBar();
        state.pageState.set(index, undefined);
      }}
    />
  );

  const newTab = () => {
    const index = tabs.size;
    tabs.set(index, generateBrowserTab(index, props, newTab));
    state.pageState.set(index, undefined);

    setTimeout(() => {
      swiper.current?.scrollTo(tabs.size - 1, true);
      setTimeout(() => setActiveTabIndex(tabs.size - 1), 200); // Important!!!
    }, 0);

    setCounts(tabs.size);
    state.setTabCount(tabs.size);
  };

  const hideTabBar = () => {
    if (state.tabBarHidden) return;

    const { backgroundColor, systemBorderColor } = Theme;

    PubSub.publish('drawer-swipeEnabled', false);
    state.tabBarHidden = true;

    const translateY = new Animated.Value(0);
    Animated.spring(translateY, { toValue: tabBarHeight, useNativeDriver: true }).start();

    setTimeout(() => {
      navigation.setOptions({
        tabBarStyle: safeAreaBottom
          ? { height: 0, backgroundColor, borderTopColor: systemBorderColor }
          : { height: 0, backgroundColor, borderTopColor: systemBorderColor, borderTopWidth: 0 },
      });
    }, 100);

    navigation.setOptions({
      tabBarStyle: { transform: [{ translateY }], backgroundColor, borderTopColor: systemBorderColor },
    });
  };

  const showTabBar = () => {
    if (!state.tabBarHidden) return;

    const { backgroundColor, systemBorderColor } = Theme;

    PubSub.publish('drawer-swipeEnabled', true);
    state.tabBarHidden = false;

    const translateY = new Animated.Value(tabBarHeight);
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();

    navigation.setOptions({
      tabBarStyle: { transform: [{ translateY }], height: tabBarHeight, backgroundColor, borderTopColor: systemBorderColor },
    });
  };

  const [tabs] = useState(new Map<number, JSX.Element>([[0, generateBrowserTab(0, props, newTab)]]));

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <Swiper
        ref={swiper}
        showsPagination={false}
        showsButtons={false}
        horizontal
        loop={false}
        index={activeTabIndex}
        scrollEnabled
        onIndexChanged={(index) => (state.pageState.get(index) ? hideTabBar() : showTabBar())}
      >
        {Array.from(tabs.values())}
      </Swiper>

      <Portal>
        <Modalize
          ref={tabsRef}
          adjustToContentHeight
          disableScrollIfPossible
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
          modalStyle={{ padding: 0, margin: 0 }}
        >
          <View style={{ height: 400, backgroundColor, borderTopEndRadius: 6, borderTopStartRadius: 6 }}>
            <FlatGrid
              data={Array.from(state.pageState.keys())}
              keyExtractor={(i) => `Tab-${i}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 37 }}
              itemDimension={170}
              spacing={16}
              bounces={false}
              renderItem={({ item }) => {
                const meta = state.pageState.get(item);

                return (
                  <View style={{ width: 170, borderRadius: 10, height: 150, overflow: 'hidden' }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingStart: 10,
                        backgroundColor: meta?.themeColor || '#000',
                        borderTopEndRadius: 10,
                        borderTopStartRadius: 10,
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '500', fontSize: 12 }} numberOfLines={1}>
                        {meta?.title ?? 'Blank Page'}
                      </Text>

                      <TouchableOpacity style={{ paddingTop: 8, paddingBottom: 7, paddingHorizontal: 12, paddingStart: 16 }}>
                        <Ionicons name="ios-close" color="#fff" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity></TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        </Modalize>
      </Portal>
    </View>
  );
});
