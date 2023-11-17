import { useState, useEffect } from 'react';

import './Participants.css';
import ParticipantCard from './ParticipantCard';
import BookSession2 from './BookSession2';
import ParticipantFilter from './ParticipantFilter';
import { CSVLink } from 'react-csv';


function Participants({
  database,
  role,
  updateSession,
  setUpdateSession,
  checkDocuments,
  setCheckDocuments,
  filterDataFromStats,
  setFilterDataFromStats,
  setActivityLog,
  idforLog,
  setIdForLog,
  setTimeslotforLog,
  timeslotforLog
}) {
  const [showBookSession2, setShowBookSession2] = useState("");
  const [shownParticipants, setShownParticipants] = useState([]);
  const [pptCsvData, setPptCsvData] = useState([[]]);

  useEffect(() => {
    if (checkDocuments || showBookSession2 || updateSession) {
      document.body.classList.add('blocked-scrolling');
    } else {
      document.body.classList.remove('blocked-scrolling');
    }
  }, [checkDocuments, showBookSession2, updateSession])

  function getCSVdata() {
    let output = [['ID', 'First Name', 'Last Name', 'Email', 'Age-Range', 'Demo Bins', 'Ethnicities', 'Date', 'DOB', 'Target of Sessions', 'External ID', 'Phone', 'Status', 'Document Approval', 'Vision Correction', 'Sessions No.', 'Unsubscribed']];

    var data = Object.keys(database['participants']).filter(pid => shownParticipants.includes(pid)).sort((a, b) => {
      return a < b ? -1 : 1;
    }).map((key) => [
      key,
      database['participants'][key]['first_name'],
      database['participants'][key]['last_name'],
      database['participants'][key]['email'],
      database['participants'][key]['age_range'],
      database['participants'][key]['demo_bin'],
      database['participants'][key]['ethnicities'],
      new Date(database['participants'][key]['date']).toISOString().split("T")[0],
      new Date(database['participants'][key]['date_of_birth']).toISOString().split("T")[0],
      database['participants'][key]['multiple_times'],
      database['participants'][key]['external_id'],
      database['participants'][key]['phone'],
      database['participants'][key]['status'],
      database['participants'][key]['document_approval'],
      database['participants'][key]['vision_correction'],
      typeof database['participants'][key]['sessions'] === 'object' ?
        Object.keys(database['participants'][key]['sessions']).length
        : "0",
      database['participants'][key]['unsubscribed_comms'] === 'Yes' ?
        database['participants'][key]['unsubscribed_comms']
        : 'No'
      //typeof database['participants'][key]['sessions'] === 'object' ?
      //Object.keys(database['participants'][key]['sessions'])
      //: "-"
    ])

    for (var i in data) {
      output.push(data[i])

    }

    setPptCsvData(output);
    return output;

  }

  return (
    <div id="participantsContainer">
      <div id="participantsSubContainer">
        {showBookSession2 && <BookSession2 database={database} setShowBookSession2={setShowBookSession2} participantId={showBookSession2} />}

        <ParticipantFilter
          database={database}
          setShownParticipants={setShownParticipants}
          filterDataFromStats={filterDataFromStats}
          setFilterDataFromStats={setFilterDataFromStats}
        />

        <span className="filter-note">Filtered participants: {shownParticipants.length}
          {shownParticipants.length > 100 && <span> (The list is cropped at 100)</span>}
          <CSVLink
            className="download-csv-button"
            target="_blank"
            asyncOnClick={true}
            onClick={getCSVdata}
            filename={"denali-participants_" + new Date().toISOString().split("T")[0] + ".csv"}
            data={pptCsvData}
          >Download Filtered Results</CSVLink>

        </span>
        {Object.keys(database['participants'])
          .filter(pid => shownParticipants.includes(pid))
          .sort((a, b) => {
            return a < b ? -1 : 1;
          })
          .map((key, index) => (
            index < 100 && (
              <ParticipantCard
                key={"participant-card" + key}
                database={database}
                role={role}
                participantId={key}
                index={index}
                setShowBookSession2={setShowBookSession2}
                setCheckDocuments={setCheckDocuments}
                setUpdateSession={setUpdateSession}
                setActivityLog={setActivityLog}
                setIdForLog={setIdForLog}
                idforLog={idforLog}
                setTimeslotforLog={setTimeslotforLog}
                timeslotforLog={timeslotforLog}
              />
            )
          ))}
      </div>
    </div>
  );
}

export default Participants;