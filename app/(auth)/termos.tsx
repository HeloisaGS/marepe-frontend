import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TermosDeUso() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos de Uso</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdate}>Última atualização: Junho de 2026</Text>

        <Text style={styles.intro}>
          Bem-vindo ao MaréPE! Ao usar nossa plataforma, você concorda com os termos abaixo.
          Leia atentamente antes de continuar.
        </Text>

        <Text style={styles.sectionTitle}>1. Definições</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>MaréPE:</Text> Plataforma digital que conecta vendedores ambulantes
          e barraqueiros a clientes nas praias de Pernambuco.{'\n\n'}
          <Text style={styles.bold}>Usuário:</Text> Qualquer pessoa que utilize o aplicativo (Cliente,
          Ambulante ou Barraqueiro).{'\n\n'}
          <Text style={styles.bold}>Vendedor:</Text> Ambulantes e barraqueiros que oferecem produtos/serviços.{'\n\n'}
          <Text style={styles.bold}>Cliente:</Text> Usuário que busca e adquire produtos/serviços.
        </Text>

        <Text style={styles.sectionTitle}>2. Aceite dos Termos</Text>
        <Text style={styles.paragraph}>
          Ao criar uma conta ou usar o MaréPE, você confirma que:{'\n\n'}
          • Tem pelo menos 18 anos de idade ou possui autorização de um responsável legal;{'\n'}
          • Leu, compreendeu e aceita estes Termos de Uso;{'\n'}
          • Fornecerá informações verdadeiras e atualizadas;{'\n'}
          • É responsável pela segurança de sua conta e senha.
        </Text>

        <Text style={styles.sectionTitle}>3. Uso da Plataforma</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>3.1. O MaréPE é um intermediário:</Text> Facilitamos a conexão entre
          vendedores e clientes. NÃO somos responsáveis pela qualidade, segurança ou legalidade dos
          produtos/serviços oferecidos.{'\n\n'}
          <Text style={styles.bold}>3.2. Localização:</Text> Ao usar o app, você autoriza o acesso à sua
          localização em tempo real para exibir vendedores próximos.{'\n\n'}
          <Text style={styles.bold}>3.3. Proibições:</Text> É proibido usar o MaréPE para:{'\n'}
          • Vender produtos ilegais ou falsificados;{'\n'}
          • Praticar fraudes ou golpes;{'\n'}
          • Assediar, ameaçar ou prejudicar outros usuários;{'\n'}
          • Usar bots, scripts ou ferramentas automatizadas;{'\n'}
          • Criar múltiplas contas falsas.
        </Text>

        <Text style={styles.sectionTitle}>4. Transações e Pagamentos</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>4.1. Pagamento direto:</Text> As transações financeiras ocorrem
          DIRETAMENTE entre cliente e vendedor. O MaréPE não processa pagamentos.{'\n\n'}
          <Text style={styles.bold}>4.2. Inadimplência:</Text> O cliente é responsável por efetuar o
          pagamento acordado. Pedidos não pagos podem resultar em:{'\n'}
          • Bloqueio temporário ou permanente da conta;{'\n'}
          • Impossibilidade de fazer novos pedidos;{'\n'}
          • Registro interno de inadimplência.{'\n\n'}
          <Text style={styles.bold}>4.3. Cancelamento:</Text> Pedidos podem ser cancelados por ambas
          as partes antes da entrega. Após a entrega, contate diretamente o vendedor.{'\n\n'}
          <Text style={styles.bold}>4.4. Disputas:</Text> Problemas de pagamento devem ser resolvidos
          entre as partes. O MaréPE pode mediar, mas não garante reembolso.
        </Text>

        <Text style={styles.sectionTitle}>5. Responsabilidades do Cliente</Text>
        <Text style={styles.paragraph}>
          O cliente se compromete a:{'\n\n'}
          • Pagar pelo pedido no valor e prazo acordados;{'\n'}
          • Fornecer localização correta para entrega;{'\n'}
          • Tratar vendedores com respeito;{'\n'}
          • Não fazer pedidos falsos ou fraudulentos;{'\n'}
          • Avaliar honestamente o atendimento recebido.
        </Text>

        <Text style={styles.sectionTitle}>6. Responsabilidades do Vendedor</Text>
        <Text style={styles.paragraph}>
          O vendedor se compromete a:{'\n\n'}
          • Manter informações e cardápio atualizados;{'\n'}
          • Oferecer produtos de qualidade e dentro da legalidade;{'\n'}
          • Respeitar preços e condições anunciados;{'\n'}
          • Atender pedidos confirmados no prazo razoável;{'\n'}
          • Tratar clientes com respeito e profissionalismo;{'\n'}
          • Manter localização atualizada (ambulantes);{'\n'}
          • Possuir alvarás e licenças sanitárias necessárias.
        </Text>

        <Text style={styles.sectionTitle}>7. Isenção de Responsabilidade</Text>
        <Text style={styles.paragraph}>
          O MaréPE NÃO se responsabiliza por:{'\n\n'}
          • Qualidade, segurança ou procedência dos produtos vendidos;{'\n'}
          • Intoxicação alimentar ou problemas de saúde;{'\n'}
          • Danos, perdas ou roubos durante transações;{'\n'}
          • Atrasos ou falhas na entrega;{'\n'}
          • Disputas entre usuários;{'\n'}
          • Fraudes ou golpes entre as partes;{'\n'}
          • Falta de pagamento por parte do cliente;{'\n'}
          • Irregularidades fiscais ou sanitárias dos vendedores;{'\n'}
          • Indisponibilidade temporária do aplicativo;{'\n'}
          • Erros de localização ou GPS.
        </Text>

        <Text style={styles.sectionTitle}>8. Privacidade e Dados</Text>
        <Text style={styles.paragraph}>
          Coletamos e armazenamos:{'\n\n'}
          • Dados de cadastro (nome, email, telefone, CPF);{'\n'}
          • Localização em tempo real (com seu consentimento);{'\n'}
          • Histórico de pedidos e interações;{'\n'}
          • Fotos de perfil e produtos.{'\n\n'}
          Seus dados são protegidos conforme a LGPD (Lei Geral de Proteção de Dados).
          Não vendemos ou compartilhamos suas informações com terceiros sem autorização.
        </Text>

        <Text style={styles.sectionTitle}>9. Suspensão e Banimento</Text>
        <Text style={styles.paragraph}>
          Podemos suspender ou banir contas que:{'\n\n'}
          • Violem estes Termos de Uso;{'\n'}
          • Pratiquem fraudes ou irregularidades;{'\n'}
          • Acumulem múltiplas denúncias;{'\n'}
          • Não paguem pedidos repetidamente;{'\n'}
          • Usem o app para atividades ilegais.{'\n\n'}
          A decisão é final e não gera direito a reembolso ou indenização.
        </Text>

        <Text style={styles.sectionTitle}>10. Modificações nos Termos</Text>
        <Text style={styles.paragraph}>
          Podemos atualizar estes termos a qualquer momento. Você será notificado sobre mudanças
          significativas. O uso contínuo do app após alterações significa que você aceita os novos termos.
        </Text>

        <Text style={styles.sectionTitle}>11. Limitação de Garantias</Text>
        <Text style={styles.paragraph}>
          O MaréPE é fornecido "como está", sem garantias expressas ou implícitas. Não garantimos:{'\n\n'}
          • Funcionamento ininterrupto ou livre de erros;{'\n'}
          • Segurança absoluta dos dados;{'\n'}
          • Disponibilidade de vendedores ou produtos;{'\n'}
          • Precisão de informações fornecidas por usuários.
        </Text>

        <Text style={styles.sectionTitle}>12. Propriedade Intelectual</Text>
        <Text style={styles.paragraph}>
          O MaréPE, seu logo, design e conteúdos são protegidos por direitos autorais. É proibido:{'\n\n'}
          • Copiar, modificar ou distribuir o aplicativo;{'\n'}
          • Usar nossa marca sem autorização;{'\n'}
          • Fazer engenharia reversa do código;{'\n'}
          • Extrair ou copiar dados em massa.
        </Text>

        <Text style={styles.sectionTitle}>13. Lei Aplicável</Text>
        <Text style={styles.paragraph}>
          Estes termos são regidos pelas leis brasileiras. Disputas serão resolvidas no foro da
          comarca de Recife/PE, com renúncia a qualquer outro, por mais privilegiado que seja.
        </Text>

        <Text style={styles.sectionTitle}>14. Contato</Text>
        <Text style={styles.paragraph}>
          Dúvidas ou problemas? Entre em contato:{'\n\n'}
          📧 Email: suporte@marepe.com.br{'\n'}
          📱 Dentro do app: Menu → Suporte{'\n\n'}
          <Text style={styles.bold}>MaréPE - Conectando você aos sabores da praia! 🦀</Text>
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ao continuar usando o MaréPE, você confirma que leu e concordou com estes Termos de Uso.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  intro: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 25,
    backgroundColor: '#F0F9FF',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E95822',
    marginTop: 25,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
  footer: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  footerText: {
    fontSize: 13,
    color: '#E65100',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },
});