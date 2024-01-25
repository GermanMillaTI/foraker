import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { realtimeDb, auth } from './firebase/config';
import { format } from 'date-fns';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import Participants from './components/Participants';
import Scheduler from './components/Scheduler';
import UpdateSession from './components/UpdateSession';
import Stats from './components/Stats';
import Constants from './components/Constants';
import StatsSessions from './components/StatsSessions';
import SkintoneStats from './components/SkintoneStats';
import Bins from './components/Bins';
import ActivityLog from './components/ActivityLog';
import SchedulerOverview from './components/SchedulerOverview';
import ListOfOldParticipants from './components/ListOfOldParticipants';
import CheckDocuments from './components/CheckDocuments';
import SchedulerExternal from './components/SchedulerExternal';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [database, setDatabase] = useState({});
  const [updateSession, setUpdateSession] = useState("");
  const [checkDocuments, setCheckDocuments] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showStatsSkintones, setShowStatsSkintones] = useState(false);
  const [showStatsSessions, setShowStatsSessions] = useState(false);
  const [filterDataFromStats, setFilterDataFromStats] = useState(false);
  const [showBins, setShowBins] = useState(false);
  const [activityLog, setActivityLog] = useState(false);
  const [idforLog, setIdForLog] = useState("");
  const [timeslotforLog, setTimeslotforLog] = useState("");
  const [role, setRole] = useState(null);
  const [userRights, setUserRights] = useState([]);



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
    if (user !== null) realtimeDb.ref('/').on('value', snapshot => {
      let temp = snapshot.val();

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

        if (!emailCollection[email]) {
          emailCollection[email] = { [duplicateStatus]: 1 }
        } else {
          if (!emailCollection[email][duplicateStatus]) {
            emailCollection[email][duplicateStatus] = 0;
          } else {
            emailCollection[email][duplicateStatus]++;
          }
        }

        if (!phoneCollection[phoneNumber]) {
          phoneCollection[phoneNumber] = { [duplicateStatus]: 1 }
        } else {
          if (!phoneCollection[phoneNumber][duplicateStatus]) {
            phoneCollection[phoneNumber][duplicateStatus] = 0;
          } else {
            phoneCollection[phoneNumber][duplicateStatus]++;
          }
        }

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

      const oldParticipantEmails = Object.keys(ListOfOldParticipants);
      const oldParticipantNames = oldParticipantEmails.map(email => ListOfOldParticipants[email]['first_name'] + ListOfOldParticipants[email]['last_name']);
      const oldParticipantNames2 = oldParticipantEmails.map(email => ListOfOldParticipants[email]['last_name'] + ListOfOldParticipants[email]['first_name']);

      for (let participantId in temp['participants']) {

        let participant = temp['participants'][participantId];

        let email = participant['email'];
        temp['participants'][participantId]['email_counter'] = duplicateEmails.includes(email) ? 2 : 1;

        let phone = participant['phone'];
        temp['participants'][participantId]['phone_counter'] = duplicatePhones.includes(phone) ? 2 : 1;


        let ageDetails = calculateAgeDetails(participant['year_of_birth']);
        let weightDetails = calculateWeightDetails(parseFloat(participant['weight_kg']));
        let heightDetails = calculateHeightDetails(parseFloat(participant['height_cm']));
        //if (participant['identificationFile']) {
        //getDownloadURL(ref(storage, `foraker/participants/${participantId}/identification/${participant['identificationFile'][0]['name']}`))
        //.then(url => {

        //realtimeDb.ref("/participants/" + participantId.toString()).update({ pptId_url: url.split("https://firebasestorage.googleapis.com/v0/b/tiai-registrations.appspot.com/o/foraker")[1] })
        //})
        //}





        let ageRange = ageDetails['ageRange'];
        let weightRange = weightDetails['weightRange'];
        let heightRange = heightDetails['heightRange'];

        temp['participants'][participantId]['age_range'] = ageRange;
        temp['participants'][participantId]['weight_range'] = weightRange;
        temp['participants'][participantId]['height_range'] = heightRange;


        let gender = participant['gender'];





        if (Object.keys(Constants['demoBinsGenders']).includes(gender) && Object.keys(Constants['demoBinsWeightRanges']).includes(weightRange)) {
          temp['participants'][participantId]['demo_bin'] = calculateDemoBin(weightRange, heightRange, gender);
          temp['participants'][participantId]['open_demo_bin'] = temp['demo_bins'][gender][heightRange][weightRange] === 0;
        } else {
          temp['participants'][participantId]['demo_bin'] = "#NA";
          temp['participants'][participantId]['open_demo_bin'] = false;
        }

        const pptName1 = (participant['first_name'] + participant['last_name']).toLowerCase();
        const pptName2 = (participant['last_name'] + participant['first_name']).toLowerCase();
        temp['participants'][participantId]['old_ppt'] = [];
        if (oldParticipantEmails.includes(email)) {
          temp['participants'][participantId]['old_ppt'].push('email');
        }
        if (oldParticipantNames.includes(pptName1) || oldParticipantNames2.includes(pptName2)) {
          temp['participants'][participantId]['old_ppt'].push('name');
        }


        let highlightReason = [];

        /*
        if ((emailCollection[email]['Not duplicate'] || 0) > 1 && (phoneCollection[phone]['Not duplicate'] || 0) > 1 && (nameCollection[fullName]['Not duplicate'] || 0) > 1 && participant['status'] != "Duplicate" && participant['status'] != "Rejected" && participant['status'] != "Withdrawn") {
          if (temp['participants'][participantId]['highlight_reason']) {
            temp['participants'][participantId]['highlight_reason'].push("Potential duplicate");
          } else {
            temp['participants'][participantId]['highlight_reason'] = ["Potential duplicate"];
            temp['participants'][participantId]['highlighted'] = true;
          }
        }
        */

        if (highlightReason != "") {
          temp['participants'][participantId]['highlight_reason'] = highlightReason;
          temp['participants'][participantId]['highlighted'] = true;
        }
      }

      console.log("Adjust here above... the uncommented part!");
      const dateNow = parseInt(format(new Date(), "yyyyMMdd"));

      for (let sessionId in temp['timeslots']) {
        const session = temp['timeslots'][sessionId];
        const participantId = session['participant_id'];

        if (!participantId) continue;
        const participant = temp['participants'][participantId];

        const ageDetails = calculateAgeDetails(participant['year_of_birth'], sessionId.substring(0, 4) + "-" + sessionId.substring(4, 6) + "-" + sessionId.substring(6, 8));
        const weightDetails = calculateWeightDetails(parseFloat(participant['weight_kg']));
        const heightDetails = calculateHeightDetails(parseFloat(participant['height_cm']));
        const ageRange = ageDetails['ageRange'];
        const weightRange = weightDetails['weightRange'];
        const heightRange = heightDetails['heightRange'];
        const gender = participant['gender'];
        const demoBin = calculateDemoBin(weightRange, heightRange, gender);


        temp['timeslots'][sessionId]['age_range'] = ageRange;
        temp['timeslots'][sessionId]['demo_bin'] = demoBin;

        let status = session['status'];
        let sessionDate = parseInt(sessionId.substring(0, 8));
        if (sessionDate > dateNow && ['Rescheduled'].includes(status)) {
          if (temp['participants'][participantId]['highlight_reason']) {
            temp['participants'][participantId]['highlight_reason'].push("'Rescheduled' session in the future");
          } else {
            temp['participants'][participantId]['highlight_reason'] = ["'Rescheduled' session in the future"];
            temp['participants'][participantId]['highlighted'] = true;
          }
        }

        if (!participant['sessions']) participant['sessions'] = {};
        participant['sessions'][sessionId] = status;
      }

      setDatabase(temp);
    }, error => {
      console.error(error);
    })


    return () => {
      realtimeDb.ref('/').off();
    }
  }, [user])


  function calculateDemoBin(weightRange, heights, gender) {
    var demoBin = [];
    const demoWeightRange = Constants['demoBinsWeightRanges'][weightRange];
    const demoGender = Constants['demoBinsGenders'][gender];


    let demoHeight = Constants['demoBinsHeights'][heights.trim()];
    if (demoHeight && demoGender && demoWeightRange) {
      const demoStr = demoHeight + demoWeightRange + demoGender;
      if (!demoBin.includes(demoStr)) demoBin.push(demoStr);
    } else {
      demoBin.push("#NA");
    }

    return demoBin.join(',');
  }

  function calculateAgeDetails(dateOfBirth, baseDate) {
    const dob = new Date(dateOfBirth + "-01-01");
    const diff = (baseDate ? (new Date(baseDate)).getTime() : Date.now()) - dob.getTime();
    const diffAge = new Date(diff);
    const year = diffAge.getUTCFullYear();
    const age = Math.abs(year - 1970);

    let ageRange = "";
    if (age < 18) {
      ageRange = "<18";
    }
    else if (age >= 18 && age <= 29) {
      ageRange = "18-29"
    } else if (age >= 30 && age <= 50) {
      ageRange = "30-50"
    } else if (age >= 51 && age <= 65) {
      ageRange = "51-65"
    } else if (age > 50) {
      ageRange = "65+"
    }

    return {
      ageRange: ageRange,
      age: age
    };
  }

  function calculateWeightDetails(weight) {

    let weightrange;
    if (weight < 50) {
      weightrange = "<=49";
    } else if (weight >= 50 && weight < 70) {
      weightrange = "50-69";
    } else if (weight >= 70 && weight < 90) {
      weightrange = "70-89";
    } else if (weight >= 90 && weight <= 110) {
      weightrange = "90-110"
    } else if (weight > 110) {
      weightrange = ">110"
    }

    return {
      weightRange: weightrange,
      weight: weight
    }
  }

  function calculateHeightDetails(height) {
    let heightrange;
    if (height < 150) {
      heightrange = "<150";
    } else if (height >= 150 && height < 161) {
      heightrange = "150-160";
    } else if (height >= 161 && height < 171) {
      heightrange = "161-170";
    } else if (height >= 171 && height < 181) {
      heightrange = "171-180";
    } else if (height >= 181 && height < 191) {
      heightrange = "181-190";
    } else if (height >= 191) {
      heightrange = ">190"
    }

    return {
      heightRange: heightrange,
      height: height
    }

  }

  if (database['users'] && auth.currentUser && role === null) {
    const tempRole = database['users'][auth.currentUser.uid]['role'];
    const tempRights = database['roles'][tempRole];
    setRole(tempRole);
    setUserRights(tempRights);
  }

  function getElement(path) {
    if (!user) return <LoginPage />;
    if (!userRights.includes(path.replace("/", ""))) return null;

    switch (path) {
      case "/":
        return null;
      case "/participants":
        return <Participants
          database={database}
          role={role}
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
      default:
        return null;
    }
  }

  return (
    <div id="mainContainer">
      {user ? Object.keys(database).length > 3 ? <>
        {user && <Navbar
          database={database}
          setDatabase={setDatabase}
          setRole={setRole}
          setUserRights={setUserRights}
          setShowStats={setShowStats}
          setShowStatsSkintones={setShowStatsSkintones}
          setShowStatsSessions={setShowStatsSessions}
          setShowBins={setShowBins}
          setActivityLog={setActivityLog}
          setIdForLog={setIdForLog}
          setTimeslotforLog={setTimeslotforLog}
          role={role}
        />}
        <Routes>
          <Route path="/" element={getElement("/")} />
          <Route path="/participants" element={getElement("/participants")} />
          <Route path="/scheduler" element={getElement("/scheduler")} />
          <Route path="/scheduler-overview" element={getElement("/scheduler-overview")} />
          <Route path="/scheduler-external" element={getElement("/scheduler-external")} />
        </Routes>
      </> : null : (loading ? null : <LoginPage />)
      }

      {activityLog && <ActivityLog database={database} setActivityLog={setActivityLog} participantId={idforLog} timeslotforLog={timeslotforLog} setTimeslotforLog={setTimeslotforLog} />}
      {updateSession && <UpdateSession database={database} updateSession={updateSession} setUpdateSession={setUpdateSession} checkDocuments={checkDocuments} setCheckDocuments={setCheckDocuments} setActivityLog={setActivityLog} setIdForLog={setIdForLog} setTimeslotforLog={setTimeslotforLog} timeslotforLog={timeslotforLog} />}
      {checkDocuments && <CheckDocuments database={database} checkDocuments={checkDocuments} setCheckDocuments={setCheckDocuments} />}
      {showStats && <Stats database={database} setShowStats={setShowStats} setFilterDataFromStats={setFilterDataFromStats} role={role} />}
      {showStatsSkintones && <SkintoneStats database={database} setShowStatsSkintones={setShowStatsSkintones} setFilterDataFromStats={setFilterDataFromStats} role={role} />}
      {showStatsSessions && <StatsSessions database={database} setShowStatsSessions={setShowStatsSessions} setFilterDataFromStats={setFilterDataFromStats} />}
      {showBins && <Bins database={database} setShowBins={setShowBins} />}

    </div >
  );
}

export default App;
