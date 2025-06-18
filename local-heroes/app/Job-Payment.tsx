import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function JobPaymentScreen() {
  const [employeeName, setEmployeeName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [bonuses, setBonuses] = useState("");
  const [deductions, setDeductions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerateSlip = async () => {
    if (!employeeName || !jobTitle) {
      Alert.alert("Please fill in all required fields.");
      return;
    }
    setGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([400, 600]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let y = height - 40;
      const lineHeight = 24;
      const draw = (label: string, value: string) => {
        page.drawText(`${label}: ${value}`, {
          x: 40,
          y,
          size: 16,
          font,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;
      };

      page.drawText("Job Payment Slip", {
        x: 40,
        y,
        size: 20,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight * 2;
      draw("Employee", employeeName);
      draw("Job Title", jobTitle);
      draw("Job Description", jobDescription);
      draw("Hours Worked", hoursWorked);
      draw("Hourly Rate", hourlyRate);
      draw("Bonuses", bonuses);
      draw("Deductions", deductions);
      draw("Payment Method", paymentMethod);
      draw("Transaction ID", transactionId);
      draw(
        "Total Pay",
        (
          Number(hoursWorked) * Number(hourlyRate) +
          Number(bonuses) -
          Number(deductions)
        ).toFixed(2)
      );

      const pdfBytes = await pdfDoc.saveAsBase64();
      const pdfUri = FileSystem.cacheDirectory + "payment-slip.pdf";
      await FileSystem.writeAsStringAsync(pdfUri, pdfBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert("PDF Generated!", `Saved to: ${pdfUri}`);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Job Payment Slip</Text>
          <TextInput
            style={styles.input}
            placeholder="Employee Name"
            value={employeeName}
            onChangeText={setEmployeeName}
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Job Title"
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Hours Worked"
            value={hoursWorked}
            onChangeText={setHoursWorked}
            keyboardType="numeric"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Hourly Rate"
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="numeric"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Bonuses"
            value={bonuses}
            onChangeText={setBonuses}
            keyboardType="numeric"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Deductions"
            value={deductions}
            onChangeText={setDeductions}
            keyboardType="numeric"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Payment Method"
            value={paymentMethod}
            onChangeText={setPaymentMethod}
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.input}
            placeholder="Transaction ID"
            value={transactionId}
            onChangeText={setTransactionId}
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Job Description"
            value={jobDescription}
            onChangeText={setJobDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity
            style={[styles.button, generating && styles.buttonDisabled]}
            onPress={handleGenerateSlip}
            disabled={generating}
            activeOpacity={0.8}
          >
            {generating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Generate Payment Slip</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 420,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2A9D8F",
    marginBottom: 18,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
    color: "#222",
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#2A9D8F",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
