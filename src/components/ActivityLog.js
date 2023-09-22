import './Scheduler.css';

import { CSVLink } from 'react-csv';
import { useState } from 'react';
import FormattingFunctions from './Core/FormattingFunctions';


function ActivityLog({ database }){
    const [logCsvData, setLogCsvData] = useState([[]]);

    function formatDate(rawValue){
        let formattedKey = "";
        let tempKey = rawValue.substring(0, 6);

        for (let i = 0; i < tempKey.length; i+=2){
            formattedKey += tempKey.substring(i, i + 2);
            if (i + 2 < tempKey.length){
                formattedKey += "-";
            }
        }

        return formattedKey;
    }
    
    function getCSVdata(){
        let output = [['User', 'Date', 'Action', 'Participant', 'Timeslot']]

        var data = Object.keys(database['log'])
        .map((key) =>[
            database['log'][key]['user'],
            formatDate(key),
            database['log'][key]['action'],
            database['log'][key]['pid'],
            database['log'][key]['timeslot']

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
                        <th>Date</th>
                        <th>Timeslot</th>
                        <th>Station</th>
                        <th>Participant</th>
                        <th>Action</th>
                        <th>User</th>
                    </thead>
                    <tbody>
                        {Object.keys(database['log'])
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