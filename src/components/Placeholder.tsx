import { StyleSheet, Text, View,Image } from 'react-native'
import React from 'react'

const Placeholder = () => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
              <View style={styles.card1}>
                 <Image
                         source={{uri:"https://openclipart.org/image/2000px/289282"}}
                        style={styles.picture1}/>
                <Text style={styles.title}>Healthy recipe</Text>
              
              </View>
              <View style={styles.card}>
                 <Image
                        source={{uri:"https://static.thenounproject.com/png/637461-200.png"}}
                        style={styles.picture1}/>
                <Text style={styles.title}>Exercise</Text>
                
              </View>
              <View style={styles.card2}>
               <Image
                        source={{uri:"https://cdn-icons-png.flaticon.com/512/11782/11782312.png"}}
                        style={styles.picture1}/>
                <Text style={styles.title}>Online fraud</Text>
                
              </View>
            </View>
    </View>
  )
}

export default Placeholder

const styles = StyleSheet.create({
     card: {
    backgroundColor: '#f72a06ff',
    padding: 16,
    borderRadius: 25,
    marginVertical: 6,
    elevation: 3,
    height: "85%",
    width: "35%",
    marginHorizontal: 5,
  },
  picture1:{
        width: 50,
        height: 50,
        alignSelf:'center',
        
    },
  card1: {
    backgroundColor: '#23d467ce',
    padding: 16,
    borderRadius: 25,
    marginVertical: 6,
    elevation: 3,
    height: "85%",
    width: "35%",
    marginHorizontal: 5,
  },
  card2: {
    backgroundColor: '#69d5f0ff',
    padding: 16,
    borderRadius: 25,
    marginVertical: 6,
    elevation: 3,
    height: "85%",
    width: "35%",
    marginHorizontal: 5,
  },
  title: {
    marginTop: 5,
    fontSize: 18,
    color: '#ffffffff',

  },
 
  row:{
    flexDirection: "row",
    justifyContent:'center',
    
  },
  container:{
        paddingHorizontal: 10,
        
        
  }
})