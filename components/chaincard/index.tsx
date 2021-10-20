import {
  RegisteredStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import React from "react";

interface Props {
  style?: StyleProp<ViewStyle>;
}

export default ({ style }: Props) => {
  return (
    <View style={{ ...styles.container, ...((style as any) || {}) }}>
      <View
        style={{
          flexDirection: "row",
          marginBottom: 4,
          justifyContent: "space-between",
        }}
      >
        <Text style={{ ...styles.text, fontSize: 15 }}>Ethereum</Text>
      </View>

      <Text style={{ ...styles.text, marginBottom: 42, fontSize: 12 }}>
        0xABCDE....67890
      </Text>

      <Text style={styles.headline} numberOfLines={1}>
        $ 223,875.64
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#627EEA",
  },

  text: { color: "white", fontWeight: "500" },

  headline: {
    color: "white",
    fontWeight: "500",
    fontSize: 27,
    fontFamily: "Avenir Next",
  },
});
