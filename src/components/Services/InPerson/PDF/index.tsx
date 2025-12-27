import { convertNumberMoney } from '@/utils/convert.util';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontSize: 11, 
    fontFamily: 'Helvetica', 
    color: '#333' 
  },
  header: { 
    flexDirection: 'row',       // Coloca logo e título na mesma linha
    justifyContent: 'space-between', 
    alignItems: 'center',       // Centraliza verticalmente
    marginBottom: 30, 
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#000',
    paddingBottom: 10 
  },
  logo: {
    width: 80,                  // Ajuste o tamanho da largura conforme necessário
    height: 'auto'
  },
  title: { 
    fontSize: 16, 
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#cccccc',
    borderRadius: 4
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 10,
    color: '#666'
  },
  value: {
    fontSize: 12,
    marginBottom: 10,
    color: '#000'
  },
  signatureContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#000',
    width: 250,
    textAlign: 'center',
    paddingTop: 5
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
    borderTopWidth: 0.5,
    borderTopStyle: 'solid',
    borderTopColor: '#eee',
    paddingTop: 10
  }
});

interface Props {
  recipient: string;
  accreditedNetwork: string;
  value: any;
  responsiblePayment: string;
}

export const ProcedureSinglePDF = ({ recipient, accreditedNetwork, value, responsiblePayment }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
        {/* CABEÇALHO COM LOGO */}
        <View style={styles.header}>
            <Image 
                style={styles.logo} 
                src="/assets/images/logo.png" 
            />
            <Text style={styles.title}>COMPROVANTE DE ATENDIMENTO</Text>
        </View>

        <View style={styles.section}>
            <Text style={styles.label}>BENEFICIÁRIO</Text>
            <Text style={styles.value}>{recipient?.toUpperCase()}</Text>
        </View>

        <View style={styles.section}>
            <Text style={styles.label}>UNIDADE CREDENCIADA</Text>
            <Text style={styles.value}>{accreditedNetwork?.toUpperCase()}</Text>
        </View>
      
        {
            responsiblePayment === "Contratante" &&
            <View style={styles.section}>
                <Text style={styles.label}>VALOR</Text>
                <Text style={styles.value}>R$ {convertNumberMoney(value)}</Text>
            </View>
        }

        <View style={styles.signatureContainer}>
            <View style={styles.signatureLine}>
                <Text>Assinatura do Beneficiário</Text>
            </View>
        </View>

        <Text style={styles.footer}>
            Este documento é um registro interno da Unidade Credenciada.
        </Text>
    </Page>
  </Document>
);