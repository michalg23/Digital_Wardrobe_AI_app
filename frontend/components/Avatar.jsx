import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const Avatar = () => {
  const [image, setImage] = useState(null);

  // Function to handle image picking from gallery or camera
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Set the selected image URI
    }
  };

  // Function to reset to the default icon
  const resetToDefaultIcon = () => {
    setImage(null); // Set the image state to null to revert to the default icon
  };

  return (
    <View style={styles.container}>
      {/* Rectangle Container */}
      <View style={styles.rectangleContainer}>
        {/* Avatar Image and Edit Text as one package */}
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image
            source={image ? { uri: image } : require('../assets/icons/user.png')} // Replace with your default image path
            style={styles.avatar}
          />
          <Text style={styles.editText}>Tap to change profile :)</Text>
        </TouchableOpacity>

        {/* Reset Icon Button */}
        <TouchableOpacity onPress={resetToDefaultIcon} style={styles.resetIconContainer}>
          <Image
            source={require('../assets/icons/cross.png')} // Replace with your reset icon path
            style={styles.resetIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  rectangleContainer: {
    width: 300, // Width of the rectangle
    height: 200, // Adjusted height to fit the reset icon
    borderWidth: 2, // Border width
    borderColor: '#000', // Border color
    borderRadius: 10, // Rounded corners for the rectangle
    alignItems: 'center', // Center all items horizontally
    justifyContent: 'center', // Center all items vertically
    position: 'relative',
    backgroundColor:"#f0f0f0",
  },
  avatarContainer: {
    alignItems: 'center', // Center the avatar and text horizontally
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#000',
    borderWidth: 2,
    backgroundColor:"#FFFFFF"
  },
  editText: {
    marginTop: 10,
    color: '#000',
    fontSize: 20, // Increase the font size
    fontWeight: 'bold', // Make the text bold
    textAlign: 'center', // Center the text
  },
  resetIconContainer: {
    position: 'absolute', // Position the reset icon absolutely within the rectangle
    right: 10,// Position it at the right within the rectangle
    top: 10,
    zIndex: 1, // Ensure it appears above other elements
  },
  resetIcon: {
    width: 30,
    height: 30,
    
    
  },
});

export default Avatar;
