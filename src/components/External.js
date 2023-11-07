import { realtimeDb } from '../firebase/config';
import { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';

import './External.css';

function External({ database }) {
  const [csvData, setCsvData] = useState([[]]);

  function getCSVData() {
    let output = [];

    let table = document.getElementById("externalTable");
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
    <div id="externalContainer">
      <CSVLink
        className="download-csv-button"
        target="_blank"
        asyncOnClick={true}
        onClick={() => getCSVData()}
        filename={"wiesbaden-export.csv"}
        data={csvData}
      >Download CSV</CSVLink>
      <div className="external-table-container">
        <table id="externalTable" className="external-table">
          <thead >
            <tr>
              <th>Participant ID</th>
              <th>Telus ID</th>
              <th>First Name</th>
              <th>Last Initial</th>
              <th>Gender</th>
              <th>Birth Date</th>
              <th>Ethnicity</th>
              <th>Ethnicity Other</th>
              <th>Status</th>
              <th>Vision Correction</th>
              <th>Birth Year</th>
              <th>Age Range</th>
              <th>Ethnicity Group</th>
              <th>Demo Bin</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(database['participants']).map((participantId, index) => {
              const participantInfo = database['participants'][participantId];
              const externalId = participantInfo['external_id'];
              const status = participantInfo['status'];
              if (!externalId || status == "Denali PPT") return null;

              return (
                <tr key={participantId + index}>
                  <td className="center-tag">
                    {externalId}
                  </td>
                  <td className="center-tag">
                    {participantId}
                  </td>
                  <td>{participantInfo['first_name']}</td>
                  <td>{participantInfo['last_name'].substring(0, 1)}</td>
                  <td className="center-tag">{participantInfo['gender']}</td>
                  <td className="center-tag">{participantInfo['date_of_birth'].substring(0, 10)}</td>
                  <td>{participantInfo['ethnicities']}</td>
                  <td>{participantInfo['unlisted_ethnicity']}</td>
                  <td className="center-tag">{participantInfo['status']}</td>
                  <td className="center-tag">{participantInfo['vision_correction']}</td>
                  <td className="center-tag">{participantInfo['date_of_birth'].substring(0, 4)}</td>
                  <td className="center-tag">{participantInfo['age_range']}</td>
                  <td className="center-tag"></td>
                  <td className="center-tag">{participantInfo['demo_bin']}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default External;