import './Scheduler.css';

import { CSVLink } from 'react-csv';
import { useState, useReducer, useMemo } from 'react';
import FormattingFunctions from './Core/FormattingFunctions';
import { format } from "date-fns";
import TableFilter from './Core/TableFilter';


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
  


function ActivityLog({ database }){
    const [logCsvData, setLogCsvData] = useState([[]]);
    const [days, setDays] = useState([]);

    const [filterData, setFilterData] = useReducer(filterReducer, {
        date: [format(new Date(), "yyyy-MM-dd")],
    });
      

    useMemo(() => {
        let temp = [];
        let usersTemp = [];
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
    }, [Object.keys(database['log']).length]);

    function filterFunction(timeslotId) {
        
        let timeslotDate ="20" + `${timeslotId.substring(0, 2)}-${timeslotId.substring(2, 4)}-${timeslotId.substring(4, 6)}T${timeslotId.substring(6, 8)}:${timeslotId.substring(8, 10)}`;
        const parsedDate = new Date(timeslotDate);
        
        parsedDate.setHours(parsedDate.getHours()-7);
        //converting date to LA time so the data matches the filtered date
        let adjustedDate = format(parsedDate, "yyyy-MM-dd")

        return filterData["date"].includes(adjustedDate);
      }
    
    
    
    
    function getCSVdata(){
        let output = [['Date', 'Timeslot', 'Station', 'Participant', 'Action', 'User']]

        var data = Object.keys(database['log']).
        filter((id) => filterFunction(id))
        .map((key) =>[
            FormattingFunctions.DateFromLog(key),
            FormattingFunctions.TimeSlotFormat(database['log'][key]['timeslot']),
            FormattingFunctions.StationFromSlot(database['log'][key]['timeslot']),
            database['log'][key]['pid'],
            database['log'][key]['action'],
            database['log'][key]['user']
          ]) 

        for (var i in data){
            output.push(data[i])
            
        }
      
        setLogCsvData(output);
        return output
    } 

    return (
        <div id="schedulerContainer">
            <CSVLink
            className="download-csv-button"
            target="_blank"
            asyncOnClick={true}
            onClick={getCSVdata}
            filename={"denali-logs_"+ new Date().toISOString().split("T")[0]+".csv"}
            data={logCsvData}
        >Download CSV</CSVLink>
            <div className="scheduler-table-container">
                <table className="scheduler-table">
                    <thead>
                        <th>
                            <TableFilter 
                                filterName="Date"
                                alt="date"
                                values={days}
                                filterData={filterData}
                                setFilterData={setFilterData}
                            />
                        </th>
                        <th>Timeslot</th>
                        <th>Station</th>
                        <th>Participant</th>
                        <th>Action</th>
                        <th>User</th>
                    </thead>
                    <tbody>
                        {Object.keys(database['log'])
                        .filter((id) =>filterFunction(id))
                        .map((key, index, array) => {


                            return (
                                <tr>
                                    <td className="center-tag no-wrap">{FormattingFunctions.DateFromLog(key)}</td>
                                    <td className="center-tag no-wrap">{FormattingFunctions.TimeSlotFormat(database['log'][key]['timeslot'])}</td>
                                    <td className="center-tag no-wrap">{FormattingFunctions.StationFromSlot(database['log'][key]['timeslot'])}</td>
                                    <td className="center-tag no-wrap">{database['log'][key]['pid']}</td>

                                    <td className="">{database['log'][key]['action']}</td>
                                    <td className="center-tag no-wrap">{database['log'][key]['user']}</td>
                                    
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ActivityLog;