import { View, Text, TextInput } from 'react-native'
import React ,{useState} from 'react';

const FormField = ({title, value, placeholder, handleChangeText,otherStyles, ...props}) => {
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-black-100 font-pmedium">
        {title}
      </Text>
        <View style={{flexDirection: 'row',alignItems: 'center',borderColor: '#000',backgroundColor: '#FFFFFF',borderWidth: 2,width: '100%',height: 64,paddingHorizontal: 16,
            borderRadius: 16,justifyContent: 'center',}}
            className="items-center"
            {...props}
        >
        <TextInput 
           style={{fontSize:20,textAlign: 'left',}}
           className="flex-1 text-black text-base"
           value={value}
           placeholder={placeholder}
           placeholderTextColor="#7b7b8b"
           onChangeText={handleChangeText}
           
        />
        </View>



    </View>
  )
}

export default FormField