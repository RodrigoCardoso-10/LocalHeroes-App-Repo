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
    // Basic regex for 16-digit card number (with or without spaces)
    const cardNumberValid = /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(cardNumber.replace(/\s/g, ''));
    // Expiry MM / YY or MM/YY
    const expiryValid = /^(0[1-9]|1[0-2]) ?\/ ?\d{2}$/.test(expiry);
    // CVC: 3 or 4 digits
    const cvcValid = /^\d{3,4}$/.test(cvc);

    if (cardNumber && expiry && cvc && name && cardNumberValid && expiryValid && cvcValid) {
      setConfirmed(true);
    } else {
      // Provide specific feedback for each invalid field
      const errors: string[] = [];
      if (!cardNumber) errors.push('Card number is required.');
      else if (!cardNumberValid) errors.push('Card number is invalid.');
      if (!expiry) errors.push('Expiry date is required.');
      else if (!expiryValid) errors.push('Expiry date is invalid.');
      if (!cvc) errors.push('Security code is required.');
      else if (!cvcValid) errors.push('Security code is invalid.');
      if (!name) errors.push('Name on card is required.');
      alert(errors.join('\n'));
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
          <View style={styles.cardPreviewReal}>
            <Text style={styles.cardPreviewNumberReal}>{maskCardNumber(cardNumber)}</Text>
            <View style={styles.cardPreviewRowReal}>
              <View>
                <Text style={styles.cardPreviewLabelReal}>VALID THRU</Text>
                <Text style={styles.cardPreviewValueReal}>{expiry}</Text>
              </View>
            </View>
            <Text style={styles.cardPreviewNameReal}>{name.toUpperCase()}</Text>
            <Image
              source={require('../../assets/images/mastercard_payment_icon.png')}
              style={styles.cardPreviewLogo}
            />
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
  cardPreviewReal: {
    backgroundColor: '#A9A9A9',
    borderRadius: 12,
    padding: 24,
    width: 300,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
    minHeight: 170,
    justifyContent: 'space-between',
  },
  cardPreviewNumberReal: {
    color: '#fff',
    fontSize: 20,
    letterSpacing: 2,
    fontWeight: '500',
    marginBottom: 18,
  },
  cardPreviewRowReal: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  cardPreviewLabelReal: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '300',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardPreviewValueReal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardPreviewNameReal: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 0,
    letterSpacing: 1,
  },
  cardPreviewLogo: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    width: 40,
    height: 28,
    resizeMode: 'contain',
  },
});
