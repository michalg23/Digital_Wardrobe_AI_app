import { View, Text ,ScrollView, Image, Alert, BackHandler } from 'react-native';
import React ,{useState} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import axiosInstance, {baseURL} from '../../src/config';
import {validateEmail, validateUsername} from '../../components/Validation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const SignUp = () => {
  
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true; // Prevents going back
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

    const [form, setForm] = useState({
    email:'',
    username: ''
    });

    const [isSubmitting, setisSubmitting] = useState(false)

    const submit  = async ()=> {

      const userData = {
        email: form.email,
        username: form.username,
      };
      if(!form.email || !form.username){
        Alert.alert('Error', 'Please fill in all the fields')
        return;
      }
      const emailValidationResult = validateEmail(form.email);
      const usernameValidationResult = validateUsername(form.username);
  
      if (emailValidationResult !== true) {
        Alert.alert('Error', 'Email is incorrect. Please use the format name@gmail.com where name can be 1-15 characters');
        return;
      }
  
      if (usernameValidationResult !== true) {
        Alert.alert('Error', 'Username is incorrect. It should be between 1 to 15 characters');
        return;
      }
      
      const apiUrl= `${baseURL}/users/signup`;
      try{
        setisSubmitting(true);
        console.log("trying to create user:",userData);
        const response = await axiosInstance.post(apiUrl, userData);//backend call
      
          if(response.status === 201) {
            console.log("user created:",response.data);
            Alert.alert('Success', 'User created successfully!');
            // Save the token to AsyncStorage
            const itemToSave = [['jwt_token', response.data.token],['inserted_id', response.data.inserted_id],['username',form.username],['email',form.email]];
              await AsyncStorage.multiSet(itemToSave);//asyncstorage call

            router.replace('/create')
            
            if (response.data.inserted_id) {
              console.log('Session ID:', response.data.inserted_id);
              // You can use AsyncStorage here to store session ID if needed
              router.replace('/create')
            }
          }

      } catch (error) {
        if (error.response && error.response.status === 400) {
          Alert.alert('Error', 'Email is already in use. Please pick a different one.');
        }
        else{
          console.log(error);
          Alert.alert('Error', 'An error occurred while creating the user.');
        }
      }
      finally {
        setisSubmitting(false); // Reset loading state
      }
    };    



    

  return (
    <SafeAreaView className='white-primary h-full'>
      <ScrollView>
         <View className="w-full justify-center min-h-[80vh] px-4 my-6">
            <Image
               source={require('../../../frontend/assets/icons/custom.png')}
               style={{ width: 450,left: -50, height: 500,top: 10,  marginTop: -250 }} // Adjust size and spacing
               resizeMode="contain"
               //resizeMode="cover"
            />
            <Text 
                  style={{
                    fontSize: 55, // Use a larger font size for emphasis
                    color: 'black',
                    fontWeight: 'bold',
                    position: 'absolute', // Position the text absolutely
                    top: 20, // Adjust the distance from the top
                    left: 70, // Adjust the distance from the left
                  }}
            >
              Join {"\n"}the app :)
            </Text>
            <Text className="text-xl text-black text-semibold font-psemibold">
              Sign up to Digital Wardrobe: 

            </Text>

            <FormField 
               title="Email:"
               value={form.email}
               handleChangeText={(e) => setForm({ ...form, email: e})}
               otherStyle="mt-7"
               keyboardType="email-adress"

            />
            <FormField 
               title="Username:"
               value={form.username}
               handleChangeText={(e) => setForm({ ...form, username: e})}
               otherStyle="mt-7"
               
            />
            <View style={{alignItems: 'center'}}>
                    <CustomButton 
                        title="Sign Up"
                        handlePress={submit}
                        containerStyles={{backgroundColor:"#000",width: 120}}
                        isLoading={isSubmitting}
                        textStyles={{color: "#FFFFFF"}}
                        
                    />
            </View>     
            <View  className="justify-center pt-5 flex-row gap-2">
              <Text className="text-lg text-black-100 font-pregular">
                allready have an account?
              </Text>
              <Link href="/sign-in" style={{fontSize: 18, fontWeight: 'bold', color: '#5ce1e6'}}>
                Sign In
              </Link>
            </View>
            
            

         </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp