import React, { createContext, useState, useContext } from "react";

const PlayerPut = createContext();

export const PlayerPutProvider = ({ children }) => {
  const [isPut, setIsPut] = useState(false);

  // Toggle the state of isPut
  const togglePut = (state) => {
    setIsPut(state);
  };

  return (
    <PlayerPut.Provider value={{ isPut, togglePut }}>
      {children}
    </PlayerPut.Provider>
  );
};

// Custom hook to use flip context
export const usePlayerPut = () => useContext(PlayerPut);
