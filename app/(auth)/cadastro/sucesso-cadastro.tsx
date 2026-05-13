import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import LogoMaré from '../../../assets/images/logo.png';

export default function SucessoCadastro() {
  const { nome, role } = useLocalSearchParams();
  const [etapa, setEtapa] = useState<'carregando' | 'sucesso' | 'bem-vindo'>('carregando');

  useEffect(() => {
    if (etapa === 'carregando') {
      const timerSucesso = setTimeout(() => setEtapa('sucesso'), 2000); 
      return () => clearTimeout(timerSucesso);
    }
    
    if (etapa === 'sucesso') {
      const timerBoasVindas = setTimeout(() => setEtapa('bem-vindo'), 1500); 
      return () => clearTimeout(timerBoasVindas);
    }

    if (etapa === 'bem-vindo') {
      const timerFinal = setTimeout(() => {
        router.replace({
          pathname: '/(auth)/sucesso', 
          params: { role: role } 
        });
      }, 2500); 
      return () => clearTimeout(timerFinal);
    }
  }, [etapa]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={LogoMaré} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tituloLogo}>MaréPE</Text>
      </View>

      {/* RENDERIZAÇÃO CONDICIONAL BASEADA NA ETAPA */}
      <View style={styles.content}>
        
        {etapa === 'carregando' && (
          <View style={styles.innerContent}>
            <ActivityIndicator size="large" color="#FF5733" style={styles.loader} />
            <Text style={styles.statusText}>Finalizando o cadastro</Text>
          </View>
        )}

        {etapa === 'sucesso' && (
          <View style={styles.innerContent}>
            <MaterialCommunityIcons name="check-circle" size={80} color="#79FF79" />
            <Text style={styles.statusText}>Cadastro finalizado</Text>
          </View>
        )}

        {etapa === 'bem-vindo' && (
          <View style={styles.innerContent}>
            <Text style={styles.textoNormal}>
              <Text style={styles.negrito}>{nome}</Text>,{"\n"}
              Seja bem-vindo ao <Text style={styles.negrito}>MaréPE!</Text>
            </Text>
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    position: 'absolute', // Mantém o logo no mesmo lugar sempre
    top: '15%',
  },
  logo: {
    width: 200,
    height: 150,
  },
  tituloLogo: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    marginTop: 100,
    alignItems: 'center',
  },
  innerContent: {
    alignItems: 'center',
  },
  loader: {
    marginBottom: 20,
    transform: [{ scale: 1.5 }], // Deixa o loading maior
  },
  statusText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  textoNormal: {
    fontSize: 26,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 35,
  },
  negrito: {
    fontWeight: 'bold',
  },
});