import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Browser } from './Browser';
import { borderColor } from '../../constants/styles';
import { observer } from 'mobx-react-lite';

export default observer((props: BottomTabScreenProps<{}, never>) => {
  const [isHome, setIsHome] = useState(true);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tabs, setTabs] = useState<JSX.Element[]>([]);

  const generateBlankTab = () => {
    setTabs((prev) => [
      ...prev,
      <Browser
        {...props}
        tabIndex={prev.length}
        onTakeOff={() => setIsHome(false)}
        onHome={() => setIsHome(true)}
        onPageLoaded={console.log}
      />,
    ]);

    console.log(tabs.length);
    setActiveTabIndex(tabs.length);
  };

  useEffect(() => generateBlankTab(), []);
  console.log(tabs.length, activeTabIndex);

  return (
    <View style={{ flex: 1 }}>
      {tabs[activeTabIndex]}

      {isHome && tabs.length > 1 ? (
        <View
          style={{
            flexDirection: 'row',
            padding: 8,
            paddingHorizontal: 12,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderColor,
          }}
        >
          <View style={{ padding: 8, borderRadius: 10, borderWidth: 1 }}>
            <Text>Uniswap Interface</Text>
          </View>
        </View>
      ) : undefined}
    </View>
  );
});
