import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { tasksService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';

export default function MapScreen({ navigation }) {
  const { user } = useAuth();
  const [region, setRegion] = useState({
    latitude: -24.9555,
    longitude: -53.4552,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [filters, setFilters] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workers, setWorkers] = useState([]);

  const [taskRequestForm, setTaskRequestForm] = useState({
    name: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipcode: '',
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    getCurrentLocation();
    loadMapData();
    if (user?.role === 'admin') {
      loadWorkers();
    }
  }, [filters]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permissão de localização é necessária');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadMapData = async () => {
    try {
      setLoading(true);
      const filterParam = filters.length > 0 ? filters : null;
      const data = await tasksService.getMapData(user.cpf, filterParam);
      setPins(data.pins || []);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar dados do mapa.');
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    try {
      const { usersService } = require('../services/api');
      const data = await usersService.listUsers();
      const workerList = data.filter(u => u.role === 'worker');
      setWorkers(workerList);
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  };

  const handlePinPress = async (pin) => {
    setSelectedPin(pin);
    setLoadingDetails(true);
    setShowDetailsModal(true);
    
    try {
      const data = await tasksService.getTaskDetails(pin.type, pin.id);
      setDetails(data);
      // Update pin status in case it changed
      setPins(prevPins => prevPins.map(p => 
        p.id === pin.id ? { ...p, status: data.status } : p
      ));
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar detalhes.');
      console.error('Error loading details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateTaskRequest = async () => {
    if (!taskRequestForm.name || !taskRequestForm.street || !taskRequestForm.number) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (!taskRequestForm.latitude || !taskRequestForm.longitude) {
      Alert.alert('Erro', 'Localização não encontrada. Tente novamente.');
      return;
    }

    try {
      await tasksService.createTaskRequest(user.cpf, taskRequestForm);
      Alert.alert('Sucesso', 'Solicitação criada com sucesso!');
      setShowCreateModal(false);
      setTaskRequestForm({
        name: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipcode: '',
        latitude: null,
        longitude: null,
      });
      loadMapData();
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.errors?.join(', ') || 'Erro ao criar solicitação.');
      console.error('Error creating task request:', error);
    }
  };

  const handleStartTask = async () => {
    try {
      const updated = await tasksService.updateTaskStatus(user.cpf, selectedPin.id, 'in_progress');
      Alert.alert('Sucesso', 'Tarefa iniciada!');
      // Update details with the response - this will show the "Solicitar Aprovação" button
      setDetails(updated);
      // Update the pin status in the pins array
      setPins(prevPins => prevPins.map(pin => 
        pin.id === selectedPin.id ? { ...pin, status: updated.status } : pin
      ));
      // Update selectedPin status as well
      setSelectedPin({ ...selectedPin, status: updated.status });
      // Reload map data to ensure consistency
      loadMapData();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao iniciar tarefa.');
      console.error('Error starting task:', error);
    }
  };

  const handleRequestApproval = async () => {
    try {
      const updated = await tasksService.updateTaskStatus(user.cpf, selectedPin.id, 'approval_requested');
      Alert.alert('Sucesso', 'Aprovação solicitada!');
      // Update details with the response
      setDetails(updated);
      // Update the pin status
      setPins(prevPins => prevPins.map(pin => 
        pin.id === selectedPin.id ? { ...pin, status: updated.status } : pin
      ));
      setShowDetailsModal(false);
      loadMapData();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao solicitar aprovação.');
      console.error('Error requesting approval:', error);
    }
  };

  const handleAdminAction = async (actionType) => {
    try {
      const workerId = actionType === 'approve_task_request' ? selectedWorker : null;
      await tasksService.adminAction(user.cpf, selectedPin.id, actionType, workerId);
      Alert.alert('Sucesso', 'Ação realizada com sucesso!');
      setShowDetailsModal(false);
      setSelectedWorker(null);
      loadMapData();
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao realizar ação.');
      console.error('Error performing admin action:', error);
    }
  };

  const getStatusLabel = (status, type) => {
    if (type === 'task_request') {
      const statusMap = {
        'pending': 'Pendente',
        'approved': 'Aprovado',
        'refused': 'Recusado'
      };
      return statusMap[status] || status;
    } else {
      const statusMap = {
        'in_progress': 'Em Progresso',
        'approval_requested': 'Aguardando Aprovação',
        'approved_conclusion': 'Conclusão Aprovada',
        'refused_conclusion': 'Conclusão Recusada'
      };
      return statusMap[status] || status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getPinColor = (pin) => {
    if (pin.type === 'task_request') {
      if (pin.status === 'pending') return Colors.primary;
      if (pin.status === 'approved') return Colors.success;
      return Colors.error;
    } else {
      if (pin.status === 'in_progress') return Colors.primaryLight;
      if (pin.status === 'approval_requested') return '#FFA500';
      if (pin.status === 'approved_conclusion') return Colors.success;
      if (pin.status === 'refused_conclusion') return Colors.error;
      return Colors.textSecondary;
    }
  };

  const toggleFilter = (filterName) => {
    setFilters(prev => {
      if (prev.includes(filterName)) {
        return prev.filter(f => f !== filterName);
      } else {
        return [...prev, filterName];
      }
    });
  };

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nova Solicitação</Text>
          <ScrollView>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome da Tarefa</Text>
              <TextInput
                style={styles.input}
                value={taskRequestForm.name}
                onChangeText={(text) => setTaskRequestForm({ ...taskRequestForm, name: text })}
                placeholder="Ex: Pintura de parede"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Rua</Text>
              <TextInput
                style={styles.input}
                value={taskRequestForm.street}
                onChangeText={(text) => setTaskRequestForm({ ...taskRequestForm, street: text })}
                placeholder="Nome da rua"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Número</Text>
              <TextInput
                style={styles.input}
                value={taskRequestForm.number}
                onChangeText={(text) => setTaskRequestForm({ ...taskRequestForm, number: text })}
                placeholder="Número"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bairro</Text>
              <TextInput
                style={styles.input}
                value={taskRequestForm.neighborhood}
                onChangeText={(text) => setTaskRequestForm({ ...taskRequestForm, neighborhood: text })}
                placeholder="Bairro"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput
                style={styles.input}
                value={taskRequestForm.city}
                onChangeText={(text) => setTaskRequestForm({ ...taskRequestForm, city: text })}
                placeholder="Cidade"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Estado</Text>
              <TextInput
                style={styles.input}
                value={taskRequestForm.state}
                onChangeText={(text) => setTaskRequestForm({ ...taskRequestForm, state: text })}
                placeholder="Estado"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>CEP</Text>
              <TextInput
                style={styles.input}
                value={taskRequestForm.zipcode}
                onChangeText={(text) => setTaskRequestForm({ ...taskRequestForm, zipcode: text })}
                placeholder="00000-000"
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={async () => {
                const location = await Location.getCurrentPositionAsync({});
                setTaskRequestForm({
                  ...taskRequestForm,
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                });
                Alert.alert('Sucesso', 'Localização obtida!');
              }}
            >
              <Text style={styles.locationButtonText}>Obter Localização Atual</Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleCreateTaskRequest}
            >
              <Text style={styles.saveButtonText}>Criar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDetailsModal = () => {
    if (!selectedPin || !details) return null;

    return (
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {loadingDetails ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <>
                <Text style={styles.modalTitle}>{details.name}</Text>
                <ScrollView>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={styles.detailValue}>{getStatusLabel(details.status, selectedPin.type)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Endereço:</Text>
                    <Text style={styles.detailValue}>
                      {details.address.street}, {details.address.number} - {details.address.neighborhood}
                    </Text>
                  </View>
                  {details.citizen && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Solicitante:</Text>
                      <Text style={styles.detailValue}>{details.citizen.name}</Text>
                    </View>
                  )}
                  {details.worker && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Trabalhador:</Text>
                      <Text style={styles.detailValue}>{details.worker.name}</Text>
                    </View>
                  )}
                  {details.initial_date && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Data Início:</Text>
                      <Text style={styles.detailValue}>{formatDate(details.initial_date)}</Text>
                    </View>
                  )}
                  {details.limit_end_date && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Prazo:</Text>
                      <Text style={styles.detailValue}>{formatDate(details.limit_end_date)}</Text>
                    </View>
                  )}
                  {details.conclusion_date && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Data de Conclusão:</Text>
                      <Text style={styles.detailValue}>{formatDate(details.conclusion_date)}</Text>
                    </View>
                  )}

                  {/* Role-based actions */}
                  {user.role === 'worker' && selectedPin.type === 'task' && (
                    <View style={styles.actionsContainer}>
                      {details.status === 'in_progress' && !details.initial_date && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={handleStartTask}
                        >
                          <Text style={styles.actionButtonText}>Iniciar Tarefa</Text>
                        </TouchableOpacity>
                      )}
                      {details.status === 'in_progress' && details.initial_date && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={handleRequestApproval}
                        >
                          <Text style={styles.actionButtonText}>Solicitar Aprovação</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {user.role === 'admin' && (
                    <View style={styles.actionsContainer}>
                      {selectedPin.type === 'task_request' && details.status === 'pending' && (
                        <>
                          <Text style={styles.label}>Atribuir Trabalhador:</Text>
                          <ScrollView horizontal style={styles.workerList}>
                            {workers.map(worker => (
                              <TouchableOpacity
                                key={worker.id}
                                style={[
                                  styles.workerChip,
                                  selectedWorker === worker.id && styles.workerChipSelected
                                ]}
                                onPress={() => setSelectedWorker(worker.id)}
                              >
                                <Text style={[
                                  styles.workerChipText,
                                  selectedWorker === worker.id && styles.workerChipTextSelected
                                ]}>
                                  {worker.name}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() => handleAdminAction('approve_task_request')}
                            disabled={!selectedWorker}
                          >
                            <Text style={styles.actionButtonText}>Aprovar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.refuseButton]}
                            onPress={() => handleAdminAction('refuse_task_request')}
                          >
                            <Text style={styles.actionButtonText}>Recusar</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {selectedPin.type === 'task' && details.status === 'approval_requested' && (
                        <>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() => handleAdminAction('approve_task')}
                          >
                            <Text style={styles.actionButtonText}>Aprovar Conclusão</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.refuseButton]}
                            onPress={() => handleAdminAction('refuse_task')}
                          >
                            <Text style={styles.actionButtonText}>Recusar Conclusão</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                </ScrollView>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDetailsModal(false)}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filtros</Text>
          <ScrollView>
            {[
              { key: 'pending_task_requests', label: 'Solicitações Pendentes' },
              { key: 'tasks_without_worker', label: 'Tarefas sem Trabalhador' },
              { key: 'tasks_not_started', label: 'Tarefas Não Iniciadas' },
              { key: 'tasks_pending_approval', label: 'Tarefas Aguardando Aprovação' },
              { key: 'tasks_refused', label: 'Tarefas Recusadas' },
              { key: 'tasks_concluded', label: 'Tarefas Concluídas' },
            ].map(filter => (
              <TouchableOpacity
                key={filter.key}
                style={styles.filterItem}
                onPress={() => toggleFilter(filter.key)}
              >
                <View style={styles.checkbox}>
                  {filters.includes(filter.key) && <View style={styles.checkboxChecked} />}
                </View>
                <Text style={styles.filterLabel}>{filter.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.closeButtonText}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa</Text>
        {user?.role === 'admin' && (
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            style={styles.filterButton}
          >
            <Text style={styles.filterButtonText}>Filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar endereço..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {pins.map((pin) => (
          <Marker
            key={`${pin.type}-${pin.id}`}
            coordinate={{
              latitude: pin.latitude,
              longitude: pin.longitude,
            }}
            pinColor={getPinColor(pin)}
            onPress={() => handlePinPress(pin)}
          />
        ))}
      </MapView>

      {user?.role === 'citizen' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {renderCreateModal()}
      {renderDetailsModal()}
      {renderFilterModal()}
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
  filterButton: {
    padding: 8,
  },
  filterButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  locationButton: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  locationButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
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
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.text,
  },
  actionsContainer: {
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  refuseButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  workerList: {
    marginVertical: 12,
  },
  workerChip: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  workerChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  workerChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  workerChipTextSelected: {
    color: Colors.white,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 16,
    height: 16,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  filterLabel: {
    fontSize: 16,
    color: Colors.text,
  },
});

