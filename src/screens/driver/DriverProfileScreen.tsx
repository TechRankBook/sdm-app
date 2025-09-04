import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

// Import services and stores
import { AuthService } from '@/services/supabase/auth';
import { useAppStore, useUser } from '@/stores/appStore';

export default function DriverProfileScreen() {
  const user = useUser();
  const { setLoading } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.full_name || '');
  const [editedPhone, setEditedPhone] = useState(user?.phone || '');

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const { error } = await AuthService.updateProfile(user!.id, {
        full_name: editedName.trim(),
        phone: editedPhone.trim() || undefined,
      });

      if (error) {
        Alert.alert('Error', 'Failed to update profile');
      } else {
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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

  // Mock driver stats
  const driverStats = [
    {
      label: 'Total Rides',
      value: '1,247',
      icon: '🚗',
    },
    {
      label: 'Rating',
      value: '4.7',
      icon: '⭐',
    },
    {
      label: 'Completion Rate',
      value: '98%',
      icon: '✅',
    },
    {
      label: 'Member Since',
      value: 'Jan 2024',
      icon: '📅',
    },
  ];

  const menuItems = [
    {
      title: 'Vehicle Information',
      subtitle: 'Manage your vehicle details',
      icon: '🚙',
      onPress: () => Alert.alert('Coming Soon', 'Vehicle management coming soon'),
    },
    {
      title: 'Documents',
      subtitle: 'License, insurance, permits',
      icon: '📄',
      onPress: () => Alert.alert('Coming Soon', 'Document management coming soon'),
    },
    {
      title: 'Bank Details',
      subtitle: 'Update payment information',
      icon: '🏦',
      onPress: () => Alert.alert('Coming Soon', 'Bank details coming soon'),
    },
    {
      title: 'Notifications',
      subtitle: 'Manage app notifications',
      icon: '🔔',
      onPress: () => Alert.alert('Coming Soon', 'Notifications settings coming soon'),
    },
    {
      title: 'Support',
      subtitle: 'Get help and contact us',
      icon: '🆘',
      onPress: () => Alert.alert('Coming Soon', 'Support coming soon'),
    },
    {
      title: 'Settings',
      subtitle: 'App preferences and privacy',
      icon: '⚙️',
      onPress: () => Alert.alert('Coming Soon', 'Settings coming soon'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.full_name?.charAt(0)?.toUpperCase() || 'D'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter your name"
              autoCapitalize="words"
              placeholderTextColor="#64748b"
            />
          ) : (
            <Text style={styles.userName}>{user?.full_name || 'Driver'}</Text>
          )}
          <Text style={styles.userEmail}>{user?.email}</Text>
          {isEditing ? (
            <TextInput
              style={styles.phoneInput}
              value={editedPhone}
              onChangeText={setEditedPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              placeholderTextColor="#64748b"
            />
          ) : (
            <Text style={styles.userPhone}>
              {user?.phone || 'No phone number'}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              handleSaveProfile();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Driver Stats */}
      <View style={styles.statsContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          {driverStats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>{item.icon}</Text>
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#16a34a', // Green for drivers
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#64748b',
  },
  nameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  phoneInput: {
    fontSize: 14,
    color: '#64748b',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  menuItemArrow: {
    fontSize: 18,
    color: '#cbd5e1',
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});