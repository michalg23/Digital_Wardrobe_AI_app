import React, { useState, useEffect ,useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Image, ScrollView, Alert,Dimensions  } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance, { baseURL } from '../../src/config';
import { router } from 'expo-router';
import useStore from '../store';
import { useImageStore } from '../store';
import { useOutfitStore } from '../store';
import axios from 'axios';

//import editOutfit from '../(auth)/editOutfit';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window'); // Get screen dimensions
import { Calendar as RNCalendar } from 'react-native-calendars';
//import axiosInstance from '../../src/config';

const Calendar = () => {

  const navigation = useNavigation();
  const route = useRoute();
  const [storedOutfits, setStoredOutfits] = useState([]); // State to hold the outfits from AsyncStorage
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [eventName, setEventName] = useState('');
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [outfitsForDate, setOutfitsForDate] = useState([]); // Track outfits for the selected date
  const [markedclickedDates, setMarkedclickedDates] = useState({});
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); // State for delete confirmation modal
  const [outfitToDelete, setOutfitToDelete] = useState(null); // Store the outfit to be deleted
  const [isOutfitConfirmed, setIsOutfitConfirmed] = useState(false); // New state to track confirmation
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // Edit modal visibility
  const { deletedImagePath, resetDeletedImagePath } = useImageStore();
  const { NewOutfit,  setOutfitwardrobe ,resetOutfit} = useOutfitStore.getState();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const outfitforcancel = useStore(state => state.outfit); // Get outfit from Zustand store
  const { outfit, setOutfit, eraseOutfit } = useStore.getState();
  const [previousOutfit1, setpreviousOutfit] = useState(null); // Store the outfit to be deleted



  // Ensure handleFocus follows React's rules
  const handleFocus = useCallback(async () => {
    try {
      const storedOutfitsData = await AsyncStorage.getItem('outfitsCalendar');
      console.log('value1:', storedOutfitsData);
      console.log('value2:', previousOutfit1);
      console.log('value3:', NewOutfit.images.length);

      if (storedOutfitsData !== null && ( previousOutfit1 === undefined) && NewOutfit.images.length === 0) {
        setpreviousOutfit(null);
        loadOutfits();
        console.log('check to see if we use this useffect(first)');
        
        //setpreviousOutfit(outfit);
      }
    } catch (error) {
      console.error('Error loading outfits:', error);
    }
  }, [previousOutfit1, NewOutfit, outfit]);

  // Use `useFocusEffect` properly
  useFocusEffect(
    useCallback(() => {
      handleFocus(); // Call the async function on focus
      return () => {
        // Optional cleanup if needed (not required in your case)
      };
    }, [handleFocus])
  );


  useEffect(() => {
    console.log("check to see if we use this useffect(seconed)");
    //const currentOutfit = useStore.getState().outfit; // Get the outfit from global state
    const unsubscribe  = navigation.addListener('focus', () => {
        const updatedOutfit  = route.params?.updatedOutfit;
        const previousOutfit = route.params?.previousOutfit;
        setpreviousOutfit(previousOutfit);
        //console.log("the outfit from editoutfit is ",previousOutfit);
        console.log("Updated Outfit:", updatedOutfit);
        if (updatedOutfit) {
          console.log("1111");
          handleUpdatedOutfit(updatedOutfit); // Update the stored outfits
          //setpreviousOutfit(null);
        }
        
        
        
        
        // Reset route params to avoid reusing old data on the next focus
        //navigation.setParams({ updatedOutfit: null, previousOutfit: null });
        //useStore.getState().setOutfit(null); // Store the selected outfit
        navigation.setParams({ updatedOutfit: null});
            
     });

    return unsubscribe;
  }, [navigation,route.params]);

  useEffect(() => {
    console.log("the deleted image is :",deletedImagePath);
    if (deletedImagePath !== '' ) {
      loadOutfits(); // Call loadOutfits whenever the deleted image path changes
      //useStore.getState().setOutfit(null);
      
    }
  }, [deletedImagePath]);


   // Update outfit display after image selection
  useEffect(() => {
    console.log("check to see if we use this useffect(selectedimages)");
    
      if (!isLoading && NewOutfit&& NewOutfit.images.length > 0 && NewOutfit.eventName && NewOutfit.selectedDate) {
        console.log('Saving outfit:', NewOutfit);

        // Save the outfit and reset the state afterward
        saveOutfit(NewOutfit.images);
        resetOutfit(); // Clear the outfit state after saving
      }
    
  }, [NewOutfit,isLoading]);
  

   



  const loadOutfits = async () => {
    
    try {
      const storedOutfitsData = await AsyncStorage.getItem('outfitsCalendar');
      
      if (storedOutfitsData  && storedOutfitsData.length>0 ) {
        const parsedOutfits = JSON.parse(storedOutfitsData);
        const filtered = parsedOutfits.filter(outfit => outfit.date === selectedDate);
        //setOutfitsForDate(filtered);
        
        //useStore.getState().setOutfit(null); // Store the selected outfit
        console.log("all the outfits are",parsedOutfits);
        //const outfitsForThisDate = parsedOutfits.filter(outfit => outfit.event_name === outfitforcancel.event_name);
        //useStore.getState().setOutfit(null);
        //console.log("the date is ",outfitsForThisDate);
        // Wait for all update promises to complete
        const updatedOutfits = await Promise.all(
         // Use map with async to ensure all promises are correctly handled
          parsedOutfits.map(async (outfit) => {
            if (outfit.images.length>0) {
              const originalLength = outfit.images.length;
              outfit.images = outfit.images.filter(image => image !== deletedImagePath);
              
              if (originalLength !== outfit.images.length) {
                console.log("Sent to update:", outfit);
    
                try {
                  const response = await axiosInstance.put(
                    `${baseURL}/update_outfit/${outfit._id}`,
                    {
                      event_name: outfit.event_name,
                      images: outfit.images,
                    }
                  );
    
                  if (response.status === 200) {
                    console.log("The update from backend was successful");
                  } else {
                    console.error("Failed to update outfit");
                  }
                } catch (error) {
                  console.error("Error updating outfit:", error);
                }
              }
              
              
            }
            return outfit; // Make sure to return the modified outfit
          })
        );
        //useStore.getState().setOutfit(null); // Store the selected outfit

        await AsyncStorage.setItem('outfitsCalendar', JSON.stringify(updatedOutfits));
        const updatedoutfits = await AsyncStorage.getItem('outfitsCalendar');
    
        const outfitsarray = JSON.parse(updatedoutfits);
        const filteredOutfits = outfitsarray.filter(outfit => outfit.date === selectedDate);
        
        setOutfitsForDate(filteredOutfits);//display the outfit for the clicked date
        setStoredOutfits(outfitsarray);//store all the updated outfits 
        
        
        // Update marked dates
        const marked = {};
        updatedOutfits.forEach((outfit) => {
          marked[outfit.date] = {
            customStyles: {
              container: {
                backgroundColor: '#a5f3fc',
                borderRadius: 10,
              },
              text: {
                color: '#000',
              },
            },
          };
        });
        setMarkedDates(marked);
        resetDeletedImagePath();
        //useStore.getState().setOutfit(null);
        
        
      }
    } catch (error) {
      console.error("Error loading outfits from AsyncStorage:", error);
    }
    
  };
  
  


  // Handle date selection and highlighting
  const handleDateSelect = (day) => {
    const date = day.dateString;
    setSelectedDate(date);

    // Filter outfits for the selected date
    const outfitsForThisDate = storedOutfits.filter(outfit => outfit.date === date);
    setOutfitsForDate(outfitsForThisDate); // Update outfits for the selected date
    // Clear previous temporary highlight
    setMarkedclickedDates({});
    // Mark the selected date
    const clickedDateHighlight  = {
      [date]: {
        customStyles: {
          container: {
            backgroundColor: '#FFDDC1',  // Highlight color for the selected date
            borderRadius: 10,
          },
          text: {
            color: '#000',  // Text color for the selected date
            fontWeight: 'bold',
          },
        }
      }
    };  
    // Merge markedDates (outfits) and clickedDateHighlight (temporary highlight)
  

    // Update markedDates to reflect both outfits and the clicked highlight
     setMarkedclickedDates(clickedDateHighlight);  // Store just the clicked highlight
    //setMarkedDates(updatedMarkedDates);  // Update the UI with the merged data  
  };

  const mergedMarkedDates = { ...markedDates, ...markedclickedDates };


 
  // Modal for adding an outfit
  const handleAddOutfit = () => {
    if (!selectedDate) {
      Alert.alert('Date Required', 'Please select a date before adding an outfit.');
      return;
    }
    setIsModalVisible(true);
  };

  const handleModalSubmit = () => {
    if (eventName.trim() === '') {
      Alert.alert('Event Name Required', 'Please enter an event name.');
      return;
    }
    // Store event name and date in Zustand
    useOutfitStore.getState().setOutfitwardrobe({ eventName, selectedDate });
    //setIsOutfitConfirmed(true); // Set to true when outfit is confirmed
    navigation.navigate('wardrobe', { mode: 'selection', selectedDate,  previousScreen: 'calendar',});
    setIsModalVisible(false);
  };

  

  // Save outfit in AsyncStorage and MongoDB
  const saveOutfit = async (images) => {
    if (!Array.isArray(images) || images.length === 0) {
      Alert.alert('Error', 'No images selected to save.');
      return;
    }
    setIsLoading(true); // Set loading to true
    try {
      console.log("after try");
      const response = await axiosInstance.post(`${baseURL}/add_outfit`, {
        event_name: eventName,
        date: selectedDate,
        images: images,
      });

      if (response.status === 201) {
        console.log("after 1");
        const newOutfit = response.data;
        console.log("Before setOutfitsForDate");
        //setOutfitsForDate(prevOutfits => [...prevOutfits, newOutfit]);
        console.log("After setOutfitsForDate");
        //setStoredOutfits(prevOutfits => [...prevOutfits, newOutfit]);
        
        console.log("after 2");
        const existingOutfitsJson = await AsyncStorage.getItem('outfitsCalendar');
        let existingOutfits = existingOutfitsJson ? JSON.parse(existingOutfitsJson) : [];
        existingOutfits.push(newOutfit);
        await AsyncStorage.setItem('outfitsCalendar', JSON.stringify(existingOutfits));
        console.log("after 3");
        //setOutfitsForDate(newoutfitsarray => {
          // If the current date's outfits are being displayed
          //if (selectedDate) {
            //return [...existingOutfits, newOutfit]; // Push new outfit to the array
          //}
          //return prevOutfits; // Return previous state if not selected date
        //});
        setOutfitsForDate(existingOutfits.filter(outfit => outfit.date === newOutfit.date));
        setStoredOutfits(prevOutfits => [...prevOutfits, newOutfit]); // Update stored outfits

        Alert.alert("Success", "New outfit created");
        console.log("after 4");
        const marked = {};
        console.log("after 5");
       
        existingOutfits.forEach((outfit) => {
          marked[outfit.date] = {
              customStyles: {
                  container: {
                      backgroundColor: '#a5f3fc',
                      borderRadius: 10,
                  },
                  text: {
                      color: '#000',
                  },
              },
          };
        });
        setMarkedDates(marked); // Update marked dates state
      } else {
        Alert.alert('Error', 'Failed to create an outfit.');
      }
      
    } catch (error) {
      Alert.alert('Error', 'An error occurred while creating an outfit.');
    }finally{
      setEventName('');
      setIsLoading(false); // Reset loading state
    }
  };

  const handleDeleteOutfit = (outfitId) => {
    setOutfitToDelete(outfitId);
    setIsDeleteModalVisible(true); // Show the delete confirmation modal
  };

  const confirmDeleteOutfit  = async () => {
    try {
      console.log("ready to delete");
      const response = await axiosInstance.delete(`${baseURL}/delete_outfit/${outfitToDelete}`);
      setIsDeleteModalVisible(false); // Close the modal after deletion
      if (response.status === 200) {
        // Remove the outfit from the local state
        const deletedoutfit = storedOutfits.filter(outfit => outfit._id === outfitToDelete);
        setOutfitsForDate(outfitsForDate.filter(outfit => outfit._id !== outfitToDelete));
        setStoredOutfits(storedOutfits.filter(outfit => outfit._id !== outfitToDelete));
        console.log("after set delete");
        // Update AsyncStorage
        const updatedOutfits = storedOutfits.filter(outfit => outfit._id !== outfitToDelete);
        await AsyncStorage.setItem('outfitsCalendar', JSON.stringify(updatedOutfits));

        // If there are no more outfits for the selected date, remove the highlight from the calendar
        if (deletedoutfit.length === 1) {
        const updatedMarkedDates = { ...markedDates };
        delete updatedMarkedDates[selectedDate];
        setMarkedDates(updatedMarkedDates);
      }
        Alert.alert('Success', 'Outfit deleted successfully.');
      } else {
        Alert.alert('Error', 'Failed to delete the outfit.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the outfit.');
    }
    
  };

  const handleEditOutfit = (outfit) => {
    useStore.getState().setOutfit(outfit); // Store the selected outfit
    setSelectedDate(outfit.date);
    console.log("your date is ",outfit.date);
    router.push('/editOutfit'); // Navigate to the EditOutfit page
    console.log("Navigated to EditOutfit with outfit:", outfit);
    

  };


  const handleUpdatedOutfit = async (updatedOutfit) => {
    try{
  
    // Get the current outfits from AsyncStorage
      const outfitsCalendar = await AsyncStorage.getItem('outfitsCalendar');
      const existingOutfits = JSON.parse(outfitsCalendar) || []; // Parse the existing outfits

      // Update the specific outfit in the calendar array
      const updatedOutfits = existingOutfits.map(outfit => 
          outfit._id === updatedOutfit._id ? updatedOutfit : outfit
      );
      
      // Save the updated array back to AsyncStorage
      await AsyncStorage.setItem('outfitsCalendar', JSON.stringify(updatedOutfits));
      console.log("The update from calendar was good", updatedOutfits);
      const outfitsCalendar1 = await AsyncStorage.getItem('outfitsCalendar');
      const existingOutfits1 = JSON.parse(outfitsCalendar1) || []; // Parse the existing outfits

      setStoredOutfits(existingOutfits1); // Update local state if necessary
      // If the updated outfit belongs to the selected date, update outfitsForDate too
      
      const filteredOutfits = existingOutfits1.filter(outfit => outfit.date === selectedDate);
      setOutfitsForDate(filteredOutfits);
    } catch (error) {
      console.error("Error updating outfit:", error);
      Alert.alert('Error', 'Failed to update the outfit. Please try again.');
    }
    useStore.getState().setOutfit(null); // Store the selected outfit
  };


  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>Create an outfit for an event:</Text>
        <Image source={require('../../assets/images/event.gif')} style={styles.gif} />
      </View>
      <View style={styles.calendarWrapper}>
          <RNCalendar
            current={new Date().toISOString().split('T')[0]} // Set current date

            //calendarWidth={screenWidth * 0.9}
            //calendarHeight={screenHeight * 0.4}
            markedDates={mergedMarkedDates}
            markingType={'custom'} // Make sure markingType is set to 'custom'
            onDayPress={handleDateSelect} // Use handleDateSelect for date selection
            theme={{
              arrowColor: '#2196F3', // Arrow color for navigation
            selectedDayBackgroundColor: '#2196F3',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#2196F3',
            dayTextColor: '#000',
            textDisabledColor: '#d9e1e8',
            monthTextColor: '#333',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
              
            }}
          />
      </View>
      

      <View style={styles.outfitContainer}>
        {outfitsForDate.length > 0 ? (
          outfitsForDate.map((outfit, index) => (
            <View key={index} style={styles.outfitWrapper}>
              {/* Event name on top of the container */}
              <Text style={styles.eventNameText}>Event: {outfit.event_name}</Text>
              {/* Delete Button in the top-right corner */}
              <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => handleDeleteOutfit(outfit._id)}
              >
               <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              
              <View style={styles.eventContainer}>
                <Text style={styles.dateText}>Date: {outfit.date}</Text>
                <ScrollView horizontal style={styles.scrollView}>
                  {outfit.images  ?.filter(image => image)
                    .map((image, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image  source={{ uri: image }} style={styles.outfitImage} resizeMode='contain' />
                    </View>
                  ))}
                </ScrollView>
                {/* Edit Button */}
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditOutfit(outfit)}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <>
            <Text style={styles.noOutfitText}>No outfit yet? Click to create</Text>
            <TouchableOpacity onPress={handleAddOutfit}>
              <Image 
                source={require('../../assets/icons/add-event.png')} // Update with your icon path
                style={styles.icon}  // Icon style
              />
            </TouchableOpacity>
          </>
        )}
      </View>



      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Event Name"
              value={eventName}
              onChangeText={setEventName}
              maxLength={15}  
            />
            <TouchableOpacity
              style={[styles.addButton, eventName.trim() ? { backgroundColor: '#90ee90' } : { opacity: 0.5,backgroundColor: 'gray'}]}
              onPress={handleModalSubmit}
              disabled={!eventName.trim()}
            >
              <Text style={styles.addButtonText}>Choose Outfit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => {setIsModalVisible(false); setEventName('');}}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={isDeleteModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.confirmationText}>Are you sure you want to delete this outfit?</Text>
            <TouchableOpacity style={styles.confirmButton} onPress={confirmDeleteOutfit}>
              <Text style={styles.confirmButtonText}>Yes, Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsDeleteModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16, // Reduce padding to move everything closer to the edges
    backgroundColor: '#f0f0f0',
    margin: 0,
    //padding: 0,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10, // Reduced margin to bring it closer to the calendar
    top: 20,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // Reduced to move closer to the calendar
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  gif: {
    width: 50,
    height: 50,
  },
  calendarWrapper: {
    width:'100%',
    //maxHeight: screenHeight * 0.43, // Restrict the height of the calendar container
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
    //overflow: 'hidden', // Prevent overflow when switching months
  },
  calendarContainer: {
    marginBottom: 10, // Spacing between the calendar and the outfit list
    
  },
  outfitContainer: {
    marginTop: 15,
    
  },
  outfitWrapper: {
    marginBottom: 20, // Space between event containers
    //position: 'relative',
  },
  eventNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#333',
    marginBottom: 5, // Added margin to move it above the container
  },
  eventContainer: {
    backgroundColor: '#fff',
    padding: 10, // Increased padding for better content spacing
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: 320, // Reduced width for better alignment with the screen
    height: 190,
    justifyContent: 'flex-start',
  },
  dateText: {
    marginBottom: 10,
    textAlign: 'left',
    fontSize: 16,
  },
  imageWrapper: {
    marginRight: 10, 
    marginBottom: 20, 
    //alignItems: 'center',
  },
  outfitImage: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
    marginHorizontal: 3,
    
  },
  scrollView: {
    marginBottom: 19, // Reduce or remove any margin around ScrollView
    
  },
  noOutfitText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 120, // Adjusted size to fit better
    height: 120,
    alignSelf: 'center', // Center the icon
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 16,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 3,
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmationText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
  },
  addButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#000',
  },
  editButton: {
    backgroundColor: '#000',
    width:100,
    height: 40,
    borderRadius: 5,
    //padding: 5,
    marginTop: -15,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    alignSelf: 'center', // Center the button within its parent container
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

});

export default Calendar;
