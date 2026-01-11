import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const pickImage = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'avatar') {
        setAvatar(result.assets[0]);
      } else {
        setCoverImage(result.assets[0]);
      }
    }
  };

  const handleRegister = async () => {
    if (!fullName || !userName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!avatar) {
      Alert.alert('Error', 'Avatar is required');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('userName', userName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('avatar', {
      uri: avatar.uri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    });

    if (coverImage) {
      formData.append('coverImage', {
        uri: coverImage.uri,
        type: 'image/jpeg',
        name: 'cover.jpg',
      });
    }

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Registration successful! Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>YT-CC</Text>
          <Text style={styles.subtitle}>Create Account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.imagePickerContainer}>
            <TouchableOpacity
              style={styles.avatarPicker}
              onPress={() => pickImage('avatar')}
            >
              {avatar ? (
                <Image source={{ uri: avatar.uri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>+</Text>
                  <Text style={styles.avatarLabel}>Avatar*</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.coverPicker}
              onPress={() => pickImage('cover')}
            >
              {coverImage ? (
                <Image source={{ uri: coverImage.uri }} style={styles.coverImage} />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Text style={styles.coverPlaceholderText}>+ Cover Image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={fullName}
            onChangeText={setFullName}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Username *"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Password *"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  form: {
    width: '100%',
  },
  imagePickerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarPicker: {
    marginBottom: 15,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  avatarPlaceholderText: {
    fontSize: 30,
    color: '#999',
  },
  avatarLabel: {
    fontSize: 12,
    color: '#999',
  },
  coverPicker: {
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  coverPlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  coverPlaceholderText: {
    color: '#999',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
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
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#666',
    fontSize: 16,
  },
  linkBold: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
