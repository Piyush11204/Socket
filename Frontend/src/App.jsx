// src/App.js

import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import ChatApp from './pages/ChatApp';

const App = () => {
  const [userName, setUserName] = useState('');

  const handleLogin = (name) => {
    setUserName(name);
  };

  return (
    <div className="App">
      {!userName ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <ChatApp userName={userName} />
      )}
    </div>
  );
};

export default App;
