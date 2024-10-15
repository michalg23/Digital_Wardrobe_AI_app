import React, { useRef, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, useWindowDimensions, Modal } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import FilterSlide from '../../components/FilterSlide';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductBox from '../../components/ProductBox.jsx';
import { Link ,router} from 'expo-router';
import editOutfit from '../(auth)/editOutfit.jsx';
import useStore from '../store';
import { useImageStore } from '../store';
import {useOutfitStore} from '../store';

const Wardrobe = () => {
  const outfit = useStore(state => state.outfit); // Get outfit from Zustand store
  //const setOutfit = useStore(state => state.setOutfit); // Function to update outfit in Zustand
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allImages, setAllImages] = useState([]); // Store all images
  const [filteredImages, setFilteredImages] = useState([]); // Store filtered images based on category
  const [loading, setLoading] = useState(false); // Loading state
  const [selectedImages, setSelectedImages] = useState([]); // Track selected images in outfit mode
  const scrollViewRef = useRef(null);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const route = useRoute();
  const previousScreen = route.params?.previousScreen;
  const existingImages = route.params?.existingImages;

  const { mode } = route.params || {}; // Retrieve mode from route parameters (default is undefined)
  const isOutfitMode = mode === 'selection'; // Check if it's outfit mode

  const handleFilterButtonPress = () => setIsFilterVisible(true);
  const handleFilterClose = () => setIsFilterVisible(false);


  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    filterImagesByCategory(category); // Call the filter function with the selected category
  };

  const filterImagesByCategory = (category) => {
    if (category === 'All') {
      setFilteredImages(allImages); // Show all images if "All" is selected
    } else {
      const filtered = allImages.filter((image) => image.category === category);
      setFilteredImages(filtered); // Update filtered images for the selected category
    }
  };

  const resetScrollView = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, animated: false });
      handleCategorySelect('All');
    }
  };

  const handleSelect = (imagefilepath) => {
    setSelectedImages(prevSelectedImages => {
      if (prevSelectedImages.includes(imagefilepath)) {
        return prevSelectedImages.filter(filepath => filepath !== imagefilepath);
      } else {
        return [...prevSelectedImages, imagefilepath];
      }
    });
  };

  const handleFinishSelection = () => {
    
    if (previousScreen === 'calendar') {
      const { NewOutfit ,setOutfitwardrobe } = useOutfitStore.getState();
      // Set the selected images to the outfit
      setOutfitwardrobe({ images: selectedImages });
      navigation.navigate('calendar'); // Return to the Calendar with selected images
    }
    else if (previousScreen === 'editOutfit') {
      //const existingImages = editedImages;
      const uniqueSelectedImages = selectedImages.filter(
        (image) => !existingImages.includes(image) // Check for duplicates
      );
      const updatedOutfit = {
        ...outfit, // Keep the existing outfit properties
        images: [...new Set([...outfit.images, ...uniqueSelectedImages])] // Merge images, ensuring uniqueness
      };
      useStore.getState().setOutfit(updatedOutfit);
      router.push('editOutfit');
    }
    console.log("the selected ",selectedImages);
    navigation.setParams({ mode: null });
    setSelectedImages([]);
  };

  // Fetch images from AsyncStorage
  
    const loadImages = async () => {
      setLoading(true); // Start loading
      try {
        const storedImages = await AsyncStorage.getItem('wardrobeImages');
        console.log("the check is",storedImages);
        if (storedImages) {
          const parsedImages = JSON.parse(storedImages);
          setAllImages(parsedImages); // Set the full image list
          setFilteredImages(parsedImages); // Initially show all images
        }
      } catch (error) {
        console.error('Error loading images from AsyncStorage:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };
    
  

  useFocusEffect(
    React.useCallback(() => {
      loadImages(); // Reload images whenever the screen is focused
      resetScrollView(); // Reset scroll view whenever the screen is focused
    }, [])
  );

  // Define the onDelete handler
  const handleDelete = (imageId,newpath) => {
    // Update the Zustand store with the deleted image path
    const { setDeletedImagePath } = useImageStore.getState();
    setDeletedImagePath(newpath);
    console.log("from wardrobe :", newpath);
    // Update the state to remove the deleted image
    setAllImages(prevImages => prevImages.filter(image => image._id !== imageId));
    setFilteredImages(prevImages => prevImages.filter(image => image._id !== imageId));
    
    router.navigate({ pathname: 'create', params: { fromWardrobe: true } });
    router.setParams({ fromWardrobe: false });
    // Set the deleted image path in the Zustand store
    
  };

  // Function to handle applying the filter from FilterSlide
  const handleFilterApply = (filteredImages) => {
    
      setFilteredImages(filteredImages); // Update the filtered images in the state
      setIsFilterVisible(false); // Close the filter modal
    
  };



  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Wardrobe</Text>
          <Image source={require('../../assets/images/wardrobe2.gif')} style={styles.icon} />
        </View>
        <View style={styles.underline} />
      </View>

      {/* Category ScrollView */}
      <ScrollView horizontal style={styles.scrollView} ref={scrollViewRef}>
        {['All', 'Longsleeve', 'Shortsleeve', 'Shoes', 'Dress', 'Vest', 'Outwear', 'Pants', 'Skirt', 'Hat', 'Hoodie', 'Shorts', 'other'].map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryButton, selectedCategory === category && styles.selectedCategoryButton]}
            onPress={() => handleCategorySelect(category)}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Button */}
      <TouchableOpacity style={styles.filterButton} onPress={handleFilterButtonPress}>
        <Text style={styles.filterText}>Filter by: </Text>
        <Image source={require('../../assets/icons/index.png')} style={styles.filterIcon} />
      </TouchableOpacity>

      {/* Image Grid */}
      <View style={styles.imageContainer}>
        {loading ? (
          <Text>Loading...</Text>
        ) : filteredImages.length === 0 ? (
          <Text style={styles.noImagesText}>No images yet</Text>
        ) : (
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.gridContainer}>
              
              {/* Mapping over filtered images and passing to ProductBox */}
              {filteredImages.map((image, index) => (
                
                <ProductBox
                  key={index}
                  image={image}
                  isOutfitMode={isOutfitMode}
                  onSelect={handleSelect}
                  isSelected={isOutfitMode && selectedImages.includes(image.Newfile_path)}
                  onDelete={handleDelete} // Pass the onDelete handler
                  // Pass other props like delete handler, etc.
                />
                
              ))}
              
            </View>
          </ScrollView>
        )}
        
      </View>
      
      {/* Finish Selection Button (Outfit Mode) */}
      {isOutfitMode && (
        <TouchableOpacity style={styles.finishButton} onPress={handleFinishSelection}>
          <Text style={styles.finishButtonText}>Finish Selection</Text>
        </TouchableOpacity>
      )}

      {/* Filter Modal */}
      <Modal visible={isFilterVisible} animationType="slide" transparent>
        <FilterSlide isVisible={isFilterVisible} onClose={handleFilterClose} onApply={handleFilterApply}  />
      </Modal>
      <StatusBar backgroundColor='#000' style='light'/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    top: 30,
    backgroundColor: '#fff',
  },
  headerContainer: {
    marginBottom: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 3,
  },
  icon: {
    width: 45,
    height: 35,
  },
  underline: {
    height: 2,
    backgroundColor: '#000',
    alignSelf: 'flex-start',
    marginTop: 2,
    width: 165, 
    marginBottom: 2,
  },
  scrollView: {
    marginBottom: 370,
    marginTop: 2,
  },
  categoryButton: {
    marginRight: 5,
    width: 105,
    height: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 3,
  },
  selectedCategoryButton: {
    backgroundColor: '#000', // Black background for selected category
  },
  categoryText: {
    fontSize: 16,
    color: '#000',
  },
  selectedCategoryText: {
    color: '#fff', // White text for selected category
  },
  filterButton: {
    position: 'absolute',
    top: 120,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    justifyContent: 'center',
    width: 160,
  },
  filterText: {
    color: '#fff',
    fontSize: 18,
    marginRight: 5,
    textAlign: 'center',
    top: -2,
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  imageContainer: {
    flex: 1,
    marginTop: -700, // Position under the filter button
    backgroundColor: '#f0f0f0', // Light gray background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    marginBottom: 40,
    borderWidth: 1, // Thin black border
    borderColor: '#000', // Black color for the border
    borderRadius: 20,
  },
  scrollContainer: {
    width: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: -10,  // Add some padding to give spacing between the edge
  },
  finishButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#4CAF50', // Green button for selection finish
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  noImagesText: {
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});

export default Wardrobe;