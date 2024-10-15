import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance, { baseURL } from '../src/config';

const FilterSlide = ({ isVisible, onClose, onApply }) => {
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [colors, setColors] = useState([]);
  const [startDate, setStartDate] = useState(null); // Start date filter
  const [endDate, setEndDate] = useState(null); // End date filter
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const categories = ['Longsleeve', 'Shortsleeve', 'Shoes', 'Dress', 'Vest', 'Outwear', 'Pants', 'Skirt', 'Hat', 'Hoodie', 'Shorts'];

  useEffect(() => {
    const fetchColors = async () => {
      const storedColors = await AsyncStorage.getItem('Colors');
      if (storedColors) {
        setColors(JSON.parse(storedColors));
      }
    };

    fetchColors();

    // Reset the date selections every time the filter form is opened
    if (isVisible) {
      setStartDate(null);
      setEndDate(null);
    }
  }, [isVisible]);

  const handleCategoryPress = (category) => {
    setSelectedCategory((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleColorPress = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleApply = async () => {
    try {
        // Format the dates before sending
        const formattedStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : null;
        const formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : null;
        const apiUrl = `${baseURL}/images/search`;

        // Prepare query params
        const queryParams = {};
        if (selectedCategory.length > 0) {
            queryParams.category = selectedCategory.join(',');  // Send as comma-separated string
        }
        if (selectedColors.length > 0) {
            queryParams.dominant_color = selectedColors.join(',');  // Send as comma-separated string
        }
        if (formattedStartDate) {
            queryParams.date_from = formattedStartDate;
        }
        if (formattedEndDate) {
            queryParams.date_to = formattedEndDate;
        }

        // Make API request to the filter backend
        console.log(queryParams);
        const apiUrl3= `${baseURL}/get-image-url`;
        const response = await axiosInstance.get(apiUrl, { params: queryParams });
        const filteredImages = response.data;
        console.log(filteredImages);
        if (filteredImages.message) {
          //console.log('Images:', filteredImages);
          console.log('Filtered Images: no images to display');
          Alert.alert('filter','No images were found');
          onClose();
          
          //onApply([]);  // Pass an empty array to ensure the parent component knows there's no data
        } else if (Array.isArray(filteredImages) && filteredImages.length === 0){
            // If no images were found
            console.log('Filtered Images: no images to display');
            Alert.alert('Filter', 'No images were found');
            onClose();
            return;
             // Close filter slide
            //onApply([]);  // Pass an empty array
        }
        else {
          console.log('Filtered Images:', filteredImages);
          const updatedImages = await Promise.all(filteredImages.map(async image => {
            
            const response = await axiosInstance.post(apiUrl3, {
              file_path: image.file_path
            });
            // Return a new object with the updated file_path
            return {...image, Newfile_path: `${baseURL}${response.data.url}`}; // Use the corrected path
          }));
          onApply(updatedImages); // Pass the filtered images to parent component
          onClose(); // Close filter slide
        }
    } catch (error) {
        console.error('Error fetching filtered images:', error);
        Alert.alert('Error', 'Something went wrong while fetching images. Please try again.');
    }
  };

  const onChangeStartDate = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onChangeEndDate = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Filter Options</Text>
        <View style={styles.underline} />

        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {/* Category Selection */}
          <View style={styles.filterBox}>
            <Text style={styles.filterTitle}>Category</Text>
            <View style={styles.buttonContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryButton, selectedCategory.includes(category) && styles.selectedButton]}
                  onPress={() => handleCategoryPress(category)}
                >
                  <Text style={styles.buttonText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.filterBox}>
            <Text style={styles.filterTitle}>Color</Text>
            <View style={styles.colorBox}>
              {colors.length === 0 ? (
                <Text style={styles.noColorsText}>No colors yet</Text>
              ) : (
                <ScrollView style={styles.colorScrollContainer} showsVerticalScrollIndicator={false}>
                  <View style={styles.colorRow}>
                    {colors.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[styles.colorCube, { backgroundColor: color }]}
                        onPress={() => handleColorPress(color)}
                      >
                        {selectedColors.includes(color) && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>

          {/* Date Selection */}
          <View style={styles.filterBox}>
            <Text style={styles.filterTitle}>Date</Text>
            <View style={styles.dateContainer}>
              <View style={styles.datePickerContainer}>
                <Text style={styles.dateLabel}>From</Text>
                <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.datePickerButton}>
                  <Text>{startDate ? startDate.toDateString() : 'Select a date'}</Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate || new Date()} // Default to current date in picker, but show 'Select a date'
                    mode="date"
                    display="default"
                    onChange={onChangeStartDate}
                  />
                )}
              </View>
              <View style={styles.datePickerContainer}>
                <Text style={styles.dateLabel}>To</Text>
                <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.datePickerButton}>
                  <Text>{endDate ? endDate.toDateString() : 'Select a date'}</Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate || new Date()} // Default to current date in picker, but show 'Select a date'
                    mode="date"
                    display="default"
                    onChange={onChangeEndDate}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Apply Button */}
          <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles remain the same
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
  },
  modalContent: {
    top: 0,
    backgroundColor: '#fff',
    padding: 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    maxHeight: '100%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
    backgroundColor: 'black',
    borderRadius: 20,
    marginTop: -10,
    right: -10,
  },
  closeText: {
    fontSize: 15,
    color: '#fff',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    marginTop: -10,
  },
  underline: {
    height: 2,
    backgroundColor: '#2196F3',
    marginBottom: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: -5,
  },
  filterBox: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
    right: 7,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    right: -10,
  },
  categoryButton: {
    backgroundColor: '#eee',
    borderRadius: 15,
    padding: 10,
    margin: 3,
  },
  selectedButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    fontSize: 14,
    color: '#000',
  },
  colorBox: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    height: 110, // Enough height for 3 lines of colors
    right: 0,
  },
  colorScrollContainer: {
    maxHeight: 100,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  colorCube: {
    width: 30, // Cube width
    height: 30, // Cube height
    borderRadius: 5,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noColorsText: {
    textAlign: 'center',
    color: '#888',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  datePickerButton: {
    backgroundColor: '#eee',
    borderRadius: 15,
    padding: 10,
    margin: 5,
  },
  dateLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  applyButton: {
    backgroundColor: '#2196F3',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FilterSlide;