import { Button, StyleSheet, Text, View } from "react-native";

import ChainCard from "../../components/chaincard";
import { DrawerScreenProps } from "@react-navigation/drawer";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { observer } from "mobx-react-lite";

type RootStackParamList = {
  Home: undefined;
  Details?: { userId?: number };
  Feed: { sort: "latest" | "top" } | undefined;
};

export default observer(
  ({ navigation }: DrawerScreenProps<RootStackParamList, "Home">) => {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          alignItems: "stretch",
          justifyContent: "flex-start",
          backgroundColor: "#fff",
        }}
      >
        <ChainCard />

        <Button
          title="Go to Details"
          onPress={() => {
            navigation.navigate("Details", { userId: 0 });
            navigation.openDrawer();
          }}
        />
        <StatusBar style="dark" />
      </View>
    );
  }
);
