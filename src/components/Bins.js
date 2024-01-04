import React, { useEffect, useState, useReducer } from 'react';
import ReactDOM from 'react-dom';
import { realtimeDb } from '../firebase/config';

import './Bins.css';
import Constants from './Constants';

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
                    <table className="table-of-bins">
                        <thead>
                            <tr>
                                <th>

                                </th>
                                {Object.keys(Constants['demoBinsGenders']).map(gender => {
                                    return <th key={'demo-bins-header-' + gender}>{gender}</th>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {Constants['listOfAgeRanges'].map(ageRange => {
                                return <tr>

                                    <th>{ageRange}</th>

                                    {Object.keys(Constants['demoBinsGenders']).map(gender => {
                                        const currentValue = database['demo_bins'][gender][ageRange];
                                        return <td className={"stats-demo-bin-cell + demo-bin-" + currentValue.toString()} onClick={() => updateValue("/demo_bins/" + gender, { [ageRange]: (currentValue === 2 ? 0 : currentValue + 1) })}>
                                            <>
                                                {Constants['demoBinStatusDictionary'][currentValue]}
                                                <label className="stats-demo-bin">{Constants['demoBinsAgeRanges'][ageRange] + Constants['demoBinsGenders'][gender]}</label>
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