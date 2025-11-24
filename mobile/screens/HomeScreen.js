import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { tasksService } from '../services/api';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await tasksService.getDashboard(user.cpf);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrador',
      citizen: 'Cidadão',
      worker: 'Trabalhador',
    };
    return roles[role] || role;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Bom dia';
    } else if (hour >= 12 && hour < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderCitizenContent = () => {
    if (!dashboardData) return null;
    
    return (
      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardData.total_task_requests || 0}</Text>
            <Text style={styles.statLabel}>Solicitações</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardData.total_approved || 0}</Text>
            <Text style={styles.statLabel}>Aprovadas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solicitações Aprovadas</Text>
          {dashboardData.approved_list && dashboardData.approved_list.length > 0 ? (
            dashboardData.approved_list.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <Text style={styles.listItemTitle}>{item.name}</Text>
                <Text style={styles.listItemText}>
                  Início: {formatDate(item.initial_date)}
                </Text>
                <Text style={styles.listItemText}>
                  Fim: {formatDate(item.end_date)}
                </Text>
                <Text style={styles.listItemAddress}>
                  {item.address.street}, {item.address.number} - {item.address.neighborhood}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma solicitação aprovada</Text>
          )}
        </View>
      </View>
    );
  };

  const renderWorkerContent = () => {
    if (!dashboardData) return null;
    
    return (
      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardData.total_approval_requested || 0}</Text>
            <Text style={styles.statLabel}>Aguardando Aprovação</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardData.total_approved_conclusion || 0}</Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarefas Atribuídas</Text>
          {dashboardData.attached_tasks && dashboardData.attached_tasks.length > 0 ? (
            dashboardData.attached_tasks.map((task) => (
              <View key={task.id} style={styles.listItem}>
                <Text style={styles.listItemTitle}>{task.name}</Text>
                <Text style={styles.listItemText}>
                  Local: {task.local}
                </Text>
                <Text style={styles.listItemText}>
                  Prazo: {formatDate(task.limit_end_date)}
                </Text>
                <View style={[styles.statusBadge, task.status === 'approved_conclusion' ? styles.statusSuccess : styles.statusPending]}>
                  <Text style={styles.statusText}>
                    {task.status === 'approved_conclusion' ? 'Concluída' : 'Aguardando Aprovação'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma tarefa atribuída</Text>
          )}
        </View>
      </View>
    );
  };

  const renderAdminContent = () => {
    if (!dashboardData) return null;
    
    return (
      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardData.total_task_requests || 0}</Text>
            <Text style={styles.statLabel}>Solicitações</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboardData.total_validated_tasks || 0}</Text>
            <Text style={styles.statLabel}>Validadas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solicitações Pendentes</Text>
          {dashboardData.pending_task_requests && dashboardData.pending_task_requests.length > 0 ? (
            dashboardData.pending_task_requests.map((tr) => (
              <View key={tr.id} style={styles.listItem}>
                <Text style={styles.listItemTitle}>{tr.name}</Text>
                <Text style={styles.listItemText}>Solicitante: {tr.citizen_name}</Text>
                <Text style={styles.listItemAddress}>
                  {tr.address.street}, {tr.address.number} - {tr.address.neighborhood}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma solicitação pendente</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarefas Aguardando Aprovação</Text>
          {dashboardData.pending_tasks && dashboardData.pending_tasks.length > 0 ? (
            dashboardData.pending_tasks.map((task) => (
              <View key={task.id} style={styles.listItem}>
                <Text style={styles.listItemTitle}>{task.name}</Text>
                <Text style={styles.listItemText}>Trabalhador: {task.worker_name || 'Não atribuído'}</Text>
                <Text style={styles.listItemText}>
                  Prazo: {formatDate(task.limit_end_date)}
                </Text>
                <Text style={styles.listItemAddress}>
                  {task.address.street}, {task.address.number} - {task.address.neighborhood}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma tarefa aguardando aprovação</Text>
          )}
        </View>
      </View>
    );
  };

  const renderRoleContent = () => {
    switch (user?.role) {
      case 'citizen':
        return renderCitizenContent();
      case 'worker':
        return renderWorkerContent();
      case 'admin':
        return renderAdminContent();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Communiserve</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.greetingCard}>
          <Text style={styles.greetingText}>{getGreeting()},</Text>
          <Text style={styles.nameText}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleLabel(user?.role)}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          renderRoleContent()
        )}

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileButtonText}>Meu Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.mapButtonText}>Ver Mapa</Text>
        </TouchableOpacity>

        {user?.role === 'admin' && (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <Text style={styles.adminButtonText}>Gerenciar Usuários</Text>
          </TouchableOpacity>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: Colors.white,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  greetingCard: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greetingText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  roleText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
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
  listItem: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  listItemAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 16,
    fontStyle: 'italic',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  statusSuccess: {
    backgroundColor: Colors.success,
  },
  statusPending: {
    backgroundColor: Colors.primaryLight,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  profileButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  profileButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  mapButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  mapButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  adminButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  adminButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
