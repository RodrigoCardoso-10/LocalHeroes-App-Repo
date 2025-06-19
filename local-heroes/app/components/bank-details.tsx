import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const cardIcons = [
  require('../../assets/images/visa_icon.png'),
  require('../../assets/images/mastercard_payment_icon.png'),
  require('../../assets/images/maestro_payment_icon.png'),
];
type Errors = {
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
    name?: string;
};

const validateCardNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return 'Invalid card number';
    return '';
};

const validateExpiry = (expiry: string) => {
    if (!/^\d{2} \/ \d{2}$/.test(expiry)) return 'Invalid expiry format';
    const [month, year] = expiry.split(' / ').map(Number);
    if (month < 1 || month > 12) return 'Invalid month';
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    if (year < currentYear || (year === currentYear && month < now.getMonth() + 1)) return 'Card expired';
    return '';
};

const validateCvc = (cvc: string) => {
    if (!/^\d{3,4}$/.test(cvc)) return 'Invalid CVC';
    return '';
};

const validateName = (name: string) => {
    if (!name.trim()) return 'Name required';
    return '';
};
const maskCardNumber = (number: string) => {
  if (!number) return '';
  const visible = number.slice(-4);
  return '•••• •••• •••• ' + visible;
};

export default function BankDetails() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [showCvcInfo, setShowCvcInfo] = useState(false);

  const handleConfirm = () => {
    if (cardNumber && expiry && cvc && name) {
      setConfirmed(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>
      <Text style={styles.subtitle}>All transactions are secure and encrypted.</Text>
      <View style={styles.tabRow}>
        <Text style={styles.tabActive}>Credit card</Text>
        <View style={styles.iconRow}>
          {cardIcons.map((icon, i) => (
            <Image key={i} source={icon} style={styles.cardIcon} />
          ))}
        </View>
      </View>
      {!confirmed ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Card number"
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={setCardNumber}
            maxLength={19}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Expiry Date (MM / YY)"
              value={expiry}
              onChangeText={setExpiry}
              maxLength={7}
            />
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Security code"
                value={cvc}
                onChangeText={setCvc}
                maxLength={4}
                secureTextEntry
              />
              <TouchableOpacity onPress={() => setShowCvcInfo(!showCvcInfo)}>
                <Ionicons name="help-circle-outline" size={20} color="#888" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
              {showCvcInfo && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>
                    3-digit security code usually found on the back of your card.\nAmerican Express cards have a 4-digit code located on the front.
                  </Text>
                </View>
              )}
            </View>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Name on card"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cardPreviewContainer}>
          <Text style={styles.previewLabel}>Your Card</Text>
          <View style={styles.cardPreview}>
            <Text style={styles.cardPreviewNumber}>{maskCardNumber(cardNumber)}</Text>
            <View style={styles.cardPreviewRow}>
              <Text style={styles.cardPreviewLabel}>Exp:</Text>
              <Text style={styles.cardPreviewValue}>{expiry}</Text>
              <Text style={[styles.cardPreviewLabel, { marginLeft: 16 }]}>Name:</Text>
              <Text style={styles.cardPreviewValue}>{name}</Text>
            </View>
            {/* No CVC or full card number shown after confirmation */}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: '#666', marginBottom: 16 },
  tabRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  tabActive: { fontWeight: 'bold', marginRight: 16 },
  iconRow: { flexDirection: 'row' },
  cardIcon: { width: 32, height: 20, marginHorizontal: 2, resizeMode: 'contain' },
  form: { marginTop: 8 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  confirmButton: { backgroundColor: '#2A9D8F', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  confirmButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  tooltip: { position: 'absolute', top: 36, left: 0, backgroundColor: '#222', padding: 8, borderRadius: 6, zIndex: 10, maxWidth: 220 },
  tooltipText: { color: '#fff', fontSize: 12 },
  cardPreviewContainer: { alignItems: 'center', marginTop: 32 },
  previewLabel: { fontSize: 16, color: '#888', marginBottom: 8 },
  cardPreview: { backgroundColor: '#2A9D8F', borderRadius: 16, padding: 24, width: 320, maxWidth: '100%' },
  cardPreviewNumber: { color: '#fff', fontSize: 22, letterSpacing: 2, marginBottom: 16 },
  cardPreviewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  cardPreviewLabel: { color: '#fff', fontWeight: 'bold', marginRight: 4 },
  cardPreviewValue: { color: '#fff', fontSize: 16, marginRight: 8 },
});
