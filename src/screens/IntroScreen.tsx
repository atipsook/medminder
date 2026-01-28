import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';

const IntroScreen = () => {
  return (
    <LinearGradient
      colors={[ '#0b2d58ff','#fff','#0b2d58ff',]} // The top and bottom gradient colors
      style={styles.container}
    >
      <Image
        source={require("../assets/logo.png")}
        style={styles.picture1}
      />
    </LinearGradient>
  )
}

export default IntroScreen

const styles = StyleSheet.create({
    picture1:{
        width: 200,
        height: 150,
    },
    container:{
        
        flex: 1,
        justifyContent: "center",
        alignItems:"center",
    }
})