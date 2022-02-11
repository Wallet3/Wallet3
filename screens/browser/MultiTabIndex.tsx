import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Browser } from '.';
import Swiper from 'react-native-swiper';

const generateBrowser = (index: number, props: BottomTabScreenProps<{}, never>, onNewTab: () => void) => (
  <Browser key={index} {...props} tabIndex={index} onPageLoaded={(index, metadata) => {}} onNewTab={onNewTab} />
);

export default (props: BottomTabScreenProps<{}, never>) => {
  const swiper = useRef<Swiper>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [counts, setCounts] = useState(1);

  const newTab = () => {
    tabs.set(tabs.size, generateBrowser(tabs.size, props, newTab));

    setTimeout(() => {
      swiper.current?.scrollTo(tabs.size - 1, true);
      setTimeout(() => setActiveTabIndex(tabs.size - 1), 200); // Important!!!
    }, 0);

    setCounts(tabs.size);
  };

  const [tabs] = useState(new Map<number, JSX.Element>([[0, generateBrowser(0, props, newTab)]]));

  return (
    <View style={{ flex: 1 }}>
      <Swiper
        ref={swiper}
        showsPagination={false}
        showsButtons={false}
        horizontal
        loop={false}
        scrollEnabled
        index={activeTabIndex}
        onIndexChanged={(index) => console.log(index)}
      >
        {Array.from(tabs.values())}
      </Swiper>
      <Text style={{ position: 'absolute', top: 0, left: 0, fontSize: 29 }}>{counts}</Text>
    </View>
  );
};
