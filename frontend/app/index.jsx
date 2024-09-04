import { StatusBar } from 'expo-status-bar';
import { Redirect, router } from "expo-router";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FastImage from 'react-native-fast-image';
import CustomButton from '../components/CustomButton';


//import  Animated , { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
//import RotatingAnimation from '../components/Rotating_animation';


export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ height: "100%", }}>

        <View className="w-full justify-center items-center min-h-[105vh] px-4">
          <Image
            source={require('C:/Users/student/Desktop/FinalProject/frontend/assets/icons/opening.png')}
            style={{ width: 400, height: 300, marginBottom: 40, marginTop: -150 }} // Adjust size and spacing
            resizeMode="contain"
          />
          <FastImage
            source={require('C:/Users/student/Desktop/FinalProject/frontend/assets/images/wardrobe.gif')} // Path to your GIF file
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
                handlePress={() => router.push('sign-in')}
                containerStyles= "w-full mt-7"
          />

        </View>


      </ScrollView>
      <StatusBar backgroundColor='#000' style='light'/>
    </SafeAreaView>
  );
}
