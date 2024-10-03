import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, MessageSquare, LogOut, Volume2, Mic } from 'lucide-react';

const ChatApp = ({ userName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentRoom, setCurrentRoom] = useState('General');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [isListening, setIsListening] = useState(false); // Speech recognition state
  const messagesEndRef = useRef(null);
  const socket = useRef();
  const recognitionRef = useRef(null); // Reference for speech recognition

  useEffect(() => {
    socket.current = io('http://127.0.0.1:8000');

    // Join the room after the socket connection is established
    socket.current.emit('join room', currentRoom);

    socket.current.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.current.on('user count', (count) => {
      setOnlineUsers(count);
    });

    // Initialize SpeechRecognition
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript); // Set the recognized speech to the input
      };
    }

    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.current.emit('leave room', currentRoom);
    socket.current.emit('join room', currentRoom);
    setMessages([]);
  }, [currentRoom]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const message = `${userName}: ${input}`;
      socket.current.emit('chat message', { room: currentRoom, message });
      setInput('');
    }
  };

  const handleTextToSpeech = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeechToText = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-100 to-blue-300 p-6">
      <h2 className="text-4xl font-extrabold text-center mb-8 text-blue-700">
        Awesome Chat App
      </h2>

      <div className="flex-grow flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <MessageSquare className="mr-2" />
            <span className="font-bold text-lg">{currentRoom} Room</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-2" />
            <span className="font-semibold">{onlineUsers} online</span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-lg my-2 shadow-md ${
                  index % 2 === 0 ? 'bg-blue-100 self-end' : 'bg-gray-200 self-start'
                }`}
              >
                {msg}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-gray-100">
          <form onSubmit={handleFormSubmit} className="flex space-x-2">
            <select
              className="border border-gray-300 rounded-lg p-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => setCurrentRoom(e.target.value)}
              value={currentRoom}
            >
              <option value="General">General</option>
              <option value="Sports">Sports</option>
              <option value="Technology">Technology</option>
              <option value="Music">Music</option>
            </select>
            <input
              className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-2 rounded-r-lg hover:bg-blue-600 transition duration-300 ease-in-out flex items-center"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      <div className="flex space-x-4 mt-4">
        <button
          onClick={() => handleTextToSpeech(messages[messages.length - 1])}
          className="bg-gradient-to-r from-green-500 to-green-700 text-white p-3 rounded-lg hover:bg-green-600 transition duration-300 ease-in-out flex items-center justify-center shadow-lg"
        >
          <Volume2 size={20} className="mr-2" />
          Read Last Message
        </button>

        <button
          onClick={handleSpeechToText}
          className={`bg-gradient-to-r ${
            isListening ? 'from-yellow-500 to-yellow-700' : 'from-blue-500 to-blue-700'
          } text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out flex items-center justify-center shadow-lg`}
        >
          <Mic size={20} className="mr-2" />
          {isListening ? 'Listening...' : 'Start Speaking'}
        </button>
      </div>

      <button
        onClick={() => {
          socket.current.disconnect();
          window.location.reload();
        }}
        className="mt-4 bg-gradient-to-r from-red-500 to-red-700 text-white p-3 rounded-lg hover:bg-red-600 transition duration-300 ease-in-out flex items-center justify-center shadow-lg"
      >
        <LogOut size={20} className="mr-2" />
        Leave Chat
      </button>
    </div>
  );
};

export default ChatApp;
