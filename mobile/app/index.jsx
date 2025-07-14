import { Link } from "expo-router";
import React from "react";
import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Text>Edit <Text style={{ fontFamily: "monospace" }}>app/index.tsx</Text> to edit this screen.</Text>
      </Text>

    <Link href="/(auth)/signup">Signup</Link>
    <Link href="/(auth)">Login</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "blue",
  },
});
