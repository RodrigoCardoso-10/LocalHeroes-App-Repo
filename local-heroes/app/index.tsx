import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to LocalHeroes</Text>

      <Link href="/jobs/index">
        <Text style={{ color: 'blue', marginTop: 20 }}>Browse Jobs</Text>
      </Link>

      <Link href="/about">
        <Text style={{ color: 'blue', marginTop: 20 }}>About Us</Text>
      </Link>

      <Link href="/contact">
        <Text style={{ color: 'blue', marginTop: 20 }}>Contact Us</Text>
      </Link>
x
      <Link href="/jobs/[id]">
        <Text style={{ color: 'blue', marginTop: 20 }}>Go to Job Details (ID 123)</Text>
      </Link>
    </View>
  );
}
