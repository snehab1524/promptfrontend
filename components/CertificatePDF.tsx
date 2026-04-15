import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface Props {
  learnerName: string;
  courseLevel: string;
  certId: string;
  date: string;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica-Bold",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    border: "4px solid #4F46E5", // purple border
    borderRadius: 20,
    width: "100%",
    padding: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937", // dark text
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 30,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 10,
    textAlign: "center",
  },
  footer: {
    marginTop: 40,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  certificateId: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 20,
  },
});

const CertificatePDF: React.FC<Props> = ({ learnerName, courseLevel, certId, date }) => {
  const formatCourseName = (value: string) => {
    const normalized = value
      .replace(/^PM-/i, '')
      .replace(/-[A-F0-9]{6,8}$/i, '')
      .replace(/\s+Certificate$/i, '')
      .trim();

    if (!normalized) return '';

    if (normalized.toLowerCase().startsWith('advanced-')) {
      const baseName = normalized
        .replace(/^advanced-/i, '')
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      return `Advanced ${baseName}`;
    }

    if (/^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(normalized)) {
      return normalized
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }

    return normalized;
  };

  const preferredCourseName = courseLevel?.trim();
  const completedCourseName =
    preferredCourseName && preferredCourseName.toLowerCase() !== 'completed course'
      ? formatCourseName(preferredCourseName)
      : formatCourseName(certId) || 'Course Level';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <Text style={styles.title}>🎓 Certificate of Completion</Text>
          <Text style={styles.subtitle}>{completedCourseName}</Text>
          <Text style={styles.text}>This is to certify that</Text>
          <Text style={styles.name}>{learnerName}</Text>
          <Text style={styles.text}>has successfully completed {completedCourseName} course</Text>
          <Text style={styles.certificateId}>Certificate ID: {certId}</Text>
          <Text style={styles.text}>Date: {date}</Text>
          <Text style={styles.footer}>Generated with React PDF</Text>
        </View>
      </Page>
    </Document>
  );
};

export default CertificatePDF;
