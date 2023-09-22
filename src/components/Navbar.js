import React, { useState } from 'react';
import { auth } from '../firebase/config'
import { signOut } from 'firebase/auth';
import Constants from './Constants';

import './Navbar.css';

function Navbar({ database, setActivePage, setShowStats, setShowStatsSessions, setShowBonuses, setShowBins }) {
  const [role, setRole] = useState(database['users'][auth.currentUser.uid]);

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="navbar">
      {role == "admin" && <button className="navbar-button" onClick={() => setActivePage("Participants")}>Participants</button>}
      {role == "admin" && <button className="navbar-button" onClick={() => setActivePage("Scheduler")}>Scheduler</button>}
      {(role == "admin" || role == "external") && <button className="navbar-button" onClick={() => setActivePage("Scheduler Overview")}>Scheduler overview</button>}
      <button className="navbar-button" onClick={() => setShowStats(true)}>Participant stats</button>
      <button className="navbar-button" onClick={() => setShowStatsSessions(true)}>Session stats</button>
      {Constants.superAdmins.includes(auth.currentUser.email) && <button className="navbar-button" onClick={() => setShowBins(true)}>Demo bins</button>}

      {Constants.superAdmins.includes(auth.currentUser.email) && <button className='navbar-button' onClick={() => setActivePage("ActivityLog")}>Activity Log</button>}
      
      {['zoltan.bathori@telusinternational.com', 'sari.kiiskinen@telusinternational.com'].includes(auth.currentUser.email) && <button className="navbar-button" onClick={() => setShowBonuses(true)}>Bonus $</button>}
      {(role == "admin" || role == "goodwork") && <button className="navbar-button" onClick={() => setActivePage("Goodwork")}>Goodwork participants</button>}
      {(role == "admin" || role == "external") && <button className="navbar-button" onClick={() => setActivePage("Scheduler External")}>Scheduler external</button>}
      {(role == "admin" || role == "external") && <button className="navbar-button" onClick={() => setActivePage("External")}>External report</button>}
      <button className="navbar-button" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;