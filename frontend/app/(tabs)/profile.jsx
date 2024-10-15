import React, { useState,useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView,Button,Linking  } from 'react-native';
import Avatar from '../../components/Avatar'; // Make sure the path is correct for your Avatar component
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native'; // For navigation
import CustomButton from '../../components/CustomButton';
import {useSearchParams , Redirect, useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance, {baseURL} from '../../src/config';
import { useFocusEffect } from '@react-navigation/native';


const Profile = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const navigation = useNavigation(); // Hook for navigation
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const recipientEmail = 'michaeltenenboim@gmail.com'; // Your email
  const router = useRouter();; // Hook to access params

   // Fetch the username and email from SyncStorage on component mount
  useFocusEffect(
    React.useCallback(() => {
      // Function to fetch user data from AsyncStorage
      const fetchUserData = async () => {
        try {
          const storedUsername = await AsyncStorage.getItem('username');
          const storedEmail = await AsyncStorage.getItem('email');

          if (storedUsername) setUsername(storedUsername);
          if (storedEmail) setEmail(storedEmail);
        } catch (error) {
          console.error('Failed to load user data from AsyncStorage', error);
        }
      };

        // Call the fetch function
      fetchUserData();
    }, [])
  );

  const handleLogOut = async () => {
    const apiUrl= `${baseURL}/users/signout`;
    try {
      console.log("trying to log out ");
      const logout = await axiosInstance.post(apiUrl);//backend call
      await AsyncStorage.removeItem('outfitsCalendar');
      await AsyncStorage.clear(); // Remove all data and asyncstorage call
      navigation.navigate('index'); // Navigate to the initial screen
    } catch (error) {
      console.error('Error logging out: ', error);
      Alert.alert('Logout Failed', 'An error occurred while logging out. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    // Show the confirmation dialog before deleting
    setShowConfirmation(true);
    
  };

  const confirmDelete = async () => {
    // Replace with your API call later
    const apiUrl= `${baseURL}/users/delete_account`;
    try {
      console.log("trying to delete account ");
      const response  = await axiosInstance.delete(apiUrl);//backend call
      await AsyncStorage.clear(); // Remove all data and asyncstorage call
      navigation.navigate('index'); // Navigate to the initial screen
    } catch (error) {
      console.error('Error deleting account: ', error);
      Alert.alert('Delete Account Failed', 'An error occurred while deleting your account. Please try again.');
    }
  };

  const handleContactUs = () => {
    const mailtoURL = `mailto:${recipientEmail}`;

    // Open the email app
    Linking.openURL(mailtoURL)
      .then(() => {
        Alert.alert('Email App Opened', 'You can send us an email directly.');
      })
      .catch((error) => {
        Alert.alert('Error', 'Could not open the email app. Please try again.');
        console.error('Email app error:', error);
      });
  };

  const sendContactMessage = () => {
    // Handle sending the contact message here
    Alert.alert('Message Sent', 'Your message has been sent successfully.');
    setShowContactForm(false); // Close the contact form
  };

  return (
    <View style={styles.container}>
     
      <Avatar />

      {/* Name and Email Tabs */}
        
      <View style={styles.infoContainer}>
        {/* Name Field */}
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          placeholderTextColor="#000" // Placeholder color
          value={username} // Set value from state
          editable={false} // Make it non-editable until 'Edit' is pressed
        />

        {/* Email Field */}
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Email"
          placeholderTextColor="#000" // Placeholder color
          value={email} // Set value from state
          editable={false} // Make it non-editable until 'Edit' is pressed
        />
        <CustomButton 
                title="Edit"
                handlePress={() => router.push({pathname:'editProfile',params: { username, email },})}
                containerStyles= {{backgroundColor:"#93D9F5"}}
        />

       
      </View>

      {/* Action Icons */}
      <View style={styles.iconRow}>
        {/* Log Out Icon */}
        <TouchableOpacity onPress={handleLogOut} style={styles.iconContainer}>
          <Image source={require('../../assets/icons/logout.png')} style={styles.icon} />
          <Text style={styles.iconLabel}>Log Out</Text>
        </TouchableOpacity>

        {/* Delete Account Icon */}
        <TouchableOpacity onPress={handleDeleteAccount} style={styles.iconContainer}>
          <Image source={require('../../assets/icons/trash.png')} style={styles.icon} />
          <Text style={styles.iconLabel}>Delete Account</Text>
        </TouchableOpacity>

        {/* Contact Us Icon */}
        <TouchableOpacity onPress={handleContactUs} style={styles.iconContainer}>
          <Image source={require('../../assets/icons/email.png')} style={styles.icon} />
          <Text style={styles.iconLabel}>Contact Us</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <View style={styles.dialogContainer}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogText}>Are you sure you want to delete the account?</Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity onPress={confirmDelete} style={styles.dialogButton}>
                <Text style={styles.dialogButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowConfirmation(false)} style={styles.dialogButton}>
                <Text style={styles.dialogButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Contact Form */}
      {showContactForm && (
        <View style={styles.contactFormContainer}>
          <View style={styles.contactFormBox}>
            <TouchableOpacity onPress={() => setShowContactForm(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.contactInput}
              placeholder="Enter your message here..."
              placeholderTextColor="#000"
              multiline
              value={contactMessage}
              onChangeText={setContactMessage}
            />
            
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  infoContainer: {
    marginTop: 10,
    width: '90%',
    padding: 10, // Adds padding inside the container
    borderWidth: 2, // Border width for the container
    borderColor: '#000', // Black border color
    borderRadius: 8, // Rounded corners
    
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: '#000', // Text color inside the input
    fontSize: 18,
    
  },
  editButton: {
    backgroundColor: '#000', // Color for the edit button
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  
  },
  editButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconRow: {
    flexDirection: 'row', // Align the icons in a horizontal row
    justifyContent: 'space-around', // Distribute icons evenly
    width: '100%', // Full width for the row
    marginTop: 35, // Space above the row
  },
  iconContainer: {
    alignItems: 'center', // Center the icon and label horizontally
  },
  icon: {
    width: 35,
    height: 35,
  },
  iconLabel: {
    marginTop: 5,
    fontSize: 15, // Font size for the labels
    color: '#000',
    textAlign: 'center', // Center the text
    fontWeight: 'bold',
  },
  dialogContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  dialogText: {
    fontSize: 16,
    marginBottom: 20,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',  // Full width to better control spacing
    paddingHorizontal: 20, // Padding for spacing between buttons and dialog edges
  },
  dialogButton: {
    backgroundColor: '#000',
    borderRadius: 5,
    padding: 5,
    paddingVertical: 5,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    flex: 1,
    alignItems: 'center',
  },
  dialogButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  contactFormContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactFormBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  contactInput: {
    width: '110%',
    height: 110,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#000',
    borderRadius: 15,
    padding: 5,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    justifyContent: 'center',
    position: 'absolute',
  },
});

export default Profile;
