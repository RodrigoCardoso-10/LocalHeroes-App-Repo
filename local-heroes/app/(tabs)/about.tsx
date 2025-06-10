import { Text, View } from 'react-native';

export default function AboutScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>About LocalHeroes</Text>
            <Text style={{ textAlign: 'center', paddingHorizontal: 20 }}>
                LocalHeroes is a platform connecting local communities with skilled professionals.
                We believe in empowering local talent and making quality services accessible to everyone.
            </Text>
        </View>
    );
}