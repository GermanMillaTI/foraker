import React, { useState } from 'react';
import { renderToString } from 'react-dom/server';
import ReactDOM from 'react-dom';
import { auth, realtimeDb } from '../firebase/config';
import Swal from 'sweetalert2';
import format from 'date-fns/format';

import './UpdateSession.css';
import Constants from './Constants';
import LogEvent from './Core/LogEvent';

function UpdateSession({ database, updateSession, setUpdateSession, setCheckDocuments }) {
    const [participantId, setParticipantId] = useState(database['timeslots'][updateSession]['participant_id']);
    const [sessionInfo, setSessionInfo] = useState(database['timeslots'][updateSession]);
    const [hasCompletedSession] = useState(
        ['sari.kiiskinen@telusinternational.com', 'axel.romeo@telusinternational.com'].includes(auth.currentUser.email) ? false : Object.keys(database['timeslots']).filter(timeslotId => participantId == database['timeslots'][timeslotId]['participant_id'] && database['timeslots'][timeslotId]['status'] == "Completed").length > 0
    );

    let participantInfo = database['participants'][participantId];

    // Update value in DB
    function updateValue(path, newValue) {
        realtimeDb.ref(path).update(newValue);
    }

    function cancelSession(sessionId) {
        Swal.fire({
            title: "Are you sure?",
            html: 'By cancelling the session, it will be deleted from the timetable!',
            showCancelButton: true,
            confirmButtonText: 'Yes, cancel!'
        }).then((result) => {
            if (result.isConfirmed) {
                let path = "/timeslots/" + sessionId;
                let data = {
                    participant_id: "",
                    status: "",
                    glasses: false,
                    confirmed: "",
                    booked_today: false,
                    remind: false,
                    delayed: false,
                    comments: ""
                }

                // Set the bonuses to false
                let bonuses = database['timeslots'][sessionId]['bonus'];
                if (bonuses) {
                    data['bonus'] = JSON.parse(JSON.stringify(bonuses));
                    Object.keys(bonuses).map(bonusId => {
                        data['bonus'][bonusId]['a'] = false;
                    })
                }

                updateValue(path, data);
                setUpdateSession("");

                LogEvent({
                    pid: database['timeslots'][sessionId]['participant_id'],
                    timeslot: sessionId,
                    action: "Cancel session"
                })
            }
        })
    }

    function openDocuments(participantId) {
        realtimeDb.ref("/participants/" + participantId + "/documents/pending").remove();
        setCheckDocuments(participantId);
    }

    function modifyExternalId() {
        let externalId = participantInfo['external_id'];

        Swal.fire({
            title: 'Update external ID',
            showCancelButton: true,
            confirmButtonText: 'Save',
            html: '<input id="externalIdInputBox" value="' + (externalId || "") + '"/> ',
            didOpen: () => {
                let input = document.getElementById('externalIdInputBox');
                input.focus();
                input.select();

                input.addEventListener("keypress", function (event) {
                    if (event.key === "Enter") Swal.clickConfirm();
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                let newExternalId = document.getElementById('externalIdInputBox').value;
                let rx = new RegExp(/^TL_[a-zA-Z0-9_.-]{6}$/);
                if (newExternalId.match(rx)) {
                    let newId = "TL_" + newExternalId.substring(3).toLowerCase();
                    updateValue("/participants/" + participantId, { external_id: newId });

                    LogEvent({
                        pid: participantId,
                        action: "External ID: '" + newId + "'"
                    })
                } else {
                    Swal.fire({
                        title: 'The ID is not saved!',
                        html: '<span>The expected format is:</span><br/> <span>"TL_" + 6 numbers and/ or letters.</span>'
                    })
                }
            }
        })
    }


    function updateEthnicity() {
        const HTMLContent = () => {
            const pInfo = database['participants'][participantId];
            const ethnicities = pInfo['ethnicities'];
            const unlistedEthnicity = pInfo['unlisted_ethnicity'];

            return <>
                {Constants['ethnicities'].map((val, i) => {
                    return val != 'Other' && <div key={"popup-filter-eth" + i} className="update-ethnicity-row">
                        <input id={"popup-filter-" + val} name={val} type="checkbox" checked={ethnicities.includes(val) ? true : false} />
                        <label htmlFor={"popup-filter-" + val}>{val}</label>
                    </div>
                })}
                <div className="update-ethnicity-row2">
                    <label>Other ethnicity:</label>
                    <input id="otherEthnicity" type="textbox" defaultValue={unlistedEthnicity} />
                </div>
            </>
        }


        const pInfo = database['participants'][participantId];
        const currentEthnicities = pInfo['ethnicities'];
        const currentUnlistedEthnicity = pInfo['unlisted_ethnicity'];

        Swal.fire({
            title: "Updating ethnicities",
            confirmButtonText: "Save",
            showCancelButton: true,
            html: renderToString(<HTMLContent />)
        }).then((result) => {
            if (result.isConfirmed) {
                let checkboxes = document.querySelectorAll("[id^='popup-filter-']");
                let list = "";
                checkboxes.forEach(x => list += (x.checked ? x.name + ", " : ""));

                let otherEthnicity = document.getElementById('otherEthnicity').value.trim();
                if (otherEthnicity) list += "Other,"

                list = list.trim();
                list = list.substring(0, list.length - 1);

                if (list) {
                    if (list != currentEthnicities) {
                        if (!pInfo['original_ethnicities']) updateValue("/participants/" + participantId, { original_ethnicities: currentEthnicities });
                        updateValue("/participants/" + participantId, { ethnicities: list });

                        LogEvent({
                            pid: participantId,
                            action: "Ethnicities: '" + list + "'"
                        })
                    }

                    if (otherEthnicity != currentUnlistedEthnicity) {
                        if (!pInfo['original_unlisted_ethnicity'] && currentUnlistedEthnicity) updateValue("/participants/" + participantId, { original_unlisted_ethnicity: currentUnlistedEthnicity });
                        updateValue("/participants/" + participantId, { unlisted_ethnicity: otherEthnicity });
                        LogEvent({
                            pid: participantId,
                            action: "Unlisted ethnicity: '" + otherEthnicity + "'"
                        })
                    }
                }
            }
        })
    }

    return ReactDOM.createPortal((
        <div className="modal-book-update-session-backdrop" onClick={(e) => { if (e.target.className == "modal-book-update-session-backdrop") setUpdateSession("") }}>
            <div className="modal-book-update-session-main-container">
                <div className="modal-book-update-session-header">
                    Update session
                </div>
                <div className="update-session-container">
                    <div>
                        <div className="sub-header">
                            Participant Information
                        </div>
                        <table>
                            <tbody className="participant-table">
                                <tr>
                                    <td className="participant-table-left">{"# " + participantId}</td>
                                    <td className="participant-table-right">{participantInfo['first_name'] + " " + participantInfo['last_name']}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">E-mail</td>
                                    <td className="participant-table-right">
                                        {participantInfo['email']}
                                        <a className="copy-email-link fas fa-copy" onClick={(e) => {
                                            e.preventDefault();
                                            let email = participantInfo['email'];
                                            navigator.clipboard.writeText(email);

                                            Swal.fire({
                                                toast: true,
                                                icon: 'success',
                                                title: 'Copied: ' + email,
                                                animation: false,
                                                position: 'bottom',
                                                width: 'unset',
                                                showConfirmButton: false,
                                                timer: 2000
                                            })
                                        }} target="_blank" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Phone</td>
                                    <td className="participant-table-right">{participantInfo['phone'].replace("T: ", "")}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Country, State</td>
                                    <td className="participant-table-right">{participantInfo['country_of_residence'] + ", " + participantInfo['state_of_residence']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">City</td>
                                    <td className="participant-table-right">{participantInfo['city_of_residence']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Participant comment</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left" colSpan="2">
                                        <textarea
                                            className="ppt-comment"
                                            defaultValue={participantInfo['comment']}
                                            onBlur={(e) => {
                                                updateValue("/participants/" + participantId, { comment: e.currentTarget.value });
                                                LogEvent({
                                                    pid: participantId,
                                                    action: "Participant comment: '" + e.currentTarget.value + "'"
                                                })
                                            }}
                                            placeholder="Comments about the participant..."
                                            onInput={(e) => {
                                                let height = e.currentTarget.offsetHeight;
                                                let newHeight = e.currentTarget.scrollHeight;
                                                if (newHeight > height) {
                                                    e.currentTarget.style.height = 0;
                                                    e.currentTarget.style.height = newHeight + "px";
                                                }
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">&nbsp;</td>
                                    <td className="participant-table-right">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Target of sessions</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            onChange={(e) => {
                                                updateValue("/participants/" + participantId, { multiple_times: e.currentTarget.value });
                                                LogEvent({
                                                    pid: participantId,
                                                    action: "Target: '" + (e.currentTarget.value || "Blank") + "'"
                                                })
                                            }}
                                        >
                                            {Constants['possibleNumberOfSessions'].map((s, i) => (
                                                <option key={"data-vc" + i} value={s} selected={s == participantInfo['multiple_times']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Vision correction</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            disabled={hasCompletedSession}
                                            onChange={(e) => {
                                                updateValue("/participants/" + participantId, { vision_correction: e.currentTarget.value });
                                                updateValue("/timeslots/" + updateSession, { glasses: ['Glasses - distance', 'Glasses - progressive, bifocal or multifocal'].includes(e.currentTarget.value) });
                                                LogEvent({
                                                    pid: participantId,
                                                    action: "Vision correction: '" + e.currentTarget.value + "'"
                                                })
                                            }}
                                        >
                                            {Constants['visionCorrections'].map((s, i) => (
                                                <option key={"data-vc" + i} value={s} selected={s == participantInfo['vision_correction']}>{s.replace("progressive, bifocal or multifocal", "pr/ bf/ mf")}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Documents</td>
                                    <td className="participant-table-right"><a href="" className="signature-link" onClick={(e) => { e.preventDefault(); openDocuments(participantId); }}>Open Documents</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Signatures</td>
                                    <td className="participant-table-right">
                                        <a href={"https://fs30.formsite.com/LB2014/files/" + participantInfo['sla_url']} target="_blank" className="signature-link">Open SLA</a>&nbsp;&nbsp;&nbsp;&nbsp;
                                        <a href={"https://fs30.formsite.com/LB2014/files/" + participantInfo['icf']} target="_blank" className="signature-link">Open ICF</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">&nbsp;</td>
                                    <td className="participant-table-right">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Demo bin</td>
                                    <td className="participant-table-right">{participantInfo['demo_bin']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Date of birth</td>
                                    <td className="participant-table-right">{participantInfo['date_of_birth'].substring(0, 10)}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Gender</td>
                                    <td className="participant-table-right">{participantInfo['gender']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Ethnicity</td>
                                    <td className="participant-table-right">
                                        {participantInfo['ethnicities']}
                                        <a className="copy-email-link fas fa-edit"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (hasCompletedSession) return;
                                                updateEthnicity();
                                            }} target="_blank" />
                                    </td>
                                </tr>
                                {participantInfo['unlisted_ethnicity'] &&
                                    <tr>
                                        <td className="participant-table-left">Unlisted ethnicity</td>
                                        <td className="participant-table-right">{participantInfo['unlisted_ethnicity']}</td>
                                    </tr>
                                }
                                {participantInfo['original_ethnicities'] &&
                                    <tr>
                                        <td className="participant-table-left">Original ethnicity</td>
                                        <td className="participant-table-right">{participantInfo['original_ethnicities']}</td>
                                    </tr>
                                }
                                {participantInfo['original_unlisted_ethnicity'] &&
                                    <tr>
                                        <td className="participant-table-left">Original unlisted ethnicity</td>
                                        <td className="participant-table-right">{participantInfo['original_unlisted_ethnicity']}</td>
                                    </tr>
                                }
                                <tr>
                                    <td className="participant-table-left">Height</td>
                                    <td className="participant-table-right">{participantInfo['height']} inch</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Weight</td>
                                    <td className="participant-table-right">{participantInfo['weight']} lbs</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Monk skin type</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            disabled={hasCompletedSession}
                                            onChange={(e) => updateValue("/participants/" + participantId, { skin_type: parseInt(e.currentTarget.value) })}
                                        >
                                            {Constants['skinTypes'].map((s, i) => (
                                                <option key={"data-skin" + i} value={s} selected={s == participantInfo['skin_type']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Eye color</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            disabled={hasCompletedSession}
                                            onChange={(e) => updateValue("/participants/" + participantId, { eye_color: e.currentTarget.value })}
                                        >
                                            {Constants['eyeColors'].map((s, i) => (
                                                <option key={"data-eye" + i} value={s} selected={s == participantInfo['eye_color']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Facial type</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            disabled={hasCompletedSession}
                                            onChange={(e) => updateValue("/participants/" + participantId, { facial_hair: e.currentTarget.value })}
                                        >
                                            {Constants['facialHairs'].map((s, i) => (
                                                <option key={"data-fch" + i} value={s} selected={s == participantInfo['facial_hair']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Hair color</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            disabled={hasCompletedSession}
                                            onChange={(e) => updateValue("/participants/" + participantId, { hair_color: e.currentTarget.value })}
                                        >
                                            {Constants['hairColors'].map((s, i) => (
                                                <option key={"data-hair-color" + i} value={s} selected={s == participantInfo['hair_color']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Hair length</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            disabled={hasCompletedSession}
                                            onChange={(e) => updateValue("/participants/" + participantId, { hair_length: e.currentTarget.value })}
                                        >
                                            {Constants['hairLengths'].map((s, i) => (
                                                <option key={"data-hair-length" + i} value={s} selected={s == participantInfo['hair_length']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Hair density</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            disabled={hasCompletedSession}
                                            onChange={(e) => updateValue("/participants/" + participantId, { hair_density: e.currentTarget.value })}
                                        >
                                            {Constants['hairDensities'].map((s, i) => (
                                                <option key={"data-hair-density" + i} value={s} selected={s == participantInfo['hair_density']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Hair diameter</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            disabled={hasCompletedSession}
                                            onChange={(e) => updateValue("/participants/" + participantId, { hair_diameter: e.currentTarget.value })}
                                        >
                                            {Constants['hairDiameters'].map((s, i) => (
                                                <option key={"data-hair-diameter" + i} value={s} selected={s == participantInfo['hair_diameter']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Hair type</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            disabled={hasCompletedSession}
                                            onChange={(e) => updateValue("/participants/" + participantId, { hair_type: e.currentTarget.value })}
                                        >
                                            {Constants['hairTypes'].map((s, i) => (
                                                <option key={"data-hair-type" + i} value={s} selected={s == participantInfo['hair_type']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Pregnant</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            disabled={hasCompletedSession}
                                            onChange={(e) => updateValue("/participants/" + participantId, { pregnant: e.currentTarget.value })}
                                        >
                                            {Constants['pregnant'].map((s, i) => (
                                                <option key={"data-pregnant" + i} value={s} selected={s == participantInfo['pregnant']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                {participantInfo['conditions'] != "None of the above" &&
                                    <tr>
                                        <td className="participant-table-left">Health conditions</td>
                                        <td className="participant-table-right">{participantInfo['conditions']}</td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <div className="sub-header">
                            Session Information
                        </div>
                        <table>
                            <tbody>
                                <tr>
                                    <td className="participant-table-left">Time</td>
                                    <td className="participant-table-right">
                                        {updateSession.substring(0, 4) + "-" +
                                            updateSession.substring(4, 6) + "-" +
                                            updateSession.substring(6, 8) + " " +
                                            Constants['bookingDictionary'][updateSession.substring(9, 11) + ":" + updateSession.substring(11, 13)]
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Station</td>
                                    <td className="participant-table-right">{updateSession.substring(14, 20) + (sessionInfo['backup'] ? " (backup session)" : "")}</td>
                                </tr>
                                {/*
                                <tr>
                                    <td className="participant-table-left">Session number</td>
                                    <td className="participant-table-right">{(participantInfo['sessions'] || {})[updateSession]}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Moderator</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            onChange={(e) => updateValue("/timeslots/" + updateSession, { moderator: e.currentTarget.value })}
                                        >
                                            {Constants['listOfModerators'].map((s, i) => (
                                                <option key={"data-moderator" +i} value={s} selected={s == sessionInfo['moderator']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                */}
                                {(['Checked In', 'Completed'].includes(database['timeslots'][updateSession]['status']) &&
                                    database['timeslots'][updateSession]['backup']) &&
                                    <tr>
                                        <td className="participant-table-left">Waiting time</td>
                                        <td className="participant-table-right">
                                            <input id="waitingTime"
                                                type="checkbox"
                                                checked={database['timeslots'][updateSession]['delayed']}
                                                onChange={(e) => {
                                                    updateValue("/timeslots/" + updateSession, { delayed: e.currentTarget.checked });
                                                    LogEvent({
                                                        pid: participantId,
                                                        timeslot: updateSession,
                                                        action: e.currentTarget.checked ? "Delayed (on)" : "Delayed (off)"
                                                    })
                                                }}
                                            /><label htmlFor="waitingTime"> 30 mins+</label>
                                        </td>
                                    </tr>
                                }
                                <tr>
                                    <td className="participant-table-left">Session status</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            onChange={(e) => {
                                                updateValue("/timeslots/" + updateSession, { status: e.currentTarget.value });
                                                LogEvent({
                                                    pid: participantId,
                                                    timeslot: updateSession,
                                                    action: "Session status: '" + (e.currentTarget.value || "Blank") + "'"
                                                })
                                            }}
                                        >
                                            {Constants['sessionStatuses'].map((s, i) => {
                                                if (s === "Comp. for Waiting" && !database['timeslots'][updateSession]['backup']) return;
                                                return <option key={"data-session-status" + i} value={s} selected={s == sessionInfo['status']}>{s}</option>
                                            })}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Participant status</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            onChange={(e) => {
                                                updateValue("/participants/" + participantId, { status: e.currentTarget.value });
                                                LogEvent({
                                                    pid: participantId,
                                                    action: "Participant status: '" + (e.currentTarget.value || "Blank") + "'"
                                                })
                                            }}
                                        >
                                            {Constants['participantStatuses'].map((s, i) => (
                                                <option key={"data-ppt-status_" + i} value={s} selected={s == participantInfo['status']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">External ID</td>
                                    <td className="participant-table-right">
                                        <button className="external-id-button" onClick={() => modifyExternalId()}>{participantInfo['external_id'] || "Missing ID!"}</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Phase</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            onChange={(e) => {
                                                updateValue("/participants/" + participantId, { phase: e.currentTarget.value });
                                                LogEvent({
                                                    pid: participantId,
                                                    action: "Phase: '" + (e.currentTarget.value || "Blank") + "'"
                                                })
                                            }}
                                            disabled={participantInfo['phase_fixed']}
                                        >
                                            {["", "1", "2"].map((s, i) => (
                                                <option key={"data-ppt-phase_" + i} value={s} selected={s == participantInfo['phase']}>{s ? "Phase " + s : ""}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Session comment</td>
                                </tr>
                                <tr className="participant-table-left">
                                    <td colSpan="2">
                                        <textarea
                                            className="session-comment"
                                            defaultValue={sessionInfo['comments']}
                                            onBlur={(e) => {
                                                updateValue("/timeslots/" + updateSession, { comments: e.currentTarget.value });
                                                LogEvent({
                                                    pid: participantId,
                                                    timeslot: updateSession,
                                                    action: "Session comment: '" + e.currentTarget.value + "'"
                                                })
                                            }}
                                            placeholder="Comments about the session..."
                                            onInput={(e) => {
                                                let height = e.currentTarget.offsetHeight;
                                                let newHeight = e.currentTarget.scrollHeight;
                                                if (newHeight > height) {
                                                    e.currentTarget.style.height = 0;
                                                    e.currentTarget.style.height = newHeight + "px";
                                                }
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="cancel-button-row" colSpan="2">
                                        {sessionInfo['status'] == "Scheduled" && <button className="cancel-session-button" onClick={() => cancelSession(updateSession)}>Cancel session</button>}
                                    </td>
                                </tr>
                                {(sessionInfo['bonus'] || participantInfo['bonus_amount']) &&
                                    <tr>
                                        <td className="participant-table-left">Bonus</td>
                                    </tr>
                                }
                                {sessionInfo['bonus'] &&
                                    <tr>
                                        <td className="participant-table-right bonus-container" colspan="2">
                                            {Object.keys(sessionInfo['bonus']).map(bonusId => {
                                                let bonus = sessionInfo['bonus'][bonusId];
                                                let bonusName = Constants['bonuses'][bonusId];
                                                let amount = bonus['p'];

                                                let today = parseInt(format(new Date(), "yyyyMMdd"));
                                                let disabled = parseInt(updateSession.substring(0, 8)) + 3 < today;

                                                return <>
                                                    <input
                                                        id={"bonus-" + bonusId}
                                                        type="checkbox"
                                                        checked={database['timeslots'][updateSession]["bonus"][bonusId]['a']}
                                                        onChange={(e) => {
                                                            updateValue("/timeslots/" + updateSession + "/bonus/" + bonusId, { a: e.currentTarget.checked });
                                                            LogEvent({
                                                                pid: participantId,
                                                                timeslot: updateSession,
                                                                action: (e.currentTarget.checked ? "Adding bonus: '" : "Removing bonus: '") + bonusName + "($ " + amount + ")" + "'"
                                                            })
                                                        }}
                                                        disabled={disabled}
                                                    /> <label htmlFor={"bonus-" + bonusId}>{bonusName} ($ {amount})</label><br />
                                                </>
                                            })}
                                        </td>
                                    </tr>
                                }
                                {participantInfo['bonus_amount'] &&
                                    <tr>
                                        <td className="participant-table-right bonus-container" colspan="2">
                                            <input type="checkbox" checked={['Scheduled', 'Checked In', 'Completed'].includes(database['timeslots'][updateSession]['status'])} disabled />
                                            <label> Extra bonus ($ {participantInfo['bonus_amount']}) <i>Offered during the handoff</i></label>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    ), document.body);
}

export default UpdateSession;