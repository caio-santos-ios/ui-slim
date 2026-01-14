import { convertNumberMoney } from '@/utils/convert.util';
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
  value: {
    fontSize: 10,
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
  procedure?: string;
  time?: string;
  date?: string;
  professional?: string;
  accreditedNetwork: string;
}

export const ProcedureSinglePDF = ({ 
  recipient, 
  cpf, 
  procedure, 
  time, 
  date, 
  professional, 
  accreditedNetwork 
}: Props) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.table}>
        
        {/* LINHA 1: LOGO E TÍTULO CENTRALIZADO */}
        <View style={styles.tableRow}>
          <View style={styles.cellLogo}>
            <Image style={{ width: 100 }} src="/assets/images/logo.png" />
            <Text style={[styles.subText, { marginTop: 5 }]}>Avenida Camilo de Holanda, 1022 - Torre</Text>
            <Text style={styles.subText}>João Pessoa-PB - Fone: 83 2179-3390</Text>
          </View>
          
          <View style={styles.cellHeaderCenter}>
            <Text style={styles.titleMain}>GUIA DE AUTORIZAÇÃO DE ATENDIMENTO PRESENCIAL</Text>
            {/* <Text style={styles.subText}>RELATÓRIO - ATENDIMENTO - UNIDADE CREDENCIADA</Text> */}
            
            {/* <View style={[styles.validityBox, { marginTop: 5 }]}>
              <Text style={{ fontSize: 6 }}>VALIDADE RELATÓRIO</Text>
              <Text style={{ fontWeight: 'bold' }}>{date || '30/12/26'}</Text>
            </View> */}
          </View>
        </View>

        {/* LINHA 2: NOME DA UNIDADE CREDENCIADA */}
        <View style={styles.tableRow}>
          <View style={[styles.cellNormal, { width: '100%' }]}>
            <Text style={styles.label}>UNIDADE CREDENCIADA</Text>
            <Text style={styles.value}>{accreditedNetwork?.toUpperCase()}</Text>
          </View>
        </View>

        {/* LINHA 3: CABEÇALHO DA TABELA DE DADOS */}
        <View style={[styles.tableRow, { minHeight: 25, backgroundColor: '#f0f0f0' }]}>
          <View style={[styles.cellNormal, { width: '25%' }]}><Text style={styles.label}>BENEFICIÁRIO(A)</Text></View>
          <View style={[styles.cellNormal, { width: '15%' }]}><Text style={styles.label}>CPF</Text></View>
          <View style={[styles.cellNormal, { width: '15%' }]}><Text style={styles.label}>PROCEDIMENTO</Text></View>
          <View style={[styles.cellNormal, { width: '10%' }]}><Text style={styles.label}>HORÁRIO</Text></View>
          <View style={[styles.cellNormal, { width: '10%' }]}><Text style={styles.label}>DATA</Text></View>
          <View style={[styles.cellNormal, { width: '35%' }]}><Text style={styles.label}>PROFISSIONAL</Text></View>
        </View>

        {/* LINHA 4: DADOS DINÂMICOS */}
        <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
          <View style={[styles.cellNormal, { width: '25%' }]}><Text style={styles.value}>{recipient}</Text></View>
          <View style={[styles.cellNormal, { width: '15%' }]}><Text style={styles.value}>{cpf || '000.000.000-00'}</Text></View>
          <View style={[styles.cellNormal, { width: '15%' }]}><Text style={styles.value}>{procedure || 'CONSULTA'}</Text></View>
          <View style={[styles.cellNormal, { width: '10%' }]}><Text style={styles.value}>{time || '09:00'}</Text></View>
          <View style={[styles.cellNormal, { width: '10%' }]}><Text style={styles.value}>{date || '01/01/2026'}</Text></View>
          <View style={[styles.cellNormal, { width: '35%' }]}><Text style={styles.value}>{professional}</Text></View>
        </View>

      </View>

      <View style={styles.footerSignatureContainer}>
        <View style={styles.footerSignatureLine}>
          <Text style={styles.footerSignatureText}>Assinatura do Beneficiário(a)</Text>
        </View>
      </View>
    </Page>
  </Document>
);