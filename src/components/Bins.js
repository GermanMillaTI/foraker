import React, { useEffect, useState, useReducer } from 'react';
import ReactDOM from 'react-dom';
import { auth, realtimeDb } from '../firebase/config';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

import './Bins.css';
import Constants from './Constants';
import LogEvent from './Core/LogEvent';

function Bins({ database, setShowBins }) {

    // Update value in DB
    function updateValue(path, newValue) {
        realtimeDb.ref(path).update(newValue);
    }

    return ReactDOM.createPortal((
        <div className="modal-bins-backdrop" onClick={(e) => { if (e.target.className == "modal-bins-backdrop") setShowBins(false) }}>
            <div className="modal-bins-main-container">
                <div className="modal-bins-header">
                    Demo bins
                </div>

                <div className="modal-bins-content">
                    <table className="table-of-bins">
                        <thead>
                            <tr>
                                <th>
                                    Male
                                </th>
                                {Object.keys(Constants['columnsOfStats']).filter(columnName => columnName != "Total").map(eth => {
                                    return <th>{eth}</th>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {Constants['listOfAgeRanges'].map(ageRange => {
                                return <tr>
                                    <th>{ageRange}</th>
                                    {Object.keys(Constants['columnsOfStats']).filter(columnName => columnName != "Total").map(columnName => {
                                        let eth = columnName.replaceAll(" ", "").replaceAll(".", "").replaceAll("-", "").replaceAll("/", "");
                                        let eth2 = Constants['columnsOfStats'][columnName];
                                        let open = database['bins']['Male'][eth][ageRange];
                                        return <td className={"stats-demo-bin-cell" + (open ? " open-demo-bin" : " closed-demo-bin")} onClick={() => updateValue("/bins/" + "Male/" + eth, { [ageRange]: !open })}>

                                            <>
                                                {open ? "Open" : "Closed"}
                                                {columnName != "Total" && <label className="stats-demo-bin">{Constants['demoBinsEthnicities'][eth2[0]] + Constants['demoBinsAgeRanges'][ageRange] + Constants['demoBinsGenders']['Male']}</label>}
                                            </>
                                        </td>
                                    })}
                                </tr>
                            })}
                        </tbody>
                    </table>

                    <table className="table-of-bins">
                        <thead>
                            <tr>
                                <th>
                                    Female
                                </th>
                                {Object.keys(Constants['columnsOfStats']).filter(columnName => columnName != "Total").map(eth => {
                                    return <th>{eth}</th>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {Constants['listOfAgeRanges'].map(ageRange => {
                                return <tr>
                                    <th>{ageRange}</th>
                                    {Object.keys(Constants['columnsOfStats']).filter(columnName => columnName != "Total").map(columnName => {
                                        let eth = columnName.replaceAll(" ", "").replaceAll(".", "").replaceAll("-", "").replaceAll("/", "");
                                        let eth2 = Constants['columnsOfStats'][columnName];
                                        let open = database['bins']['Female'][eth][ageRange];
                                        return <td className={"stats-demo-bin-cell" + (open ? " open-demo-bin" : " closed-demo-bin")} onClick={() => updateValue("/bins/" + "Female/" + eth, { [ageRange]: !open })}>
                                            <>
                                                {open ? "Open" : "Closed"}
                                                {columnName != "Total" && <label className="stats-demo-bin">{Constants['demoBinsEthnicities'][eth2[0]] + Constants['demoBinsAgeRanges'][ageRange] + Constants['demoBinsGenders']['Female']}</label>}
                                            </>
                                        </td>
                                    })}
                                </tr>
                            })}
                        </tbody>
                    </table>


                </div>
            </div>
        </div>
    ), document.body);
}

export default Bins;