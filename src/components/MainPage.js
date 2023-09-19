import { realtimeDb } from '../firebase/config';
import { useState, useEffect } from 'react';

import './MainPage.css';
import Navbar from './Navbar';
import Participants from './Participants';
import Scheduler from './Scheduler';
import SchedulerOverview from './SchedulerOverview';
import SchedulerExternal from './SchedulerExternal';
import External from './External';
import Goodwork from './Goodwork';
import CheckDocuments from './CheckDocuments';
import UpdateSession from './UpdateSession';
import Stats from './Stats';
import Constants from './Constants';
import StatsSessions from './StatsSessions';
import Bonuses from './Bonuses';
import Bins from './Bins';

function MainPage() {
  const [database, setDatabase] = useState({});
  const [activePage, setActivePage] = useState("");
  const [updateSession, setUpdateSession] = useState("");
  const [checkDocuments, setCheckDocuments] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showStatsSessions, setShowStatsSessions] = useState(false);
  const [filterDataFromStats, setFilterDataFromStats] = useState(false);
  const [showBonuses, setShowBonuses] = useState(false);
  const [showBins, setShowBins] = useState(false);

  useEffect(() => {
    realtimeDb.ref('/').on('value', snapshot => {
      let temp = snapshot.val();

      var allEmails = [];
      var duplicateEmails = [];
      var allPhones = [];
      var duplicatePhones = [];

      for (let participantId in temp['participants']) {
        let participant = temp['participants'][participantId];

        if (!participant['date']) {
          console.log("Removing: " + participantId);
          delete temp['participants'][participantId];
          continue;
        }

        let email = participant['email'];
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
      }

      for (let participantId in temp['participants']) {
        let participant = temp['participants'][participantId];

        let email = participant['email'];
        temp['participants'][participantId]['email_counter'] = duplicateEmails.includes(email) ? 2 : 1;

        let phone = participant['phone'];
        temp['participants'][participantId]['phone_counter'] = duplicatePhones.includes(phone) ? 2 : 1;

        let ageRange = calculateAgeRange(participant['date_of_birth']);
        temp['participants'][participantId]['age_range'] = ageRange;

        let gender = participant['gender'];
        let ethnicities = participant['ethnicities'].split(",");
        var demoBin = [];
        var demoBinOpen = true;

        ethnicities.map(ethnicity => {
          let demoEthnicity = Constants['demoBinsEthnicities'][ethnicity.trim()];
          let demoGender = Constants['demoBinsGenders'][gender];
          let demoAgeRange = Constants['demoBinsAgeRanges'][ageRange];
          if (demoEthnicity && demoGender && demoAgeRange) {
            let demoStr = demoEthnicity + demoAgeRange + demoGender;
            if (!demoBin.includes(demoStr)) demoBin.push(demoStr);
          } else {
            demoBin.push("#NA");
          }

          if (demoBinOpen && ['Female', 'Male'].includes(gender)) {
            let tempEth = Constants['bonusEthnicities'][ethnicity.trim()];
            if (!tempEth) {
              demoBinOpen = false;
            } else {
              if (temp['bins'][gender][tempEth][ageRange] === false) demoBinOpen = false;
            }
          }
        })
        temp['participants'][participantId]['demo_bin'] = demoBin.join(",");
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

      }

      for (let sessionId in temp['timeslots']) {
        let session = temp['timeslots'][sessionId];
        let participantId = session['participant_id'];
        let status = session['status'];

        if (!participantId) continue;
        if (!['Scheduled', 'Completed'].includes(status)) continue;

        let participant = temp['participants'][participantId];
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

  function calculateAgeRange(dateOfBirth) {

    var dob = new Date(dateOfBirth);
    var month_diff = Date.now() - dob.getTime();
    var age_dt = new Date(month_diff);
    var year = age_dt.getUTCFullYear();
    var age = Math.abs(year - 1970);

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
    return ageRange;
  }

  return (
    <div>
      {Object.keys(database).length != 0 && (
        <Navbar
          database={database}
          setActivePage={setActivePage}
          setShowStats={setShowStats}
          setShowStatsSessions={setShowStatsSessions}
          setShowBonuses={setShowBonuses}
          setShowBins={setShowBins}
        />
      )}

      <div id="mainContainer">

        {activePage == "Participants" && (
          <Participants
            database={database}
            updateSession={updateSession}
            setUpdateSession={setUpdateSession}
            checkDocuments={checkDocuments}
            setCheckDocuments={setCheckDocuments}
            filterDataFromStats={filterDataFromStats}
            setFilterDataFromStats={setFilterDataFromStats}
          />
        )}
        {activePage == "Scheduler" && (<Scheduler database={database} setUpdateSession={setUpdateSession} />)}
        {activePage == "Scheduler Overview" && (<SchedulerOverview database={database} />)}
        {activePage == "Scheduler External" && (<SchedulerExternal database={database} />)}
        {activePage == "External" && (<External database={database} setCheckDocuments />)}
        {activePage == "Goodwork" && (<Goodwork database={database} />)}
        {checkDocuments && <CheckDocuments database={database} checkDocuments={checkDocuments} setCheckDocuments={setCheckDocuments} />}
        {updateSession && <UpdateSession database={database} updateSession={updateSession} setUpdateSession={setUpdateSession} checkDocuments={checkDocuments} setCheckDocuments={setCheckDocuments} />}
        {showStats && <Stats database={database} setActivePage={setActivePage} setShowStats={setShowStats} setFilterDataFromStats={setFilterDataFromStats} />}
        {showBins && <Bins database={database} setShowBins={setShowBins} />}
        {showBonuses && <Bonuses database={database} setShowBonuses={setShowBonuses} />}
        {showStatsSessions && <StatsSessions database={database} setActivePage={setActivePage} setShowStatsSessions={setShowStatsSessions} setFilterDataFromStats={setFilterDataFromStats} />}

      </div>
    </div>
  );
}

export default MainPage;
