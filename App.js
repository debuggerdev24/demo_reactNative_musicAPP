import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PermissionScreen from './Screens/PermissionScreen';
import MusicListScreen from './Screens/MusicListScreen';
import MusicPlayerScreen from './Screens/MusicPlayerScreen';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import History from './Screens/History';
import PlaylistScreen from './Screens/PlaylistScreen';
import PlayListMusic from './Screens/PlayListMusic';

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();


function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "black",
        tabBarIndicatorStyle: {
          backgroundColor: "#ccc",
        },
        tabBarLabelStyle: {
          fontSize: 14,
          color:"#555",
        },
        tabBarStyle: {
          backgroundColor: "#f2f2f2",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0.2,
          borderBottomColor: "gray",
          borderRadius: 20,
        },
      }}
    >
      <Tab.Screen name="Music" component={MusicListScreen} />
      <Tab.Screen name="Playlist" component={PlaylistScreen} />
      <Tab.Screen name="History" component={History} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Permissions">
        <Stack.Screen name="Permissions" options={{ headerShown: false }} component={PermissionScreen} />
        <Stack.Screen name="MusicList" options={{ headerShown: false }} component={MusicListScreen} />
        <Stack.Screen name="MusicPlayerScreen" options={{ headerShown: false }} component={MusicPlayerScreen} />
        <Stack.Screen name="PlayListMusic" options={{ headerShown: false }} component={PlayListMusic} />
        <Stack.Screen name="MyTabs" options={{ headerShown: false }} component={MyTabs} />
      </Stack.Navigator>

    </NavigationContainer>
  );
}

export default App;