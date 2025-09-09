import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAppStore } from '../stores/appStore';

export default function NotificationBell() {
  const { notifications, markNotificationAsRead } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationPress = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  const handleClearAll = () => {
    Toast.show({
      type: 'info',
      text1: 'Clear All Notifications',
      text2: 'Are you sure you want to mark all notifications as read?',
      onPress: () => {
        notifications.forEach(notification => {
          if (!notification.is_read) {
            markNotificationAsRead(notification.id);
          }
        });
        Toast.show({
          type: 'success',
          text1: 'Notifications Cleared',
          text2: 'All notifications have been marked as read.',
        });
      },
    });
  };

  return (
    <>
      <TouchableOpacity
        style={styles.bellContainer}
        onPress={() => setShowNotifications(true)}
      >
        <MaterialIcons name="notifications" size={24} color="#ffffff" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Notifications ({notifications.length})
              </Text>
              <View style={styles.modalActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClearAll}
                  >
                    <Text style={styles.clearButtonText}>Clear All</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowNotifications(false)}
                >
                  <MaterialIcons name="close" size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.scrollContainer}>
              {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIcon}>
                    <MaterialIcons name="notifications" size={48} color="#cbd5e1" />
                  </View>
                  <Text style={styles.emptyTitle}>
                    No notifications yet
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    You'll receive updates about your bookings here
                  </Text>
                </View>
              ) : (
                notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.is_read && styles.notificationItemUnread
                    ]}
                    onPress={() => handleNotificationPress(notification.id)}
                  >
                    <View style={styles.notificationLeft}>
                      <View style={[
                        styles.notificationDot,
                        {
                          backgroundColor:
                            notification.type === 'booking' ? '#2563eb' :
                            notification.type === 'payment' ? '#16a34a' :
                            notification.type === 'system' ? '#f59e0b' :
                            '#a855f7'
                        }
                      ]} />
                      <View style={styles.notificationContent}>
                        <Text style={[
                          styles.notificationTitle,
                          !notification.is_read && styles.notificationTitleUnread
                        ]}>
                          {notification.title}
                        </Text>
                        <Text style={[
                          styles.notificationMessage,
                          !notification.is_read && styles.notificationMessageUnread
                        ]}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {new Date(notification.created_at).toLocaleString()}
                        </Text>
                      </View>
                      {!notification.is_read && (
                        <View style={styles.unreadIndicator} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellContainer: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f43f5e', // Rose color for notification badge
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#475569',
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    fontSize: 18,
  },
  scrollContainer: {
    maxHeight: 320,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  notificationItemUnread: {
    backgroundColor: '#eff6ff',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationTitleUnread: {
    color: '#1e293b',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  notificationMessageUnread: {
    color: '#475569',
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
});