import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [userName, setUserName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      onLogin(userName); // Pass the userName to the onLogin handler
    } else {
      alert("Please enter a valid name.");
    }
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center bg-gray-100">
      <h2 className="text-3xl font-bold mb-4 text-blue-600">Welcome to the Awesome Chat App</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
          className="border border-gray-300 rounded p-2 mb-4 w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition duration-300"
        >
          Join Chat
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
