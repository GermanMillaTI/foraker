import React, { useEffect, useState, useReducer } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from "react-router-dom";

import './Stats.css';
import Constants from './Constants';

const filterReducer = (state, event) => {
    let newState = JSON.parse(JSON.stringify(state));
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

function SkintoneStats({ database, setShowStatsSkintones, setFilterDataFromStats, role }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState(getDefaultNumbers());
    const [filterData, setFilterData] = useReducer(filterReducer, {
        statuses: ["Blank", "Not Selected"],
        statuses2: ["Contacted", "Scheduled", "Completed"]
    });

    function getDefaultNumbers() {
        let temp = Object.assign({}, ...Constants['skinTone'].map(k => ({
            [k]: Object.assign({}, ...Constants['genders'].map(k => ({
                [k]: Object.assign({}, ...Constants['participantStatuses'].map(k => ({ [k || "Blank"]: 0 })))
            })))
        })))

        return (temp);
    }


    function selectDemoBin(statuses, skintoneRange, gender) {
        if (role != "admin") return;
        setFilterDataFromStats({
            fromStats: true,
            genders: [gender],
            skinTones: skintoneRange,
            statuses: statuses,
            icfs: ['Yes', 'No'],
            demoBinStatuses: Constants['demoBinStatuses'],
            highlighted: ['Yes', 'No'],
            ageRanges: Constants['listOfAgeRanges'],
            hairlength: Constants['hairlength'],
            weightRanges: Constants['listOfWeights'],
            heightRanges: Constants['listOfHeights'],
            session1stat: ["N/A", ...Constants['sessionStatuses']],
            sources: Object.keys(Constants['sources']),

        });

        navigate('participants');
        setShowStatsSkintones(false);
    }

    useEffect(() => {
        // Fill stats
        let tempStats = getDefaultNumbers();

        let participants = database['participants'];
        Object.values(participants).map(participant => {
            let gender = participant['gender'];
            let skintone = participant['skinTone'];
            let status = participant['status'] || "Blank";
            if (!Constants['skinTone'].includes(skintone)) return;
            if (!Constants['listOfAgeRanges'].includes(participant['age_range'])) return;

            tempStats[skintone][gender][status] += 1;
        })

        setStats(tempStats);
    }, [])

    useEffect(() => {
        const handleEsc = (event) => { if (event.keyCode === 27) setShowStatsSkintones(""); };
        window.addEventListener('keydown', handleEsc);
        return () => { window.removeEventListener('keydown', handleEsc) };
    }, []);

    return ReactDOM.createPortal((
        <div className="modal-stats-backdrop" onClick={(e) => { if (e.target.className == "modal-stats-backdrop") setShowStatsSkintones("") }}>
            <div className="modal-stats-main-container">
                <div className="modal-stats-header">
                    Skin tone stats
                </div>

                <div className="stats-filter-element">
                    <div><span className="first-number">First number:</span></div>
                    {Constants['participantStatuses'].map((val, i) => {
                        return <div key={"filter-status" + i}>
                            <input id={"stats-filter-participant-status-" + (val || "Blank")} name={val || "Blank"} type="checkbox" alt="statuses" onChange={setFilterData} checked={val == "" ? filterData['statuses'].includes("Blank") : filterData['statuses'].includes(val)} />
                            <label className="first-number" htmlFor={"stats-filter-participant-status-" + (val || "Blank")}>{(val || "Blank")}</label>
                        </div>
                    })}
                </div>

                <div className="stats-filter-element">
                    <div><span className="second-number">Second number:</span></div>
                    {Constants['participantStatuses'].map((val, i) => {
                        return <div key={"filter-status" + i}>
                            <input id={"stats-filter2-participant-status-" + (val || "Blank")} name={val || "Blank"} type="checkbox" alt="statuses2" onChange={setFilterData} checked={val == "" ? filterData['statuses2'].includes("Blank") : filterData['statuses2'].includes(val)} />
                            <label className="second-number" htmlFor={"stats-filter2-participant-status-" + (val || "Blank")}>{(val || "Blank")}</label>
                        </div>
                    })}
                </div>


                <div className="modal-stats-content">


                    <table className="table-of-stats">
                        <thead>
                            <tr>
                                <th>

                                </th>
                                {Object.keys(Constants['demoBinsGenders']).map(gender => {
                                    return <th key={'stats-header-' + gender}>{gender}</th>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {Constants['skinTone'].map(ageRange => {
                                return <tr>

                                    <th>{ageRange}</th>

                                    {Object.keys(Constants['demoBinsGenders']).map(gender => {
                                        let output = filterData['statuses'].reduce((x, y) => {
                                            return stats[ageRange][gender][y] + x
                                        }, 0);
                                        let output2 = filterData['statuses2'].reduce((x, y) => {
                                            return stats[ageRange][gender][y] + x
                                        }, 0);
                                        output = parseFloat(output.toFixed(1));
                                        output2 = parseFloat(output2.toFixed(1));

                                        let binClassTag = "demo-bin-" + database['skin_bins'][gender][ageRange];

                                        return <td className={"stats-demo-bin-cell " + (binClassTag)}>
                                            <span className="first-number" onClick={() => selectDemoBin(filterData['statuses'], [ageRange], gender)}>{output}</span>
                                            <span className="second-number" onClick={() => selectDemoBin(filterData['statuses2'], [ageRange], gender)}>{output2}</span>
                                        </td>
                                    })}
                                </tr>
                            })}
                        </tbody>
                    </table>

                    {/*
                    {['Male', 'Female'].map(gender => {
                        return <table className="table-of-stats">
                            <thead>
                                <tr>
                                    <th>
                                        {gender}
                                    </th>
                                    {Object.keys(Constants['columnsOfStats']).map(eth => {
                                        return <th key={'stats-header-' + eth}>{eth}</th>
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {Constants['listOfAgeRanges'].map(ageRange => {
                                    return <tr>
                                        <th>{ageRange}</th>
                                        {Object.keys(Constants['columnsOfStats']).map(columnName => {
                                            let eth = Constants['columnsOfStats'][columnName];
                                            let output = eth.reduce((a, b) => {
                                                return filterData['statuses'].reduce((x, y) => {
                                                    return stats[b][ageRange][gender][y] + x
                                                }, 0) + a
                                            }, 0);
                                            let output2 = eth.reduce((a, b) => {
                                                return filterData['statuses2'].reduce((x, y) => {
                                                    return stats[b][ageRange][gender][y] + x
                                                }, 0) + a
                                            }, 0);
                                            output = parseFloat(output.toFixed(1));
                                            output2 = parseFloat(output2.toFixed(1));

                                            let binClassTag = "";
                                            if (columnName != "Total") {
                                                binClassTag = "demo-bin-" + database['demo_bins'][gender][Constants['bonusEthnicities2'][columnName]][ageRange];
                                            }

                                            return <td className={"stats-demo-bin-cell " + (binClassTag)}>
                                                <span className="first-number" onClick={() => selectDemoBin(filterData['statuses'], eth, [ageRange], gender)}>{output}</span>
                                                <span className="second-number" onClick={() => selectDemoBin(filterData['statuses2'], eth, [ageRange], gender)}>{output2}</span>
                                                {columnName != "Total" && <label className="stats-demo-bin">{Constants['demoBinsEthnicities'][eth[0]] + Constants['demoBinsAgeRanges'][ageRange] + Constants['demoBinsGenders'][gender]}</label>}
                                            </td>
                                        })}
                                    </tr>
                                })}
                                <tr>
                                    <th className="stats-total-row">Total</th>
                                    {Object.keys(Constants['columnsOfStats']).map(columnName => {
                                        let eth = Constants['columnsOfStats'][columnName];
                                        let output = eth.reduce((a, b) => {
                                            return filterData['statuses'].reduce((x, y) => {
                                                return Constants['listOfAgeRanges'].reduce((q, w) => { return stats[b][w][gender][y] + q }, 0) + x
                                            }, 0) + a
                                        }, 0);
                                        let output2 = eth.reduce((a, b) => {
                                            return filterData['statuses2'].reduce((x, y) => {
                                                return Constants['listOfAgeRanges'].reduce((q, w) => { return stats[b][w][gender][y] + q }, 0) + x
                                            }, 0) + a
                                        }, 0);
                                        output = parseFloat(output.toFixed(1));
                                        output2 = parseFloat(output2.toFixed(1));

                                        return <td className="stats-demo-bin-cell stats-total-row">
                                            <span className="first-number" onClick={() => selectDemoBin(filterData['statuses'], eth, Constants['listOfAgeRanges'], gender)}>{output}</span>
                                            <span className="second-number" onClick={() => selectDemoBin(filterData['statuses2'], eth, Constants['listOfAgeRanges'], gender)}>{output2}</span>
                                        </td>
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    })}
                */}
                </div>
            </div>
        </div>
    ), document.body);
}

export default SkintoneStats;