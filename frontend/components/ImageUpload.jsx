// Avatar Component
import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const Avatar = ({ onImagePicked }) => {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access gallery is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
      onImagePicked(result.uri); // Call the callback function to upload the image
    }
  };

  return (
    <View style={styles.container}>
      {/* Rectangle Container */}
      <View style={styles.rectangleContainer}>
        {/* Avatar Image and Edit Text as one package */}
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image
            source={image ? { uri: image } : require('../assets/icons/upload.png')} // Replace with your default image path
            style={styles.avatar}
          />
          <Text style={styles.editText}>Tap to add an item :)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Avatar;
