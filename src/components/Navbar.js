import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config'
import { signOut } from 'firebase/auth';
import Constants from './Constants';
import appInfo from '../../package.json';
import Swal from 'sweetalert2';

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

  let hostedVersion = database['settings']['app_version'];

  useEffect(() => {
    if (hostedVersion !== appInfo.version) {
      Swal.fire({
        toast: true,
        title: 'The app is updated now, please refresh the page!',
        html: 'Your version: ' + appInfo.version + '<br/>New version: ' + hostedVersion + '<br/><br/><b><a href=".">Click here to refresh!</a></b> <br/><br/><i>If not working, press CTRL+F5 <br/> to refresh and empty the cache!</i>',
        position: 'bottom-end',
        width: 'unset',
        showConfirmButton: false,
        timer: 10000000
      })
    }
  }, [hostedVersion])

  return (
    <div className="navbar">

      {role == "admin" && <button className="navbar-button" onClick={() => setActivePage("Participants")}>Participants</button>}
      {role == "admin" && <button className="navbar-button" onClick={() => setActivePage("Scheduler")}>Scheduler</button>}
      {(role == "admin" || role == "external") && <button className="navbar-button" onClick={() => setActivePage("Scheduler Overview")}>Overview</button>}
      <button className="navbar-button" onClick={() => setShowStats(true)}>Participant stats</button>
      <button className="navbar-button" onClick={() => setShowStatsSessions(true)}>Session stats</button>
      {Constants.superAdmins.includes(auth.currentUser.email) && <button className="navbar-button" onClick={() => setShowBins(true)}>Demo bins</button>}
      {['zoltan.bathori@telusinternational.com', 'sari.kiiskinen@telusinternational.com'].includes(auth.currentUser.email) && <button className="navbar-button" onClick={() => setShowBonuses(true)}>Bonus $</button>}
      {(role == "admin" || role == "goodwork") && <button className="navbar-button" onClick={() => setActivePage("Goodwork")}>Goodwork</button>}
      {(role == "external") && <button className="navbar-button" onClick={() => setActivePage("Scheduler External")}>Scheduler external</button>}
      {(role == "external") && <button className="navbar-button" onClick={() => setActivePage("External")}>External report</button>}
      {Constants.superAdmins.includes(auth.currentUser.email) && <button className='navbar-button' onClick={() => {
        setActivityLog(true);
        setIdForLog("");
        setTimeslotforLog("");
      }}>Activity log</button>}
      <button className="navbar-button" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;