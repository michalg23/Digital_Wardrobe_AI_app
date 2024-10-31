import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation ,useRoute } from '@react-navigation/native';
import axiosInstance, {baseURL} from '../../src/config';
import {validateEmail, validateUsername} from '../../components/Validation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfile = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Hook to access params

  const { username: initialUsername, email: initialEmail } = route.params; // Get passed params

  const [updatedName, setUpdatedName] = useState(initialUsername); // Editable name state
  const [updatedEmail, setUpdatedEmail] = useState(initialEmail); // Editable email state

  //const [username, setName] = useState('');
  //const [email, setEmail] = useState('');
  
  const handleSave = async () => {
    // Save changes and navigate back to Profile page
    
    if (updatedEmail) {
      const emailValidationResult = validateEmail(updatedEmail);
      if (emailValidationResult !== true) {
        Alert.alert('Error', 'Invalid email. Use the format name@gmail.com.');
        return;
      }
    } 
    if (updatedName) {
      const usernameValidationResult = validateUsername(updatedName);
      if (usernameValidationResult !== true) {
        Alert.alert('Error', 'Username must be between 1 and 15 characters.');
        return;
      }
    }

    if (!updatedName && !updatedEmail) {
      Alert.alert('Error', 'Please update at least one field.');
      return;
    }

    const userdata = { email: updatedEmail, username: updatedName };
    const apiUrl= `${baseURL}/users/update`;
    try{
      const response = await axiosInstance.put(apiUrl, userdata);//backend call
      
      
        // Save updated values locally
      if (updatedName) await AsyncStorage.setItem('username', updatedName);
      if (updatedEmail) await AsyncStorage.setItem('email', updatedEmail);

      Alert.alert('Success', 'Profile updated successfully.');
      navigation.navigate('profile'); // Navigate back to profile
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(error);
        Alert.alert('Error', 'Email already in use, try something else');
      } else {
        console.log(error);
        Alert.alert('Error', 'An error occurred while updating the profile.');
      }
    }

  };

  const handleCancel = () => {
    // Navigate back to Profile page without saving
    navigation.navigate('profile');
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Edit Profile</Text>

      {/* GIF Image */}
      <Image
        source={require('../../assets/images/pencil.gif' )} // Replace with your actual gif image path
        style={styles.gifImage}
      />

      {/* Input fields */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#000"
        value={updatedName}
        onChangeText={setUpdatedName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#000"
        value={updatedEmail}
        onChangeText={setUpdatedEmail}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      {/* Cancel Link */}
      <Text style={styles.cancelText}>
        Don't want to edit?{' '}
        <Text style={styles.backToProfile} onPress={handleCancel}>
          Back to Profile
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:-60,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  gifImage: {
    width: 200, // Adjust the size of your GIF
    height: 150,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    fontSize:20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 20,
    width:120,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cancelText: {
    marginTop: 20,
    fontSize: 18,
    color: '#000',
  },
  backToProfile: {
    color: '#93D9F5',
    fontWeight: 'bold',
  },
});

export default EditProfile;
