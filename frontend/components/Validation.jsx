import { View, Text } from 'react-native';
import React from 'react';

// Function to validate the email
export const validateEmail = (email) => {
  // Regular expression to match the pattern: any character up to 15 times + @gmail.com
  const emailRegex = /^[\w\W]{1,15}@gmail\.com$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  return true; // Return true if validation is successful
};

// Function to validate the username
export const validateUsername = (username) => {
  // Username should be between 1 to 15 characters
  if (username.length >= 1 && username.length <=15 ) {
    return true;
  }

  return false; // Return true if validation is successful
};

// Optional component to display validation messages or feedback
const Validation = () => {
  return (
    <View>
      <Text>Validation Component</Text>
    </View>
  );
};

export default Validation;
