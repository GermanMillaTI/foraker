import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <MainPage /> : <LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
