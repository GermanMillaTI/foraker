import React, { useEffect, useState, useReducer } from 'react';
import ReactDOM from 'react-dom';
import { auth } from '../firebase/config';
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

function StatsSessions({ database, setShowStatsSessions, setFilterDataFromStats }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState(getDefaultNumbers());
    const [stats2, setStats2] = useState(getDefaultNumbers());
    const [filterData, setFilterData] = useReducer(filterReducer, {
        statuses: ["Scheduled", "Checked In"],
        statuses2: ["Completed"]
    });

    function getDefaultNumbers() {
        let temp = Object.assign({}, ...Constants['ethnicities'].map(k => ({
            [k]: Object.assign({}, ...Constants['listOfAgeRanges'].map(k => ({
                [k]: Object.assign({}, ...Constants['genders'].map(k => ({
                    [k]: Object.assign({}, ...Constants['sessionStatuses'].map(k => ({ [k]: 0 })))
                })))
            })))
        })))

        return (temp);
    }

    function selectDemoBin(statuses, ethnicities, ageRange, gender) {

        if (database['users'][auth.currentUser.uid]['role'] != "admin") return;
        setFilterDataFromStats({
            fromStats: true,
            ethnicities: ethnicities,
            multipleEthnicities: ['Yes', 'No'],
            genders: [gender],
            ageRanges: ageRange,
            statuses: ["Blank", ...Constants['participantStatuses']],
            icfs: ['Yes', 'No'],
            demoBinStatuses: Constants['demoBinStatuses'],
            sources: Object.keys(Constants['sources']),
            documentStatuses: ["Blank", ...Constants['documentStatuses']],
            visionCorrections: Constants['visionCorrections'],
            parentRegistered: ['Yes', 'No'],
            newDocuments: ['Yes', 'No'],
            highlighted: ['Yes', 'No'],
            stillInterested: Constants['stillInterestedValues'],
            unsubscribed: ['Yes', 'No'],
            unreadEmails: ['Yes', 'No']
        });

        navigate('participants');
        setShowStatsSessions(false);
    }

    useEffect(() => {
        // Fill stats
        let tempStats = getDefaultNumbers();
        let tempStats2 = getDefaultNumbers();

        let participants = database['participants'];
        let sessions = database['timeslots'];
        Object.values(sessions).map(session => {
            let participantId = session['participant_id'];
            if (!participantId) return;

            let participant = participants[participantId];
            let gender = participant['gender'];
            let ageRange = session['age_range'];
            let ethnicities = participant['ethnicities'].split(',');
            let ethValue = 1 / ethnicities.length;
            let status = session['status'] || "Blank";

            // The following loop fills up the object of stats2 -- it's used for the backgound highlights only...
            for (let x = 0; x < ethnicities.length; x++) {
                let ethnicity = ethnicities[x].trim();
                if (!Constants['listOfAgeRanges'].includes(ageRange)) continue;
                tempStats2[ethnicity][ageRange][gender][status] += ethValue;
            }

            for (let x = 0; x < ethnicities.length; x++) {
                let ethnicity = ethnicities[x].trim();
                if (!Constants['listOfAgeRanges'].includes(ageRange)) continue;
                tempStats[ethnicity][ageRange][gender][status] += ethValue;
            }
        })

        setStats(tempStats);
        setStats2(tempStats2);
    }, [])

    function getBackgroundColor(number, columnName, totalRow) {
        return 0;

        if (columnName == "Total") {
            if (totalRow) {
                if (number < 912) {
                    return 1;
                } else if (number < 1152) {
                    return 2;
                } else {
                    return 3;
                }
            } else {
                if (number < 114) {
                    return 1;
                } else if (number < 144) {
                    return 2;
                } else {
                    return 3;
                }
            }
        } else {
            if (totalRow) {
                if (number < 152) {
                    return 1;
                } else if (number < 192) {
                    return 2;
                } else {
                    return 3;
                }
            } else {
                if (number < 19) {
                    return 1;
                } else if (number < 24) {
                    return 2;
                } else {
                    return 3;
                }
            }
        }
    }

    return ReactDOM.createPortal((
        <div className="modal-stats-backdrop" onClick={(e) => { if (e.target.className == "modal-stats-backdrop") setShowStatsSessions("") }}>
            <div className="modal-stats-main-container">
                <div className="modal-stats-header">
                    Session stats
                </div>

                <div className="stats-filter-element">
                    <div><span className="first-number">First number:</span></div>
                    {Constants['sessionStatuses'].map((val, i) => {
                        if (val == "Comp. for Waiting") return;
                        return <div key={"filter-status" + i}>
                            <input id={"stats-filter-participant-status-" + (val || "Blank")} name={val || "Blank"} type="checkbox" alt="statuses" onChange={setFilterData} checked={val == "" ? filterData['statuses'].includes("Blank") : filterData['statuses'].includes(val)} />
                            <label className="first-number" htmlFor={"stats-filter-participant-status-" + (val || "Blank")}>{(val || "Blank")}</label>
                        </div>
                    })}
                </div>

                <div className="stats-filter-element">
                    <div><span className="second-number">Second number:</span></div>
                    {Constants['sessionStatuses'].map((val, i) => {
                        if (val == "Comp. for Waiting") return;
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
                                    Male
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
                                                return stats[b][ageRange]['Male'][y] + x
                                            }, 0) + a
                                        }, 0);
                                        let output2 = eth.reduce((a, b) => {
                                            return filterData['statuses2'].reduce((x, y) => {
                                                return stats[b][ageRange]['Male'][y] + x
                                            }, 0) + a
                                        }, 0);
                                        output = parseFloat(output.toFixed(1));
                                        output2 = parseFloat(output2.toFixed(1));

                                        let number = parseFloat(eth.reduce((a, b) => {
                                            return ['Scheduled', 'Checked In', 'Completed'].reduce((x, y) => {
                                                return stats2[b][ageRange]['Male'][y] + x
                                            }, 0) + a
                                        }, 0));

                                        let background = getBackgroundColor(number, columnName, false);

                                        let binClassTag = "";
                                        if (columnName != "Total") {
                                            binClassTag = "demo-bin-" + database['demo_bins']['Male'][Constants['bonusEthnicities2'][columnName]][ageRange];
                                        }

                                        return <td className={"stats-demo-bin-cell " + binClassTag}>
                                            <span className={"first-number stats-completion-" + background} onClick={() => selectDemoBin(filterData['statuses'], eth, [ageRange], "Male")}>{output}</span>
                                            <span className={"second-number stats-completion-" + background} onClick={() => selectDemoBin(filterData['statuses2'], eth, [ageRange], "Male")}>{output2}</span>
                                            {columnName != "Total" && <label className="stats-demo-bin">{Constants['demoBinsEthnicities'][eth[0]] + Constants['demoBinsAgeRanges'][ageRange] + Constants['demoBinsGenders']['Male']}</label>}
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
                                            return Constants['listOfAgeRanges'].reduce((q, w) => { return stats[b][w]['Male'][y] + q }, 0) + x
                                        }, 0) + a
                                    }, 0);
                                    let output2 = eth.reduce((a, b) => {
                                        return filterData['statuses2'].reduce((x, y) => {
                                            return Constants['listOfAgeRanges'].reduce((q, w) => { return stats[b][w]['Male'][y] + q }, 0) + x
                                        }, 0) + a
                                    }, 0);
                                    output = parseFloat(output.toFixed(1));
                                    output2 = parseFloat(output2.toFixed(1));

                                    let number = parseFloat(eth.reduce((a, b) => {
                                        return ['Scheduled', 'Checked In', 'Completed'].reduce((x, y) => {
                                            return Constants['listOfAgeRanges'].reduce((q, w) => { return stats2[b][w]['Male'][y] + q }, 0) + x
                                        }, 0) + a
                                    }, 0));

                                    let background = getBackgroundColor(number, columnName, true);

                                    return <td className="stats-demo-bin-cell stats-total-row">
                                        <span className={"first-number stats-completion-" + background} onClick={() => selectDemoBin(filterData['statuses'], eth, Constants['listOfAgeRanges'], "Male")}>{output}</span>
                                        <span className={"second-number stats-completion-" + background} onClick={() => selectDemoBin(filterData['statuses2'], eth, Constants['listOfAgeRanges'], "Male")}>{output2}</span>
                                    </td>
                                })}
                            </tr>
                        </tbody>
                    </table>


                    <table className="table-of-stats">
                        <thead>
                            <tr>
                                <th>
                                    Female
                                </th>
                                {Object.keys(Constants['columnsOfStats']).map(eth => {
                                    return <th>{eth}</th>
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
                                                return stats[b][ageRange]['Female'][y] + x
                                            }, 0) + a
                                        }, 0);
                                        let output2 = eth.reduce((a, b) => {
                                            return filterData['statuses2'].reduce((x, y) => {
                                                return stats[b][ageRange]['Female'][y] + x
                                            }, 0) + a
                                        }, 0);
                                        output = parseFloat(output.toFixed(1));
                                        output2 = parseFloat(output2.toFixed(1));

                                        let number = parseFloat(eth.reduce((a, b) => {
                                            return ['Scheduled', 'Checked In', 'Completed'].reduce((x, y) => {
                                                return stats2[b][ageRange]['Female'][y] + x
                                            }, 0) + a
                                        }, 0));

                                        let background = getBackgroundColor(number, columnName, false);

                                        let binClassTag = "";
                                        if (columnName != "Total") {
                                            binClassTag = "demo-bin-" + database['demo_bins']['Female'][Constants['bonusEthnicities2'][columnName]][ageRange];
                                        }

                                        return <td className={"stats-demo-bin-cell " + binClassTag}>
                                            <span className={"first-number stats-completion-" + background} onClick={() => selectDemoBin(filterData['statuses'], eth, [ageRange], "Female")}>{output}</span>
                                            <span className={"second-number stats-completion-" + background} onClick={() => selectDemoBin(filterData['statuses2'], eth, [ageRange], "Female")}>{output2}</span>
                                            {columnName != "Total" && <label className="stats-demo-bin">{Constants['demoBinsEthnicities'][eth[0]] + Constants['demoBinsAgeRanges'][ageRange] + Constants['demoBinsGenders']['Female']}</label>}
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
                                            return Constants['listOfAgeRanges'].reduce((q, w) => { return stats[b][w]['Female'][y] + q }, 0) + x
                                        }, 0) + a
                                    }, 0);
                                    let output2 = eth.reduce((a, b) => {
                                        return filterData['statuses2'].reduce((x, y) => {
                                            return Constants['listOfAgeRanges'].reduce((q, w) => { return stats[b][w]['Female'][y] + q }, 0) + x
                                        }, 0) + a
                                    }, 0);
                                    output = parseFloat(output.toFixed(1));
                                    output2 = parseFloat(output2.toFixed(1));

                                    let number = parseFloat(eth.reduce((a, b) => {
                                        return ['Scheduled', 'Checked In', 'Completed'].reduce((x, y) => {
                                            return Constants['listOfAgeRanges'].reduce((q, w) => { return stats2[b][w]['Female'][y] + q }, 0) + x
                                        }, 0) + a
                                    }, 0));

                                    let background = getBackgroundColor(number, columnName, true);

                                    return <td className="stats-demo-bin-cell stats-total-row">
                                        <span className={"first-number stats-completion-" + background} onClick={() => selectDemoBin(filterData['statuses'], eth, Constants['listOfAgeRanges'], "Female")}>{output}</span>
                                        <span className={"second-number stats-completion-" + background} onClick={() => selectDemoBin(filterData['statuses2'], eth, Constants['listOfAgeRanges'], "Female")}>{output2}</span>
                                    </td>
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    ), document.body);
}

export default StatsSessions;