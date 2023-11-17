import React, { useEffect, useState, useReducer } from 'react';
import ReactDOM from 'react-dom';
import { auth, realtimeDb } from '../firebase/config';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

import './Bonuses.css';
import Constants from './Constants';
import LogEvent from './Core/LogEvent';

function Bonuses({ database, setShowBonuses }) {

    function updatePrice(gender, ethnicity, ageRange) {
        let ethString = ethnicity.replaceAll(" ", "").replaceAll(".", "").replaceAll("-", "").replaceAll("/", "");
        let oldValue = database['bonuses'][gender][ethString][ageRange];
        Swal.fire({
            title: 'Update bonus',
            html: gender + '<br/>' +
                ethnicity + '<br/>' +
                ageRange + '<br/>' +
                '<br/> Current value: $ ' + oldValue + '<br/>' +
                'New value: ' + '<input id="newPrice" type="number" value="' + oldValue + '" min="1" style="width: 4em;"/>',
            showCancelButton: true,
            confirmButtonText: 'Save',
            allowEnterKey: true,
            didOpen: () => {
                let input = document.getElementById('newPrice');
                input.focus();
                input.select();

                input.addEventListener("keypress", function (event) {
                    if (event.key === "Enter") Swal.clickConfirm();
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                let newValue = document.getElementById("newPrice").value;

                if (newValue >= 0 && oldValue != newValue) {
                    let path = "/bonuses/" + gender + "/" + ethString;
                    let data = {};
                    data[ageRange] = newValue;
                    updateValue(path, data);
                }
            }
        }
        )
    }

    // Update value in DB
    function updateValue(path, newValue) {
        realtimeDb.ref(path).update(newValue);
    }

    useEffect(() => {
        const handleEsc = (event) => { if (event.keyCode === 27) setShowBonuses(false); };
        window.addEventListener('keydown', handleEsc);
        return () => { window.removeEventListener('keydown', handleEsc) };
    }, []);

    return ReactDOM.createPortal((
        <div className="modal-bonuses-backdrop" onClick={(e) => { if (e.target.className == "modal-bonuses-backdrop") setShowBonuses(false) }}>
            <div className="modal-bonuses-main-container">
                <div className="modal-bonuses-header">
                    Bonus $
                </div>

                <div className="modal-bonuses-content">
                    <table className="table-of-bonuses">
                        <thead>
                            <tr>
                                <th>
                                    Male
                                </th>
                                {Object.keys(Constants['columnsOfStats']).filter(columnName => columnName != "Total").map(eth => {
                                    return <th key={'bonus-header-' + eth}>{eth}</th>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {Constants['listOfAgeRanges'].map(ageRange => {
                                return <tr>
                                    <th>{ageRange}</th>
                                    {Object.keys(Constants['columnsOfStats']).filter(columnName => columnName != "Total").map(columnName => {
                                        let amount = database['bonuses']['Male'][columnName.replaceAll(" ", "").replaceAll(".", "").replaceAll("-", "").replaceAll("/", "")][ageRange];
                                        return <td className="stats-demo-bin-cell" onClick={() => updatePrice("Male", columnName, ageRange)}>
                                            {amount > 0 ? ("$ " + amount) : "-"}
                                        </td>
                                    })}
                                </tr>
                            })}
                        </tbody>
                    </table>

                    <table className="table-of-bonuses">
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
                                        let amount = database['bonuses']['Female'][columnName.replaceAll(" ", "").replaceAll(".", "").replaceAll("-", "").replaceAll("/", "")][ageRange];
                                        return <td className="stats-demo-bin-cell" onClick={() => updatePrice("Female", columnName, ageRange)}>
                                            {amount > 0 ? ("$ " + amount) : "-"}
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

export default Bonuses;