import { auth, realtimeDb } from '../firebase/config';
import { useState, useEffect, useReducer } from 'react';
import Swal from 'sweetalert2';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { CSVLink } from 'react-csv';

import './SchedulerExternal.css';
import Constants from './Constants';
import BookSession from './BookSession';

function SchedulerExternal({ database }) {
  const [showBookSession, setShowBookSession] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [justBookedSession, setJustBookedSession] = useState("");
  const [csvData, setCsvData] = useState([[]]);

  function getCSVData() {
    let output = [];

    let table = document.getElementById("schedulerExternalTable");
    for (var r = 0; r < table.rows.length; r++) {
      let row = table.rows[r];
      let temp = [];
      for (var c = 0; c < row.cells.length; c++) {
        temp.push(row.cells[c].innerHTML);
      }
      output.push(temp);
    }

    setCsvData(output);
    return output;
  }

  // Update value in DB
  function updateValue(path, newValue) {
    realtimeDb.ref(path).update(newValue);
  }

  function updateSession(sessionId, actionType) {
    Swal.fire({
      title: 'Updating timeslot',
      html: 'Session ID: <b>' + sessionId + '</b><br/>' + 'Action type: <b>' + actionType + '</b> <br/><br/> It will be ready soon...',
      confirmButtonText: 'OK'
    })
  }

  return (
    <div id="schedulerExternalContainer">
      <CSVLink
        className="download-csv-button"
        target="_blank"
        asyncOnClick={true}
        onClick={() => getCSVData()}
        filename={"wiesbaden-export.csv"}
        data={csvData}
      >Download CSV</CSVLink>
      <div className="scheduler-external-table-container">
        <table id="schedulerExternalTable" className="scheduler-external-table">
          <thead>
            <tr>
              <th>
                Date
              </th>
              <th>
                Station
              </th>
              <th>
                Status
              </th>
              <th>
                Participant ID
              </th>
              <th>
                Telus ID
              </th>
              <th>
                First Name
              </th>
              <th>
                Last Initial
              </th>
              <th>
                Vision corr.
              </th>
              <th>
                Session
              </th>
              <th>
                Demo Bin
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(database['timeslots'])
              .sort((a, b) => (a.length == 15 ? (a.substring(0, 14) + "0" + a.substring(14)) : a) < (b.length == 15 ? (b.substring(0, 14) + "0" + b.substring(14)) : b) ? -1 : 1)
              .map((key, index, array) => {
                return (
                  <tr className={(justBookedSession == key ? "highlighted-session-row" : "") + (index < array.length - 1 ? (key.substring(0, 13) != array[index + 1].substring(0, 13) ? " day-separator" : "") : "")}>
                    <td className="center-tag">
                      {key.substring(0, 4) + "-" + key.substring(4, 6) + "-" + key.substring(6, 8) + " " + Constants['bookingDictionary'][key.substring(9, 11) + ":" + key.substring(11, 13)]}
                    </td>
                    <td className={"center-tag no-wrap" + (key.substring(14) == "101" ? " backup-timeslot" : "")}>
                      {key.substring(14) == "101" ? "Backup" : "Station " + key.substring(14)}
                    </td>
                    <td className="center-tag">
                      {database['timeslots'][key]['status']}
                    </td>
                    <td className="center-tag">
                      {database['timeslots'][key]['participant_id'] ?
                        //Object.keys(database['qualified']).find(q => database['qualified'][q] === database['timeslots'][key]['participant_id'])
                        database['participants'][database['timeslots'][key]['participant_id']]['external_id']
                        : ""}
                    </td>
                    <td className="center-tag">
                      {database['timeslots'][key]['participant_id']}
                    </td>
                    <td>
                      {database['timeslots'][key]['participant_id'] ?
                        database['participants'][database['timeslots'][key]['participant_id']]['first_name']
                        : ""}
                    </td>
                    <td>
                      {database['timeslots'][key]['participant_id'] ?
                        database['participants'][database['timeslots'][key]['participant_id']]['last_name'].substring(0, 1)
                        : ""}
                    </td>
                    <td className="center-tag">
                      {database['timeslots'][key]['participant_id'] ?
                        database['participants'][database['timeslots'][key]['participant_id']]['vision_correction']
                        : ""}
                    </td>
                    <td className="center-tag">
                      {database['timeslots'][key]['participant_id'] ?
                        (database['participants'][database['timeslots'][key]['participant_id']]['sessions'] ?
                          database['participants'][database['timeslots'][key]['participant_id']]['sessions'][key]
                          : "")
                        : ""}
                    </td>
                    <td className="center-tag">
                      {database['timeslots'][key]['demo_bin']}
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

export default SchedulerExternal;