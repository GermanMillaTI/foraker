import { useState } from 'react';
import { CSVLink } from 'react-csv';

import './SchedulerExternal.css';
import FormattingFunctions from './Core/FormattingFunctions';
import SessionInfo from './Tooltips/SessionInfo';

function SchedulerExternal({ database }) {
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
              <th>Date</th>
              <th>Station</th>
              <th>Status</th>
              <th>Session protocol</th>
              <th>Session outcome</th>
              <th>Participant ID</th>
              <th>Telus ID</th>
              <th>First Name</th>
              <th>Last Initial</th>
              <th>Vision corr.</th>
              <th>Session</th>
              <th>Demo Bin</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(database['timeslots'])
              .sort((a, b) => (a.length == 15 ? (a.substring(0, 14) + "0" + a.substring(14)) : a) < (b.length == 15 ? (b.substring(0, 14) + "0" + b.substring(14)) : b) ? -1 : 1)
              .map((key, index, array) => {
                return (
                  <tr className={index < array.length - 1 ? (key.substring(0, 13) != array[index + 1].substring(0, 13) ? " day-separator" : "") : ""}>
                    <td className="center-tag">
                      {FormattingFunctions.TimeSlotFormat(key)}
                    </td>
                    <td className={"center-tag no-wrap" + (key.substring(14) == "101" ? " backup-timeslot" : "")}>
                      {key.substring(14) == "101" ? "Backup" : "Station " + key.substring(14)}
                    </td>
                    <td className="center-tag">
                      {database['timeslots'][key]['status']}
                    </td>
                    <td className="center-tag">
                      {database['timeslots'][key]['session_protocol']}
                    </td>
                    <td className="center-tag">
                      {database['timeslots'][key]['session_outcome'] || ""}
                    </td>
                    <td>
                      {database['timeslots'][key]['participant_id'] ?
                        (database['participants'][database['timeslots'][key]['participant_id']]['external_id'] || "") :
                        ""
                      }
                    </td>
                    {database['timeslots'][key]['participant_id'] ?
                      <SessionInfo database={database} participantId={database['timeslots'][key]['participant_id']} sessionId={key} />
                      : <td></td>}
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
                        (database['participants'][database['timeslots'][key]['participant_id']]['session_counter'] ?
                          database['participants'][database['timeslots'][key]['participant_id']]['session_counter'][key]
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
    </div>
  );
}

export default SchedulerExternal;