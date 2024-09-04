import { TouchableOpacity, Text , StyleSheet, ActivityIndicator } from 'react-native'
import React from 'react'

const CustomButton = ({title, handlePress, containerStyles,
    textStyles, isLoading,}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.buttonContainer, isLoading && styles.loading, containerStyles]}
        disabled={isLoading }
      
    >
      <Text style={[styles.buttonText, textStyles]}>{title}</Text>

      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
          style={styles.activityIndicator}
        />
      )}
    </TouchableOpacity>
  );
};



export default CustomButton;
const styles = StyleSheet.create({
    buttonContainer: {
      backgroundColor: '#5ce1e6', // Set background color
      borderRadius: 12, // Equivalent to rounded-xl
      minHeight: 60, // Equivalent to min-h-[60px]
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16, // Adds padding inside the button
      marginTop: 20, // Adjust this to move the button lower
    },
    loading: {
      opacity: 0.5, // Reduce opacity when loading
    },
    buttonText: {
      color: '#000', // Change the text color as needed
      fontWeight: '600', // Equivalent to font-psemibold
      fontSize: 18, // Equivalent to text-lg
    },
    activityIndicator: {
      marginLeft: 10, // Space between text and loader
    },
  });