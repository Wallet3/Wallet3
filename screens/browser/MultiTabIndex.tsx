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
  pageMeta = new Map<number, PageMetadata | undefined>();
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

  const generateBrowserTab = (index: number, props: BottomTabScreenProps<{}, never>, onNewTab: () => void) => {
    return (
      <Browser
        {...props}
        key={`Browser-${index}`}
        tabIndex={index}
        onPageLoaded={(index, meta) => state.pageMeta.set(index, meta)}
        onNewTab={onNewTab}
        globalState={state}
        onOpenTabs={openTabs}
        onTakeOff={() => hideTabBar()}
        onHome={() => {
          showTabBar();
          state.pageMeta.set(index, undefined);
        }}
      />
    );
  };

  const newTab = () => {
    const index = tabs.size;
    tabs.set(index, generateBrowserTab(index, props, newTab));
    state.pageMeta.set(index, undefined);

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
        onIndexChanged={(index) => (state.pageMeta.get(index) ? hideTabBar() : showTabBar())}
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
          <View style={{ height: 430, backgroundColor, borderTopEndRadius: 6, borderTopStartRadius: 6 }}>
            <FlatGrid
              data={Array.from(state.pageMeta.keys())}
              keyExtractor={(i) => `Tab-${i}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 37 }}
              itemDimension={170}
              spacing={16}
              bounces={false}
              renderItem={({ item }) => {
                const meta = state.pageMeta.get(item);
                const themeColor = meta?.themeColor || '#000';

                return (
                  <TouchableOpacity style={{ width: 170, overflow: 'hidden' }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingStart: 10,
                        backgroundColor: themeColor,
                        borderColor: themeColor,
                        borderWidth: 1,
                        borderTopEndRadius: 10,
                        borderTopStartRadius: 10,
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '500', fontSize: 12 }} numberOfLines={1}>
                        {meta?.title ?? 'Blank Page'}
                      </Text>

                      <TouchableOpacity style={{ paddingTop: 6, paddingBottom: 5, paddingHorizontal: 12, paddingStart: 16 }}>
                        <Ionicons name="ios-close" color="#fff" />
                      </TouchableOpacity>
                    </View>

                    <View
                      style={{
                        borderWidth: 1,
                        height: 120,
                        marginTop: -1,
                        borderColor: themeColor,
                        borderBottomEndRadius: 5,
                        borderBottomStartRadius: 5,
                      }}
                    ></View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Modalize>
      </Portal>
    </View>
  );
});
