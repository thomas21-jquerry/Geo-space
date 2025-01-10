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
    <div style={styles.container}>
      {!token ? (
        <div style={styles.authContainer}>
          {isSignup ? (
            <Signup onSignupSuccess={handleSignupSuccess} onToggleForm={toggleForm} />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} onToggleForm={toggleForm} />
          )}
        </div>
      ) : (
        <div style={styles.mainContent}>
          <h1 style={styles.heading}>Geospatial Data Management</h1>
          <FileUpload onFileUploaded={handleFileUpload} />
          <Map datasets={datasets} onShapeDrawn={(shape) => console.log(shape)} />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f7f6',
    padding: '20px',
  },
  authContainer: {
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '30px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  mainContent: {
    width: '100%',
    maxWidth: '1200px',
    marginTop: '20px',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#333',
  },
  fileUploadSection: {
    marginBottom: '20px',
    padding: '15px',
    border: '1px dashed #ccc',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    textAlign: 'center',
  },
  // Enhanced Button Styles
  button: {
    backgroundColor: '#007BFF',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '10px',
  },
  buttonHover: {
    backgroundColor: '#0056b3', // Darker shade for hover
  },
  fileNameContainer: {
    marginTop: '20px',
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f8f8f8',
    textAlign: 'center',
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
  },
  fileNameText: {
    marginTop: '10px',
    fontSize: '16px',
    color: '#444',
    fontWeight: 'bold',
    wordWrap: 'break-word', // Ensures file names don't overflow
  },
};

export default HomePage;
