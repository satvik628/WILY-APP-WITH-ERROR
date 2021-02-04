//import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View , Image } from 'react-native';
import SearchScreen from './screens/SearchScreen';
import TransactionScreen from './screens/TransactionScreen';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import {createAppContainer} from 'react-navigation';


export default function App() {
  return (
    <View style={styles.container}>
      <Text>Welcome!</Text>
    <AppContainer/>
    </View>
  );
}

const TabNavigator=createBottomTabNavigator({
Transaction:{screen: TransactionScreen},
Search:{screen: SearchScreen}},
{
  defaultNavigationOptions :({navigation})=>({

    tabBarIcon: ()=>{
      const routeName=navigation.state.routeName;
      if(routeName==="Transaction"){
        return(
          <Image
          source={require("./assets/book.png")}
          style={{alignSelf:'center',width:25 , height:25}}
          />
        )
      }
      else if(routeName==="Search"){
        return( 
          <Image
          source={require("./assets/searchingbook.png")}
          style={{alignSelf:'center',width:25 , height:25}}
          />
        )
      }
    }
  })



})
const AppContainer=createAppContainer(TabNavigator)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    //alignItems: 'center',
    justifyContent: 'center',
  },
});
