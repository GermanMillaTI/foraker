import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { realtimeDb, auth } from './firebase/config';
import { format } from 'date-fns';

import LoginPage from './components/LoginPage';


import Navbar from './components/Navbar';
import Participants from './components/Participants';
import Scheduler from './components/Scheduler';
import SchedulerOverview from './components/SchedulerOverview';
import SchedulerExternal from './components/SchedulerExternal';
import External from './components/External';
import CheckDocuments from './components/CheckDocuments';
import UpdateSession from './components/UpdateSession';
import Stats from './components/Stats';
import Constants from './components/Constants';
import StatsSessions from './components/StatsSessions';
import Bonuses from './components/Bonuses';
import Bins from './components/Bins';
import ActivityLog from './components/ActivityLog';
import UsersAdmin from './components/UsersAdmin';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [database, setDatabase] = useState({});
  const [updateSession, setUpdateSession] = useState("");
  const [checkDocuments, setCheckDocuments] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showStatsSessions, setShowStatsSessions] = useState(false);
  const [filterDataFromStats, setFilterDataFromStats] = useState(false);
  const [showBonuses, setShowBonuses] = useState(false);
  const [showBins, setShowBins] = useState(false);
  const [activityLog, setActivityLog] = useState(false);
  const [idforLog, setIdForLog] = useState("");
  const [timeslotforLog, setTimeslotforLog] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);


  useEffect(() => {
    realtimeDb.ref('/').on('value', snapshot => {
      let temp = snapshot.val();
      if (role == "") setRole(temp['users'][auth.currentUser.uid]);

      var allEmails = [];
      var duplicateEmails = [];
      var allPhones = [];
      var duplicatePhones = [];

      var emailCollection = {};
      var phoneCollection = {};
      var nameCollection = {};

      for (let participantId in temp['participants']) {
        let participant = temp['participants'][participantId];
        let fullName = participant['first_name'] + " " + participant['last_name'];

        temp['participants'][participantId]['full_name'] = fullName;
        if (participant['parent_first_name']) temp['participants'][participantId]['parent_full_name'] = participant['parent_first_name'] + " " + participant['parent_last_name'];

        if (!participant['date']) {
          console.log("Removing: " + participantId);
          delete temp['participants'][participantId];
          continue;
        }

        let email = participant['email'];
        let phoneNumber = participant['phone'];
        if (allEmails.includes(email)) {
          duplicateEmails.push(email);
        } else {
          allEmails.push(email);
        }

        let phone = participant['phone'];
        if (allPhones.includes(phone)) {
          duplicatePhones.push(phone);
        } else {
          allPhones.push(phone);
        }

        let duplicateStatus = (participant['status'] == 'Duplicate' || participant['status'] == 'Rejected' || participant['status'] == 'Withdrawn') ? 'Duplicate' : 'Not duplicate';
        if (participant['registered_as'] != 'parent') {

          if (!emailCollection[email]) {
            emailCollection[email] = { [duplicateStatus]: 1 }
          } else {
            if (!emailCollection[email][duplicateStatus]) {
              emailCollection[email][duplicateStatus] = 0;
            } else {
              emailCollection[email][duplicateStatus]++;
            }
          }
        }

        if (participant['registered_as'] != 'parent') {

          if (!phoneCollection[phoneNumber]) {
            phoneCollection[phoneNumber] = { [duplicateStatus]: 1 }
          } else {
            if (!phoneCollection[phoneNumber][duplicateStatus]) {
              phoneCollection[phoneNumber][duplicateStatus] = 0;
            } else {
              phoneCollection[phoneNumber][duplicateStatus]++;
            }
          }
        }

        if (participant['registered_as'] != 'parent') {

          if (!nameCollection[fullName]) {
            nameCollection[fullName] = { [duplicateStatus]: 1 }
          } else {
            if (!nameCollection[fullName][duplicateStatus]) {
              nameCollection[fullName][duplicateStatus] = 0;
            } else {
              nameCollection[fullName][duplicateStatus]++;
            }
          }
        }
      }


      for (let participantId in temp['participants']) {
        let participant = temp['participants'][participantId];

        let email = participant['email'];
        temp['participants'][participantId]['email_counter'] = duplicateEmails.includes(email) ? 2 : 1;

        let phone = participant['phone'];
        temp['participants'][participantId]['phone_counter'] = duplicatePhones.includes(phone) ? 2 : 1;

        let fullName = participant['full_name'];

        let ageDetails = calculateAgeDetails(participant['date_of_birth']);
        let age = ageDetails['age'];
        let over18 = age >= 18;
        temp['participants'][participantId]['over18'] = over18;


        let ageRange = ageDetails['ageRange'];
        temp['participants'][participantId]['age_range'] = ageRange;

        let gender = participant['gender'];
        let ethnicities = participant['ethnicities'].split(",");

        //var demoBin = [];
        var demoBin = calculateDemoBin(ageRange, ethnicities, gender);
        var demoBinOpen = true;

        ethnicities.map(ethnicity => {
          /*
          let demoEthnicity = Constants['demoBinsEthnicities'][ethnicity.trim()];
          let demoGender = Constants['demoBinsGenders'][gender];
          let demoAgeRange = Constants['demoBinsAgeRanges'][ageRange];
          if (demoEthnicity && demoGender && demoAgeRange) {
            let demoStr = demoEthnicity + demoAgeRange + demoGender;
            if (!demoBin.includes(demoStr)) demoBin.push(demoStr);
          } else {
            demoBin.push("#NA");
          }
          */

          if (demoBinOpen && ['Female', 'Male'].includes(gender)) {
            let tempEth = Constants['bonusEthnicities'][ethnicity.trim()];
            if (!tempEth) {
              demoBinOpen = true;
            } else {
              if (temp['demo_bins'][gender][tempEth][ageRange] === 1 || temp['demo_bins'][gender][tempEth][ageRange] === 2) demoBinOpen = false;
            }
          }
        })

        //temp['participants'][participantId]['demo_bin'] = demoBin.join(",");
        temp['participants'][participantId]['demo_bin'] = demoBin;
        temp['participants'][participantId]['open_demo_bin'] = demoBinOpen;

        // Adding the bonus information
        let bonusString = Constants['bonusEthnicities'][ethnicities];
        let currentlyOfferedBonus = 0;
        if (bonusString != undefined && bonusString != "" && bonusString != null && ['Male', 'Female'].includes(gender)) {
          currentlyOfferedBonus = temp['bonuses'][gender][bonusString][ageRange];
        }

        temp['participants'][participantId]['currently_offered_bonus'] = currentlyOfferedBonus;

        let history = participant['history'];
        if (history) {
          let bonusEmails = Object.values(history).filter(em => em['title'].includes('Handoff and Bonus'));
          if (Object.keys(bonusEmails).length > 0) temp['participants'][participantId]['bonus_amount'] = parseInt(bonusEmails.pop()['title'].replace('Handoff and Bonus (', '').replace(')', ''));
        }

        let highlightReason = [];
        if (participant['document_approval'] != "Pass" && ["Contacted", "Scheduled", "Completed"].includes(participant['status'])) {
          highlightReason.push("Wrong document status");
        }

        if (participant['registered_as'] != 'parent') {
          if ((emailCollection[email]['Not duplicate'] || 0) > 1 && (phoneCollection[phone]['Not duplicate'] || 0) > 1 && (nameCollection[fullName]['Not duplicate'] || 0) > 1 && participant['status'] != "Duplicate" && participant['status'] != "Rejected" && participant['status'] != "Withdrawn") {
            if (temp['participants'][participantId]['highlight_reason']) {
              temp['participants'][participantId]['highlight_reason'].push("Potential duplicate");
            } else {
              temp['participants'][participantId]['highlight_reason'] = ["Potential duplicate"];
              temp['participants'][participantId]['highlighted'] = true;
            }
          }
        }


        if (highlightReason != "") {
          temp['participants'][participantId]['highlight_reason'] = highlightReason;
          temp['participants'][participantId]['highlighted'] = true;
        }


      }


      const dateNow = parseInt(format(new Date(), "yyyyMMdd"));
      var sessionDictionary = {};
      for (let sessionId in temp['timeslots']) {
        const session = temp['timeslots'][sessionId];
        const participantId = session['participant_id'];

        if (!participantId) continue;
        const participant = temp['participants'][participantId];
        const ageDetails = calculateAgeDetails(participant['date_of_birth'], sessionId.substring(0, 4) + "-" + sessionId.substring(4, 6) + "-" + sessionId.substring(6, 8));
        const ageRange = ageDetails['ageRange'];
        const ethnicities = participant['ethnicities'].split(",");
        const gender = participant['gender'];
        const demoBin = calculateDemoBin(ageRange, ethnicities, gender);
        temp['timeslots'][sessionId]['age_range'] = ageRange;
        temp['timeslots'][sessionId]['demo_bin'] = demoBin;

        let status = session['status'];
        let sessionDate = parseInt(sessionId.substring(0, 8));
        if (!sessionDictionary[participantId]) {
          sessionDictionary[participantId] = { [status]: 1 };
        } else {
          sessionDictionary[participantId][status] = (sessionDictionary[participantId][status] || 0) + 1;
        }

        if (sessionDate > dateNow && ['Rescheduled'].includes(status)) {
          if (temp['participants'][participantId]['highlight_reason']) {
            temp['participants'][participantId]['highlight_reason'].push("'Rescheduled' session in the future");
          } else {
            temp['participants'][participantId]['highlight_reason'] = ["'Rescheduled' session in the future"];
            temp['participants'][participantId]['highlighted'] = true;
          }
        }

        let externalId = participant['external_id'];
        if (!externalId) {
          if (sessionDate < dateNow && ['Completed'].includes(status)) {
            if (temp['participants'][participantId]['highlight_reason']) {
              if (!temp['participants'][participantId]['highlight_reason'].includes("Missing external ID")) {
                temp['participants'][participantId]['highlight_reason'].push("Missing external ID");
              }
            } else {
              temp['participants'][participantId]['highlight_reason'] = ["Missing external ID"];
              temp['participants'][participantId]['highlighted'] = true;
            }
          }
        }

        //if (!['Scheduled', 'Completed'].includes(status)) continue;
        let sessionsOfParticipant = participant['sessions'];
        if (!sessionsOfParticipant) {
          participant['sessions'] = {};
          sessionsOfParticipant = {};
        }

        let nr = Object.keys(participant['sessions']).length + 1;
        participant['sessions'][sessionId] = nr;


      }

      //console.log(temp['participants']['27946903']);
      setDatabase(temp);
    }, error => {
      console.error(error);
    })


    return () => {
      realtimeDb.ref('/').off();
    }
  }, [])

  function calculateDemoBin(ageRange, ethnicities, gender) {
    var demoBin = [];
    const demoAgeRange = Constants['demoBinsAgeRanges'][ageRange];
    const demoGender = Constants['demoBinsGenders'][gender];

    ethnicities.map(ethnicity => {
      let demoEthnicity = Constants['demoBinsEthnicities'][ethnicity.trim()];
      if (demoEthnicity && demoGender && demoAgeRange) {
        const demoStr = demoEthnicity + demoAgeRange + demoGender;
        if (!demoBin.includes(demoStr)) demoBin.push(demoStr);
      } else {
        demoBin.push("#NA");
      }
    })

    return demoBin.join(',');
  }

  function calculateAgeDetails(dateOfBirth, baseDate) {
    const dob = new Date(dateOfBirth);
    const diff = (baseDate ? (new Date(baseDate)).getTime() : Date.now()) - dob.getTime();
    //var diff = (new Date(baseDate || "")).getTime() - dob.getTime();
    const diffAge = new Date(diff);
    const year = diffAge.getUTCFullYear();
    const age = Math.abs(year - 1970);

    let ageRange = "";
    if (age < 13) {
      ageRange = "<13"
    } else if (age >= 13 && age <= 14) {
      ageRange = "13-14"
    } else if (age >= 15 && age <= 20) {
      ageRange = "15-20"
    } else if (age >= 21 && age <= 30) {
      ageRange = "21-30"
    } else if (age >= 31 && age <= 40) {
      ageRange = "31-40"
    } else if (age >= 41 && age <= 50) {
      ageRange = "41-50"
    } else if (age >= 51 && age <= 60) {
      ageRange = "51-60"
    } else if (age >= 61 && age <= 70) {
      ageRange = "61-70"
    } else if (age >= 71 && age <= 75) {
      ageRange = "71-75"
    } else if (age > 75) {
      ageRange = "75+"
    }
    return {
      ageRange: ageRange,
      age: age
    };
  }

  function getElement(path) {
    if (!user) return <LoginPage />;
    //if (!userRights.includes(path)) return null;

    switch (path) {
      case "/":
        return null;
      case "/participants":
        return <Participants
          database={database}
          updateSession={updateSession}
          setUpdateSession={setUpdateSession}
          checkDocuments={checkDocuments}
          setCheckDocuments={setCheckDocuments}
          filterDataFromStats={filterDataFromStats}
          setFilterDataFromStats={setFilterDataFromStats}
          setActivityLog={setActivityLog}
          setIdForLog={setIdForLog}
          idforLog={idforLog}
          timeslotforLog={timeslotforLog}
          setTimeslotforLog={setTimeslotforLog}
        />;
      case "/scheduler":
        return <Scheduler database={database} setUpdateSession={setUpdateSession} />;
      case "/scheduler-overview":
        return <SchedulerOverview database={database} />;
      case "/scheduler-external":
        return <SchedulerExternal database={database} />;
      case "/external":
        return <External database={database} setCheckDocuments />;
      case "/usersadmin":
        return <UsersAdmin database={database} />;
      default:
        return null;
    }
  }


  return (
    <div id="mainContainer">
      {user ? Object.keys(database).length > 3 ? <>
        {user && <Navbar
          database={database}
          setShowStats={setShowStats}
          setShowStatsSessions={setShowStatsSessions}
          setShowBonuses={setShowBonuses}
          setShowBins={setShowBins}
          setActivityLog={setActivityLog}
          setIdForLog={setIdForLog}
          setTimeslotforLog={setTimeslotforLog}
          role={role}
        />}
        <div id="content">
          <Routes>
            <Route path="/" element={getElement("/")} />
            <Route path="/participants" element={getElement("/participants")} />
            <Route path="/scheduler" element={getElement("/scheduler")} />
            <Route path="/scheduler-overview" element={getElement("/scheduler-overview")} />
            <Route path="/scheduler-external" element={getElement("/scheduler-external")} />
            <Route path="/external" element={getElement("/external")} />
            <Route path="/usersadmin" element={getElement("/usersadmin")} />
          </Routes>
        </div>
      </> : null : (loading ? null : <LoginPage />)
      }
    </div >
  );
}

export default App;
