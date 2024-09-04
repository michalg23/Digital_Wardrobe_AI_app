import { View, Text ,ScrollView, Image} from 'react-native';
import React ,{useState} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
//import FastImage from 'react-native-fast-image';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link } from 'expo-router';

const SignUp = () => {
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
  )
}

export default SignUp