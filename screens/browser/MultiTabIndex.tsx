import { Animated, Image, Text, View } from 'react-native';
import { BottomTabScreenProps, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useRef, useState } from 'react';
import { action, makeObservable, observable } from 'mobx';

import { Browser } from '.';
import { FlatGrid } from 'react-native-super-grid';
import { Ionicons } from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';
import { PageMetadata } from './Web3View';
import { Portal } from 'react-native-portalize';
import Swiper from 'react-native-swiper';
import Theme from '../../viewmodels/settings/Theme';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

class StateViewModel {
  tabBarHidden = false;
  pageMetas = new Map<number, PageMetadata | undefined>();
  pageCaptureFuncs = new Map<number, (() => Promise<string>) | undefined>();
  pageSnapshots = new Map<number, string | undefined>();
  tabCount = 1;

  constructor() {
    makeObservable(this, { tabCount: observable, setTabCount: action });
  }

  setTabCount(count: number) {
    this.tabCount = count;
  }
}

const WebTab = ({
  pageIndex,
  globalState,
  listIndex,
  onPress,
}: {
  globalState: StateViewModel;
  pageIndex: number;
  listIndex: number;
  onPress?: () => void;
}) => {
  const meta = globalState.pageMetas.get(pageIndex);
  const themeColor = meta?.themeColor || '#000';
  const snapshot = globalState.pageSnapshots.get(pageIndex);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 170,
        borderRadius: 7,
        backgroundColor: '#fff',
        shadowColor: `#00000060`,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowRadius: 3.14,
        shadowOpacity: 0.5,
        elevation: 5,
      }}
    >
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

        <TouchableOpacity style={{ paddingTop: 7, paddingBottom: 5, paddingHorizontal: 12, paddingStart: 16 }}>
          <Ionicons name="ios-close" color="#fff" size={15} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          borderWidth: snapshot ? 0 : 1,
          height: 120,
          borderColor: themeColor,
          borderBottomEndRadius: 5,
          borderBottomStartRadius: 5,
        }}
      >
        {snapshot ? (
          <Image
            source={{ uri: snapshot }}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',

              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
            }}
          />
        ) : undefined}
      </View>
    </TouchableOpacity>
  );
};

const WebTabs = ({ globalState }: { globalState: StateViewModel }) => {
  const { backgroundColor } = Theme;

  return (
    <View style={{ height: 430, backgroundColor, borderTopEndRadius: 6, borderTopStartRadius: 6 }}>
      <FlatGrid
        data={Array.from(globalState.pageMetas.keys())}
        keyExtractor={(i) => `Tab-${i}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 37 }}
        itemDimension={170}
        spacing={16}
        bounces={false}
        renderItem={({ item, index }) => <WebTab globalState={globalState} pageIndex={item} listIndex={index} />}
      />
    </View>
  );
};

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
        onPageLoaded={(index, meta) => state.pageMetas.set(index, meta)}
        onPageLoadEnd={() =>
          state.pageCaptureFuncs
            .get(index)?.()
            .then((snapshot) => state.pageSnapshots.set(index, snapshot))
        }
        onNewTab={onNewTab}
        globalState={state}
        onOpenTabs={openTabs}
        onTakeOff={() => hideTabBar()}
        setCapture={(func) => state.pageCaptureFuncs.set(index, func)}
        onHome={() => {
          showTabBar();
          state.pageMetas.set(index, undefined);
          state.pageCaptureFuncs.set(index, undefined);
          state.pageSnapshots.set(index, undefined);
        }}
      />
    );
  };

  const newTab = () => {
    const index = tabs.size;
    tabs.set(index, generateBrowserTab(index, props, newTab));
    state.pageMetas.set(index, undefined);

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
        onIndexChanged={(index) => (state.pageMetas.get(index) ? hideTabBar() : showTabBar())}
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
          <WebTabs globalState={state} />
        </Modalize>
      </Portal>
    </View>
  );
});
