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

    useEffect(() => {
        const handleEsc = (event) => { if (event.keyCode === 27) setShowBins(false); };
        window.addEventListener('keydown', handleEsc);
        return () => { window.removeEventListener('keydown', handleEsc) };
    }, []);
    return ReactDOM.createPortal((
        <div className="modal-bins-backdrop" onClick={(e) => { if (e.target.className == "modal-bins-backdrop") setShowBins(false) }}>
            <div className="modal-bins-main-container">
                <div className="modal-bins-header">
                    Demo bins
                </div>

                <div className="modal-bins-content">
                    {['Male', 'Female'].map(gender => {
                        return <table className="table-of-bins">
                            <thead>
                                <tr>
                                    <th>
                                        {gender}
                                    </th>
                                    {Constants['listOfHeights'].filter(columnName => columnName != "Total").map(eth => {
                                        return <th key={'demo-bins-header-' + eth}>{eth}</th>
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {Constants['listOfWeights'].map(weightRange => {
                                    return <tr>
                                        <th>{weightRange}</th>
                                        {Constants['listOfHeights'].filter(columnName => columnName != "Total").map(columnName => {
                                            let hgt = columnName
                                            let currentValue = database['demo_bins'][gender][hgt][weightRange];

                                            return <td className={"stats-demo-bin-cell + demo-bin-" + currentValue.toString()} onClick={() => updateValue("/demo_bins/" + gender + "/" + hgt, { [weightRange]: (currentValue === 2 ? 0 : currentValue + 1) })}>

                                                <>
                                                    {Constants['demoBinStatusDictionary'][currentValue]}
                                                    {/* {columnName != "Total" && <label className="stats-demo-bin">{Constants['demoBinsHeights'][hgt] + Constants['demoBinsWeightRanges'][weightRange] + Constants['demoBinsGenders'][gender]}</label>} */}

                                                </>
                                            </td>
                                        })}
                                    </tr>
                                })}
                            </tbody>
                        </table>
                    })}
                </div>
            </div>
        </div>
    ), document.body);
}

export default Bins;