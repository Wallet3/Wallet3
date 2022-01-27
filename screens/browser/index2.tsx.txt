import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Browser } from '.';
import { PageMetadata } from './Web3View';
import { borderColor } from '../../constants/styles';
import { observer } from 'mobx-react-lite';

export default observer((props: BottomTabScreenProps<{}, never>) => {
  const [initView] = useState(
    <Browser
      {...props}
      tabIndex={0}
      onTakeOff={() => setIsHome(false)}
      onPageLoaded={(index, metadata) => pagesMetadata.set(index, { metadata, view: pagesMetadata.get(index)?.view })}
      onHome={() => {
        console.log('0 home');
        setIsHome(true);
        generateHomeTab();
      }}
    />
  );

  const [pagesMetadata] = useState(
    new Map<number, { metadata?: PageMetadata; view?: JSX.Element }>([[0, { view: initView }]])
  );

  const [isHome, setIsHome] = useState(true);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  var newTab = () => {
    const tabIndex = pagesMetadata.size;

    const view = (
      <Browser
        {...props}
        tabIndex={tabIndex}
        onTakeOff={() => setIsHome(false)}
        onPageLoaded={(index, metadata) => pagesMetadata.set(index, { metadata, view: pagesMetadata.get(index)?.view })}
        onHome={() => {
          setIsHome(true);
          generateHomeTab();
        }}
      />
    );

    pagesMetadata.set(tabIndex, { view });
    return { view, tabIndex };
  };

  const generateHomeTab = () => {
    console.log('gohome', pagesMetadata.size);
    const { tabIndex } = newTab();
    console.log('new tab', tabIndex, pagesMetadata.get(tabIndex)?.view === pagesMetadata.get(tabIndex - 1)?.view);
    setActiveTabIndex(tabIndex);
  };

  console.log('renderActiveIndex', activeTabIndex);

  return (
    <View style={{ flex: 1 }}>
      {pagesMetadata.get(activeTabIndex)?.view}

      {isHome && pagesMetadata.size > 1 ? (
        <FlatList
          style={{ maxHeight: 52, backgroundColor: '#fff', borderTopWidth: 1, borderColor }}
          contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 8 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={new Array(pagesMetadata.size - 1).fill(null)}
          keyExtractor={(_, index) => `${pagesMetadata.get(index)?.metadata?.origin}-${index}`}
          renderItem={({ index }) => {
            const tuple = pagesMetadata.get(index);
            return (
              <TouchableOpacity
                onPress={() => {
                  setActiveTabIndex(index);
                  console.log('activeTabIndex', index);
                }}
                key={`tab-${index}`}
                style={{
                  padding: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: tuple?.metadata?.themeColor ?? borderColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  marginHorizontal: 4,
                }}
              >
                <Text style={{ color: tuple?.metadata?.themeColor }}>{tuple?.metadata?.title}</Text>
              </TouchableOpacity>
            );
          }}
        />
      ) : // <View
      //   style={{
      //     flexDirection: 'row',
      //     padding: 8,
      //     paddingHorizontal: 12,
      //     backgroundColor: '#fff',
      //     borderTopWidth: 1,
      //     borderColor,
      //   }}
      // >

      // </View>
      undefined}
    </View>
  );
});
