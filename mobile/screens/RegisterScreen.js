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

export default function RegisterScreen({ navigation, route }) {
  const { login } = useAuth();
  const cpfFromLogin = route?.params?.cpf || '';
  
  const [formData, setFormData] = useState({
    cpf: cpfFromLogin,
    name: '',
    birthday: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipcode: '',
  });

  const [loading, setLoading] = useState(false);

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

  const formatPhone = (text) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 7) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
      }
    }
    return text;
  };

  const formatZipcode = (text) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 8) {
      if (numbers.length <= 5) {
        return numbers;
      } else {
        return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
      }
    }
    return text;
  };

  const formatDate = (text) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 8) {
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 4) {
        return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
      } else {
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
      }
    }
    return text;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cpf') {
      formattedValue = formatCpf(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'zipcode') {
      formattedValue = formatZipcode(value);
    } else if (field === 'birthday') {
      formattedValue = formatDate(value);
    }
    
    setFormData({ ...formData, [field]: formattedValue });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome');
      return false;
    }
    if (!formData.birthday || formData.birthday.replace(/\D/g, '').length !== 8) {
      Alert.alert('Erro', 'Por favor, preencha a data de nascimento (DD/MM/AAAA)');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Erro', 'Por favor, preencha um email válido');
      return false;
    }
    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Erro', 'Por favor, preencha um telefone válido');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }
    if (!formData.street.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a rua');
      return false;
    }
    if (!formData.number.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o número');
      return false;
    }
    if (!formData.neighborhood.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o bairro');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a cidade');
      return false;
    }
    if (!formData.state.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o estado');
      return false;
    }
    if (!formData.zipcode || formData.zipcode.replace(/\D/g, '').length !== 8) {
      Alert.alert('Erro', 'Por favor, preencha um CEP válido');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const birthdayParts = formData.birthday.split('/');
      const birthday = `${birthdayParts[2]}-${birthdayParts[1]}-${birthdayParts[0]}`;
      
      const userData = {
        cpf: formData.cpf.replace(/\D/g, ''),
        name: formData.name.trim(),
        birthday: birthday,
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        password: formData.password,
        address_attributes: {
          street: formData.street.trim(),
          number: formData.number.trim(),
          neighborhood: formData.neighborhood.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipcode: formData.zipcode.replace(/\D/g, ''),
        },
      };

      const response = await authService.register(userData);
      
      if (response.user) {
        await login(response.user);
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            },
          },
        ]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errors 
        ? error.response.data.errors.join('\n')
        : 'Erro ao realizar cadastro. Tente novamente.';
      Alert.alert('Erro', errorMessage);
      console.error('Error registering:', error);
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
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Preencha os dados abaixo</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>CPF</Text>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                value={formatCpf(formData.cpf)}
                onChangeText={(text) => handleInputChange('cpf', text)}
                keyboardType="numeric"
                maxLength={14}
                editable={!cpfFromLogin}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                value={formData.birthday}
                onChangeText={(text) => handleInputChange('birthday', text)}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Endereço</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Rua</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome da rua"
                value={formData.street}
                onChangeText={(text) => handleInputChange('street', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Número</Text>
              <TextInput
                style={styles.input}
                placeholder="Número"
                value={formData.number}
                onChangeText={(text) => handleInputChange('number', text)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bairro</Text>
              <TextInput
                style={styles.input}
                placeholder="Bairro"
                value={formData.neighborhood}
                onChangeText={(text) => handleInputChange('neighborhood', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput
                style={styles.input}
                placeholder="Cidade"
                value={formData.city}
                onChangeText={(text) => handleInputChange('city', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Estado</Text>
              <TextInput
                style={styles.input}
                placeholder="Estado"
                value={formData.state}
                onChangeText={(text) => handleInputChange('state', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>CEP</Text>
              <TextInput
                style={styles.input}
                placeholder="00000-000"
                value={formData.zipcode}
                onChangeText={(text) => handleInputChange('zipcode', text)}
                keyboardType="numeric"
                maxLength={9}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkText}>Voltar</Text>
          </TouchableOpacity>
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
    padding: 24,
  },
  content: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
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

