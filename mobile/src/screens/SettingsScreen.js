import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const SettingItem = ({ icon, title, onPress, danger = false }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons
          name={icon}
          size={24}
          color={danger ? '#FF0000' : '#333'}
        />
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* User Info Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={60} color="#FF0000" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem
          icon="person-outline"
          title="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SettingItem
          icon="lock-closed-outline"
          title="Change Password"
          onPress={() => navigation.navigate('ChangePassword')}
        />
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
        />
        <SettingItem
          icon="moon-outline"
          title="Dark Mode"
          onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
        />
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem
          icon="help-circle-outline"
          title="Help & Support"
          onPress={() => Alert.alert('Help', 'Contact us at support@yt-cc.com')}
        />
        <SettingItem
          icon="document-text-outline"
          title="Terms of Service"
          onPress={() => Alert.alert('Terms', 'Terms of Service')}
        />
        <SettingItem
          icon="shield-outline"
          title="Privacy Policy"
          onPress={() => Alert.alert('Privacy', 'Privacy Policy')}
        />
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <SettingItem
          icon="log-out-outline"
          title="Logout"
          onPress={handleLogout}
          danger
        />
      </View>

      {/* Version */}
      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  avatarContainer: {
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  dangerText: {
    color: '#FF0000',
  },
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
});

export default SettingsScreen;
