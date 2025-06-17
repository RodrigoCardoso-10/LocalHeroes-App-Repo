import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
// import Header from '../components/Header';

export default function AboutScreen() {
    return (
        <View style={styles.container}>
            {/* <Header /> */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>About LocalHeroes</Text>
                <Text style={styles.description}>
                    LocalHeroes is a platform connecting local communities with skilled professionals.
                    We believe in empowering local talent and making quality services accessible to everyone.
                </Text>
                
                <Image 
                    source={require('../../assets/images/localheroes-logo.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                />
                
                <Text style={styles.missionTitle}>Our Mission</Text>
                <Text style={styles.missionText}>
                    At LocalHeroes, we're dedicated to building stronger communities by connecting skilled individuals with local opportunities. 
                    Our platform makes it easy to find reliable professionals in your area or showcase your talents to those who need them.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 20,
        color: '#333',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
        color: '#555',
    },
    logo: {
        width: 250,
        height: 250,
        marginBottom: 30,
    },
    missionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2A9D8F',
    },
    missionText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        color: '#555',
    }
});