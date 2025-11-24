import React, { useState, useEffect } from 'react';
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
import { profileService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  const isWorker = user?.role === 'worker';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile(user.cpf);
      setProfile(data);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone,
        birthday: formatDateForDisplay(data.birthday),
        street: data.address?.street || '',
        number: data.address?.number || '',
        neighborhood: data.address?.neighborhood || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
        zipcode: data.address?.zipcode || '',
      });
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar perfil. Tente novamente.');
      console.error('Error loading profile:', error);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
    
    if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'zipcode') {
      formattedValue = formatZipcode(value);
    } else if (field === 'birthday') {
      formattedValue = formatDate(value);
    }
    
    setFormData({ ...formData, [field]: formattedValue });
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    loadProfile();
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Erro', 'Por favor, preencha um email válido');
      return;
    }
    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Erro', 'Por favor, preencha um telefone válido');
      return;
    }

    setSaving(true);
    try {
      const birthdayParts = formData.birthday.split('/');
      const birthday = `${birthdayParts[2]}-${birthdayParts[1]}-${birthdayParts[0]}`;
      
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        birthday: birthday,
        address_attributes: {
          street: formData.street.trim(),
          number: formData.number.trim(),
          neighborhood: formData.neighborhood.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipcode: formData.zipcode.replace(/\D/g, ''),
        },
      };

      const updated = await profileService.updateProfile(user.cpf, userData);
      setProfile(updated);
      setEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      const errorMessage = error.response?.data?.errors 
        ? error.response.data.errors.join('\n')
        : error.response?.data?.error || 'Erro ao atualizar perfil. Tente novamente.';
      Alert.alert('Erro', errorMessage);
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>CPF</Text>
              <Text style={styles.value}>{profile.cpf}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                />
              ) : (
                <Text style={styles.value}>{profile.name}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <Text style={styles.value}>{formatDateForDisplay(profile.birthday)}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.value}>{profile.email}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Telefone</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              ) : (
                <Text style={styles.value}>{profile.phone}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Função</Text>
              <View style={[styles.roleBadge, isWorker ? styles.workerBadge : styles.citizenBadge]}>
                <Text style={styles.roleText}>
                  {isWorker ? 'Trabalhador' : profile.role === 'admin' ? 'Administrador' : 'Cidadão'}
                </Text>
              </View>
            </View>

            {isWorker && profile.skills && profile.skills.length > 0 && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Habilidades</Text>
                <View style={styles.skillsContainer}>
                  {profile.skills.map((skill) => (
                    <View key={skill.id} style={styles.skillChip}>
                      <Text style={styles.skillChipText}>{skill.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {profile.address && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Endereço</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Rua</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.street}
                    onChangeText={(text) => handleInputChange('street', text)}
                  />
                ) : (
                  <Text style={styles.value}>{profile.address.street}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Número</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.number}
                    onChangeText={(text) => handleInputChange('number', text)}
                    keyboardType="numeric"
                  />
                ) : (
                  <Text style={styles.value}>{profile.address.number}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Bairro</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.neighborhood}
                    onChangeText={(text) => handleInputChange('neighborhood', text)}
                  />
                ) : (
                  <Text style={styles.value}>{profile.address.neighborhood}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Cidade</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.city}
                    onChangeText={(text) => handleInputChange('city', text)}
                  />
                ) : (
                  <Text style={styles.value}>{profile.address.city}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Estado</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.state}
                    onChangeText={(text) => handleInputChange('state', text)}
                  />
                ) : (
                  <Text style={styles.value}>{profile.address.state}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>CEP</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.zipcode}
                    onChangeText={(text) => handleInputChange('zipcode', text)}
                    keyboardType="numeric"
                    maxLength={9}
                  />
                ) : (
                  <Text style={styles.value}>{profile.address.zipcode}</Text>
                )}
              </View>
            </View>
          )}

          {!isWorker && !editing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEdit}
            >
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          )}

          {editing && (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
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
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  placeholder: {
    width: 80,
  },
  scrollContent: {
    padding: 24,
  },
  content: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: Colors.text,
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
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  workerBadge: {
    backgroundColor: Colors.primaryLight,
  },
  citizenBadge: {
    backgroundColor: Colors.secondary,
  },
  roleText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillChipText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

