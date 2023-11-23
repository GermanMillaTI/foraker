import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import './StatsProtocols.css';
import Constants from './Constants';

function StatsProtocols({ database, setShowProtocols }) {
    const [stats, setStats] = useState(getDefaultNumbers());

    function getDefaultNumbers() {
        let temp = {};

        Constants['listOfAgeRanges'].map(ageRange => {
            Object.keys(Constants['columnsOfStats']).map(columnName => {
                if (columnName == "Total") return null;
                ["Male", "Female"].map(gender => {
                    const eth = Constants['columnsOfStats'][columnName];
                    const demoBin = Constants['demoBinsEthnicities'][eth[0]] + Constants['demoBinsAgeRanges'][ageRange] + Constants['demoBinsGenders'][gender];
                    temp[demoBin] = {
                        "Apple TV Only": 0,
                        "Random Activity": 0
                    }
                })
            })
        })

        return (temp);
    }

    useEffect(() => {
        // Fill stats
        let tempStats = getDefaultNumbers();

        Object.keys(database['timeslots']).map(timeslotId => {
            const timeslot = database['timeslots'][timeslotId];
            const participantId = timeslot['participant_id'];
            const sessionStatus = timeslot['status'];
            const sessionOutcome = timeslot['session_outcome'];
            const sessionProtocol = timeslot['session_protocol'];
            if (!participantId ||
                sessionOutcome == 'Incomplete - Redo' ||
                ['Rescheduled', 'NoShow', 'Withdrawn', 'Failed - Comp.', 'Failed - No Comp.'].includes(sessionStatus) ||
                !sessionProtocol
            ) return;

            const demoBin = database['participants'][participantId]['demo_bin'];
            if (demoBin.includes(',') || demoBin.includes('#NA')) return;

            tempStats[demoBin][sessionProtocol]++;
        })

        setStats(tempStats);
    }, [])

    useEffect(() => {
        const handleEsc = (event) => { if (event.keyCode === 27) setShowProtocols(false); };
        window.addEventListener('keydown', handleEsc);
        return () => { window.removeEventListener('keydown', handleEsc) };
    }, []);

    return ReactDOM.createPortal((
        <div className="modal-stats-of-protocols-backdrop" onClick={(e) => { if (e.target.className == "modal-stats-of-protocols-backdrop") setShowProtocols(false) }}>
            <div className="modal-stats-of-protocols-main-container">
                <div className="modal-stats-of-protocols-header">
                    Session protocols
                </div>

                <div className="stats-filter-element">
                    <span className="first-number">First number: Apple TV Only</span>
                </div>

                <div className="stats-filter-element">
                    <span className="second-number">Second number: Random Activity</span>
                </div>

                <div className="stats-filter-element">
                    <span>*Please note that the numbers might not be fully accurate, since people with multiple demo bins are not considered here...</span>
                </div>

                <div className="modal-stats-of-protocols-content">
                    <table className="table-of-protocols">
                        <thead>
                            <tr>
                                <th>
                                    Male
                                </th>
                                {Object.keys(Constants['columnsOfStats']).map(eth => {
                                    if (eth == "Total") return null;
                                    return <th key={'stats-header-' + eth}>{eth}</th>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {Constants['listOfAgeRanges'].map(ageRange => {
                                return <tr key={'protocols-male-' + ageRange}>
                                    <th>{ageRange}</th>
                                    {Object.keys(Constants['columnsOfStats']).map(columnName => {
                                        if (columnName == "Total") return null;

                                        const gender = "Male";
                                        const eth = Constants['columnsOfStats'][columnName];
                                        const demoBin = Constants['demoBinsEthnicities'][eth[0]] + Constants['demoBinsAgeRanges'][ageRange] + Constants['demoBinsGenders'][gender];
                                        const binClassTag = "demo-bin-" + database['demo_bins']['Male'][Constants['bonusEthnicities2'][columnName]][ageRange];

                                        return <td key={'protocols-male-' + columnName} className={"stats-demo-bin-cell " + binClassTag}>
                                            <span className="first-number">{stats[demoBin]['Apple TV Only']}</span>
                                            <span className="second-number">{stats[demoBin]['Random Activity']}</span>
                                            <label className="stats-demo-bin">{demoBin}</label>
                                        </td>
                                    })}
                                </tr>
                            })}
                        </tbody>
                    </table>

                    <table className="table-of-protocols">
                        <thead>
                            <tr>
                                <th>
                                    Female
                                </th>
                                {Object.keys(Constants['columnsOfStats']).map(eth => {
                                    if (eth == "Total") return null;
                                    return <th key={'stats-header-' + eth}>{eth}</th>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {Constants['listOfAgeRanges'].map(ageRange => {
                                return <tr key={'protocols-female-' + ageRange}>
                                    <th>{ageRange}</th>
                                    {Object.keys(Constants['columnsOfStats']).map(columnName => {
                                        if (columnName == "Total") return null;

                                        const gender = "Female";
                                        const eth = Constants['columnsOfStats'][columnName];
                                        const demoBin = Constants['demoBinsEthnicities'][eth[0]] + Constants['demoBinsAgeRanges'][ageRange] + Constants['demoBinsGenders'][gender];
                                        const binClassTag = "demo-bin-" + database['demo_bins']['Male'][Constants['bonusEthnicities2'][columnName]][ageRange];

                                        return <td key={'protocols-female-' + columnName} className={"stats-demo-bin-cell " + binClassTag}>
                                            <span className="first-number">{stats[demoBin]['Apple TV Only']}</span>
                                            <span className="second-number">{stats[demoBin]['Random Activity']}</span>
                                            <label className="stats-demo-bin">{demoBin}</label>
                                        </td>
                                    })}
                                </tr>
                            })}
                        </tbody>
                    </table>

                </div>
            </div>
        </div >
    ), document.body);
}

export default StatsProtocols;