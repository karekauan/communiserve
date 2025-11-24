import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { usersService } from '../services/api';
import { Colors } from '../constants/colors';

export default function UserDetailScreen({ navigation, route }) {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
    loadSkills();
  }, [userId]);

  const loadUser = async () => {
    try {
      const data = await usersService.getUser(userId);
      setUser(data);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone,
        birthday: data.birthday,
        cpf: data.cpf,
        street: data.address?.street || '',
        number: data.address?.number || '',
        neighborhood: data.address?.neighborhood || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
        zipcode: data.address?.zipcode || '',
      });
      setSelectedSkills(data.skills.map(s => s.id));
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar usuário. Tente novamente.');
      console.error('Error loading user:', error);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadSkills = async () => {
    try {
      const data = await usersService.getSkills();
      setAvailableSkills(data);
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const handleEdit = () => {
    if (user.role !== 'worker') {
      Alert.alert('Aviso', 'Apenas trabalhadores podem ser editados.');
      return;
    }
    setEditing(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birthday: formData.birthday,
        cpf: formData.cpf,
        address_attributes: {
          street: formData.street,
          number: formData.number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipcode,
        },
      };

      const updated = await usersService.updateWorker(userId, userData, selectedSkills);
      setUser(updated);
      setEditing(false);
      Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.errors?.join(', ') || 'Erro ao atualizar usuário. Tente novamente.');
      console.error('Error updating user:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    loadUser();
  };

  const toggleSkill = (skillId) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      } else {
        return [...prev, skillId];
      }
    });
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Usuário</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Nome</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              ) : (
                <Text style={styles.value}>{user.name}</Text>
              )}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>CPF</Text>
              <Text style={styles.value}>{user.cpf}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                />
              ) : (
                <Text style={styles.value}>{user.email}</Text>
              )}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Telefone</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.value}>{user.phone}</Text>
              )}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <Text style={styles.value}>{user.birthday}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Função</Text>
              <View style={[styles.roleBadge, user.role === 'worker' ? styles.workerBadge : styles.citizenBadge]}>
                <Text style={styles.roleText}>
                  {user.role === 'worker' ? 'Trabalhador' : 'Cidadão'}
                </Text>
              </View>
            </View>
          </View>

          {user.address && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Endereço</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Rua</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.street}
                    onChangeText={(text) => setFormData({ ...formData, street: text })}
                  />
                ) : (
                  <Text style={styles.value}>{user.address.street}</Text>
                )}
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Número</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.number}
                    onChangeText={(text) => setFormData({ ...formData, number: text })}
                  />
                ) : (
                  <Text style={styles.value}>{user.address.number}</Text>
                )}
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Bairro</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.neighborhood}
                    onChangeText={(text) => setFormData({ ...formData, neighborhood: text })}
                  />
                ) : (
                  <Text style={styles.value}>{user.address.neighborhood}</Text>
                )}
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Cidade</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.city}
                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                  />
                ) : (
                  <Text style={styles.value}>{user.address.city}</Text>
                )}
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Estado</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.state}
                    onChangeText={(text) => setFormData({ ...formData, state: text })}
                  />
                ) : (
                  <Text style={styles.value}>{user.address.state}</Text>
                )}
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>CEP</Text>
                {editing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.zipcode}
                    onChangeText={(text) => setFormData({ ...formData, zipcode: text })}
                  />
                ) : (
                  <Text style={styles.value}>{user.address.zipcode}</Text>
                )}
              </View>
            </View>
          )}

          {user.role === 'worker' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Habilidades</Text>
              {editing ? (
                <View style={styles.skillsContainer}>
                  {availableSkills.map((skill) => (
                    <TouchableOpacity
                      key={skill.id}
                      style={[
                        styles.skillChip,
                        selectedSkills.includes(skill.id) && styles.skillChipSelected,
                      ]}
                      onPress={() => toggleSkill(skill.id)}
                    >
                      <Text
                        style={[
                          styles.skillChipText,
                          selectedSkills.includes(skill.id) && styles.skillChipTextSelected,
                        ]}
                      >
                        {skill.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.skillsContainer}>
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill) => (
                      <View key={skill.id} style={styles.skillChip}>
                        <Text style={styles.skillChipText}>{skill.name}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noSkillsText}>Nenhuma habilidade atribuída</Text>
                  )}
                </View>
              )}
            </View>
          )}

          {!editing && user.role === 'worker' && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEdit}
            >
              <Text style={styles.editButtonText}>Editar</Text>
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
    </View>
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  field: {
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
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 12,
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
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  skillChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  skillChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  skillChipTextSelected: {
    color: Colors.white,
  },
  noSkillsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
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

