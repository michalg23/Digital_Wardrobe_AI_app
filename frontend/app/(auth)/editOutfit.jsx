import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { useNavigation ,useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import axiosInstance, { baseURL } from '../../src/config';
import useStore from '../store';

const EditOutfit = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const outfit = useStore(state => state.outfit); // Get outfit from Zustand store
    const [editedEventName, setEditedEventName] = useState('');
    const [editedImages, setEditedImages] = useState([]);
    const setOutfit = useStore(state => state.setOutfit); // Function to update outfit in Zustand

    // Update state when outfit changes
    useEffect(() => {
        if (outfit) {
            // Update editedImages only if outfit has images
            if (outfit.images) {
                setEditedImages(outfit.images);
            }
            // Update event name if it exists
            setEditedEventName(outfit.event_name || ''); 
        }
        console.log("the zustand is :",outfit);
    }, [outfit]);


    const handleUpdateOutfit = async () => {
        const updatedOutfit = {
            ...outfit,
            event_name: editedEventName.trim() !== '' ? editedEventName : outfit.event_name,
            images: editedImages,
        };

        try {
            const response = await axiosInstance.put(
                `${baseURL}/update_outfit/${outfit._id}`, 
                updatedOutfit
            );

            if (response.status === 200) {
                setOutfit(updatedOutfit); // Update the outfit in Zustand
                Alert.alert('Success', 'The outfit was updated');
                //await AsyncStorage.setItem(`outfit_${outfit._id}`, JSON.stringify(updatedOutfit));
                navigation.navigate('calendar', { updatedOutfit });
            } else {
                console.error('Failed to update outfit:', response.data);
            }
        } catch (error) {
            console.error('Error updating outfit:', error);
        }
    };

    const handleDeleteImage = (index) => {
        const updatedImages = editedImages.filter((_, idx) => idx !== index);
        setEditedImages(updatedImages);
        setOutfit({ ...outfit, images: updatedImages }); // Update the Zustand store with the new images
    };

    return (
        <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.cancelIcon} onPress={() => navigation.navigate('calendar',{previousOutfit: outfit})}>
                <MaterialIcons name="cancel" size={40} color="black" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Edit Outfit</Text>
            <View style={styles.underline} />

            <TextInput
                style={styles.input}
                placeholder="Event Name"
                value={editedEventName}
                onChangeText={setEditedEventName}
                maxLength={15}
            />

            <ScrollView contentContainerStyle={styles.imageContainer}>
                {editedImages.map((image, idx) => (
                    <View key={idx} style={styles.imageWrapper}>
                        <Image source={{ uri: image }} style={styles.outfitImage} resizeMode="contain" />
                        <TouchableOpacity style={styles.deleteIcon} onPress={() => handleDeleteImage(idx)}>
                            <MaterialIcons name="delete" size={40} color="black" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.buttonRow}>
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => navigation.navigate('wardrobe', { mode: 'selection', previousScreen: 'editOutfit', existingImages: editedImages })}
                >
                    <Text style={styles.buttonText}>Add from Wardrobe</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitButton} onPress={handleUpdateOutfit}>
                    <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    modalTitle: {
        fontSize: 40,
        fontWeight: 'bold',
        top: 40,
        marginBottom: 60,
        alignSelf: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 20,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
    },
    underline: {
        height: 2,
        left: 75,
        backgroundColor: '#000',
        alignSelf: 'flex-start',
        marginTop: -10,
        width: 170,
        marginBottom: 35,
    },
    outfitImage: {
        width: 70,
        height: 70,
        marginRight: 10,
        marginBottom: 20,
        borderRadius: 5,
        backgroundColor: '#e0e0e0',
    },
    imageWrapper: {
        marginRight: 10, 
        marginBottom: 20, 
        alignItems: 'center',
    },
    deleteIcon: {
        marginTop: -8,
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginTop: 10, // Add some margin to create space
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    addButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#4caf50',
        padding: 15,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
    },
    cancelIcon: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
    },
});

export default EditOutfit;
