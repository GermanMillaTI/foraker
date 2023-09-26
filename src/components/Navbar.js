import React, { useState } from 'react';
import { auth } from '../firebase/config'
import { signOut } from 'firebase/auth';
import Constants from './Constants';
import appInfo from '../../package.json';

import './Navbar.css';

function Navbar({ database, setActivePage, setShowStats, setShowStatsSessions, setShowBonuses, setShowBins, setActivityLog, setIdForLog, setTimeslotforLog }) {
  const [role, setRole] = useState(database['users'][auth.currentUser.uid]);

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  let hostedVersion = database['settings']['app_version']

  function refreshApp(){
    window.location.reload();
  }

  return (
    <div className="navbar">
      {hostedVersion === appInfo.version ? <div> App version {appInfo.version}</div> : <div>version {appInfo.version} <a href='#' onClick={()=>{
        refreshApp();
      }}>Refresh Browser</a></div>}
      {role == "admin" && <button className="navbar-button" onClick={() => setActivePage("Participants")}>Participants</button>}
      {role == "admin" && <button className="navbar-button" onClick={() => setActivePage("Scheduler")}>Scheduler</button>}
      {(role == "admin" || role == "external") && <button className="navbar-button" onClick={() => setActivePage("Scheduler Overview")}>Scheduler overview</button>}
      <button className="navbar-button" onClick={() => setShowStats(true)}>Participant stats</button>
      <button className="navbar-button" onClick={() => setShowStatsSessions(true)}>Session stats</button>
      {Constants.superAdmins.includes(auth.currentUser.email) && <button className="navbar-button" onClick={() => setShowBins(true)}>Demo bins</button>}

      {Constants.superAdmins.includes(auth.currentUser.email) && <button className='navbar-button' onClick={() => {
        setActivityLog(true);
        setIdForLog("");
        setTimeslotforLog("");
        }}>Activity log</button>}

      {['zoltan.bathori@telusinternational.com', 'sari.kiiskinen@telusinternational.com'].includes(auth.currentUser.email) && <button className="navbar-button" onClick={() => setShowBonuses(true)}>Bonus $</button>}
      {(role == "admin" || role == "goodwork") && <button className="navbar-button" onClick={() => setActivePage("Goodwork")}>Goodwork</button>}
      {(role == "admin" || role == "external") && <button className="navbar-button" onClick={() => setActivePage("Scheduler External")}>Scheduler external</button>}
      {(role == "admin" || role == "external") && <button className="navbar-button" onClick={() => setActivePage("External")}>External report</button>}
      <button className="navbar-button" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;