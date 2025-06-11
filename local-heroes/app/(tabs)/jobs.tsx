import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';

export default function JobsScreen() {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.text}>Jobs Screen</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 