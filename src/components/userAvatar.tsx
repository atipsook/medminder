import { StyleSheet, Text, View,Image } from 'react-native'
import React from 'react'

const userAvatar = () => {
  return (
   <Image
   source={{uri:"https://keqingmains.com/wp-content/uploads/2024/05/yae-splash.webp"}}
   style={styles.avatar}
   />

  )
}

export default userAvatar

const styles = StyleSheet.create({
    avatar:{
        height: 32,
        width: 32,
        borderRadius: 16,

    }
})