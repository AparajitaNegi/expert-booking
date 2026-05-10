import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('experts'); // experts | detail | booking | mybookings
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null); // { date, time }
  const [toast, setToast] = useState(null);

  const navigate = (page, data = {}) => {
    setCurrentPage(page);
    if (data.expert !== undefined) setSelectedExpert(data.expert);
    if (data.slot !== undefined) setSelectedSlot(data.slot);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <AppContext.Provider value={{ currentPage, selectedExpert, selectedSlot, navigate, showToast, toast }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
