import { Button, StyleSheet, Text, View } from "react-native";

import { DrawerScreenProps } from "@react-navigation/drawer";
import React from "react";
import { observer } from "mobx-react-lite";

type RootStackParamList = {
  Home: undefined;
  Details?: { userId?: number };
  Feed: { sort: "latest" | "top" } | undefined;
};

export default observer(
  ({ navigation }: DrawerScreenProps<RootStackParamList, "Home">) => {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Home</Text>

        <Button
          title="Go to Details"
          onPress={() => {
            navigation.navigate("Details", { userId: 0 });
            navigation.openDrawer();
          }}
        />
      </View>
    );
  }
);
