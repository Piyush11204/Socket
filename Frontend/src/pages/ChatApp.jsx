import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, MessageSquare, LogOut, Volume2, Mic, MapPin, Image } from 'lucide-react';

const ChatApp = ({ userName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentRoom, setCurrentRoom] = useState('General');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [imageURL, setImageURL] = useState(''); // State for image URL
  const messagesEndRef = useRef(null);
  const socket = useRef();
  const recognitionRef = useRef(null);

  useEffect(() => {
    socket.current = io('http://127.0.0.1:8000');

    socket.current.emit('join room', currentRoom);

    socket.current.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.current.on('user count', (count) => {
      setOnlineUsers(count);
    });

    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
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

  const handleImageShare = () => {
    if (imageURL.trim()) {
      const message = `${userName} shared an image: <iframe src="${imageURL}" class="w-32 h-32 cursor-pointer" frameborder="0"></iframe>`;
      socket.current.emit('chat message', { room: currentRoom, message });
      setImageURL('');
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

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Create an embedded Google Maps iframe using latitude and longitude
          const locationMessage = `
            ${userName} shared their location:
            <iframe
              src="https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed"
              width="400"
              height="300"
              frameborder="0"
              style="border:0;"
              allowfullscreen=""
              aria-hidden="false"
              tabindex="0"
              class="mt-2 w-full max-w-lg"
            ></iframe>
          `;
          socket.current.emit('chat message', { room: currentRoom, message: locationMessage });
        },
        (error) => {
          alert('Unable to fetch your location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
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
                dangerouslySetInnerHTML={{ __html: msg }} // Use this to render the HTML iframe
              />
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

          {/* Image Sharing Input and Button */}
          <div className="flex mt-4">
            <input
              type="url"
              className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Paste image URL here..."
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
            />
            <button
              onClick={handleImageShare}
              className="bg-gradient-to-r from-green-500 to-green-700 text-white p-2 rounded-r-lg hover:bg-green-600 transition duration-300 ease-in-out flex items-center"
            >
              <Image size={20} className="mr-2" />
              Share Image
            </button>
          </div>
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

        <button
          onClick={handleLocationShare}
          className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-3 rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out flex items-center justify-center shadow-lg"
        >
          <MapPin size={20} className="mr-2" />
          Share Location
        </button>
      </div>
    </div>
  );
};

export default ChatApp;

