import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { PlayerProvider } from "./context/PlayerContext.jsx";
import { FlipProvider } from "./context/FlipContext.jsx";
import { DataProvider } from './context/DataContext';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PlayerProvider>
      <FlipProvider>
        <DataProvider>
        <App />
        </DataProvider>
        </FlipProvider>
    </PlayerProvider>
  </StrictMode>
);
