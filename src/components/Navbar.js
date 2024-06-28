import React, { useState, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { auth } from '../firebase/config'
import { signOut } from 'firebase/auth';
import appInfo from '../../package.json';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import telusLogo from './Core/telusLogo.png'


import './Navbar.css';
import { Toolbar, IconButton, AppBar, Tabs, Tab } from '@mui/material';



function Navbar({ database, setDatabase, setRole, setShowStatsAges, setUserRights, setShowStats, setShowStatsSessions, setShowStatsSkintones, setShowBins, setActivityLog, setIdForLog, setTimeslotforLog, role }) {
  const navigate = useNavigate();
  const [selectedBtn, SetSelectedBtn] = useState('');

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

  const theme = createTheme({
    palette: {
      telus: {
        main: '#49166D',
        black: '#444',
        green: '#8BE234',
        lightpurple: '#C8BBD0',
        lightblack: "#666"
      },
    },
  });

  const customButtonStyle = {
    fontSize: '12px',
    color: 'telus.lightblack',
    bgcolor: 'white',
    fontWeight: 600,
    height: 25,
    '&:hover': {
      bgcolor: 'telus.main',
      color: 'white'
    },
    textTransform: 'none',
  };

  return (
    <ThemeProvider theme={theme}>
      <div className='navbar'>
        <img src={telusLogo} style={{ height: '22px', width: 'auto', position: "absolute", left: "0" }} ></img>
        <span className="navbarTitle" style={{ verticalAlign: "center" }}>Foraker </span>

        {['german.milla01@telusinternational.com'].includes(auth.currentUser.email) && <Button size='small' sx={customButtonStyle} style={{ backgroundColor: selectedBtn == "Files" ? "#49166D" : "", color: selectedBtn == "Files" ? "white" : "" }} onClick={(e) => { e.preventDefault(); navigate("/files"); SetSelectedBtn('Files'); }}>Files</Button>}
        {['admin', 'manager'].includes(role) && <Button size='small' sx={customButtonStyle} style={{ backgroundColor: selectedBtn == "Participants" ? "#49166D" : "", color: selectedBtn == "Participants" ? "white" : "" }} onClick={(e) => { e.preventDefault(); navigate("/participants"); SetSelectedBtn('Participants'); }}>Participants</Button>}
        {['admin', 'manager'].includes(role) && <Button size='small' sx={customButtonStyle} style={{ backgroundColor: selectedBtn == "Scheduler" ? "#49166D" : "", color: selectedBtn == "Scheduler" ? "white" : "" }} onClick={(e) => { e.preventDefault(); navigate("/scheduler"); SetSelectedBtn('Scheduler'); }}>Scheduler</Button>}
        {['admin', 'apple'].includes(role) && <Button size='small' sx={customButtonStyle} style={{ backgroundColor: selectedBtn == "Overview" ? "#49166D" : "", color: selectedBtn == "Overview" ? "white" : "" }} onClick={(e) => { e.preventDefault(); navigate("/scheduler-overview"); SetSelectedBtn('Overview'); }}>Overview</Button>}
        {['admin', 'manager'].includes(role) && <Button size='small' sx={customButtonStyle} onClick={() => setShowStats(true)}>Participant Stats</Button>}
        {['admin', 'manager'].includes(role) && <Button size='small' sx={customButtonStyle} onClick={() => setShowStatsSkintones(true)}>Skin tone Stats</Button>}
        {['admin', 'manager'].includes(role) && <Button size='small' sx={customButtonStyle} onClick={() => setShowStatsAges(true)}>Age Stats</Button>}
        {/*<button className="navbar-button" onClick={() => setShowStatsSessions(true)}>Session stats</button>*/}
        {['admin'].includes(role) && <Button size='small' sx={customButtonStyle} onClick={() => setShowBins(true)}>Demo bins</Button>}
        {['admin', 'apple'].includes(role) && <Button sx={customButtonStyle} style={{ backgroundColor: selectedBtn == "External" ? "#49166D" : "", color: selectedBtn == "External" ? "white" : "" }} onClick={(e) => { e.preventDefault(); navigate("/scheduler-external"); SetSelectedBtn("External") }}>Scheduler external</Button>}
        {['admin', 'apple'].includes(role) && <Button sx={customButtonStyle} style={{ backgroundColor: selectedBtn == "Reporting" ? "#49166D" : "", color: selectedBtn == "Reporting" ? "white" : "" }} onClick={(e) => { e.preventDefault(); navigate("/external"); SetSelectedBtn('Reporting') }}>External Reporting</Button>}
        {['admin'].includes(role) && <Button sx={customButtonStyle} size='small' onClick={() => {
          setActivityLog(true);
          setIdForLog("");
          setTimeslotforLog("");
        }}>Activity log</Button>}
        {['admin', 'apple'].includes(role) && <Button size='small' sx={customButtonStyle} onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</Button>}
      </div>
    </ThemeProvider>




  );
}

export default Navbar;