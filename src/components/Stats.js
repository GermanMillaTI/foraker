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

function Stats({ database, setShowStats, setFilterDataFromStats, role }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState(getDefaultNumbers());
    const [filterData, setFilterData] = useReducer(filterReducer, {
        statuses: ["Blank", "Document Requested", "Not Selected"],
        statuses2: ["Contacted", "Scheduled", "Completed"],
        stillInterested: Constants['stillInterestedValues']
    });

    function getDefaultNumbers() {
        let temp = Object.assign({}, ...Constants['ethnicities'].map(k => ({
            [k]: Object.assign({}, ...Constants['listOfAgeRanges'].map(k => ({
                [k]: Object.assign({}, ...Constants['genders'].map(k => ({
                    [k]: Object.assign({}, ...Constants['participantStatuses'].map(k => ({ [k || "Blank"]: 0 })))
                })))
            })))
        })))

        return (temp);
    }


    function selectDemoBin(statuses, ethnicities, ageRange, gender) {
        if (role != "admin") return;
        setFilterDataFromStats({
            fromStats: true,
            ethnicities: ethnicities,
            multipleEthnicities: ['Yes', 'No'],
            genders: [gender],
            ageRanges: ageRange,
            statuses: statuses,
            icfs: ['Yes', 'No'],
            demoBinStatuses: Constants['demoBinStatuses'],
            sources: Object.keys(Constants['sources']),
            documentStatuses: ["Blank", ...Constants['documentStatuses']],
            visionCorrections: Constants['visionCorrections'],
            parentRegistered: ['Yes', 'No'],
            newDocuments: ['Yes', 'No'],
            highlighted: ['Yes', 'No'],
            stillInterested: filterData['stillInterested'],
            unsubscribed: ['Yes', 'No'],
            unreadEmails: ['Yes', 'No'],
            industry: Constants['industryCategories'],
            registrationType: ['Denali', 'Elbert']
        });

        navigate('participants');
        setShowStats(false);
    }

    useEffect(() => {
        // Fill stats
        let tempStats = getDefaultNumbers();

        let participants = database['participants'];
        Object.values(participants).map(participant => {
            let gender = participant['gender'];
            let ageRange = participant['age_range'];
            let ethnicities = participant['ethnicities'].split(',');
            let ethValue = 1 / ethnicities.length;
            let status = participant['status'] || "Blank";
            let stillInterested = participant['still_interested'] || "N/A";
            if (!filterData['stillInterested'].includes(stillInterested)) return;

            for (let x = 0; x < ethnicities.length; x++) {

                let ethnicity = ethnicities[x].trim();
                if (!Constants['listOfAgeRanges'].includes(ageRange)) continue;
                tempStats[ethnicity][ageRange][gender][status] += ethValue;
            }
        })

        setStats(tempStats);
    }, [filterData['stillInterested']])

    return ReactDOM.createPortal((
        <div className="modal-stats-backdrop" onClick={(e) => { if (e.target.className == "modal-stats-backdrop") setShowStats("") }}>
            <div className="modal-stats-main-container">
                <div className="modal-stats-header">
                    Participant stats
                </div>

                <div className="stats-filter-element">
                    <div><span className="first-number">First number:</span></div>
                    {Constants['participantStatuses'].filter(status => status != "Denali PPT").map((val, i) => {
                        return <div key={"filter-status" + i}>
                            <input id={"stats-filter-participant-status-" + (val || "Blank")} name={val || "Blank"} type="checkbox" alt="statuses" onChange={setFilterData} checked={val == "" ? filterData['statuses'].includes("Blank") : filterData['statuses'].includes(val)} />
                            <label className="first-number" htmlFor={"stats-filter-participant-status-" + (val || "Blank")}>{(val || "Blank")}</label>
                        </div>
                    })}
                </div>

                <div className="stats-filter-element">
                    <div><span className="second-number">Second number:</span></div>
                    {Constants['participantStatuses'].filter(status => status != "Denali PPT").map((val, i) => {
                        return <div key={"filter-status" + i}>
                            <input id={"stats-filter2-participant-status-" + (val || "Blank")} name={val || "Blank"} type="checkbox" alt="statuses2" onChange={setFilterData} checked={val == "" ? filterData['statuses2'].includes("Blank") : filterData['statuses2'].includes(val)} />
                            <label className="second-number" htmlFor={"stats-filter2-participant-status-" + (val || "Blank")}>{(val || "Blank")}</label>
                        </div>
                    })}
                </div>

                {role == 'admin' &&
                    <div className="still-interested-participants-only-filter">
                        <div><span className="still-interested-row">Still interested:</span></div>
                        {Constants['stillInterestedValues'].map((val, i) => {
                            return <div key={"filter-status-" + i}>
                                <input id={"stats-filter-still-interested-" + val} name={val} type="checkbox" alt="stillInterested" onChange={setFilterData} checked={filterData['stillInterested'].includes(val)} />
                                <label className="still-interested-row" htmlFor={"stats-filter-still-interested-" + val}>{val}</label>
                            </div>
                        })}
                    </div>}

                <div className="modal-stats-content">
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
                </div>
            </div>
        </div>
    ), document.body);
}

export default Stats;