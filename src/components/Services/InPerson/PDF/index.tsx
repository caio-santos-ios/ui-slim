import { formattedMoney } from '@/utils/mask.util';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    fontSize: 9, // Fonte menor para caber no formato de tabela
    fontFamily: 'Helvetica', 
    color: '#000' 
  },
  // Estrutura de Tabela
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 40,
  },
  // Células específicas
  cellLogo: {
    width: '35%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellHeaderCenter: {
    width: '65%',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellNormal: {
    padding: 5,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  // Textos
  titleMain: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subText: {
    fontSize: 7,
    textAlign: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 7,
    fontWeight: 'bold',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  labelTable: {
    fontSize: 7,
    fontWeight: 'bold',
    marginBottom: 2,
    textTransform: 'uppercase',
    textAlign: 'center'
  },
  value: {
    fontSize: 10,
  },
  valueTable: {
    fontSize: 10,
    textAlign: 'center'
  },
  validityBox: {
    backgroundColor: '#d1e9f5', // Azul claro da imagem
    padding: 4,
    borderWidth: 1,
    borderColor: '#000',
    textAlign: 'center',
    width: 100,
  },
  footerSignatureContainer: {
    position: 'absolute',
    bottom: 50, // Distância do fim da página
    left: 0,
    right: 0,
    alignItems: 'center', // Centraliza a linha horizontalmente
    justifyContent: 'center',
  },
  footerSignatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: 250, // Largura da linha de assinatura
    textAlign: 'center',
    paddingTop: 5,
  },
  footerSignatureText: {
    fontSize: 8,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  }
});

interface Props {
  recipient: string;
  cpf?: string;
  procedures: any[];
  time?: string;
  date?: string;
  professional?: string;
  accreditedNetwork: string;
  total: number;
  responsiblePayment: string;
}

export const ProcedureSinglePDF = ({ 
  recipient, 
  cpf, 
  procedures, 
  time, 
  date, 
  professional, 
  accreditedNetwork,
  total,
  responsiblePayment
}: Props) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.table}>
        
        <View style={styles.tableRow}>
          <View style={styles.cellLogo}>
            <Image style={{ width: 100 }} src="/assets/images/logo.png" />
          </View>
          
          <View style={styles.cellHeaderCenter}>
            <Text style={styles.titleMain}>GUIA DE AUTORIZAÇÃO DE ATENDIMENTO PRESENCIAL</Text>
          </View>
        </View>

        <View style={styles.tableRow}>
          <View style={[styles.cellNormal, { width: '100%' }]}>
            <Text style={styles.label}>UNIDADE CREDENCIADA</Text>
            <Text style={styles.value}>{accreditedNetwork?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={[styles.tableRow, { minHeight: 25, backgroundColor: '#f0f0f0' }]}>
          <View style={[styles.cellNormal, { width: responsiblePayment == "Contratante" ? '15%' : '20%' }]}><Text style={styles.labelTable}>BENEFICIÁRIO(A)</Text></View>
          <View style={[styles.cellNormal, { width: responsiblePayment == "Contratante" ? '15%' : '20%' }]}><Text style={styles.labelTable}>CPF</Text></View>
          <View style={[styles.cellNormal, { width: responsiblePayment == "Contratante" ? '15%' : '20%' }]}><Text style={styles.labelTable}>PROCEDIMENTO</Text></View>
          {
            responsiblePayment == "Contratante" &&
            <View style={[styles.cellNormal, { width: '15%' }]}><Text style={styles.labelTable}>VALOR</Text></View>
          }
          <View style={[styles.cellNormal, { width: '10%' }]}><Text style={styles.labelTable}>HORÁRIO</Text></View>
          <View style={[styles.cellNormal, { width: '10%' }]}><Text style={styles.labelTable}>DATA</Text></View>
          <View style={[styles.cellNormal, { width: '25%' }]}><Text style={styles.labelTable}>PROFISSIONAL</Text></View>
        </View>

        {
          procedures.map((x: any, index: number) => {
            return (
              <View key={index} style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                <View style={[styles.cellNormal, { width: responsiblePayment == "Contratante" ? '15%' : '20%' }]}><Text style={styles.valueTable}>{recipient}</Text></View>
                <View style={[styles.cellNormal, { width: responsiblePayment == "Contratante" ? '15%' : '20%' }]}><Text style={styles.valueTable}>{cpf || '000.000.000-00'}</Text></View>
                <View style={[styles.cellNormal, { width: responsiblePayment == "Contratante" ? '15%' : '20%' }]}><Text style={styles.valueTable}>{x.name || 'CONSULTA'}</Text></View>
                {
                  responsiblePayment == "Contratante" &&
                  <View style={[styles.cellNormal, { width: '15%' }]}><Text style={styles.valueTable}>{formattedMoney(x.value) || '0,00'}</Text></View>
                }
                <View style={[styles.cellNormal, { width: '10%' }]}><Text style={styles.valueTable}>{time || '09:00'}</Text></View>
                <View style={[styles.cellNormal, { width: '10%' }]}><Text style={styles.valueTable}>{date || '01/01/2026'}</Text></View>
                <View style={[styles.cellNormal, { width: '25%' }]}><Text style={styles.valueTable}>{professional}</Text></View>
              </View>
            )
          })
        }

        {
          responsiblePayment == "Contratante" && procedures.length > 1 &&
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.cellNormal, { width: '15%' }]}><Text></Text></View>
            <View style={[styles.cellNormal, { width: '15%' }]}><Text></Text></View>
            <View style={[styles.cellNormal, { width: '15%' }]}><Text></Text></View>
            <View style={[styles.cellNormal, { width: '15%' }]}><Text style={styles.valueTable}>{formattedMoney(total) || '0,00'}</Text></View>
            <View style={[styles.cellNormal, { width: '10%' }]}><Text></Text></View>
            <View style={[styles.cellNormal, { width: '10%' }]}><Text></Text></View>
            <View style={[styles.cellNormal, { width: '25%' }]}><Text></Text></View>
          </View>
        }
      </View>

      <View style={styles.footerSignatureContainer}>
        <View style={styles.footerSignatureLine}>
          <Text style={styles.footerSignatureText}>Assinatura do Beneficiário(a)</Text>
        </View>
      </View>
    </Page>
  </Document>
);