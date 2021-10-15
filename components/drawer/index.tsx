import { Button, StyleSheet, Text, View } from "react-native";
import {
  DrawerContent,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  DrawerNavigationProp,
  DrawerScreenProps,
  DrawerView,
} from "@react-navigation/drawer";

import React from "react";

export default (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView {...props} scrollEnabled={false}>
      <DrawerItem label="Home" onPress={() => {}} />
    </DrawerContentScrollView>
  );
};
