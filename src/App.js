import './App.css';
import React, { useEffect, useState } from "react";
import { Dimmer, Loader } from 'semantic-ui-react';
import Weather from './components/weather';
import Forecast from './components/forecast';
export default function App() {
  
  const [lat, setLat] = useState([]);
  const [long, setLong] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
      navigator.geolocation.getCurrentPosition(function(position) {
        setLat(position.coords.latitude);
        setLong(position.coords.longitude);
      });
      
      if (typeof lat === 'number' && typeof long === 'number') {
        getWeather(lat, long)
        .then(weather => {
          setWeatherData(weather);
          setError(null);
        })
        .catch(err => {
          setError(err.message);
        });

        getForecast(lat, long)
          .then(data => {
            setForecast(data);
            setError(null);
          })
          .catch(err => {
            setError(err.message);
          });
      }
  }, [lat,long,error])

  function handleResponse(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Everything is burning, BAIL, BAIL, BAIL.");
    }
  }

  function getWeather(lat, long) {
    return fetch(
      `${process.env.REACT_APP_API_URL}/weather/?lat=${lat}&lon=${long}&units=metric&APPID=${process.env.REACT_APP_API_KEY}`
    )
      .then(res => handleResponse(res))
  }
  
  function getForecast(lat, long) {
    return fetch(
      `${process.env.REACT_APP_API_URL}/forecast/?lat=${lat}&lon=${long}&units=metric&APPID=${process.env.REACT_APP_API_KEY}`
    )
      .then(res => handleResponse(res))
      .then(forecastData => {
        if (Object.entries(forecastData).length) {
          return forecastData.list
            .filter(forecast => forecast.dt_txt.match(/09:00:00/))
        }
      });
  }
  
  return (
    <div className="App">
      {(typeof weatherData.main != 'undefined') ? (
        <div>
          <Weather weatherData={weatherData}/>
          <Forecast forecast={forecast} weatherData={weatherData}/>
        </div>
      ): (
        <div>
          <Dimmer active>
            <Loader>Loading..</Loader>
            {error}
          </Dimmer>
        </div>
      )}
    </div>
  );
}