import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingCpf, setCheckingCpf] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formatCpf = (text) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length <= 3) {
        return numbers;
      } else if (numbers.length <= 6) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
      } else if (numbers.length <= 9) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
      } else {
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
      }
    }
    return text;
  };

  const handleCheckCpf = async () => {
    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      Alert.alert('Erro', 'Por favor, insira um CPF válido (11 dígitos)');
      return;
    }

    setCheckingCpf(true);
    try {
      const cpfNumbers = cpf.replace(/\D/g, '');
      const response = await authService.checkCpf(cpfNumbers);
      
      if (response.exists) {
        setShowPassword(true);
      } else {
        navigation.navigate('Register', { cpf: cpfNumbers });
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao verificar CPF. Tente novamente.';
      Alert.alert('Erro', errorMessage);
      console.error('Error checking CPF:', error);
    } finally {
      setCheckingCpf(false);
    }
  };

  const handleLogin = async () => {
    if (!password) {
      Alert.alert('Erro', 'Por favor, insira sua senha');
      return;
    }

    setLoading(true);
    try {
      const cpfNumbers = cpf.replace(/\D/g, '');
      const response = await authService.login(cpfNumbers, password);
      
      if (response.user) {
        await login(response.user);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao fazer login. Tente novamente.');
      console.error('Error logging in:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Communiserve</Text>
          <Text style={styles.subtitle}>Bem-vindo de volta!</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={(text) => setCpf(formatCpf(text))}
              keyboardType="numeric"
              maxLength={14}
              editable={!showPassword}
            />
          </View>

          {!showPassword ? (
            <TouchableOpacity
              style={styles.button}
              onPress={handleCheckCpf}
              disabled={checkingCpf}
            >
              {checkingCpf ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Continuar</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => {
                  setShowPassword(false);
                  setPassword('');
                }}
              >
                <Text style={styles.linkText}>Voltar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.primary,
    fontSize: 16,
  },
});

