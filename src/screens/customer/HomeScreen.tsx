import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';

// Import services and stores
import { AuthService } from '@/services/supabase/auth';
import { useAppStore, useUser } from '@/stores/appStore';

// Import types
import { CustomerTabParamList } from '@/types/navigation';

type HomeScreenNavigationProp = StackNavigationProp<CustomerTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const user = useUser();
  const { setLoading } = useAppStore();

  const handleBookRide = () => {
    navigation.navigate('BookRide');
  };

  const handleViewHistory = () => {
    navigation.navigate('RideHistory');
  };

  const handleViewProfile = () => {
    navigation.navigate('Profile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await AuthService.signOut();
            setLoading(false);
          },
        },
      ]
    );
  };

  const quickActions = [
    {
      title: 'Book a Ride',
      subtitle: 'Find and book your next ride',
      icon: 'directions-car',
      iconType: 'MaterialIcons',
      onPress: handleBookRide,
      color: '#f59e0b',
    },
    {
      title: 'Ride History',
      subtitle: 'View your past rides',
      icon: 'history',
      iconType: 'MaterialIcons',
      onPress: handleViewHistory,
      color: '#f59e0b',
    },
    {
      title: 'My Profile',
      subtitle: 'Manage your account',
      icon: 'person',
      iconType: 'MaterialIcons',
      onPress: handleViewProfile,
      color: '#f59e0b',
    },
    {
      title: 'Support',
      subtitle: 'Get help and support',
      icon: 'help',
      iconType: 'MaterialIcons',
      onPress: () => navigation.navigate('Support'),
      color: '#f59e0b',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.full_name || 'Customer'}</Text>
        <Text style={styles.subtitle}>Ready for your next ride?</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { borderLeftColor: action.color }]}
              onPress={action.onPress}
            >
              <View style={styles.actionIcon}>
                <MaterialIcons name={action.icon as any} size={28} color="#f59e0b" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>
            No recent rides. Book your first ride to get started!
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
  },
  header: {
    backgroundColor: '#fef3c7',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    shadowColor: '#f59e0b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#92400e',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#92400e',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#78350f',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.1)',
    shadowColor: '#f59e0b',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#78350f',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 16,
  },
  activitySection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  activityText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 24,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});