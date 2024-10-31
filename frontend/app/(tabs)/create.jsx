import React, { useState, useEffect ,useCallback } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Alert, TouchableOpacity, Modal } from 'react-native';
import { VictoryPie } from 'victory-native';
import * as ImagePicker from 'expo-image-picker';
import axiosInstance, {baseURL} from '../../src/config';
const { width, height } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import mime from 'mime';
import { StatusBar } from 'expo-status-bar';
import {  router } from 'expo-router';
//import { useRoute } from '@react-navigation/native';
import SignIn from '../(auth)/sign-in';
import { useRouter ,useSearchParams } from 'expo-router';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';


const Create = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const fromSignIn = route?.params?.fromSignIn || false; // Ensure fromSignIn is safely extracted
  const fromWardrobe = route?.params?.fromWardrobe || false; // Ensure fromSignIn is safely extracted

  const [lineWidth, setLineWidth] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [image, setImage] = useState(null);
  // save data
  // Helper function to save chart data in localStorage
  useFocusEffect(
    useCallback(() => {
      if (fromSignIn) {
        console.log('Navigated from SignIn:', fromSignIn); // Should print true
        fetchChartData();  // Call the function if navigated from SignIn
      }
      else if (fromWardrobe) {
        console.log('Navigated from Wardrobe:', fromWardrobe); // Should print true
        fetchChartData();  // Call the function if navigated from SignIn
      }

    }, [fromSignIn,fromWardrobe])
  );
    

  const saveChartData = async  (chartData, totalCount) => {
    try{  
      const chartDataString = JSON.stringify(chartData);
      AsyncStorage.setItem('categoryCounts', chartDataString);
      AsyncStorage.setItem('totalCount', totalCount.toString());
      
    } catch (error) {
      console.error("Error saving chart data:", error);
    } 
  };
  //get data
  // Helper function to load chart data from localStorage
  const loadChartData = async () => {
    try{
      const chartDataString = await AsyncStorage.getItem('categoryCounts');
      const totalCountString = await AsyncStorage.getItem('totalCount');
  
      if (chartDataString && totalCountString) {
         const chartData = JSON.parse(chartDataString);
         const totalCount = parseInt(totalCountString, 10);
         return { chartData, totalCount };
      }
        return { chartData: [], totalCount: 0 };
    } catch (error) { 
      console.error("Error loading chart data:", error);
      return { chartData: [], totalCount: 0 };
    }

  };


  useEffect(() => {
    const loadStoredData = async () => {
      const { chartData: savedChartData, totalCount: savedTotalCount } = await loadChartData();
      if (savedChartData.length > 0) {
        setChartData(savedChartData);
        setTotalCount(savedTotalCount);
      }
    };
    loadStoredData(); // Only load stored chart data when the component mounts
  }, []);

  const pickImage = async () => {
    try{
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
          console.log(result); 

          if (result.canceled ){
            //console.warn("Image selection was canceled by the user.");
            Alert.alert("Image selection canceled", "You did not select any image.");
            return;
          }
          if (!result.assets || result.assets.length === 0) {
            console.error("No image URI found.");
            Alert.alert("No image selected", "Please try again.");
            return;
          }

          const imageUri = result.assets[0].uri;
          console.log('Image URI:', imageUri);  // Debug: Log the correct URI
          setImage(imageUri);
          await uploadImage(imageUri);  // Pass the correct URI to your upload function
          
        } catch (error) {
          console.error('Error in pickImage:', error);
          Alert.alert("Error", "Something went wrong while picking the image.");
          
    }    
  };

  const takePhoto = async () => {
    try{
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
          alert("Permission to access camera is required!");
          return;
        }

        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 4],
          quality: 1,
        });
        
        if (result.canceled) {
          //console.warn("Taking a photo was canceled by the user.");
          Alert.alert("Photo capture canceled", "You did not take a photo.");
          return;
        }
        if (!result.assets || result.assets.length === 0) {
          console.error("No image URI found.");
          Alert.alert("No image captured", "Please try again.");
          return;
        }

        const imageUri = result.assets[0].uri;
        console.log('Image URI:', imageUri);  // Debug: Log the correct URI
        setImage(imageUri);
        await uploadImage(imageUri);
         
      } catch (error) {
        console.error('Error in takePhoto:', error);
        Alert.alert("Error", "Something went wrong while taking the photo.");
      }
  };

  const uploadImage = async (imageUri) => {
    const apiUrl= `${baseURL}/images`;
    
    if(imageUri===null){
      router.replace('create')
    }
    console.log("Image URI:", imageUri); // Add this line to debug
    const newImageUri =  "file:///" + imageUri.split("file:/").join("");

      const formData = new FormData();
      formData.append('image', {
        uri: newImageUri,// use the passed imageUri parameter
        type: mime.getType(newImageUri),
        name: newImageUri.split("/").pop()
      });

    try{
      //call for the backend 
      const response = await axiosInstance.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data, headers) => {
          return formData; // this is doing the trick
        },
      });
      
      if (response.status === 201) {
        Alert.alert('Success', 'Image uploaded successfully.');
        const newImage = response.data;// The new image data from the backend (e.g., _id, file_path, etc.)
        console.log("the image data from backend :",newImage);
        try{
          const createResponse = await axiosInstance.post(`${baseURL}/get-image-url`, {
            file_path: newImage.file_path,
          });
          const updatedImage = { ...newImage, Newfile_path: `${baseURL}${createResponse.data.url}`, // Corrected path for local display
          };
          const existingImagesJson = await AsyncStorage.getItem('wardrobeImages');
          let existingImages = existingImagesJson ? JSON.parse(existingImagesJson) : [];
          //Add the new image to the existing images array
          console.log("the new image data is :",updatedImage);
          existingImages.push(updatedImage);
          //Save the updated images array back to AsyncStorage
          await AsyncStorage.setItem('wardrobeImages', JSON.stringify(existingImages));
          console.log('Image successfully added and AsyncStorage updated!');
          if(newImage.category !== 'other'){
              //add colors to the colors array
              const storedColorsJson = await AsyncStorage.getItem('Colors');
              let storedColors = storedColorsJson ? JSON.parse(storedColorsJson) : []; // If no colors, initialize an empty array
              //  Extract the dominant colors from the new image data
              const newColors = newImage.dominant_color;
              //  Combine existing colors with new colors (ensure no duplicates)
              const combinedColors = [...new Set([...storedColors, ...newColors])];
              // 4. Save the updated color list back to AsyncStorage
              await AsyncStorage.setItem('Colors', JSON.stringify(combinedColors));
              // 5. Log to confirm the new color set is saved
              console.log("Updated colors:", combinedColors);
          }
        }
        catch (error) {
        console.error("Error uploading image:", error);
        }
        //setIsModalVisible(false);
        handleCancel();
        // Fetch new chart data after successful image upload
        fetchChartData();
        
      } else {
        Alert.alert('Error', 'Image upload failed.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'An error occurred while uploading the image.');
    }
  };

  const fetchChartData = async () => {
    const apiUrl = `${baseURL}/chartpieData`;
    try {
      const response = await axiosInstance.get(apiUrl);
      const data = response.data;

      const countsString = data.counts;
      const formattedData = countsString.split(', ').map((item) => {
        const [category, count] = item.split(': ');
        return { x: category, y: parseInt(count, 10) };
      }).filter(item => item.y > 0);

      setChartData(formattedData);
      setTotalCount(data.total_count);
      await saveChartData(formattedData, data.total_count); // Save the fetched data to AsyncStorage
    } catch (error) {
      console.error('Error fetching chart data:', error);
      Alert.alert('Error', 'An error occurred while fetching chart data.');
    }
  };

  const handleUploadButtonClick = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Image source={require('../../assets/icons/shop.png')} style={styles.icon} resizeMode="contain" />
          <Text style={styles.subHeaderText}>Digital Wardrobe</Text>
        </View>

        <View style={styles.addImageContainer}>
          <Text
            style={styles.addImageText}
            onLayout={(event) => {
              const { width } = event.nativeEvent.layout;
              setLineWidth(width);
            }}
          >
            Add an Image
          </Text>
          <View style={[styles.line, { width: lineWidth }]} />
        </View>
      </View>

      <View style={styles.chartContainer}>
        <VictoryPie
          data={chartData.length > 0 ? chartData : [{ x: '', y: 1 }]} // Display a single, invisible slice when empty
          innerRadius={50}
          labelRadius={({ innerRadius }) => innerRadius + 70}
          labels={({ datum }) => (chartData.length > 0 ? `${datum.x}\n(${datum.y})` : '')}
          style={{
            labels: { 
              fill: '#000', 
              fontSize: ({ datum }) => (datum.y >= 100 ? 12 : 20),
              textAnchor: 'middle'
            },
            data: {
              fillOpacity: chartData.length > 0 ? 0.9 : 0, // No fill for empty data
              stroke: 'white',
              strokeWidth: 1,
            },
          }}
          colorScale={['#76D6ED', '#4B8CF4','#1E90FF','#DA70D6','#FFD700','#F0E68C','#FAFAD2','#FFD580','#40E0D0','#7FFFD4','#FFA07A']} // Light blue colors
        />
        <Text style={styles.totalCount}>
          Total:{'\n'}    {totalCount}
        </Text>
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={handleUploadButtonClick}>
        <Image source={require('../../assets/icons/upload.png')} style={styles.uploadIcon} />
        <Text style={styles.uploadButtonText}>Click me to upload an item!</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Image source={require('../../assets/icons/cross.png')} style={{ width: 30, height: 30 }} />
            </TouchableOpacity>
            <Text style={styles.modalText}>
              1. Ensure the item is positioned straight, not upside down or sideways{'\n'}
              2. Use a dark surface for light clothes and a light surface for dark clothes
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
                <Text style={styles.modalButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
                <Text style={styles.modalButtonText}>Take a Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <StatusBar backgroundColor='#000' style='light'/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  headerContainer: {
    marginBottom: 30,
    top: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: -5,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  subHeaderText: {
    fontSize: 20,
    color: '#000',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgray',
    padding: 10,
    borderRadius: 10,
    width: width - 20,
    height: height / 2,
    marginVertical: 10,
    left: -10,
  },
  totalCount: {
    position: 'absolute',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  addImageContainer: {
    alignItems: 'flex-start',
  },
  addImageText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
  line: {
    height: 2,
    backgroundColor: '#76D6ED',
    marginTop: 2,
  },
  uploadButton: {
    alignItems: 'center',
    marginTop: -3,
  },
  uploadIcon: {
    width: 120,
    height: 120,
  },
  uploadButtonText: {
    marginTop: 5,
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    
  },
  modalContent: {
    width: 300,
    padding: 35,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    justifyContent: 'space-between', // Ensure buttons have space between them
    width: '130%', // Make the container full width
    paddingHorizontal: 10, // Add some padding to prevent buttons from touching edges
    padding:10,
  },
  modalButton: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    backgroundColor: '#76D6ED',
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
  cancelButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default Create;
