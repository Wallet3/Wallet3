import { Animated, Text, View } from 'react-native';
import { BottomTabScreenProps, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useCallback, useRef, useState } from 'react';

import { Browser } from '.';
import { PageMetadata } from './Web3View';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

class StateViewModel {
  tabBarHidden = false;
  pageState = new Map<number, PageMetadata | undefined>();
}

export default (props: BottomTabScreenProps<{}, never>) => {
  const { navigation } = props;
  const swiper = useRef<Swiper>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [counts, setCounts] = useState(1);
  const [state] = useState(new StateViewModel());

  const [tabBarHeight] = useState(useBottomTabBarHeight());
  const { bottom: safeAreaBottom } = useSafeAreaInsets();

  const { backgroundColor, systemBorderColor } = Theme;

  const generateBrowser = (index: number, props: BottomTabScreenProps<{}, never>, onNewTab: () => void) => (
    <Browser
      key={index}
      {...props}
      tabIndex={index}
      onPageLoaded={(index, meta) => state.pageState.set(index, meta)}
      onNewTab={onNewTab}
      onTakeOff={() => hideTabBar()}
      onHome={() => {
        showTabBar();
        state.pageState.delete(index);
      }}
    />
  );

  const newTab = () => {
    tabs.set(tabs.size, generateBrowser(tabs.size, props, newTab));

    setTimeout(() => {
      swiper.current?.scrollTo(tabs.size - 1, true);
      setTimeout(() => setActiveTabIndex(tabs.size - 1), 200); // Important!!!
    }, 0);

    setCounts(tabs.size);
  };

  const hideTabBar = () => {
    if (state.tabBarHidden) return;

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

    PubSub.publish('drawer-swipeEnabled', true);
    state.tabBarHidden = false;

    const translateY = new Animated.Value(tabBarHeight);
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();

    navigation.setOptions({
      tabBarStyle: { transform: [{ translateY }], height: tabBarHeight, backgroundColor, borderTopColor: systemBorderColor },
    });
  };

  const [tabs] = useState(new Map<number, JSX.Element>([[0, generateBrowser(0, props, newTab)]]));

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
        onIndexChanged={(index) => {
          console.log(index, state.pageState.get(index));
          state.pageState.get(index) ? hideTabBar() : showTabBar();
        }}
      >
        {Array.from(tabs.values())}
      </Swiper>
    </View>
  );
};
