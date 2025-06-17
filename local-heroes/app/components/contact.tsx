import { Linking, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';

export default function ContactScreen() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Contact Us</Text>

      <TouchableOpacity
        onPress={() => Linking.openURL('mailto:support@localheroes.com')}
        style={{ marginVertical: 10 }}
      >
        <Text style={{ color: 'blue' }}>Email: support@localheroes.com</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Linking.openURL('tel:+1234567890')} style={{ marginVertical: 10 }}>
        <Text style={{ color: 'blue' }}>Phone: +123 456 7890</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 20, textAlign: 'center', paddingHorizontal: 20 }}>
        We're here to help! Feel free to reach out with any questions or concerns.
      </Text>
    </SafeAreaView>
  );
}
