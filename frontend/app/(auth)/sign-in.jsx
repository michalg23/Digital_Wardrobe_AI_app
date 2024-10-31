import { View, Text ,ScrollView, Image, Alert, BackHandler} from 'react-native';
import React ,{useState, useEffect} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link ,router} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance, {baseURL} from '../../src/config';
import {validateEmail, validateUsername} from '../../components/Validation';
import { useFocusEffect,useRoute } from '@react-navigation/native';

const SignIn = () => {


   useEffect(() => {
    // Define a function to handle back button press
    const backAction = () => {
      //Alert.alert("Hold on!", "You can't go back from the sign-in screen.");
      return true; // Return true to disable back button
    };

    // Add the event listener for back press
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Cleanup the event listener on component unmount
    return () => backHandler.remove();
   }, []);
   
   const [form, setForm] = useState({
    email:'',
    username: ''
    });
    const [isSubmitting, setisSubmitting] = useState(false)

    const submit = async () => {
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
      const apiUrl= `${baseURL}/users/signin`;
      const apiUrl1= `${baseURL}/users/profile`;
      const apiUrl2= `${baseURL}/images`;
      const apiUrl3= `${baseURL}/get-image-url`;
      const apiUrl5= `${baseURL}/outfits`; 

      try{
        setisSubmitting(true);
        console.log("trying to sign in with:",userData);
        const response = await axiosInstance.post(apiUrl, userData);//backend call
      
          if(response.status === 200) {
            console.log("user was found ");
            Alert.alert('Welcome', 'User signed in successfully!');
            const token = response.data.token;
            //get user profile data to save
            const userProfile = await axiosInstance.get(apiUrl1);//backend call
            if (userProfile.status === 200) {
              const profileToSave = [['jwt_token',token],['username',userProfile.data.username],['email',userProfile.data.email],['inserted_id',userProfile.data.id]];
              await AsyncStorage.multiSet(profileToSave);//asyncstorage call
              // Fetch user images from backend
              const imagesUser = await axiosInstance.get(apiUrl2);
              if (imagesUser.status === 200) {
                const images = imagesUser.data;
                console.log("got user's images")// Create an array to hold updated images
                const updatedImages = await Promise.all(images.map(async image => {
                  // const apiUrl3 = `${baseURL}/get-image-url`;
                  const response = await axiosInstance.post(apiUrl3, {
                    file_path: image.file_path
                  });
                  // Return a new object with the updated file_path
                  return {...image, Newfile_path: `${baseURL}${response.data.url}`}; // Use the corrected path
                }));
          
                // Save the updated images array to AsyncStorage
                await AsyncStorage.setItem('wardrobeImages', JSON.stringify(updatedImages));
                const savedImages = JSON.parse(await AsyncStorage.getItem('wardrobeImages'));
                console.log("Retrieved images:", savedImages);
                console.log("Images saved to AsyncStorage");

              }else{
                console.log("could not get user's images")
              }
              // Fetch user colors from backend
              const apiUrl4= `${baseURL}/users/${userProfile.data.id}/colors`;
              const userColors = await axiosInstance.get(apiUrl4);
              if (userColors.status === 200) {
                const colors = userColors.data.color;
                console.log("got user's colors")
                await AsyncStorage.setItem('Colors', JSON.stringify(colors)); // Save colors
              }else{
                console.log("could not get user's colors")
              }
              const userOutfits = await axiosInstance.get(apiUrl5);
              if (userOutfits.status === 200) {
                const outfits = userOutfits.data;
                console.log("Got user's outfits");
                await AsyncStorage.setItem('outfitsCalendar', JSON.stringify(outfits)); // Save outfits
                const savedOutfits = JSON.parse(await AsyncStorage.getItem('outfitsCalendar'));
                console.log("Retrieved outfits:", savedOutfits);
                console.log("Outfits saved to AsyncStorage");
              } else {
                console.log("Could not get user's outfits");
              }
              
              router.navigate({ pathname: 'create', params: { fromSignIn: true } });
              //router.replace('/create');
            }
          } else{
            Alert.alert('error', 'User was not found !');
          }
      } catch (error) {
        if (error.response ){
          if (error.response.status === 401) {
            Alert.alert('Error', 'User was not found! try again');
          } else {
            Alert.alert('Error', 'An error occurred. Please try again.');
          }
        } else {
          // No response received or another error occurred
          Alert.alert('Error', 'An error occurred while connecting a user.');
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
               source={require('../../assets/icons/custom.png')}
               style={{ width: 450,left: -50, height: 500,top: 10,  marginTop: -250 }} // Adjust size and spacing
               resizeMode="contain"
               
            />
            <Text 
                  style={{
                    fontSize: 45, // Use a larger font size for emphasis
                    color: 'black',
                    fontWeight: 'bold',
                    position: 'absolute', // Position the text absolutely
                    top: 30, // Adjust the distance from the top
                    left: 70, // Adjust the distance from the left
                  }}
            >
              welcome {""} back :)
            </Text>
            <Text className="text-xl text-black text-semibold font-psemibold">
              log in to Digital Wardrobe: 

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
                        title="Sign In"
                        handlePress={submit}
                        containerStyles={{backgroundColor:"#000",width: 120}}
                        isLoading={isSubmitting}
                        textStyles={{color: "#FFFFFF"}}
                        
                    />
            </View>     
            <View  className="justify-center pt-5 flex-row gap-2">
              <Text className="text-xl text-black-100 font-pregular">
                Don't have account?
              </Text>
              <Link href="/sign-up" style={{fontSize: 20, fontWeight: 'bold', color: '#5ce1e6'}}>
                Sign Up 
              </Link>
            </View>

         </View>
      </ScrollView>
    </SafeAreaView>
  )
};

export default SignIn