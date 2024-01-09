import { auth, realtimeDb } from '../firebase/config';
import React from 'react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import md5 from 'md5';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { renderToString } from 'react-dom/server';

import './ParticipantCard.css';
import Constants from './Constants';
import LogEvent from './Core/LogEvent';
import ActivityLog from './ActivityLog';
import FormattingFunctions from './Core/FormattingFunctions';

function ParticipantCard({ database, role, participantId, index, setShowBookSession2, setUpdateSession, setActivityLog, activityLog, idforLog, setIdForLog, setTimeslotforLog, timeslotforLog }) {
    const [tempParticipants, setTempParticipants] = useState([]);

    let participantInfo = database['participants'][participantId];
    let timeslotsOfParticipant = Object.assign({}, Object.keys(participantInfo['sessions'] || {}).map(timeslotId => database['timeslots'][timeslotId]));
    let nrOfTimeslotsOfParticipant = Object.keys(timeslotsOfParticipant).length;

    // Update value in DB
    function updateValue(path, newValue) {
        realtimeDb.ref(path).update(newValue);
    }

    function sendMail(pid, kind) {
        const participant = database['participants'][pid];

        // Define HTML of popup
        let html = '<b>' + kind + '</b><br/>';

        Swal.fire({
            title: "Are you sure?",
            showCancelButton: true,
            confirmButtonText: 'Yes, send ' + kind,
            html: html
        }).then((result) => {
            if (result.isConfirmed) {

                const scriptURL = 'https://script.google.com/macros/s/AKfycbxluZsxLy2fK3iN4nzQ2K7OWO2bH_ATXmmJmHJDAShTfIKvcAQ_dFCBp5qB4q7To_D2bQ/exec';
                fetch(scriptURL, {
                    method: 'POST',
                    muteHttpExceptions: true,
                    body: JSON.stringify({
                        "pid": pid,
                        "email_kind": kind,
                        "first_name": participantInfo['first_name'],
                        "last_name": participantInfo['last_name'],
                        "email": participantInfo['email']
                    })
                }).then(res => {
                    // Update the status to 'Contacted' if empty
                    let currentStatus = participantInfo['status'];
                    if ((!currentStatus || currentStatus == "") && kind == 'Handoff') {
                        updateValue("/participants/" + pid.toString(), { status: "Contacted" });
                    }
                    LogEvent({
                        pid: participantId,
                        action: "Email: '" + kind + "'"
                    })
                });
            }
        })
    }

    return (
        <div className={"participant-card "}>
            <div className={"participant-card-column" + " column-1"}>

                <div className="participant-attribute-container">
                    <span className="field-label"># {participantId} </span>
                    <span>{participantInfo['full_name']}
                        <a
                            className="copy-email-link fas fa-file-export"
                            title="Open log"
                            onClick={() => {
                                setActivityLog(true);
                                setIdForLog(participantId)
                                setTimeslotforLog("");
                            }}
                        />
                        {activityLog && ['admin'].includes(role) &&
                            <ActivityLog
                                database={database}
                                participantId={idforLog}
                                setActivityLog={setActivityLog}
                            />
                        }
                        {participantInfo['highlighted'] && <Tooltip
                            disableInteractive
                            TransitionProps={{ timeout: 100 }}
                            componentsProps={{ tooltip: { sx: { width: '30em', fontSize: '1.2em' }, } }}
                            title={
                                participantInfo['highlight_reason'] &&
                                participantInfo['highlight_reason'].map(reason => {
                                    return <><span>- {reason}</span><br /></>
                                })
                            }
                        >
                            <span className="highlighted-participant-button fas fa-exclamation-circle" />
                        </Tooltip>}
                    </span>
                </div>
                <div className="participant-attribute-container">
                    <span className="field-label">E-mail</span>
                    <span className={participantInfo['email_counter'] > 1 ? "highlighted-span" : ""}>
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
                                    position: 'bottom',
                                    width: 'unset',
                                    showConfirmButton: false,
                                    timer: 2000
                                })
                            }} target="_blank" />
                    </span>
                </div>
                <div className="participant-attribute-container">
                    <span className="field-label">Phone</span><span className={participantInfo['phone_counter'] > 1 ? "highlighted-span" : ""}>
                        {participantInfo['phone'].replaceAll('T: ', '')}
                        <a className="copy-email-link fas fa-copy"
                            title="Copy phone number"
                            onClick={(e) => {
                                e.preventDefault();
                                let phone = participantInfo['phone'].replace("T: ", "");
                                navigator.clipboard.writeText(phone);

                                Swal.fire({
                                    toast: true,
                                    icon: 'success',
                                    title: 'Copied: ' + phone,
                                    position: 'bottom',
                                    width: 'unset',
                                    showConfirmButton: false,
                                    timer: 2000
                                })
                            }} target="_blank" />
                    </span>
                </div>

                <div className="participant-attribute-container">
                    <span className="field-label">Country of residence</span><span>{participantInfo['country_of_residence']}</span>
                </div>

                <div className="participant-attribute-container">
                    <span className="field-label">State, City</span><span>{participantInfo['state_of_residence'] + ", " + participantInfo['city_of_residence']}</span>
                </div>


                <div className="participant-attribute-container">
                    <span className="field-label">Date of Birth</span><span>{participantInfo['date_of_birth'].substring(0, 10)}
                    </span>
                </div>

                <div className="participant-attribute-container">
                    <span className="field-label">Age range / Gender</span><span>{participantInfo['age_range'] + " / " + participantInfo['gender']}</span>
                </div>

                <div className="participant-attribute-container">
                    <span className="field-label">Industry</span>
                    <span>{participantInfo['industry']}</span>
                </div>

                {participantInfo['vlog'] && <div className="participant-attribute-container">
                    <span className="field-label">Vlog</span>
                    <span><a href={participantInfo['vlog']} target="_blank" className="vlog-link">Open vlog link</a></span>
                </div>}

                <div className="participant-attribute-container">
                    <span className="field-label">Reg. date</span><span>{participantInfo['date'].substring(0, 16).replaceAll("T", " ")}</span>
                </div>

                <div className="participant-attribute-container">
                    <span className="field-label">Signatures</span>

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
                </div>

                {participantInfo['other_companies'] &&
                    <div className="participant-attribute-container">
                        <span className="field-label">Other companies</span><span>{participantInfo['other_companies']}</span>
                    </div>
                }
            </div>

            <div className={"participant-card-column" + " column-3"}>
                <div className="participant-attribute-container">
                    <span className="field-label">Participant status</span>

                    <select className="participant-data-selector min-width-selector"
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
                        }}>
                        {Constants['participantStatuses'].map((s, i) => (
                            <option key={"status" + i} value={s} selected={s == participantInfo['status']}>{s}</option>
                        ))}
                    </select>
                </div>

                {participantInfo['old_ppt'].length > 0 &&
                    <div className="participant-attribute-container">
                        <span className="old-penelope-participant">
                            {"Penelope <6 participant"}
                            {participantInfo['old_ppt'].includes('name') && participantInfo['old_ppt'].includes('email') &&
                                <span> (Name, email)</span>}
                            {participantInfo['old_ppt'].includes('name') && !participantInfo['old_ppt'].includes('email') &&
                                <span> (Name)</span>}
                            {!participantInfo['old_ppt'].includes('name') && participantInfo['old_ppt'].includes('email') &&
                                <span> (Email)</span>}
                        </span>
                    </div>
                }

                {((participantInfo['email_counter'] > 1 || participantInfo['phone_counter'] > 1) && participantInfo['status'] != "Duplicate") && <div className="participant-attribute-container">
                    <span className="field-label">Not duplicate</span>

                    <input
                        type="checkbox"
                        checked={participantInfo['not_duplicate']}
                        onChange={(e) => {
                            updateValue("/participants/" + participantId, { not_duplicate: e.currentTarget.checked });
                            LogEvent({
                                pid: participantId,
                                action: "Not duplicate: '" + (e.currentTarget.checked ? "Yes" : "No") + "'"
                            })
                        }}
                    />
                </div>}

                <div className="participant-attribute-container">
                    <span className="field-label">Demo bin</span>
                    <span>{participantInfo['demo_bin']} {participantInfo['open_demo_bin'] ? " (open)" : "(closed)"}</span>
                </div>


                {!["Rejected", "Withdrawn", "Completed", "Not Selected", "Duplicate"].includes(participantInfo['status']) &&
                    <div className="participant-attribute-container">
                        <span className="field-label">Communication</span>
                        {(participantInfo['open_demo_bin'] === true || tempParticipants.includes(participantId)) ?
                            <>
                                <button className="email-button handoff-button" onClick={() => sendMail(participantId, "Handoff")}>Send handoff email</button>
                                <a className="copy-booking-link fas fa-copy" onClick={(e) => {
                                    e.preventDefault();

                                    let url = "https://odyssey-9248a.web.app/#" + md5('p_' + participantId) + "&" + participantId
                                    navigator.clipboard.writeText(url);

                                    Swal.fire({
                                        toast: true,
                                        icon: 'success',
                                        title: 'Copied',
                                        html: url,
                                        position: 'bottom',
                                        width: 'unset',
                                        showConfirmButton: false,
                                        timer: 2000
                                    })
                                }} target="_blank" />
                            </>
                            : <span><b>Closed demo bin!</b>
                                {participantInfo['status'] == "Contacted" && <label className="copy-email-link fas fa-eye" onClick={() => setTempParticipants([participantId, ...tempParticipants])}></label>}
                            </span>
                        }
                    </div>
                }
                <div className="participant-attribute-container">
                    <textarea className="participant-comment" defaultValue={participantInfo['comment']}
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
                        placeholder="Comments..."
                        onInput={(e) => {
                            let height = e.currentTarget.offsetHeight;
                            let newHeight = e.currentTarget.scrollHeight;
                            if (newHeight > height) {
                                e.currentTarget.style.height = 0;
                                e.currentTarget.style.height = newHeight + "px";
                            }
                        }}
                    />
                </div>

            </div>

            <div className={"participant-card-column" + " column-4"}>
                <span className="participant-attribute-header">Sessions {participantInfo['external_id'] ? " (" + participantInfo['external_id'] + ")" : ""}</span>
                {Object.keys(participantInfo['sessions'] || {}).map(timeslotId => {
                    const session = database['timeslots'][timeslotId];
                    const station = parseInt(timeslotId.substring(14)) > 100 ? 'Backup' : timeslotId.substring(14);
                    return (
                        <button
                            key={"session" + timeslotId}
                            className="session-button"
                            onClick={
                                () => {
                                    setUpdateSession(timeslotId);
                                    setTimeslotforLog(timeslotId);
                                }
                            }
                        >
                            {FormattingFunctions.TimeSlotFormat(timeslotId) + " (" + station + ")" + ": " + session['status']}
                        </button>
                    )
                })}

                {
                    !["Rejected", "Withdrawn", "Completed", "Not Selected", "Duplicate"].includes(participantInfo['status']) &&
                    <button className="book-session-button" onClick={() => setShowBookSession2(participantId)}>Schedule session</button>
                }
            </div>


            {
                participantInfo['history'] &&
                <div className={"participant-card-column" + " column-5"}>
                    <span className="participant-attribute-header">Email history</span>
                    {participantInfo['history'] && Object.keys(participantInfo['history']).map((t) => {
                        let emailTitle = participantInfo['history'][t]['title'];
                        let appointmentTime = "";
                        if (emailTitle.startsWith('Handoff')) {
                            emailTitle = emailTitle.replace("(", "($ ");
                        }
                        else if (emailTitle.startsWith('Confirmation') && emailTitle.length > 15) {
                            appointmentTime = emailTitle.substring(13, 17) + "-" +
                                emailTitle.substring(17, 19) + "-" +
                                emailTitle.substring(19, 21) + " " +
                                FormattingFunctions.FormatTime(emailTitle.substring(22, 24) + ":" + emailTitle.substring(24, 26)) +
                                " (" + (parseInt(emailTitle.substring(27)) > 100 ? 'Backup' : emailTitle.substring(27)) + ")";
                            emailTitle = 'Confirmation';
                        } else if (emailTitle.startsWith('Reminder') && emailTitle.length > 15) {
                            appointmentTime = emailTitle.substring(9, 13) + "-" +
                                emailTitle.substring(13, 15) + "-" +
                                emailTitle.substring(15, 17) + " " +
                                FormattingFunctions.FormatTime(emailTitle.substring(18, 20) + ":" + emailTitle.substring(20, 22)) +
                                " (" + (parseInt(emailTitle.substring(23)) > 100 ? 'Backup' : emailTitle.substring(23)) + ")";
                            emailTitle = 'Reminder';
                        }
                        return <div key={participantId + t} className="participant-attribute-container">
                            <span className="field-label">{t.substring(0, 16).replaceAll('_', ' ')}</span>
                            <span className="email-history-content">
                                <span>{emailTitle}</span>
                                {appointmentTime && <span>{appointmentTime}</span>}
                            </span>
                        </div>
                    })}

                </div>
            }

        </div >
    );
}

export default ParticipantCard;