import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateProfile, updateAvatar, updateCoverImage } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!fullName || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await updateProfile({ fullName, email });
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleUpdateAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarLoading(true);
      const updateResult = await updateAvatar(result.assets[0].uri);
      setAvatarLoading(false);

      if (updateResult.success) {
        Alert.alert('Success', 'Avatar updated successfully!');
      } else {
        Alert.alert('Error', updateResult.message);
      }
    }
  };

  const handleUpdateCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverLoading(true);
      const updateResult = await updateCoverImage(result.assets[0].uri);
      setCoverLoading(false);

      if (updateResult.success) {
        Alert.alert('Success', 'Cover image updated successfully!');
      } else {
        Alert.alert('Error', updateResult.message);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Cover Image */}
      <TouchableOpacity
        style={styles.coverContainer}
        onPress={handleUpdateCoverImage}
        disabled={coverLoading}
      >
        {user?.coverImage ? (
          <Image source={{ uri: user.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.coverPlaceholder]}>
            <Ionicons name="image-outline" size={40} color="#999" />
          </View>
        )}
        {coverLoading ? (
          <View style={styles.coverOverlay}>
            <ActivityIndicator color="#fff" />
          </View>
        ) : (
          <View style={styles.coverOverlay}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.changeText}>Change Cover</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleUpdateAvatar}
          disabled={avatarLoading}
        >
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={40} color="#999" />
            </View>
          )}
          {avatarLoading ? (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color="#fff" size="small" />
            </View>
          ) : (
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.changeAvatarText}>Change Avatar</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter full name"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={user?.userName}
          editable={false}
          placeholderTextColor="#999"
        />
        <Text style={styles.hint}>Username cannot be changed</Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  coverContainer: {
    height: 150,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 14,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -50,
  },
  avatarContainer: {
    position: 'relative',
    borderWidth: 4,
    borderColor: '#fff',
    borderRadius: 55,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF0000',
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  changeAvatarText: {
    marginTop: 10,
    color: '#FF0000',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    padding: 20,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  disabledInput: {
    backgroundColor: '#eee',
    color: '#999',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: -15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ffaaaa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
