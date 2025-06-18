import React from "react";
import PostJobScreen from "../post-job";
import { ScrollView, View, StyleSheet } from "react-native";

export default function PostScreen() {
  return (
    <ScrollView 
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <PostJobScreen />
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  bottomSpace: {
    height: 80,
  },
  // ... existing styles ...
});
