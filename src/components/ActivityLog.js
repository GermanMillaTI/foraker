import { CSVLink } from 'react-csv';
import { useState, useReducer, useMemo, useEffect } from 'react';
import FormattingFunctions from './Core/FormattingFunctions';
import { format } from "date-fns";
import TableFilter from './Core/TableFilter';
import ReactDOM from 'react-dom';

import './ActivityLog.css';

const filterReducer = (state, event) => {
  let newState = JSON.parse(JSON.stringify(state));

  if (event.target.name == "checkAll") {
    let field = event.target.getAttribute("field");
    let values = event.target.getAttribute("values");
    newState[field] = values.split(",");
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
};

function ActivityLog({ database, setActivityLog, participantId, timeslotforLog }) {
  const [logCsvData, setLogCsvData] = useState([[]]);
  const [days, setDays] = useState([]);

  const [filterData, setFilterData] = useReducer(filterReducer, {
    date: [format(new Date(), "yyyy-MM-dd")],
  });

  let result = {}

  if (!participantId) {
    result = database['log'];
  } else {
    for (const key in database['log']) {
      if (database['log'][key].pid === participantId) {
        result[key] = database['log'][key];
      }
    }


  }

  let filteredResult = result;

  if (timeslotforLog) {
    result = {};
    for (const key in filteredResult) {

      if (typeof filteredResult[key]['timeslot'] !== 'undefined' && filteredResult[key]['timeslot'] === timeslotforLog) {
        result[key] = filteredResult[key];
      }
    }
  }



  useMemo(() => {
    let temp = [];
    for (var timestampId in database['log']) {
      let timestampDate =
        "20" +
        timestampId.substring(0, 2) +
        "-" +
        timestampId.substring(2, 4) +
        "-" +
        timestampId.substring(4, 6);
      if (!temp.includes(timestampDate)) temp.push(timestampDate);

    }
    setDays(temp);
  }, [Object.keys(result).length]);

  function filterFunction(timeslotId) {
    let timeslotDate = "20" + `${timeslotId.substring(0, 2)}-${timeslotId.substring(2, 4)}-${timeslotId.substring(4, 6)}T${timeslotId.substring(6, 8)}:${timeslotId.substring(8, 10)}`;
    const parsedDate = new Date(timeslotDate);

    parsedDate.setHours(parsedDate.getHours() - 7);
    //converting date to LA time so the data matches the filtered date
    let adjustedDate = format(parsedDate, "yyyy-MM-dd")

    return filterData["date"].includes(adjustedDate);
  }




  function getCSVdata() {
    let output = [['Date', 'Timeslot', 'Station', 'Participant', 'Action', 'User']]

    var data = Object.keys(database['log']).
      filter((id) => filterFunction(id))
      .map((key) => [
        FormattingFunctions.DateFromLog(key),
        FormattingFunctions.TimeSlotFormat(database['log'][key]['timeslot']),
        FormattingFunctions.StationFromSlot(database['log'][key]['timeslot']),
        database['log'][key]['pid'],
        database['log'][key]['action'],
        database['log'][key]['user']
      ])

    for (var i in data) {
      output.push(data[i])

    }

    setLogCsvData(output);
    return output
  }

  useEffect(() => {
    const handleEsc = (event) => { if (event.keyCode === 27) setActivityLog(false); };
    window.addEventListener('keydown', handleEsc);
    return () => { window.removeEventListener('keydown', handleEsc) };
  }, []);

  return ReactDOM.createPortal((
    <div
      className="modal-activitylog-backdrop"
      onClick={(e) => {
        if (e.target.className == "modal-activitylog-backdrop") setActivityLog(false);
      }}
    >
      <div className="modal-activitylog-main-container">
        <div className="modal-activitylog-header">Activity Log</div>
        {!participantId ?
          <CSVLink
            className="download-csv-button"
            target="_blank"
            asyncOnClick={true}
            onClick={getCSVdata}
            filename={"penelope-logs_" + new Date().toISOString().split("T")[0] + ".csv"}
            data={logCsvData}
          >Download CSV</CSVLink> : ""
        }


        <div className="activityLogContainer" style={{ width: "55vw", minHeight: "70vh", height: "auto" }}>
          {Object.keys(result).length > 0 ? (
            <div className="scrollable-content" style={{ maxHeight: "90vh", minHeight: "80vh", overflowY: "auto" }}>
              <div className="">
                <table
                  className="activityLog-table"
                  style={{ width: "50vw", marginTop: "2vw" }}
                >
                  <thead>
                    <th>
                      {!participantId ? <TableFilter
                        filterName="Date"
                        alt="date"
                        values={days}
                        filterData={filterData}
                        setFilterData={setFilterData}
                        selectedEach={true}
                      /> : <div>Date</div>}

                    </th>
                    <th>Timeslot</th>
                    <th>Station</th>
                    <th>Participant</th>
                    <th>Action</th>
                    <th>User</th>
                  </thead>
                  <tbody>
                    {Object.keys(result)
                      .filter((id) => {
                        if (!participantId) {
                          return filterFunction(id);
                        }
                        return true;
                      })
                      .map((key) => {
                        return (
                          <tr>
                            <td className="center-tag no-wrap">
                              {FormattingFunctions.DateFromLog(key)}
                            </td>
                            <td className="center-tag no-wrap">
                              {FormattingFunctions.TimeSlotFormat(
                                result[key]["timeslot"]
                              )}
                            </td>
                            <td className="center-tag no-wrap">
                              {FormattingFunctions.StationFromSlot(
                                result[key]["timeslot"]
                              )}
                            </td>
                            <td className="center-tag no-wrap" >
                              {result[key]["pid"]}
                            </td>
                            <td className="white-space-wrap">{result[key]["action"]}</td>
                            <td className="center-tag no-wrap">
                              {result[key]["user"]}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <h2 className="center-tag no-wrap" style={{ marginTop: "1vw" }}>
              No records found
            </h2>
          )}
        </div>
      </div>
    </div>
  ), document.body);
}

export default ActivityLog;