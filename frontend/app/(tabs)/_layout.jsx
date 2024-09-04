import { View, Text ,Image} from 'react-native';
import { Tabs, Redirect} from 'expo-router';

import { icons }  from '../../constants';

const TabIcon= ({ icon, color, name, focused }) => {
    
    return (
       <View className="items-center justify-center gap-1" style={{ paddingTop: 5 }}>
            <Image 
                source={icon}
                resizeMode="contain"
                tintColor={color}
                className="w-6 h-6"
                style={{ width: 30, height: 30, tintColor: color }} // white color shade for the icon
            />
           <Text
                className={`${focused ? 'font-psemibold' : 'font-pregular'}`}
                style={{ fontSize: 14, color: color }} // Larger text size and blue color
            >
                {name}
            </Text>   

        </View>
    );
};

const TabsLayout = () => {
    return (
      <>
        <Tabs
          screenOptions={{
            tabBarShowLabel: false,
            tabBarActiveTintColor: '#000',
            tabBarInactiveTintColor: '#FFFFFF',
            tabBarActiveBackgroundColor: '#ADD8E6',
            // Increase the height of the tab bar and adjust styling
            tabBarStyle: {
              height: 60, // Make the tab bar taller
              backgroundColor: '#000'
            },
          }}
        >
          <Tabs.Screen
            name="wardrobe"
            options={{
              title: 'Wardrobe',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.wardrobe}
                  color={color}
                  name="Wardrobe"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="create"
            options={{
              title: 'Create',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.plus}
                  color={color}
                  name="Add"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
              title: 'Calendar',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.calendar}
                  color={color}
                  name="Calendar"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.profile}
                  color={color}
                  name="Profile"
                  focused={focused}
                />
              ),
            }}
          />
        </Tabs>
      </>
    );
  };
  
  export default TabsLayout;