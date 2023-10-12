import { realtimeDb } from '../firebase/config';
import { useState, useReducer, useMemo } from 'react';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import './Scheduler.css';
import Constants from './Constants';
import BookSession from './BookSession';
import LogEvent from './Core/LogEvent';
import SessionInfo from './Tooltips/SessionInfo';


function SchedulerRow({ database, sessionId, index, array, setUpdateSession, highlightedTimeslots }) {
  const [showBookSession, setShowBookSession] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [justBookedSession, setJustBookedSession] = useState("");

  const participantId = database['timeslots'][sessionId]['participant_id'];
  const participantInfo = database['participants'][participantId] || {};

  // Update value in DB
  function updateValue(path, newValue) {
    realtimeDb.ref(path).update(newValue);
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

  return (<tr key={"schedule-row-" + index} className={(justBookedSession == sessionId ? "highlighted-session-row" : "") + (index < array.length - 1 ? (sessionId.substring(0, 13) != array[index + 1].substring(0, 13) ? " day-separator" : "") : "")}>
    <td className="center-tag no-wrap">
      {sessionId.substring(0, 4) + "-" + sessionId.substring(4, 6) + "-" + sessionId.substring(6, 8) + " " + Constants['bookingDictionary'][sessionId.substring(9, 11) + ":" + sessionId.substring(11, 13)]}
      {database['timeslots'][sessionId]['booked_today'] && format(new Date(), "yyyyMMdd") == sessionId.substring(0, 8) &&
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
    <td className={"center-tag no-wrap" + (database['timeslots'][sessionId]['backup'] ? " backup-timeslot" : "")}>
      {(database['timeslots'][sessionId]['backup'] ? "Backup" : ("St. " + sessionId.substring(14)))}
    </td>

    <td className="center-tag">
      {database['timeslots'][sessionId]['status']}
    </td>
    <td className="center-tag">
      {participantInfo['status'] || ""}
    </td>
    {database['timeslots'][sessionId]['participant_id'] ?
      <SessionInfo database={database} participantId={database['timeslots'][sessionId]['participant_id']} sessionId={sessionId} />
      : <td></td>}
    <td>
      {participantId ? (participantInfo['first_name'] + " " + participantInfo['last_name']) : ""}
      {participantId &&
        <a className="copy-email-link fas fa-search"
          title="Google"
          target="_blank"
          href={("https://www.google.com/search?q=" + participantInfo['first_name'] + " " + participantInfo['last_name'] + " Los Angeles").replaceAll(" ", "%20")}
        />}
    </td>
    <td className={"center-tag " + ((highlightedTimeslots[sessionId.substring(0, 13)] > 4 && database['timeslots'][sessionId]['glasses']) ? "glasses-highlighted" : "")}>
      {participantId ?
        participantInfo['vision_correction']
        : ""}
    </td>
    <td className="center-tag">
      {participantInfo['phase'] ? "Phase " + participantInfo['phase'] : ""}
    </td>
    <td>
      {database['timeslots'][sessionId]['comments']}
    </td>
    <td className="center-tag">
      <div className="buttons-of-timeslot">
        {database['timeslots'][sessionId]['status'] == "" && <button className="update-timeslot-button book-button" onClick={() => { setSelectedSessionId(sessionId); setShowBookSession(true) }}>Schedule</button>}
        {database['timeslots'][sessionId]['status'] == "Scheduled" && database['timeslots'][sessionId]['remind'] == true && <button className="update-timeslot-button remind-button" onClick={() => sendReminder(sessionId)}>Remind</button>}
        {database['timeslots'][sessionId]['status'] != "" && <button className="update-timeslot-button update-button" onClick={() => setUpdateSession(sessionId)}>Update</button>}
        {database['timeslots'][sessionId]['status'] != "" && <button className="update-timeslot-button cancel-button" onClick={() => cancelSession(sessionId)}>Cancel</button>}
      </div>
    </td>
    {showBookSession && <BookSession database={database} setShowBookSession={setShowBookSession} selectedSessionId={selectedSessionId} setJustBookedSession={setJustBookedSession} />}
  </tr>
  )
}

export default SchedulerRow;