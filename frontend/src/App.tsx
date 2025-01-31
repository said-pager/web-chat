// src/App.tsx

import React, { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";

function App() {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Connect to the Socket.io server
    const socket = io("http://localhost:8000");

    // Listen for the connection
    socket.on("connect", () => {
      console.log("Connected to server with ID:", socket.id);
    });

    // Listen for messages or events from the server
    socket.on("message", (data: string) => {
      setMessage(data);
    });

    // Clean up the socket connection when the component is unmounted
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <h1>React TypeScript with Socket.io</h1>
      <h2>Socket.io Test</h2>
      <p>Message from server: {message}</p>
    </div>
  );
}

export default App;
