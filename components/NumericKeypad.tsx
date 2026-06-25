import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface NumericKeypadProps {
  amountCents: number;
  onAmountChange: (nextAmountCents: number) => void;
}

const formatCurrency = (cents: number) => {
  const value = (cents / 100).toFixed(2).replace('.', ',');
  return `R$ ${value}`;
};

export default function NumericKeypad({ amountCents, onAmountChange }: NumericKeypadProps) {
  const handleDigitPress = (digit: string) => {
    const nextAmount = amountCents * 10 + Number(digit);
    if (nextAmount <= 999999999) {
      onAmountChange(nextAmount);
    }
  };

  const handleBackspace = () => {
    onAmountChange(Math.floor(amountCents / 10));
  };

  const handleSeparator = () => {
    // O teclado numérico já insere valores em centavos automaticamente.
    // O botão de vírgula/ponto é exibido para conforto do usuário,
    // mas não altera o comportamento do valor atual.
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>{formatCurrency(amountCents)}</Text>
      </View>

      <View style={styles.row}>
        {['1', '2', '3'].map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.key}
            onPress={() => handleDigitPress(item)}
          >
            <Text style={styles.keyText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        {['4', '5', '6'].map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.key}
            onPress={() => handleDigitPress(item)}
          >
            <Text style={styles.keyText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        {['7', '8', '9'].map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.key}
            onPress={() => handleDigitPress(item)}
          >
            <Text style={styles.keyText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.key} onPress={handleSeparator}>
          <Text style={styles.keyText}>,</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={() => handleDigitPress('0')}>
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={handleBackspace}>
          <Text style={styles.keyText}>⌫</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  displayContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  displayText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  key: {
    flex: 1,
    marginHorizontal: 4,
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
});
