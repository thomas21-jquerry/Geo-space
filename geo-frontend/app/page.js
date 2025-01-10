// app/page.js
"use client"
import { useState } from 'react';
import Map from './components/Map';
import FileUpload from './components/FileUpload';
import Signup from './components/Signup';
import Login from './components/Login';
import axios from 'axios';

const HomePage = () => {
  const [datasets, setDatasets] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null); // Get token from localStorage
  const [isSignup, setIsSignup] = useState(false); // Toggle between Signup and Login

  const handleSignupSuccess = (token) => {
    setToken(token);
    localStorage.setItem('token', token); // Store token in local storage for persistence
  };

  const handleLoginSuccess = (token) => {
    setToken(token);
    localStorage.setItem('token', token); // Store token in local storage for persistence
  };

  const handleFileUpload = (dataset) => {
    setDatasets((prevDatasets) => [...prevDatasets, dataset]);
  };

  const toggleForm = () => setIsSignup(!isSignup);

  return (
    <div>
      {!token ? (
        <div>
          {isSignup ? (
            <Signup onSignupSuccess={handleSignupSuccess} onToggleForm={toggleForm} />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} onToggleForm={toggleForm} />
          )}
        </div>
      ) : (
        <div>
          <h1>Geospatial Data Management</h1>
          <FileUpload onFileUploaded={handleFileUpload} />
          <Map datasets={datasets} onShapeDrawn={(shape) => console.log(shape)} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
