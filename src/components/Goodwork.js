import { auth, realtimeDb } from '../firebase/config';
import { useState, useEffect, useReducer } from 'react';
import { CSVLink } from 'react-csv';

import './Goodwork.css';
import Constants from './Constants';

function Goodwork({ database }) {
  const [csvData, setCsvData] = useState([[]]);

  function getCSVData() {
    let output = [];

    let table = document.getElementById("goodworkTable");
    if (table.rows.length == 1) return;

    for (var r = 0; r < table.rows.length; r++) {
      let row = table.rows[r];
      let temp = [];
      for (var c = 0; c < row.cells.length; c++) {
        if (r > 0 && c == row.cells.length - 1) {
          let element = row.cells[c].firstChild;
          if (element) temp.push(element.value || "");
        } else {
          temp.push(row.cells[c].innerHTML);
        }
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

  return (
    <div id="goodworkContainer">
      <CSVLink
        className="download-csv-button"
        target="_blank"
        asyncOnClick={true}
        onClick={() => getCSVData()}
        filename={"wiesbaden-export.csv"}
        data={csvData}
      >Download CSV</CSVLink>
      <div className="goodwork-table-container">
        <table id="goodworkTable" className="goodwork-table">
          <thead>
            <tr>
              <th>Participant ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Age range</th>
              <th>Ethnicity</th>
              <th>Vision correction</th>
              <th>Date</th>
              <th>Status</th>
              <th>Telus comments</th>
              <th>Goodwork comments</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(database['participants']).filter(participantId => database['participants'][participantId]['source'] == 'goodwork')
              .map((participantId, index) => {
                let participantInfo = database['participants'][participantId];
                return (
                  <tr key={participantId + "-" + index}>
                    <td className="center-tag">{participantId}</td>
                    <td>{participantInfo['first_name'] + " " + participantInfo['last_name']}</td>
                    <td>{participantInfo['email']}</td>
                    <td className="center-tag">{participantInfo['gender']}</td>
                    <td className="center-tag">{participantInfo['age_range']}</td>
                    <td>{participantInfo['ethnicities']}</td>
                    <td>{participantInfo['vision_correction']}</td>
                    <td className="center-tag">{participantInfo['date'].substring(0, 10)}</td>
                    <td className={"center-tag " + (!participantInfo['icf'] ? "gw-missing-icf" : "")}>
                      {(!participantInfo['icf'] ? "Missing ICF" : "")}
                      {!participantInfo['icf'] && participantInfo['status'] && <br />}
                      {(participantInfo['status'] || "")}
                    </td>
                    <td>
                      {participantInfo['goodwork_comment_internal']}
                    </td>
                    <td className="center-tag">
                      <textarea
                        className="goodwork-comment"
                        defaultValue={participantInfo['goodwork_comment']}
                        onBlur={(e) => updateValue("/participants/" + participantId, { goodwork_comment: e.currentTarget.value })}
                        onInput={(e) => {
                          let height = e.currentTarget.offsetHeight;
                          let newHeight = e.currentTarget.scrollHeight;
                          if (newHeight > height) {
                            e.currentTarget.style.height = 0;
                            e.currentTarget.style.height = newHeight + "px";
                          }
                        }}
                      />
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

export default Goodwork;