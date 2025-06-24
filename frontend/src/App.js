// frontend/src/App.js
import React from "react";
import Chat from "./Chat";
import "./App.css";

function App() {
  return (
    <div className="App">
      <div className="app-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        <Chat />
      </div>
    </div>
  );
}

export default App;