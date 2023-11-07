import { useState, useReducer, useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';

import './Scheduler.css';
import Constants from './Constants';
import TableFilter from './Core/TableFilter';
import SchedulerRow from './SchedulerRow';

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
  const [csvData, setCsvData] = useState([[]]);
  const [highlightedTimeslots, setHighlightedTimeslots] = useState([]);
  const [filterData, setFilterData] = useReducer(filterReducer, {
    date: [format(new Date(), "yyyy-MM-dd")],
    sessionStatuses: ['Blank', ...Constants['sessionStatuses']],
    participantStatuses: ['Blank', ...Constants['participantStatuses']]
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

  function getCSVData() {
    let output = [];

    let table = document.getElementById("schedulerTable");
    for (var r = 0; r < table.rows.length; r++) {
      let row = table.rows[r];
      let temp = [];
      let participant = {};
      // -1, because we don't need the last column...
      for (var c = 0; c < row.cells.length - 1; c++) {
        if (r == 0) {
          if (c == 0) {
            temp.push('Date');
            continue;
          } else if (c == 2) {
            temp.push('Session status');
            continue;
          } else if (c == 3) {
            temp.push('Participant status');
            continue;
          }
        }
        if (c == 4 && r > 0) {
          let participantID = row.cells[c].innerHTML;
          if (participantID) participant = database['participants'][participantID];
        }
        temp.push(row.cells[c].innerHTML);
      }

      if (r == 0) {
        temp.push("Demo bin");
      } else {
        temp.push(participant['demo_bin'] || "");
      }
      output.push(temp);
    }

    setCsvData(output);
    return output;
  }

  function filterFunction(timeslotId) {
    const timeslotDate = timeslotId.substring(0, 4) + "-" + timeslotId.substring(4, 6) + "-" + timeslotId.substring(6, 8);
    const session = database['timeslots'][timeslotId];
    const sessionStatus = session['status'] || "Blank";


    const participantId = session['participant_id'];
    const participant = database['participants'][participantId] || {};
    const participantStatus = participant['status'] || 'Blank';

    return filterData['participantStatuses'].includes(participantStatus) &&
      filterData['sessionStatuses'].includes(sessionStatus) &&
      filterData['date'].includes(timeslotDate);
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
                  selectedEach={true}
                />
              </th>
              <th>Station</th>
              <th>
                <TableFilter
                  filterName="Session status"
                  alt="sessionStatuses"
                  values={['Blank', ...Constants['sessionStatuses']]}
                  filterData={filterData}
                  setFilterData={setFilterData}
                  selectedEach={false}
                />
              </th>
              <th>
                <TableFilter
                  filterName="Participant status"
                  alt="participantStatuses"
                  values={['Blank', ...Constants['participantStatuses']]}
                  filterData={filterData}
                  setFilterData={setFilterData}
                  selectedEach={false}
                />
              </th>
              <th>Participant ID</th>
              <th>Name</th>
              <th>Vision corr.</th>
              <th>Session comments</th>
              <th>Functions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(database['timeslots'])
              .filter(timeslotId => filterFunction(timeslotId))
              .sort((a, b) => (a.length == 15 ? (a.substring(0, 14) + "0" + a.substring(14)) : a) < (b.length == 15 ? (b.substring(0, 14) + "0" + b.substring(14)) : b) ? -1 : 1)
              .map((key, index, array) => {
                return <SchedulerRow
                  key={"sch-row-" + key}
                  database={database}
                  sessionId={key}
                  index={index}
                  array={array}
                  setUpdateSession={setUpdateSession}
                  highlightedTimeslots={highlightedTimeslots}
                />
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Scheduler;