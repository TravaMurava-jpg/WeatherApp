import React, {useState, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  ImageBackground,
  TextInput,
  ActivityIndicator,
  View,
  Image
} from 'react-native';

import axios from 'axios';
import * as Location from 'expo-location'

const styles = StyleSheet.create({
  root: {
    flex:1
  },

  image : {
    
    flexDirection: 'column'
  },
  
  textInput : {
    borderBottomWidth : 3,
    padding: 5,
    paddingVertical: 20,
    marginVertical: 72,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    fontSize: 19,
    borderRadius: 16,
    borderBottomColor: "#df8e00"
  },

  infoView: {
    alignItems: "center"
  },
  
  cityCountryText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: 'bold'
  },

  dateText: {
    color: "#fff",
    marginVertical: 10,
    fontSize: 25
  },

  tempText : {
    fontSize: 45,
    color: "#FFF",
    marginVertical: 10
  },

  minMaxText: {
    fontSize: 22,
    color: "#FFF",
    marginVertical: 10,
    fontWeight: '500'
  },

  forecast: {
    position: 'absolute',
    fontSize: 22,
    fontWeight: '500',
    color: '#FFF',
    right: 95
  },


  main: {
    padding: 4
  },
  
  forecast2: {

    fontSize: 22,
    fontWeight: '500',
    left: 125,
    color: '#FFF',
   
  },

  image1: {
    weight: 80,
    height: 100,
    flex:0
  },

  feels_like:{
    fontSize: 22,
    fontWeight: '500',
    color: '#FFF'
  },

  

});




const App = () => {

const api = {
  key : '16909a97489bed275d13dbdea4e01f59',
  baseUrl: 'https://api.openweathermap.org/data/2.5'
};

const [input, setInput] = useState('')
const [loading, setLoading] = useState(false)
const [data, setData] = useState([])
const [dataRecieved, setDataRecieved] = useState(false)
const [forecastData, setForecastData] = useState([])
const [location, setLocation] = useState({})
const [cityName, setCityName] = useState('')
const [timezone, setTimeZone] = useState(0)
const days = [' Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday', 'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

var todaysDate = new Date()
var seconds = todaysDate.getTime()
var mili = seconds+ timezone*1000-3600*1000
var today = new Date(mili)
const daysWeek = new Date().getDay()
const curTime = today.getHours()



useEffect(() => {
  (async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log('status',status)
    if (status !== 'granted'){
      console.log(`Permission not granted`)
    } else{
      console.log(`Permission granted!`)
    
      const loc = await Location.getCurrentPositionAsync()
      setLoading(true)
      setLocation(loc)
      axios.get(`https://api.openweathermap.org/data/2.5/forecast/daily?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&appid=${api.key}&units=metric`)
      .then(res => {
        // instead of setting all of res.data pick what you need from there to make render in lines 167-173 work. map for the forecast is working as it is
        // populating list of forecast
        setForecastData(res.data.list)
        // setting to true for the rendering to happen
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${res.data.city.name}&units=metric&appid=${api.key}`)
        .then(res => {
          setData(res.data)
          setTimeZone(res.data.timezone)
          setDataRecieved(true)
          console.log(data)
        })
        .catch(e=> console.log(e))
        })
      .catch(e=> console.log(e))
      .finally(() => setLoading(false))
}})() 
}, [])



const dataHandler = useCallback(() => {
  setLoading(true)
  setInput("")
  axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${input}&units=metric&appid=${api.key}`)
  .then(res => {
    setData(res.data)
  })
  .catch(e=> console.log(e))
  .finally(() => setLoading(false))
  axios.get(`https://api.openweathermap.org/data/2.5/forecast/daily?q=${input}&units=metric&appid=${api.key}`)
  .then(res => {
    setTimeZone(res.data.city.timezone)
    setForecastData(res.data.list)
    setDataRecieved(true)
    console.log(forecastData)
  })
}, [api.key, input])

var icon = (curTime > 18 || curTime < 10) ? require('./assets/background2.jpg') : require('./assets/background.jpg');
var daystyle = (curTime > 18 || curTime < 10) ? styles.day_night : styles.dateText
console.log(daystyle)
  return (
    
    <View style={styles.root}>
      <ImageBackground source={icon}
      resizeMode="cover"
      style={styles.image}>
        <View>
          <TextInput placeholder='Enter a city name'
                     onChangeText={text=>setInput(text)}
                     value={input}
                     placeholderTextColor={'#000'}
                     style={styles.textInput}
                     onSubmitEditing={dataHandler}></TextInput>
        </View>
        {loading && (<View>
          <ActivityIndicator size={'large'} color={'#000'} />
            </View>
            )}

{dataRecieved && (
          <View style={styles.infoView}>
          <Text style={styles.cityCountryText}>
            {`${data.name} ${data.sys.country}`}
          </Text>
          <Text style={styles.dateText}>{today.toLocaleString()}</Text>
          <Text style={styles.dateText}>{days[daysWeek]}</Text>
          <View>
          <Image style={styles.image1} source={{uri: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}}/>
          </View>
          <Text style={styles.tempText}>{`${Math.round(data.main.temp)} °C`}</Text>
         
          <Text style={styles.feels_like}>{`*Feels like ${Math.round(data.main.feels_like)} °C`}</Text>
          <Text style={styles.minMaxText}>{`Min ${Math.round(data.main.temp_min)}  °C / Max ${Math.round(data.main.temp_max)} °C`}</Text>
          {forecastData.map((forecast, index) => { return(
            <View key ={index} style={styles.main}>
            <Text style={styles.forecast}>{`${days[daysWeek+ index+ 1]}`}</Text>
            <Text style={styles.forecast2}>{`${Math.round(forecast.temp.day)} °C`}</Text>
            </View>
          )})}
          </View>
          )}
      
      </ImageBackground>

    </View>
  )
}



export default App;
