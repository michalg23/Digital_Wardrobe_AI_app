import { View, Text ,ScrollView, Image} from 'react-native';
import React ,{useState} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
//import FastImage from 'react-native-fast-image';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link } from 'expo-router';

const SignIn = () => {
   const [form, setForm] = useState({
    email:'',
    username: ''
    });
    const [isSubmitting, setisSubmitting] = useState(false)

    const submit = () => {

    }

  return (
    <SafeAreaView className='white-primary h-full'>
      <ScrollView>
         <View className="w-full justify-center min-h-[80vh] px-4 my-6">
            <Image
               source={require('C:/Users/student/Desktop/FinalProject/frontend/assets/icons/custom.png')}
               style={{ width: 450,left: -50, height: 500,top: 10,  marginTop: -250 }} // Adjust size and spacing
               resizeMode="contain"
               //resizeMode="cover"
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
}

export default SignIn