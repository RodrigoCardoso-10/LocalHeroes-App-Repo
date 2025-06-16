import { Redirect } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function PostScreen() {
  // Redirect to the post-job page
  return <Redirect href="/post-job" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 