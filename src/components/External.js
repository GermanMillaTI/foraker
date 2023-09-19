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

  // Update value in DB
  function updateValue(path, newValue) {
    realtimeDb.ref(path).update(newValue);
  }


  useEffect(() => {
    updateQualified();
  }, [])

  // This is a function to update the participants if they are qualified..
  // In theory, they could be marked as qualified when the documents status is switched to pass, however, in order to avoid confusions
  // We decided to update the statuses only when the tab is opened by anyone
  // Actually there's no status, but an object with the qualified participant ID-s: database['qualified']
  function updateQualified() {

    const idPrefix = "TL";
    var qualifiedParticipants = database['qualified'] || {};
    var qualifiedIds = Object.keys(qualifiedParticipants).sort();
    var nextId = qualifiedIds.length > 0 ? parseInt(qualifiedIds.pop().replace(idPrefix, "")) + 1 : 1;

    Object.keys(database['participants']).map(participantId => {
      let participant = database['participants'][participantId];
      let qualifiedAlready = Object.values(qualifiedParticipants).includes(participantId);

      if (!qualifiedAlready) {
        let status = participant['status'] || "Blank";
        let statusOk = !["Rejected", "Withdrawn"].includes(status);
        let documentsOk = participant['document_approval'] == "Pass";
        let hasSessions = Object.values(database['timeslots']).filter(timeslot => participantId == timeslot['participant_id']).length > 0;

        if ((documentsOk && statusOk) || hasSessions) {
          let newId = "TL" + nextId.toString().padStart(6, "0");
          qualifiedParticipants[newId] = participantId;
          nextId++;
          //console.log("New: " + newId);
        }
      }
    })

    //console.log(qualifiedParticipants);
    updateValue("/qualified", qualifiedParticipants);
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
              <th>Phase</th>
              <th>First Name</th>
              <th>Last Initial</th>
              <th>Gender</th>
              <th>Birth Date</th>
              <th>Ethnicity</th>
              <th>Ethnicity Other</th>
              <th>Status</th>
              <th>Next Visit Date</th>
              <th>Next Visit Time</th>
              <th>Next Visit Station</th>
              <th>Vision Correction</th>
              <th>Hair Color</th>
              <th>Hair Type</th>
              <th>Hair Length</th>
              <th>Hair Density</th>
              <th>Hair Diameter</th>
              <th>Facial Hair</th>
              <th>Eye Color</th>
              <th>Height</th>
              <th>Weight</th>
              <th>Skin Type</th>
              <th>Repeat OK</th>
              <th>Birth Year</th>
              <th>Age Range</th>
              <th>Ethnicity Group</th>
              <th>Demo Bin</th>
              <th>LS1</th>
              <th>LS2</th>
              <th>LS3</th>
              <th>LS4</th>
              <th>LS5</th>
              <th>LS6</th>
              <th>LS7</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(database['qualified'] || {}).map((externalId, index) => {
              let participantId = database['qualified'][externalId];
              let participantInfo = database['participants'][participantId];
              return (
                <tr key={participantId + index}>
                  <td className="center-tag">
                    {/*{externalId}*/}
                    {participantInfo['external_id']}
                  </td>
                  <td className="center-tag">
                    {participantId}
                  </td>
                  <td className="center-tag">
                    {participantInfo['phase'] ? "Phase " + participantInfo['phase'] : ""}
                  </td>
                  <td>{participantInfo['first_name']}</td>
                  <td>{participantInfo['last_name'].substring(0, 1)}</td>
                  <td className="center-tag">{participantInfo['gender']}</td>
                  <td className="center-tag">{participantInfo['date_of_birth'].substring(0, 10)}</td>
                  <td>{participantInfo['ethnicities']}</td>
                  <td>{participantInfo['unlisted_ethnicity']}</td>
                  <td className="center-tag">{participantInfo['status']}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="center-tag">{participantInfo['vision_correction']}</td>
                  <td className="center-tag">{participantInfo['hair_color']}</td>
                  <td className="center-tag">{participantInfo['hair_type']}</td>
                  <td className="center-tag">{participantInfo['hair_length']}</td>
                  <td className="center-tag">{participantInfo['hair_density']}</td>
                  <td className="center-tag">{participantInfo['hair_diameter']}</td>
                  <td className="center-tag">{participantInfo['facial_hair']}</td>
                  <td className="center-tag">{participantInfo['eye_color']}</td>
                  <td className="center-tag">{participantInfo['height'] + ' inch'}</td>
                  <td className="center-tag">{participantInfo['weight'] + ' lbs'}</td>
                  <td className="center-tag">{participantInfo['skin_type']}</td>
                  <td className="center-tag">OK</td>
                  <td className="center-tag">{participantInfo['date_of_birth'].substring(0, 4)}</td>
                  <td className="center-tag">{participantInfo['age_range']}</td>
                  <td className="center-tag"></td>
                  <td className="center-tag">{participantInfo['demo_bin']}</td>
                  <td className="center-tag"></td>
                  <td className="center-tag"></td>
                  <td className="center-tag"></td>
                  <td className="center-tag"></td>
                  <td className="center-tag"></td>
                  <td className="center-tag"></td>
                  <td className="center-tag"></td>
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