import { realtimeDb } from '../firebase/config';
import { useState, useReducer, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';

import './SchedulerOverview.css';
import Constants from './Constants';
import { json } from 'react-router-dom';

function SchedulerOverview({ database }) {
  const [days, setDays] = useState([]);
  const [csvData, setCsvData] = useState([[]]);

  useEffect(() => {
    var temp = Object.assign({}, ...[...Object.keys(database['timeslots']), 'Total'].map(k => ({
      [k.substring(0, 8)]: Object.assign({}, ...[...Constants['sessionStatuses'], 'Free', 'Completed (Minors only)'].map(k => ({ [k]: 0 })))
    })))
    //console.log(temp);

    Object.keys(database['timeslots']).map(timeslotId => {
      let timeslot = database['timeslots'][timeslotId];
      let day = timeslotId.substring(0, 8);
      let status = timeslot['status'] || 'Free';
      temp[day][status]++;
      temp['Total'][status]++;

      let participantId = timeslot['participant_id'];
      if (participantId) {
        let participant = database['participants'][participantId];
        let minorParticipant = participant['registered_as'] == "parent";
        if (minorParticipant && status == 'Completed') {
          temp[day]['Completed (Minors only)']++;
          temp['Total']['Completed (Minors only)']++;
        }
      }
    })
    setDays(temp);
  }, [Object.keys(database['timeslots']).length])

  function getCSVData() {
    let output = [];

    let table = document.getElementById("schedulerTable");
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

  return (
    <div id="schedulerContainer">
      <CSVLink
        className="download-csv-button"
        target="_blank"
        asyncOnClick={true}
        onClick={() => getCSVData()}
        filename={"denali-scheduler-overview-export.csv"}
        data={csvData}
      >Download CSV</CSVLink>
      <div className="scheduler-overview-table-container">
        <table id="schedulerTable" className="scheduler-overview-table">
          <thead >
            <tr>
              <th>Date</th>
              {['Scheduled', 'Checked In', 'Completed', 'Completed (Minors only)', 'Rescheduled', 'NoShow'].map(status => {
                return <th>{status === 'Completed' ? 'Completed (All)' : status}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {Object.keys(days).map((key, index, array) => {
              return (
                <tr key={"schedule-row-" + index}>
                  <td className={"center-tag" + (key == 'Total' ? ' total-row' : '')}>
                    {key == "Total" ? key : key.substring(0, 4) + "-" + key.substring(4, 6) + "-" + key.substring(6, 8)}
                  </td>
                  {['Scheduled', 'Checked In', 'Completed', 'Completed (Minors only)', 'Rescheduled', 'NoShow'].map(status => {
                    return <td className={"center-tag" + (key == 'Total' ? ' total-row' : '')}>
                      {days[key][status] ? days[key][status] : ''}
                    </td>
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SchedulerOverview;