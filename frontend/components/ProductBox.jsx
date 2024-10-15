import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Modal, Button, Alert } from 'react-native';
import axiosInstance, { baseURL } from '../src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductBox = ({ image, isOutfitMode, onSelect, isSelected, onDelete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Function to handle image press (open modal for detailed view)
  const handlePress = () => {
    if (isOutfitMode) {
      onSelect(image.Newfile_path); // Pass the image's id to onSelect function
    } else {
      setIsModalVisible(true); // Open modal for detailed view if not in outfit mode
    }
  };

  // Function to handle image deletion
  const handleDelete = async () => {
    try {
      const apiUrl = `${baseURL}/images/${image._id}/${image.category}`;
      const response = await axiosInstance.delete(apiUrl);

      if (response.status === 200) {
        let storedImages = await AsyncStorage.getItem('wardrobeImages');
        if (storedImages !== null) {
          storedImages = JSON.parse(storedImages);
          const updatedImages = storedImages.filter(img => img._id !== image._id);
          await AsyncStorage.setItem('wardrobeImages', JSON.stringify(updatedImages));
        }

        Alert.alert('Success', 'Image was deleted.');
        onDelete(image._id, image.Newfile_path );
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Error', 'Failed to delete the image. Please try again.');
    } finally {
      setShowDeleteConfirmation(false);
      setIsModalVisible(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, isSelected && styles.selectedContainer]}
        onPress={handlePress}
      >
        {image.Newfile_path && <Image source={{ uri: image.Newfile_path }} style={styles.image} />}

        {isOutfitMode && (
          <View style={styles.selectionOverlay}>
            <Text style={styles.selectionText}>{isSelected ? 'Selected' : 'Select'}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalFrame}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
              <Image source={require('../assets/icons/cross.png')} style={styles.cancelIcon} />
            </TouchableOpacity>

            <View style={styles.modalContent}>
              {/* Frame and Image Display */}
              <Image source={require('../assets/icons/photo-frame.png')} style={styles.frameImage} />
              {image.Newfile_path && <Image source={{ uri: image.Newfile_path }} style={styles.modalImageOnFrame} />}

              {/* Display category, colors, and upload date */}
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Category:</Text>{'\n'}{image.category} 
              </Text>
              <Text style={styles.modalText}>
              <Text style={styles.boldText}>Colors:</Text>{'\n'}
                {Array.isArray(image.dominant_color) ? image.dominant_color.join(', ') : 'No colors available'}
              </Text>
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Upload Date:</Text>{'\n'}{new Date(image.uploaded_at).toLocaleDateString()} 
              </Text>

              {/* Trash icon for delete */}
              <View style={styles.trashButton} onPress={() => setShowDeleteConfirmation(true)}>
                <Image source={require('../assets/images/trash.gif')} style={styles.trashIcon} />
                <Text style={styles.deleteText}>Delete?</Text>
                <View style={styles.confirmationButtons}>
                  <TouchableOpacity style={styles.confirmationButton} onPress={handleDelete}>
                    <Text style={styles.buttonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmationButton} onPress={() => setIsModalVisible(false)}>
                    <Text style={styles.buttonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 126,
    height: 126,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    borderColor: '#000',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '90%',
    height: '90%',
    alignSelf: 'center',
    top: 5,
    resizeMode: 'contain',
  },
  selectedContainer: {
    borderColor: '#00f',
    borderWidth: 2,
  },
  selectionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
  },
  selectionText: {
    color: '#fff',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalFrame: {
    width: 325,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    position: 'relative',
  },
  cancelButton: {
    position: 'absolute',
    top: 8,
    right: 10,
  },
  cancelIcon: {
    width: 33,
    height: 33,
  },
  modalContent: {
    alignItems: 'center',
  },
  frameImage: {
    width: 240,
    height: 260,
    position: 'absolute',
  },
  modalImageOnFrame: {
    width: '90%', 
    height: '33%',
    aspectRatio: 1,
    marginBottom: 65,
    position: 'relative',
    resizeMode: 'contain',
    alignSelf: 'center',
    top: 33, // Adjust the image position to go over the frame
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  trashButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  trashIcon: {
    width: 50,
    height: 50,
  },
  deleteText: {
    fontSize: 20,
    marginTop: -2,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 210,
    top:15,
    
  },
  confirmationButton: {
    backgroundColor: '#000', // green for 'Yes', you can dynamically change this for 'No' if needed
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1, // This ensures the buttons take equal space
    marginHorizontal: 9, // Adds some space between the buttons
    alignItems: 'center', // Center text inside the button
  },
  buttonText: {
    color: '#fff', // Text color for the button
    fontSize: 18, // Text size for larger appearance
    fontWeight: 'bold',
  },
});

export default ProductBox;
