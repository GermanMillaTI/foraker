import React, { useState, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import ReactDOM from 'react-dom';
import { auth, realtimeDb } from '../firebase/config';
import Swal from 'sweetalert2';
import format from 'date-fns/format';

import './UpdateSession.css';
import Constants from './Constants';
import LogEvent from './Core/LogEvent';
import FormattingFunctions from './Core/FormattingFunctions';

function UpdateSession({ database, updateSession, setUpdateSession, setActivityLog, setIdForLog }) {
    const sessionInfo = database['timeslots'][updateSession];
    const participantId = sessionInfo['participant_id'];
    const participantInfo = database['participants'][participantId];

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
                    confirmed: "",
                    booked_today: false,
                    remind: false,
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
                    });
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

    useEffect(() => {
        const handleEsc = (event) => { if (event.keyCode === 27) setUpdateSession(""); };
        window.addEventListener('keydown', handleEsc);
        return () => { window.removeEventListener('keydown', handleEsc) };
    }, []);

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
                                    <td className="participant-table-right">{participantInfo['full_name']}
                                        <a
                                            className="copy-email-link fas fa-file-export"
                                            title="Open log"
                                            onClick={() => {
                                                setActivityLog(true);
                                                setIdForLog(participantId);
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">E-mail</td>
                                    <td className="participant-table-right">
                                        {participantInfo['email']}
                                        <a className="copy-email-link fas fa-copy"
                                            title="Copy email"
                                            onClick={(e) => {
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
                                    <td className="participant-table-right">
                                        {participantInfo['phone'].replace("T: ", "")}
                                        <a className="copy-email-link fas fa-copy"
                                            title="Copy phone"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                let phone = participantInfo['phone'].replace("T: ", "");
                                                navigator.clipboard.writeText(phone);

                                                Swal.fire({
                                                    toast: true,
                                                    icon: 'success',
                                                    title: 'Copied: ' + phone,
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
                                    <td className="participant-table-left">Country of residence</td>
                                    <td className="participant-table-right">{participantInfo['country_of_residence']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">State, City</td>
                                    <td className="participant-table-right">{participantInfo['state_of_residence'] + ", " + participantInfo['city_of_residence']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Address</td>
                                    <td className="participant-table-right">{participantInfo['street']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Signatures</td>
                                    <td className="participant-table-right">
                                        <a href={"https://fs30.formsite.com/LB2014/files/" + participantInfo['sla_url']} target="_blank" className="signature-link">Open SLA</a>

                                        <span> &nbsp;/&nbsp; </span>

                                        {participantInfo['icf'] ?
                                            <a href={"https://fs30.formsite.com/LB2014/files/" + participantInfo['icf']} target="_blank" className="signature-link">Open ICF</a>
                                            : <>
                                                <span className="missing-icf">Missing ICF!</span>
                                                <a
                                                    href={"https://fs30.formsite.com/LB2014/qdpfkbii6j/fill?id377=" + participantId +
                                                        "&id335=" + participantInfo['email'] +
                                                        "&id372=" + participantInfo['first_name'] +
                                                        "&id373=" + participantInfo['last_name']}
                                                    className="copy-email-link fas fa-file-export"
                                                    title="Open ICF URL"
                                                    target="_blank" />
                                            </>
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Age range / Gender</td>
                                    <td className="participant-table-right">{participantInfo['age_range'] + " / " + participantInfo['gender']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Year / country (birth)</td>
                                    <td className="participant-table-right">
                                        {participantInfo['year_of_birth'] + " / " + participantInfo['country_of_birth']}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Demo bin</td>
                                    <td className="participant-table-right">{sessionInfo['demo_bin']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Handiness</td>
                                    <td className="participant-table-right">{participantInfo['hand']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Tattoo</td>
                                    <td className="participant-table-right">{participantInfo['tattoo']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">&nbsp;</td>
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
                                                const newComment = e.currentTarget.value;
                                                if (newComment != participantInfo['comment']) {
                                                    updateValue("/participants/" + participantId, { comment: newComment });
                                                    LogEvent({
                                                        pid: participantId,
                                                        action: "Participant comment: '" + newComment + "'"
                                                    })
                                                }
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
                                        {FormattingFunctions.TimeSlotFormat(updateSession)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Station</td>
                                    <td className="participant-table-right">{updateSession.substring(14) + (sessionInfo['backup'] ? " (backup session)" : "")}</td>
                                </tr>

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
                                                if (e.currentTarget.value == "Duplicate" && participantInfo['not_duplicate']) {
                                                    updateValue("/participants/" + participantId, { not_duplicate: false });
                                                    LogEvent({
                                                        pid: participantId,
                                                        action: "Not duplicate: 'No'"
                                                    })
                                                }
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
                                    <td className="participant-table-left">Session comment</td>
                                </tr>

                                <tr className="participant-table-left">
                                    <td colSpan="2">
                                        <textarea
                                            className="session-comment"
                                            defaultValue={sessionInfo['comments']}
                                            onBlur={(e) => {
                                                const newComment = e.currentTarget.value;
                                                if (newComment != sessionInfo['comments']) {
                                                    updateValue("/timeslots/" + updateSession, { comments: newComment });
                                                    LogEvent({
                                                        pid: participantId,
                                                        timeslot: updateSession,
                                                        action: "Session comment: '" + newComment + "'"
                                                    })
                                                }
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
                                        <button className="cancel-session-button" onClick={() => cancelSession(updateSession)}>Cancel session</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    ), document.body);
}

export default UpdateSession;