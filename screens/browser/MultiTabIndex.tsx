import { Animated, FlatList, Keyboard, NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';
import { BottomTabScreenProps, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState } from 'react';
import { action, makeObservable, observable } from 'mobx';

import { Browser } from './Browser';
import MessageKeys from '../../common/MessageKeys';
import { Modalize } from 'react-native-modalize';
import { PageMetadata } from './Web3View';
import { Portal } from 'react-native-portalize';
import { ReactiveScreen } from '../../utils/device';
import Theme from '../../viewmodels/settings/Theme';
import { WebTabs } from './components/Tabs';
import { observer } from 'mobx-react-lite';
import { startLayoutAnimation } from '../../utils/animations';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export class StateViewModel {
  private _id = 0;

  pageCount = 1;
  activePageId = 0;
  activePageIndex = 0;
  tabBarHidden = false;

  pageMetas = new Map<number, PageMetadata | undefined>();
  pageCaptureFuncs = new Map<number, (() => Promise<string>) | undefined>();
  pageSnapshots = new Map<number, string | undefined>();

  get id() {
    return this._id;
  }

  constructor() {
    makeObservable(this, {
      pageCount: observable,
      activePageId: observable,
      activePageIndex: observable,
      setTabCount: action,
      setActivePageIdByPageIndex: action,
    });
  }

  setTabCount(count: number) {
    this.pageCount = count;
  }

  setActivePageIdByPageIndex(pageIndex: number) {
    this.activePageId = Array.from(this.pageMetas.keys())[pageIndex] ?? 0;
    this.activePageIndex = pageIndex;
  }

  genId() {
    return ++this._id;
  }

  findBlankPageIndex() {
    return Array.from(this.pageMetas).findIndex(([id, meta]) => meta === undefined);
  }

  clear() {
    this.pageMetas.clear();
    this.pageCaptureFuncs.clear();
    this.pageSnapshots.clear();
    this.setTabCount(0);
    this.setActivePageIdByPageIndex(0);
  }
}

export default observer((props: BottomTabScreenProps<{}, never>) => {
  const { navigation } = props;
  const swiper = useRef<FlatList>(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [persistentKeyboard, setPersistentKeyboard] = useState<'always' | 'never'>('never');
  const [_, forceUpdate] = useState(1);
  const [state] = useState(new StateViewModel());
  const { backgroundColor } = Theme;

  const [tabBarHeight] = useState(useBottomTabBarHeight());
  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  const { ref: tabsRef, open: openTabs, close: closeTabsModal } = useModalize();

  const generateBrowserTab = (id: number, props: BottomTabScreenProps<{}, never>, onNewTab: () => void) => (
    <Browser
      {...props}
      key={`Browser-${id}`}
      pageId={id}
      onPageLoaded={(_, meta) => state.pageMetas.set(id, meta)}
      onNewTab={onNewTab}
      globalState={state}
      onOpenTabs={openTabs}
      onTakeOff={() => hideTabBar()}
      setCapture={(func) => state.pageCaptureFuncs.set(id, func)}
      onPageLoadEnd={() => state.pageSnapshots.delete(id)}
      onInputting={(inputting) => setPersistentKeyboard(inputting ? 'always' : 'never')}
      onHome={() => {
        showTabBar();
        state.pageMetas.set(id, undefined);
        state.pageCaptureFuncs.set(id, undefined);
        state.pageSnapshots.set(id, undefined);
      }}
    />
  );

  const newTab = (forceGenerate = false) => {
    const index = state.findBlankPageIndex();

    if (!forceGenerate && index >= 0) {
      swiper.current?.scrollToIndex({ index, animated: true });
      return;
    }

    const id = state.genId();
    const tabView = generateBrowserTab(id, props, newTab);

    tabs.set(id, tabView);
    state.pageMetas.set(id, undefined);

    state.setTabCount(tabs.size);
    forceUpdate(tabs.size);
    Keyboard.dismiss();

    setTimeout(() => {
      swiper.current?.scrollToIndex({ index: tabs.size - 1, animated: true }); // swiper.current?.scrollToItem({ item: tabView, animated: true });
    }, 450);
  };

  const hideTabBar = () => {
    if (state.tabBarHidden) return;

    const { backgroundColor, systemBorderColor } = Theme;

    PubSub.publish(MessageKeys.drawerSwipeEnabled, false);
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

    PubSub.publish(MessageKeys.drawerSwipeEnabled, true);
    state.tabBarHidden = false;

    const translateY = new Animated.Value(tabBarHeight);
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();

    navigation.setOptions({
      tabBarStyle: { transform: [{ translateY }], height: tabBarHeight, backgroundColor, borderTopColor: systemBorderColor },
    });
  };

  const [tabs] = useState(new Map<number, JSX.Element>([[0, generateBrowserTab(0, props, newTab)]]));

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (persistentKeyboard === 'always') {
      Keyboard.dismiss();
      setPersistentKeyboard('never');
    }

    const pageIndex = Math.min(Math.max(Math.floor(e.nativeEvent.contentOffset.x / ReactiveScreen.width + 0.5), 0), tabs.size);
    setActivePageIndex(pageIndex);
    state.setActivePageIdByPageIndex(pageIndex);

    Array.from(state.pageMetas.values())[pageIndex] ? hideTabBar() : showTabBar();
  };

  useEffect(() => {
    const handler = () => {
      setTimeout(
        () =>
          swiper.current?.scrollToIndex({
            index: Math.max(0, Math.min(state.activePageIndex, tabs.size - 1)),
            animated: true,
          }),
        225
      );
    };

    ReactiveScreen.on('change', handler);

    return () => {
      ReactiveScreen.off('change', handler);
    };
  }, []);

  const removePageId = (pageId: number) => {
    const pageIndexToBeRemoved = Array.from(state.pageMetas.keys()).findIndex((i) => i === pageId);
    if (pageIndexToBeRemoved < 0) return;

    const removeTab = () => {
      startLayoutAnimation();

      let newPageIndex = -1;

      if (activePageIndex === tabs.size - 1 || pageIndexToBeRemoved < activePageIndex) {
        newPageIndex = Math.max(0, activePageIndex - 1);
      } else if (pageIndexToBeRemoved === activePageIndex) {
        newPageIndex = pageIndexToBeRemoved;
      } else {
        newPageIndex = activePageIndex;
      }

      tabs.delete(pageId);
      state.pageMetas.delete(pageId);
      state.pageCaptureFuncs.delete(pageId);
      state.pageSnapshots.delete(pageId);
      state.setTabCount(tabs.size);
      forceUpdate(tabs.size);

      setActivePageIndex(newPageIndex);
      state.setActivePageIdByPageIndex(newPageIndex);

      setTimeout(() => {
        Array.from(state.pageMetas.values())[newPageIndex] ? hideTabBar() : showTabBar();
        if (tabs.size > 1) swiper.current?.scrollToIndex({ index: newPageIndex, animated: false });
      }, 0);
    };

    if (tabs.size === 1) {
      newTab();

      setTimeout(() => {
        removeTab();
      }, 500);

      closeTabsModal();
      return;
    }

    removeTab();

    if (tabs.size === 1) closeTabsModal();
  };

  const removeAllTabs = () => {
    tabs.clear();
    state.clear();
    newTab();
    closeTabsModal();
    setActivePageIndex(0);
    showTabBar();
  };

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <FlatList
        key="browser-pivot"
        ref={swiper}
        data={Array.from(tabs.values())}
        renderItem={({ item }) => item}
        initialNumToRender={99}
        horizontal
        pagingEnabled
        onMomentumScrollEnd={onScrollEnd}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        initialScrollIndex={0}
        keyboardShouldPersistTaps={persistentKeyboard}
        onScrollToIndexFailed={({ index }) => {
          console.error('onScrollToIndexFailed', index);
        }}
      />

      <Portal>
        <Modalize
          ref={tabsRef}
          adjustToContentHeight
          disableScrollIfPossible
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
          modalStyle={{ padding: 0, margin: 0 }}
        >
          <WebTabs
            globalState={state}
            activeIndex={activePageIndex}
            onRemovePage={removePageId}
            onRemoveAll={removeAllTabs}
            onNewTab={() => {
              newTab(true);
              closeTabsModal();
            }}
            onJumpToPage={(index) => {
              swiper.current?.scrollToIndex({ index, animated: true });
              closeTabsModal();
            }}
          />
        </Modalize>
      </Portal>
    </View>
  );
});
