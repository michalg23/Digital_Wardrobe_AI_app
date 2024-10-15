import { StatusBar } from 'expo-status-bar';
import { Redirect, router,useRouter } from "expo-router";
import { View, Text, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from '../components/CustomButton';
import { useEffect, useState  } from 'react';
import axiosInstance  from '../src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';


//import  Animated , { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
//import RotatingAnimation from '../components/Rotating_animation';


export default function App() {
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        setHasToken(!!token); // Sets hasToken to true if a token exists
      } catch (error) {
        console.error('Failed to fetch token:', error);
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, []);

  const handleContinueWithEmail = async () => {
    if (hasToken) {
      router.replace('/create'); // Redirect to create page if token exists
    } else {
      router.push('/sign-in'); // Redirect to sign-in page if no token
    }
  };

  if (isCheckingToken) {
    // Optionally display a loading spinner or splash screen while checking the token
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ height: "100%", }}>

        <View className="w-full justify-center items-center min-h-[105vh] px-4">
          <Image
            source={require('../../frontend/assets/icons/opening.png')}
            style={{ width: 400, height: 300, marginBottom: 40, marginTop: -150 }} // Adjust size and spacing
            resizeMode="contain"
          />
          <Image
            source={require('../../frontend/assets/images/wardrobe.gif')} // Path to your GIF file
            style={{ width:200, height: 180, marginTop: -90 }} // Adjust size and spacing for the GIF
            resizeMode="contain"
          />
          <View className="relative mt-5">
            <Text className="text-2xl text-black font-bold text-center">
              Organize Your Closet{"\n"}
              Effortlessly with{"\n"}
               AI{" "}
              <Text style={{ color: '#5ce1e6' }}>Digital Wardrobe </Text>
            </Text>

          </View>
          <CustomButton
            title="Continue with Email"
            handlePress={handleContinueWithEmail}
            containerStyles="w-full mt-7"
          />

        </View>


      </ScrollView>
      <StatusBar backgroundColor='#000' style='light'/>
    </SafeAreaView>
  );
}
