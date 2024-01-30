import React, { useEffect, useState, useReducer } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from "react-router-dom";

import './Stats.css';
import Constants from './Constants';
import { filter } from 'd3';

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
        statuses: ["Blank", "Not Selected"],
        statuses2: ["Contacted", "Scheduled", "Completed"],
        skinTones: Constants['skinTone']
    });


    function getDefaultNumbers() {
        let temp = Object.assign({}, ...Constants['listOfHeights'].map(k => ({
            [k]: Object.assign({}, ...Constants['listOfWeights'].map(k => ({
                [k]: Object.assign({}, ...Constants['genders'].map(k => ({
                    [k]: Object.assign({}, ...Constants['participantStatuses'].map(k => ({ [k || "Blank"]: 0 })))
                })))
            })))
        })))

        return (temp);
    }


    function selectDemoBin(statuses, heightRange, weightRange, gender) {
        if (role != "admin") return;
        setFilterDataFromStats({
            fromStats: true,
            ageRanges: Constants['listOfAgeRanges'],
            genders: [gender],
            weightRanges: weightRange,
            heightRanges: heightRange,
            statuses: statuses,
            icfs: ['Yes', 'No'],
            demoBinStatuses: Constants['demoBinStatuses'],
            highlighted: ['Yes', 'No'],
            skinTones: filterData['skinTones'],
            hairlength: Constants['hairlength'],
        });

        navigate('participants');
        setShowStats(false);
    }


    useEffect(() => {
        // Fill stats
        let tempStats = getDefaultNumbers();
        let blankArray = 0

        let participants = database['participants'];
        Object.values(participants).map(participant => {


            let gender = participant['gender'];
            let weightRange = participant['weight_range'];
            let heightRange = participant['height_range'];
            let ethValue = 1
            let status = participant['status'] || "Blank";
            let skinTone = participant['skinTone'];
            if (!filterData['skinTones'].includes(skinTone)) return;


            if (status == "Blank") {
                blankArray = blankArray + 1;
                console.log(participant['email'], status)
            }
            if (!Constants['listOfWeights'].includes(weightRange)) return;
            if (!Constants['listOfAgeRanges'].includes(participant['age_range'])) return;
            tempStats[heightRange][weightRange][gender][status] += ethValue;

        })
        setStats(tempStats);
    }, [filterData['skinTones']])


    useEffect(() => {
        const handleEsc = (event) => { if (event.keyCode === 27) setShowStats(""); };
        window.addEventListener('keydown', handleEsc);
        return () => { window.removeEventListener('keydown', handleEsc) };
    }, []);

    return ReactDOM.createPortal((
        <div className="modal-stats-backdrop" onClick={(e) => { if (e.target.className == "modal-stats-backdrop") setShowStats("") }}>
            <div className="modal-stats-main-container">
                <div className="modal-stats-header">
                    Participant stats
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

                {role == 'admin' &&
                    <div className='stats-filter-skins'>
                        <div className="still-interested-participants-only-filter">
                            <div><span className="skinTones-row">Skin tones:</span></div>
                            {Constants['skinTone'].map((val, i) => {
                                return <div key={"filter-status-" + i}>
                                    <input id={"stats-filter-skinTones-" + val} name={val} type="checkbox" alt="skinTones" onChange={setFilterData} checked={filterData['skinTones'].includes(val)} />
                                    <label className="skinTones-row" htmlFor={"stats-filter-skinTones-" + val}>{val}</label>
                                </div>
                            })}
                        </div>
                    </div>}

                <div className="modal-stats-content">
                    {['Male', 'Female'].map(gender => {
                        return <table className="table-of-stats">
                            <thead>
                                <tr>
                                    <th>
                                        {gender}
                                    </th>
                                    {Constants['listOfHeights'].map(eth => {
                                        return <th key={'stats-header-' + eth}>{eth}</th>
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {Constants['listOfWeights'].map(ageRange => {
                                    return <tr>
                                        <th>{ageRange}</th>
                                        {Constants['listOfHeights'].map(columnName => {
                                            let eth = [columnName];
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
                                                binClassTag = "demo-bin-" + database['demo_bins'][gender][columnName][ageRange];
                                            }

                                            return <td className={"stats-demo-bin-cell " + (binClassTag)}>
                                                <span className="first-number" onClick={() => selectDemoBin(filterData['statuses'], eth, [ageRange], gender)}>{output}</span>
                                                <span className="second-number" onClick={() => selectDemoBin(filterData['statuses2'], eth, [ageRange], gender)}>{output2}</span>
                                            </td>
                                        })}
                                    </tr>
                                })}
                                <tr>
                                    <th className="stats-total-row">Total</th>
                                    {Constants['listOfHeights'].map(columnName => {
                                        let eth = [columnName];
                                        let output = eth.reduce((a, b) => {
                                            return filterData['statuses'].reduce((x, y) => {

                                                return Constants['listOfWeights'].reduce((q, w) => {
                                                    return stats[b][w][gender][y] + q
                                                }, 0) + x
                                            }, 0) + a
                                        }, 0);

                                        let output2 = eth.reduce((a, b) => {
                                            return filterData['statuses2'].reduce((x, y) => {
                                                return Constants['listOfWeights'].reduce((q, w) => { return stats[b][w][gender][y] + q }, 0) + x
                                            }, 0) + a
                                        }, 0);
                                        output = parseFloat(output);
                                        output2 = parseFloat(output2);

                                        return <td className="stats-demo-bin-cell stats-total-row">
                                            <span className="first-number" onClick={() => selectDemoBin(filterData['statuses'], eth, Constants['listOfWeights'], gender)}>{output}</span>
                                            <span className="second-number" onClick={() => selectDemoBin(filterData['statuses2'], eth, Constants['listOfWeights'], gender)}>{output2}</span>
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