import React, { useState, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { auth } from '../firebase/config'
import { signOut } from 'firebase/auth';
import Constants from './Constants';
import appInfo from '../../package.json';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";

import './Navbar.css';

function Navbar({ database, setDatabase, setRole, setUserRights, setShowStats, setShowStatsSessions, setShowProtocols, setShowBonuses, setShowBins, setActivityLog, setIdForLog, setTimeslotforLog, role }) {
  const navigate = useNavigate();

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth).then(() => {
        navigate("/");
        setDatabase({});
        setRole(null);
        setUserRights([]);
      });
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
      {['admin', 'manager'].includes(role) && <button className="navbar-button" onClick={(e) => { e.preventDefault(); navigate("/participants"); }}>Participants</button>}
      {['admin', 'manager'].includes(role) && <button className="navbar-button" onClick={(e) => { e.preventDefault(); navigate("/scheduler"); }}>Scheduler</button>}
      {['admin', 'apple'].includes(role) && <button className="navbar-button" onClick={(e) => { e.preventDefault(); navigate("/scheduler-overview"); }}>Overview</button>}
      <button className="navbar-button" onClick={() => setShowStats(true)}>Participant stats</button>
      <button className="navbar-button" onClick={() => setShowStatsSessions(true)}>Session stats</button>
      <button className="navbar-button" onClick={() => setShowProtocols(true)}>Protocols</button>
      {['admin'].includes(role) && <button className="navbar-button" onClick={() => setShowBins(true)}>Demo bins</button>}
      {/* {['admin'].includes(role) && <button className="navbar-button" onClick={() => setShowBonuses(true)}>Bonus $</button>} */}
      {['admin', 'apple'].includes(role) && <button className="navbar-button" onClick={(e) => { e.preventDefault(); navigate("/scheduler-external"); }}>Scheduler external</button>}
      {['admin', 'apple'].includes(role) && <button className="navbar-button" onClick={(e) => { e.preventDefault(); navigate("/external"); }}>External report</button>}
      {['admin'].includes(role) && <button className='navbar-button' onClick={() => {
        setActivityLog(true);
        setIdForLog("");
        setTimeslotforLog("");
      }}>Activity log</button>}
      {['german.milla01@telusinternational.com', 'zoltan.bathori@telusinternational.com'].includes(auth.currentUser.email) && <button className="navbar-button" onClick={(e) => { e.preventDefault(); navigate("/usersadmin"); }}>Users</button>}
      {['admin', 'apple'].includes(role) && <button className="navbar-button" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</button>}

      {/*
      <div className='navbar-button-user' onClick={(e) => {
        let menu = document.getElementById("navbarMenu");
        if (menu.style.display === "none" || menu.style.display === "") {
          menu.style.display = "block";
        } else {
          menu.style.display = "none";
        }

      }}>{database['users'][auth.currentUser.uid]['name'] || 'Logout'}</div>
      <div id='navbarMenu'>
        <li>
          <a href="/" className="navbar-button-user-settings" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
        </li>
      </div>
      */}

    </div>

  );
}

export default Navbar;