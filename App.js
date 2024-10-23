import { Oval } from 'react-loader-spinner';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function Grp204WeatherApp() {
    const [input, setInput] = useState('');
    const [weather, setWeather] = useState({
        loading: false,
        data: {},
        error: false,
    });
    const [forecast, setForecast] = useState([]);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        setFavorites(savedFavorites);
    }, []);

    const toDateFunction = () => {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const weekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const currentDate = new Date();
        const date = `${weekDays[currentDate.getDay()]} ${currentDate.getDate()} ${months[currentDate.getMonth()]}`;
        return date;
    };

    const search = async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setInput('');
            setWeather({ ...weather, loading: true });
            const url = 'https://api.openweathermap.org/data/2.5/weather';
            const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
            const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

            try {
                const res = await axios.get(url, {
                    params: {
                        q: input,
                        units: 'metric',
                        appid: api_key,
                    }
                });

                const forecastRes = await axios.get(forecastUrl, {
                    params: {
                        q: input,
                        units: 'metric',
                        appid: api_key,
                    }
                });

                setWeather({ data: res.data, loading: false, error: false });
                setForecast(forecastRes.data.list.slice(0, 5));  // Get 5-day forecast
            } catch (error) {
                setWeather({ ...weather, data: {}, error: true });
            }
            setInput('');
        }
    };

    const saveToFavorites = (city) => {
        if (!favorites.includes(city)) {
            const updatedFavorites = [...favorites, city];
            setFavorites(updatedFavorites);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        }
    };

    const loadFavoriteCity = async (city) => {
        setInput(city);
        const url = 'https://api.openweathermap.org/data/2.5/weather';
        const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
        const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

        try {
            const res = await axios.get(url, {
                params: {
                    q: city,
                    units: 'metric',
                    appid: api_key,
                }
            });

            const forecastRes = await axios.get(forecastUrl, {
                params: {
                    q: city,
                    units: 'metric',
                    appid: api_key,
                }
            });

            setWeather({ data: res.data, loading: false, error: false });
            setForecast(forecastRes.data.list.slice(0, 5));
        } catch (error) {
            setWeather({ ...weather, data: {}, error: true });
        }
    };

    return (
        <div className="App">
            <h1 className="app-name">Application Météo </h1>

            <div className="search-bar">
                <input
                    type="text"
                    className="city-search"
                    placeholder="Entrez le nom de la ville..."
                    name="query"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyPress={search}
                />
            </div>

            <div className="favorites-list">
                {favorites.map((city, index) => (
                    <button key={index} onClick={() => loadFavoriteCity(city)}>
                        {city}
                    </button>
                ))}
            </div>

            {weather.loading && (
                <Oval type="Oval" color="black" height={100} width={100} />
            )}

            {weather.error && (
                <span className="error-message">
                    <FontAwesomeIcon icon={faFrown} />
                    <span>Ville introuvable</span>
                </span>
            )}

            {weather && weather.data && weather.data.main && (
                <div>
                    <h2>{weather.data.name}, {weather.data.sys.country}</h2>
                    <span>{toDateFunction()}</span>
                    <img
                        src={`https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`}
                        alt={weather.data.weather[0].description}
                    />
                    <p>{Math.round(weather.data.main.temp)}°C</p>
                    <p>Vitesse du vent : {weather.data.wind.speed} m/s</p>
                    <button onClick={() => saveToFavorites(weather.data.name)}>Ajouter aux favoris</button>

                    <div className="forecast-container">
                        {forecast.map((forecast, index) => (
                            <div key={index} className="forecast-card">
                                <p>{new Date(forecast.dt * 1000).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}</p>
                                <img
                                    src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                                    alt={forecast.weather[0].description}
                                />
                                <p>{Math.round(forecast.main.temp)}°C</p>
                                <p>{forecast.weather[0].description}</p>
                                <p>Humidité : {forecast.main.humidity}%</p>
                                <p>Vitesse du vent : {forecast.wind.speed} m/s</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Grp204WeatherApp;
