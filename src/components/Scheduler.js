import { realtimeDb } from '../firebase/config';
import { useState, useReducer, useMemo } from 'react';
import Swal from 'sweetalert2';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import './Scheduler.css';
import Constants from './Constants';
import BookSession from './BookSession';
import TableFilter from './Core/TableFilter';
import LogEvent from './Core/LogEvent';

const filterReducer = (state, event) => {

  let newState = JSON.parse(JSON.stringify(state));

  if (event.target.name == "checkAll") {
    let field = event.target.getAttribute('field');
    let values = event.target.getAttribute('values');
    newState[field] = values.split(',');
    return newState;
  }

  if (event.target.type == "checkbox") {
    let filterValue = event.target.name;
    let checked = event.target.checked;
    let filterType = event.target.alt;
    if (checked && !newState[filterType].includes(filterValue)) {
      newState[filterType].push(filterValue);
    } else if (!checked && state[filterType].includes(filterValue)) {
      const index = newState[filterType].indexOf(filterValue);
      newState[filterType].splice(index, 1);
    }
  }

  return newState;
}

function Scheduler({ database, setUpdateSession }) {
  const [days, setDays] = useState([]);
  const [highlightedTimeslots, setHighlightedTimeslots] = useState([]);
  const [showBookSession, setShowBookSession] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [justBookedSession, setJustBookedSession] = useState("");
  const [csvData, setCsvData] = useState([[]]);
  const [filterData, setFilterData] = useReducer(filterReducer, {
    date: [format(new Date(), "yyyy-MM-dd")]
  });

  useMemo(() => {
    var temp = [];
    var glassesTimeSlots = {};
    //const todayNr = parseInt(format(new Date(), "yyyyMMdd"));
    for (var timeslotId in database['timeslots']) {
      let timeslotDate = timeslotId.substring(0, 4) + "-" + timeslotId.substring(4, 6) + "-" + timeslotId.substring(6, 8);
      if (!temp.includes(timeslotDate)) temp.push(timeslotDate);

      let timeslot = database['timeslots'][timeslotId];
      let timeslotTime = timeslotId.substring(0, 13);
      //let timeslotNr = parseInt(timeslotId.substring(0, 8));
      if (!glassesTimeSlots[timeslotTime]) glassesTimeSlots[timeslotTime] = 0;
      if (timeslot['participant_id'] && timeslot['glasses'] == true) { // && timeslotNr >= todayNr - 1) {
        glassesTimeSlots[timeslotTime]++;
      }
    }
    setHighlightedTimeslots(glassesTimeSlots);
    setDays(temp);
  }, [Object.keys(database['timeslots']).length])

  // Update value in DB
  function updateValue(path, newValue) {
    realtimeDb.ref(path).update(newValue);
  }

  function getCSVData() {
    let output = [];

    let table = document.getElementById("schedulerTable");
    for (var r = 0; r < table.rows.length; r++) {
      let row = table.rows[r];
      let temp = [];
      // -1, because we don't need the last column...
      for (var c = 0; c < row.cells.length - 1; c++) {
        if (c == 0 && r == 0) {
          temp.push('Date');
          continue;
        }
        temp.push(row.cells[c].innerHTML);
      }
      output.push(temp);
    }

    setCsvData(output);
    return output;
  }

  function cancelSession(sessionId) {
    Swal.fire({
      title: "Are you sure?",
      showCancelButton: true,
      html: 'By cancelling the session, it will be deleted from the timetable!',
      confirmButtonText: 'Yes, cancel!'
    }).then((result) => {
      if (result.isConfirmed) {
        let path = "/timeslots/" + sessionId;
        let data = {
          participant_id: "",
          status: "",
          glasses: false,
          confirmed: "",
          booked_today: false,
          remind: false,
          delayed: false,
          comments: ""
        }

        // Set the bonuses to false
        let bonuses = database['timeslots'][sessionId]['bonus'];
        if (bonuses) {
          data['bonus'] = JSON.parse(JSON.stringify(bonuses));
          Object.keys(bonuses).map(bonusId => {
            data['bonus'][bonusId]['a'] = false;
          })
        }

        updateValue(path, data);

        LogEvent({
          pid: database['timeslots'][sessionId]['participant_id'],
          timeslot: sessionId,
          action: "Cancel session"
        })
      }
    })
  }

  /*
  function testFunction(key) {
    let timeslotDate = new Date(key.substring(0, 4) + "-" + key.substring(4, 6) + "-" + key.substring(6, 8) + " " + key.substring(9, 11) + ":" + key.substring(11, 13));
    let currentTime = new Date();
    return currentTime.toString() + "   " + timeslotDate.toString();
  }
  */

  function filterFunction(timeslotId) {
    let timeslotDate = timeslotId.substring(0, 4) + "-" + timeslotId.substring(4, 6) + "-" + timeslotId.substring(6, 8);
    return filterData['date'].includes(timeslotDate);
  }

  function sendReminder(timeslotId) {
    let pid = database['timeslots'][timeslotId]['participant_id'];
    let participantInfo = database['participants'][pid];
    Swal.fire({
      title: "Reminder",
      showCancelButton: true,
      confirmButtonText: 'Yes, send',
      html: "Are you sure?"
    }).then((result) => {
      if (result.isConfirmed) {
        updateValue("/timeslots/" + timeslotId, { remind: false });

        const scriptURL = 'https://script.google.com/macros/s/AKfycbyZ7PUpLz7hTMAiQqw6dTHpGfqqvV5SNABubnLBYb2phZnd2qS_I_fFrgbU9txyv1oxQg/exec';
        fetch(scriptURL, {
          method: 'POST',
          muteHttpExceptions: true,
          body: JSON.stringify({
            "pid": pid,
            "email_kind": "Reminder",
            "first_name": participantInfo['first_name'],
            "last_name": participantInfo['last_name'],
            "email": participantInfo['email'],
            "document_request": "",
            "registration_type": "",
            "date_of_birth": "",
            "appointment": timeslotId
          })

        }).then(res => {
          Swal.fire({
            toast: true,
            icon: 'success',
            title: 'Reminder sent',
            animation: false,
            position: 'bottom',
            width: 'unset',
            showConfirmButton: false,
            timer: 2000
          })
        });
      }
    })
  }

  return (
    <div id="schedulerContainer">
      <CSVLink
        className="download-csv-button"
        target="_blank"
        asyncOnClick={true}
        onClick={() => getCSVData()}
        filename={"denali-scheduler-export.csv"}
        data={csvData}
      >Download CSV</CSVLink>
      <div className="scheduler-table-container">
        <table id="schedulerTable" className="scheduler-table">
          <thead >
            <tr>
              <th>
                <TableFilter
                  filterName="Date"
                  alt="date"
                  values={days}
                  filterData={filterData}
                  setFilterData={setFilterData}
                />
              </th>
              <th>Station</th>
              <th>Session status</th>
              <th>Participant status</th>
              <th>Participant ID</th>
              <th>Name</th>
              <th>Vision corr.</th>
              {/*<th>#</th>*/}
              <th>Phase</th>
              <th>Session comments</th>
              <th>Functions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(database['timeslots'])
              .filter(timeslotId => filterFunction(timeslotId))
              .sort((a, b) => (a.length == 15 ? (a.substring(0, 14) + "0" + a.substring(14)) : a) < (b.length == 15 ? (b.substring(0, 14) + "0" + b.substring(14)) : b) ? -1 : 1)
              .map((key, index, array) => {
                return (
                  <tr key={"schedule-row-" + index} className={(justBookedSession == key ? "highlighted-session-row" : "") + (index < array.length - 1 ? (key.substring(0, 13) != array[index + 1].substring(0, 13) ? " day-separator" : "") : "")}>
                    <td className="center-tag no-wrap">
                      {key.substring(0, 4) + "-" + key.substring(4, 6) + "-" + key.substring(6, 8) + " " + Constants['bookingDictionary'][key.substring(9, 11) + ":" + key.substring(11, 13)]}
                      {database['timeslots'][key]['booked_today'] && format(new Date(), "yyyyMMdd") == key.substring(0, 8) &&
                        <Tooltip
                          disableInteractive
                          TransitionProps={{ timeout: 100 }}
                          componentsProps={{ tooltip: { sx: { fontSize: '1em' }, } }}
                          title={
                            <b><span>The participant booked the session today!</span></b>
                          }
                        >
                          <label className="extra-info fas fa-info-circle" />
                        </Tooltip>
                      }

                    </td>
                    <td className={"center-tag no-wrap" + (database['timeslots'][key]['backup'] ? " backup-timeslot" : "")}>
                      {(database['timeslots'][key]['backup'] ? "Backup" : ("St. " + key.substring(14)))}
                    </td>

                    <td className="center-tag">
                      {database['timeslots'][key]['status']}
                    </td>
                    <td className="center-tag">
                      {database['timeslots'][key]['participant_id'] ? database['participants'][database['timeslots'][key]['participant_id']]['status'] : ""}
                    </td>
                    {database['timeslots'][key]['participant_id'] ?
                      <Tooltip
                        disableInteractive
                        TransitionProps={{ timeout: 100 }}
                        componentsProps={{ tooltip: { sx: { fontSize: '1em' }, } }}
                        title={
                          <>
                            <b><span>Demo bin: {database['participants'][database['timeslots'][key]['participant_id']]['demo_bin']}</span><br /><br /></b>
                            <span>{database['participants'][database['timeslots'][key]['participant_id']]['age_range']} / {database['participants'][database['timeslots'][key]['participant_id']]['gender']}</span><br />
                            <span>{database['participants'][database['timeslots'][key]['participant_id']]['ethnicities']}</span>
                          </>
                        }
                      >
                        <td className="center-tag">{database['timeslots'][key]['participant_id']}</td>
                      </Tooltip> : <td></td>}
                    <td>
                      {database['timeslots'][key]['participant_id'] ?
                        database['participants'][database['timeslots'][key]['participant_id']]['first_name'] + " " +
                        database['participants'][database['timeslots'][key]['participant_id']]['last_name']
                        : ""}
                    </td>
                    <td className={"center-tag " + ((highlightedTimeslots[key.substring(0, 13)] > 4 && database['timeslots'][key]['glasses']) ? "glasses-highlighted" : "")}>
                      {database['timeslots'][key]['participant_id'] ?
                        database['participants'][database['timeslots'][key]['participant_id']]['vision_correction'].replace("progressive, bifocal or multifocal", "pr/ bf/ mf")
                        : ""}
                    </td>
                    {/*
                  <td className="center-tag">
                    {database['timeslots'][key]['participant_id'] ?
                      (database['participants'][database['timeslots'][key]['participant_id']]['sessions'] ?
                        database['participants'][database['timeslots'][key]['participant_id']]['sessions'][key]
                        : "")
                      : ""}
                  </td>
                  */}
                    <td className="center-tag">
                      {database['timeslots'][key]['participant_id'] ? (database['participants'][database['timeslots'][key]['participant_id']]['phase'] ? "Ph. " + database['participants'][database['timeslots'][key]['participant_id']]['phase'] : "") : ""}
                    </td>
                    <td>
                      {database['timeslots'][key]['comments']}
                    </td>
                    <td className="center-tag">
                      <div className="buttons-of-timeslot">
                        {database['timeslots'][key]['status'] == "" && <button className="update-timeslot-button book-button" onClick={() => { setSelectedSessionId(key); setShowBookSession(true) }}>Schedule</button>}
                        {database['timeslots'][key]['status'] == "Scheduled" && database['timeslots'][key]['remind'] == true && <button className="update-timeslot-button remind-button" onClick={() => sendReminder(key)}>Remind</button>}
                        {database['timeslots'][key]['status'] != "" && <button className="update-timeslot-button update-button" onClick={() => setUpdateSession(key)}>Update</button>}
                        {database['timeslots'][key]['status'] != "" && <button className="update-timeslot-button cancel-button" onClick={() => cancelSession(key)}>Cancel</button>}
                        {/*<span>{testFunction(key)}</span>*/}
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
      {showBookSession && <BookSession database={database} setShowBookSession={setShowBookSession} selectedSessionId={selectedSessionId} setJustBookedSession={setJustBookedSession} />}
    </div>
  );
}

export default Scheduler;