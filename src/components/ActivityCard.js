import { useState, useReducer, useMemo } from "react";
import ReactDOM from "react-dom";
import { format } from "date-fns";
import FormattingFunctions from "./Core/FormattingFunctions";
import TableFilter from "./Core/TableFilter";

import "./UpdateSession.css";

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

function ActivityCard({ participantId, database, togglePopup }) {
  const [days, setDays] = useState([]);
  const [users, setUsers] = useState([]);


  const [filterData, setFilterData] = useReducer(filterReducer, {
    date: [format(new Date(), "yyyy-MM-dd")]
  });

  let data = database["log"];

  let result = {};
  for (const key in data) {
    if (data[key].pid === participantId) {
      result[key] = data[key];
    }
  }

  console.log(result)

  useMemo(() => {
    let temp = [];
    let usersTemp = [];
    for (var timestampId in result) {
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
    setUsers(usersTemp);
  }, [Object.keys(result).length]);

  function filterFunction(timeslotId) {
    let timeslotDate =
      "20" +
      timeslotId.substring(0, 2) +
      "-" +
      timeslotId.substring(2, 4) +
      "-" +
      timeslotId.substring(4, 6);
    return filterData["date"].includes(timeslotDate);
  }

  return ReactDOM.createPortal(
    <div
      className="modal-book-update-session-backdrop"
      onClick={(e) => {
        if (e.target.className == "modal-book-update-session-backdrop")
          togglePopup();
      }}
    >
      <div className="modal-book-update-session-main-container">
        <div className="modal-book-update-session-header">
          Log for ID: {participantId}
        </div>

        <div className="" style={{ width: "55vw" }}>
          {Object.keys(result).length > 0 ? (
            <table
              className="scheduler-table"
              style={{ width: "50vw", marginTop: "2vw" }}
            >
              <thead>
                <th>Date</th>
                <th>Timeslot</th>
                <th>Station</th>
                <th>Participant</th>
                <th>Action</th>
                <th>User</th>
              </thead>
              <tbody>
                {Object.keys(result)
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
                        <td className="center-tag no-wrap">
                          {result[key]["pid"]}
                        </td>
                        <td className="">{result[key]["action"]}</td>
                        <td className="center-tag no-wrap">
                          {result[key]["user"]}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <h2 className="center-tag no-wrap" style={{ marginTop: "1vw" }}>
              No records found
            </h2>
          )}
        </div>
      </div>
    </div>,

    document.body
  );
}

export default ActivityCard;
