import React, { useState, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { auth } from '../firebase/config'
import { signOut } from 'firebase/auth';
import Constants from './Constants';
import appInfo from '../../package.json';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";

import './Navbar.css';

function Navbar({ database, setShowStats, setShowStatsSessions, setShowBonuses, setShowBins, setActivityLog, setIdForLog, setTimeslotforLog, role }) {
  const navigate = useNavigate();

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  let hostedVersion = database['settings']['app_version'];

  const NewVersionMessageHTML = () => {
    return <>
      Your version:  {appInfo.version} <br />
      New version: {hostedVersion}
    </>
  }

  useEffect(() => {
    if (hostedVersion !== appInfo.version) {
      Swal.fire({
        toast: true,
        title: 'The app is updated now, please refresh the page!',
        html: renderToString(<NewVersionMessageHTML />),
        position: 'bottom-end',
        width: 'unset',
        showConfirmButton: false,
        timer: 10000000
      })
    }
  }, [hostedVersion])

  return (
    <div className="navbar">
      {role == "admin" && <button className="navbar-button" onClick={(e) => { e.preventDefault(); navigate("/participants"); }}>Participants</button>}
      {role == "admin" && <button className="navbar-button" onClick={(e) => { e.preventDefault(); navigate("/scheduler"); }}>Scheduler</button>}
      {["external", "admin"].includes(role) && <button className="navbar-button" onClick={(e) => { e.preventDefault(); navigate("/scheduler-overview"); }}>Overview</button>}
      <button className="navbar-button" onClick={() => setShowStats(true)}>Participant stats</button>
      <button className="navbar-button" onClick={() => setShowStatsSessions(true)}>Session stats</button>
      {Constants.superAdmins.includes(auth.currentUser.email) && <button className="navbar-button" onClick={() => setShowBins(true)}>Demo bins</button>}
      {['zoltan.bathori@telusinternational.com', 'sari.kiiskinen@telusinternational.com'].includes(auth.currentUser.email) && <button className="navbar-button" onClick={() => setShowBonuses(true)}>Bonus $</button>}
      {["external"].includes(role) && <button className="navbar-button" onClick={(e) => { e.preventDefault(); navigate("/schedulder-external"); }}>Scheduler external</button>}
      {["external"].includes(role) && <button className="navbar-button" onClick={(e) => { e.preventDefault(); navigate("/external"); }}>External report</button>}
      {Constants.superAdmins.includes(auth.currentUser.email) && <button className='navbar-button' onClick={() => {
        setActivityLog(true);
        setIdForLog("");
        setTimeslotforLog("");
      }}>Activity log</button>}
      {/*role == "admin" && <button className="navbar-button" onClick={(e) => { e.preventDefault(); navigate("/users-admin");}}>Users Administration</button>*/}
      <button className="navbar-button" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;