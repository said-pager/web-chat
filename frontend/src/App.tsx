import React, { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";

function App() {
  const [message, setMessage] = useState<string>("");
  const [dbStatus, setDbStatus] = useState<string>("checking...");

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

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("http://localhost:8000/status");
        const data = await response.json();
        setDbStatus(data.status);
      } catch (error) {
        setDbStatus("disconnected");
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Check DB status every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>React TypeScript with Socket.io</h1>
      <h2>Socket.io Test</h2>
      <p>Message from server: {message}</p>

      {/* PostgreSQL Connection Status */}
      <h2>Database Status</h2>
      <p>
        <strong>Status: </strong>
        <span style={{ color: dbStatus === "connected" ? "green" : "red" }}>
          {dbStatus}
        </span>
      </p>
    </div>
  );
}

export default App;
