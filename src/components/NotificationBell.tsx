import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppStore } from '../stores/appStore';

export default function NotificationBell() {
  const { notifications, markNotificationAsRead } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationPress = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          onPress: () => {
            notifications.forEach(notification => {
              if (!notification.is_read) {
                markNotificationAsRead(notification.id);
              }
            });
          }
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        className="relative p-2"
        onPress={() => setShowNotifications(true)}
      >
        <Text className="text-xl">🔔</Text>
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 items-center justify-center">
            <Text className="text-white text-xs font-bold">
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
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl max-h-96">
            <View className="flex-row items-center justify-between p-4 border-b border-slate-200">
              <Text className="text-lg font-semibold text-slate-800">
                Notifications ({notifications.length})
              </Text>
              <View className="flex-row gap-3">
                {unreadCount > 0 && (
                  <TouchableOpacity
                    className="px-3 py-1 bg-slate-100 rounded-lg"
                    onPress={handleClearAll}
                  >
                    <Text className="text-sm text-slate-600">Clear All</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className="px-3 py-1"
                  onPress={() => setShowNotifications(false)}
                >
                  <Text className="text-lg">✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="max-h-80">
              {notifications.length === 0 ? (
                <View className="p-8 items-center">
                  <Text className="text-4xl mb-4">🔔</Text>
                  <Text className="text-slate-500 text-center">
                    No notifications yet
                  </Text>
                  <Text className="text-slate-400 text-sm text-center mt-2">
                    You'll receive updates about your bookings here
                  </Text>
                </View>
              ) : (
                notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    className={`p-4 border-b border-slate-100 ${
                      !notification.is_read ? 'bg-blue-50' : 'bg-white'
                    }`}
                    onPress={() => handleNotificationPress(notification.id)}
                  >
                    <View className="flex-row items-start gap-3">
                      <View className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'booking' ? 'bg-blue-500' :
                        notification.type === 'payment' ? 'bg-green-500' :
                        notification.type === 'system' ? 'bg-yellow-500' :
                        'bg-purple-500'
                      }`} />
                      <View className="flex-1">
                        <Text className={`font-medium mb-1 ${
                          !notification.is_read ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {notification.title}
                        </Text>
                        <Text className={`text-sm mb-2 ${
                          !notification.is_read ? 'text-slate-700' : 'text-slate-500'
                        }`}>
                          {notification.message}
                        </Text>
                        <Text className="text-xs text-slate-400">
                          {new Date(notification.created_at).toLocaleString()}
                        </Text>
                      </View>
                      {!notification.is_read && (
                        <View className="w-2 h-2 bg-blue-500 rounded-full" />
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