import { auth, realtimeDb } from '../firebase/config';
import React from 'react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import md5 from 'md5';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import './ParticipantCard.css';
import Constants from './Constants';
import LogEvent from './Core/LogEvent';

import ActivityLog from './ActivityLog';


function ParticipantCard({ database, participantId, index, setShowBookSession2, setCheckDocuments, setUpdateSession, setActivityLog, activityLog, idforLog, setIdForLog, setTimeslotforLog, timeslotforLog }) {
    const [tempParticipants, setTempParticipants] = useState([]);

    let participantInfo = database['participants'][participantId];
    let timeslotsOfParticipant = Object.assign({}, Object.keys(participantInfo['sessions'] || {}).map(timeslotId => database['timeslots'][timeslotId]));
    let nrOfTimeslotsOfParticipant = Object.keys(timeslotsOfParticipant).length;

    // Update value in DB
    function updateValue(path, newValue) {
        realtimeDb.ref(path).update(newValue);
    }

    function openDocuments(participantId) {
        realtimeDb.ref("/participants/" + participantId + "/documents/pending").remove();
        setCheckDocuments(participantId);
    }

    function sendMail(pid, kind) {

        let bonus = database['participants'][pid]['currently_offered_bonus'];

        // Define HTML of popup
        let html = '<b>' + kind + '</b><br/>';
        if (kind == "Document Request") {
            html = '<div style="text-align: left"><input id="documentRequestId" type="checkbox"/> <b>Request ID Document</b><br/>' +
                '<input id="documentRequestVisionCorrection" type="checkbox" /> <b>Request Vision Correction Document</b></div>';
        }

        Swal.fire({
            title: "Are you sure?",
            showCancelButton: true,
            confirmButtonText: 'Yes, send ' + kind,
            html: html
        }).then((result) => {
            if (result.isConfirmed) {
                let documentRequestMarker = "";
                if (kind == "Document Request") {
                    let documentRequestId = document.getElementById('documentRequestId').checked;
                    let documentRequestVisionCorrection = document.getElementById('documentRequestVisionCorrection').checked;
                    if (!documentRequestId && !documentRequestVisionCorrection) return;

                    if (documentRequestId && documentRequestVisionCorrection) {
                        documentRequestMarker = 0;
                    } else if (documentRequestId) {
                        documentRequestMarker = 1;
                    } else if (documentRequestVisionCorrection) {
                        documentRequestMarker = 2;
                    }
                }

                const scriptURL = 'https://script.google.com/macros/s/AKfycbyZ7PUpLz7hTMAiQqw6dTHpGfqqvV5SNABubnLBYb2phZnd2qS_I_fFrgbU9txyv1oxQg/exec';
                fetch(scriptURL, {
                    method: 'POST',
                    muteHttpExceptions: true,
                    body: JSON.stringify({
                        "pid": pid,
                        "email_kind": (kind == "Handoff" && bonus > 0) ? "Handoff and Bonus" : kind,
                        "first_name": participantInfo['first_name'],
                        "last_name": participantInfo['last_name'],
                        "email": participantInfo['email'],
                        "document_request": documentRequestMarker,
                        "registration_type": kind == "ICF Reminder" ?
                            (participantInfo['registered_as'] == "participant" ? "I am registering as a participant over the age of 18" : "I am a parent or guardian registering a child under 18")
                            : "",
                        "date_of_birth": kind == "ICF Reminder" ? "dob: " + participantInfo['date_of_birth'].substring(0, 10) : "",
                        "bonus": bonus > 0 ? bonus : ""
                    })
                }).then(res => {
                    // Update the status to 'Contacted' if empty or document requested
                    let currentStatus = participantInfo['status'];
                    if ((!currentStatus || currentStatus == "" || currentStatus == "Document Requested") && kind == 'Handoff') {
                        updateValue("/participants/" + pid.toString(), { status: "Contacted" });

                        // Update the status to document requested if empty
                    } else if ((!currentStatus || currentStatus == "") && kind == "Document Request") {
                        updateValue("/participants/" + pid.toString(), { status: "Document Requested" });
                    }

                    LogEvent({
                        pid: participantId,
                        action: "Email: '" + kind + "'"
                    })
                    //Swal.fire('Success!', '', 'success');
                });
            }
        })
    }

    function updateGoodworkComment(e) {
        e.preventDefault();
        let participantInfo = database['participants'][participantId];
        let goodworkComment = participantInfo['goodwork_comment_internal'] || "";

        Swal.fire({
            title: 'Goodwork comment (' + participantId + ")",
            html: '<textarea id="goodworkCommentInput" style="width: 20em; height: 10em; padding: .2em; font-size: 1em;">' + goodworkComment + '</textarea>',
            showCancelButton: true,
            confirmButtonText: 'Save',
            allowEnterKey: true,
            didOpen: () => {
                let textarea = document.getElementById('goodworkCommentInput');
                textarea.focus();
                textarea.select();
            }
        }).then((result) => {
            if (result.isConfirmed) {
                let newValue = document.getElementById("goodworkCommentInput").value;
                let path = "/participants/" + participantId;
                let data = {
                    goodwork_comment_internal: newValue
                };
                updateValue(path, data);
                /*LogEvent({
                    pid: participantId,
                    action: "Goodwork comment: '" + newValue + "'"
                })*/
            }
        }
        )
    }



    return (
        <div className={"participant-card " + (index % 2 == 0 ? "row1" : "row2")}>
            <div className="participant-card-column column-1">
                {participantInfo['registered_as'] == 'parent' &&
                    <span className="registered-by-parent">Registered by parent or guardian</span>
                }
                <div className="participant-attribute-container">
                    <span className="field-label"># {participantId}</span>
                    <span>{participantInfo['first_name'] + " " + participantInfo['last_name']}
                        <a
                            className="copy-email-link fas fa-file-export"
                            title="Open log"
                            onClick={() => {
                                setActivityLog(true);
                                setIdForLog(participantId)
                                setTimeslotforLog("");
                            }}
                        />
                        {activityLog && Constants.superAdmins.includes(auth.currentUser.email) &&
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

                        <a className="copy-email-link fas fa-search"
                            title="Google"
                            target="_blank"
                            href={("https://www.google.com/search?q=" + participantInfo['first_name'] + " " + participantInfo['last_name'] + " Los Angeles").replaceAll(" ", "%20")}
                        />
                    </span>
                </div>
                {participantInfo['registered_as'] != 'parent' &&
                    <>
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
                    </>
                }
                <div className={"participant-attribute-container" + (participantInfo['ethnicities'].includes(',') ? " multiple-ethnicities" : "")}>
                    <span className="field-label">Ethnicity</span><span>{participantInfo['ethnicities']}</span>
                </div>
                {participantInfo['unlisted_ethnicity'] &&
                    <div className="participant-attribute-container">
                        <span className="field-label">Unlisted ethnicity</span><span>{participantInfo['unlisted_ethnicity']}</span>
                    </div>
                }
                <div className="participant-attribute-container">
                    <span className="field-label">Age range / Gender</span><span>{participantInfo['age_range'] + " / " + participantInfo['gender']}</span>
                </div>
                <div className="participant-attribute-container">
                    <span className="field-label">Date of birth</span><span>{participantInfo['date_of_birth'].substring(0, 10)}</span>
                </div>
                <div className="participant-attribute-container">
                    <span className="field-label">Country, State</span><span>{participantInfo['country_of_residence'] + ", " + participantInfo['state_of_residence']}</span>
                </div>

                <div className="participant-attribute-container">
                    <span className="field-label">City</span><span>{participantInfo['city_of_residence']}</span>
                </div>

                <div className="participant-attribute-container">
                    <span className="field-label">Registration source</span>
                    <span>{Constants['sources'][(participantInfo['source'] || 'Other')]}</span>
                    {participantInfo['source'] == "goodwork" &&
                        <Tooltip
                            disableInteractive
                            TransitionProps={{ timeout: 100 }}
                            componentsProps={{ tooltip: { sx: { width: '30em', minHeight: '3em', fontSize: '1.2em' }, } }}
                            title={
                                <span>{participantInfo['goodwork_comment_internal'] || ""}</span>
                            }
                        >
                            <a className="copy-email-link fas fa-comment-dots" onClick={(e) => updateGoodworkComment(e)} target="_blank" />
                        </Tooltip>
                    }
                </div>

                <div className="participant-attribute-container">
                    <span className="field-label">Date of registration</span><span>{participantInfo['date'].substring(0, 16).replaceAll("T", " ")}</span>
                </div>

                <div className="participant-attribute-container">
                    <span className="field-label">Signatures</span>
                    <a href={"https://fs30.formsite.com/LB2014/files/" + participantInfo['sla_url']} target="_blank" className="signature-link">Open SLA</a>
                    <span> &nbsp;/&nbsp; </span>
                    {participantInfo['icf'] ?
                        <a href={"https://fs30.formsite.com/LB2014/files/" + participantInfo['icf']} target="_blank" className="signature-link">Open ICF</a>
                        : <span className="missing-icf">Missing ICF!</span>
                    }
                </div>


                {participantInfo['other_companies'] &&
                    <div className="participant-attribute-container">
                        <span className="field-label">Other companies</span><span>{participantInfo['other_companies']}</span>
                    </div>
                }

                {participantInfo['conditions'] && participantInfo['conditions'] != "None of the above" &&
                    <div className="participant-attribute-container">
                        <span className="field-label">Health information</span><span>{participantInfo['conditions']}</span>
                    </div>
                }

                {participantInfo['pregnant'] == "Yes" &&
                    <div className="participant-attribute-container">
                        <span className="field-label">Pregnant</span><span>{participantInfo['pregnant']}</span>
                    </div>
                }

                {participantInfo['registered_as'] == 'parent' &&
                    <>
                        <hr />
                        <div className="participant-attribute-container">
                            <span className="field-label">Parent Name</span>
                            <span>
                                {participantInfo['parent_first_name'] + " " + participantInfo['parent_last_name']}
                                <a className="copy-email-link fas fa-search"
                                    title="Google"
                                    target="_blank"
                                    href={("https://www.google.com/search?q=" + participantInfo['parent_first_name'] + " " + participantInfo['parent_last_name'] + " Los Angeles").replaceAll(" ", "%20")}
                                />
                            </span>
                        </div>
                        <div className="participant-attribute-container">
                            <span className="field-label">Parent E-mail</span>
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
                            <span className="field-label">Parent Phone</span>
                            <span className={participantInfo['phone_counter'] > 1 ? "highlighted-span" : ""}>
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

                            <span className="field-label">Parent signatures</span>
                            <a href={"https://fs30.formsite.com/LB2014/files/" + participantInfo['parent_sla_url']} target="_blank" className="signature-link">Open SLA</a>
                            <span> &nbsp;/&nbsp; </span>
                            {participantInfo['icf'] ?
                                <a href={"https://fs30.formsite.com/LB2014/files/" + participantInfo['parent_icf']} target="_blank" className="signature-link">Open ICF</a>
                                : <span className="missing-icf">Missing ICF!</span>
                            }
                        </div>
                    </>
                }
            </div>

            <div className="participant-card-column column-3">
                <div className="participant-attribute-container">
                    <span className="field-label">Documents</span>

                    <select className="participant-data-selector"
                        disabled={nrOfTimeslotsOfParticipant > 0}
                        onChange={(e) => {
                            updateValue("/participants/" + participantId, { document_approval: e.currentTarget.value });
                            LogEvent({
                                pid: participantId,
                                action: "Document approval: '" + (e.currentTarget.value || "Blank") + "'"
                            })
                        }}
                    >
                        {Constants['documentStatuses'].map((s, i) => (
                            <option key={"documents" + i} value={s} selected={s == participantInfo['document_approval']}>{s}</option>
                        ))}
                    </select>

                    <button
                        className={"doc-button" + (participantInfo['documents']['pending'] ? " pending-doc" : "")}
                        onClick={() => openDocuments(participantId)}
                    >
                        Open
                        ({Object.values(participantInfo['documents']).map(upload => (upload['document1'] ? 1 : 0) + ((upload['document2'] ? 1 : 0))).reduce((partialSum, a) => partialSum + a, 0)})
                    </button>

                    <a className="mark-unchecked fas fa-bookmark" onClick={(e) => {
                        e.preventDefault();
                        realtimeDb.ref("/participants/" + participantId + "/documents").update({ pending: true });
                    }} target="_blank" />
                </div>

                <div className="participant-attribute-container">
                    <span className="field-label">Vision correction</span>

                    <select className="participant-data-selector min-width-selector"
                        disabled={Object.keys(timeslotsOfParticipant).filter(timeslotId => timeslotsOfParticipant[timeslotId]['status'] == "Completed").length > 0}
                        onChange={(e) => {
                            updateValue("/participants/" + participantId, { vision_correction: e.currentTarget.value });
                            LogEvent({
                                pid: participantId,
                                action: "Vision correction: '" + e.currentTarget.value + "'"
                            })
                        }}
                    >
                        {Constants['visionCorrections'].map((s, i) => (
                            <option key={"vc" + i} value={s} selected={s == participantInfo['vision_correction']}>{s.replace("progressive, bifocal or multifocal", "pr/ bf/ mf")}</option>
                        ))}
                    </select>
                </div>

                <div className="participant-attribute-container">
                    <span className="field-label">Target of sessions</span>

                    <select className="participant-data-selector min-width-selector"
                        onChange={(e) => {
                            updateValue("/participants/" + participantId, { multiple_times: parseInt(e.currentTarget.value) });
                            LogEvent({
                                pid: participantId,
                                action: "Target: '" + e.currentTarget.value + "'"
                            })
                        }}
                    >
                        {Constants['possibleNumberOfSessions'].map((s, i) => (
                            <option key={"target" + i} value={s} selected={s == participantInfo['multiple_times']}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="participant-attribute-container">
                    <span className="field-label">Participant status</span>

                    <select className="participant-data-selector min-width-selector"
                        onChange={(e) => {
                            updateValue("/participants/" + participantId, { status: e.currentTarget.value });
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

                <div className="participant-attribute-container">
                    <span className="field-label">Phase</span>
                    <select className="session-data-selector"
                        onChange={(e) => {
                            updateValue("/participants/" + participantId, { phase: e.currentTarget.value });

                            //update target of sessions to be 1 in case "Phase 2" gets selected
                            if (e.currentTarget.value.toString() === "2") {
                                updateValue("participants/" + participantId, { multiple_times: 1 })
                            }

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
                </div>

                <div className="participant-attribute-container">
                    <span className="field-label">Demo bin</span>
                    <span>{participantInfo['demo_bin']} {participantInfo['open_demo_bin'] ? " (open)" : "(closed)"}</span>
                </div>

                {!participantInfo['icf'] &&
                    !["Rejected", "Withdrawn", "Not Selected"].includes(participantInfo['status']) &&
                    <div className="participant-attribute-container">
                        <span className="field-label">Communication</span>
                        {(participantInfo['open_demo_bin'] === true || tempParticipants.includes(participantId)) ?
                            <button className="email-button icf-reminder-button" onClick={() => sendMail(participantId, "ICF Reminder", "")}>ICF Reminder</button>
                            : <span><b>Closed demo bin!</b>
                                {participantInfo['status'] == "Contacted" && <label className="copy-email-link fas fa-eye" onClick={() => setTempParticipants([participantId, ...tempParticipants])}></label>}
                            </span>
                        }
                    </div>
                }

                {participantInfo['icf'] &&
                    participantInfo['document_approval'] != "Pass" &&
                    !["Contacted", "Rejected", "Withdrawn", "Completed", "Not Selected"].includes(participantInfo['status']) &&
                    <div className="participant-attribute-container">
                        <span className="field-label">Communication</span>
                        {(participantInfo['open_demo_bin'] === true || tempParticipants.includes(participantId)) ?
                            <button className="email-button document-request-button" onClick={() => sendMail(participantId, "Document Request", "")}>Document Request</button>
                            : <span><b>Closed demo bin!</b>
                                {participantInfo['status'] == "Contacted" && <label className="copy-email-link fas fa-eye" onClick={() => setTempParticipants([participantId, ...tempParticipants])}></label>}
                            </span>
                        }
                    </div>
                }

                {participantInfo['icf'] &&
                    participantInfo['document_approval'] == "Pass" &&
                    !["Rejected", "Withdrawn", "Completed", "Not Selected"].includes(participantInfo['status']) &&
                    <div className="participant-attribute-container">
                        <span className="field-label">Communication</span>
                        {(participantInfo['open_demo_bin'] === true || tempParticipants.includes(participantId)) ?
                            <>
                                <button className="email-button handoff-button" onClick={() => sendMail(participantId, "Handoff")}>Send handoff email</button>
                                <a className="copy-booking-link fas fa-copy" onClick={(e) => {
                                    e.preventDefault();
                                    let url = "https://denali-appointments.web.app/#" + participantId + "&" + md5('p_' + participantId)
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
                            updateValue("/participants/" + participantId, { comment: e.currentTarget.value });
                            LogEvent({
                                pid: participantId,
                                action: "Participant comment: '" + e.currentTarget.value + "'"
                            })
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

            {((participantInfo['icf'] &&
                participantInfo['document_approval'] == "Pass" &&
                !["Rejected", "Withdrawn", "Completed", "Not Selected"].includes(participantInfo['status'])) ||
                nrOfTimeslotsOfParticipant > 0) &&
                <div className="participant-card-column column-4">
                    <span className="participant-attribute-header">Sessions {participantInfo['external_id'] ? " (" + participantInfo['external_id'] + ")" : ""}</span>
                    {Object.keys(participantInfo['sessions'] || {}).map(timeslotId => {
                        let session = database['timeslots'][timeslotId];
                        let sessionString = timeslotId.substring(0, 4) + "-" +
                            timeslotId.substring(4, 6) + "-" +
                            timeslotId.substring(6, 8) + " " +
                            Constants['bookingDictionary'][timeslotId.substring(9, 11) + ":" + timeslotId.substring(11, 13)] +
                            " (" + timeslotId.substring(14) + ")";
                        return (
                            <button
                                key={"session" + timeslotId}
                                className={"session-button" + (sessionString.includes('Full') ? " full-session" : " lite-session")}
                                onClick={
                                    () => {
                                        setUpdateSession(timeslotId);
                                        setTimeslotforLog(timeslotId);
                                    }
                                }
                            >
                                {sessionString + ": " + session['status']}
                            </button>
                        )
                    })}

                    {
                        !["Rejected", "Withdrawn", "Completed", "Not Selected"].includes(participantInfo['status']) &&
                        <button className="book-session-button" onClick={() => setShowBookSession2(participantId)}>Schedule session</button>
                    }
                </div>
            }


            {
                participantInfo['history'] &&
                <div className="participant-card-column column-5">
                    <span className="participant-attribute-header">Email history</span>
                    {participantInfo['history'] && Object.keys(participantInfo['history']).map((t) => {
                        let emailTitle = participantInfo['history'][t]['title'].replace("Document Request:", "DR:");
                        let appointmentTime = "";
                        let uploadURL = `https://fs30.formsite.com/LB2014/pegzfrigaw/index?fill&id16=${participantInfo['first_name']}&id17=${participantInfo['last_name']}&id20=${auth.currentUser.email}&id434=${emailTitle === "DR: ID" ? 1
                            : emailTitle === "DR: Vision Correction" ? 2
                                : emailTitle === "DR: ID & Vision Correction" ? 0
                                    : ""
                            }&id435=${participantId}`;
                        if (emailTitle.startsWith('Confirmation') && emailTitle.length > 15) {
                            appointmentTime = emailTitle.substring(13, 17) + "-" +
                                emailTitle.substring(17, 19) + "-" +
                                emailTitle.substring(19, 21) + " " +
                                Constants['bookingDictionary'][emailTitle.substring(22, 24) + ":" + emailTitle.substring(24, 26)] +
                                " (" + emailTitle.substring(27) + ")";
                            emailTitle = 'Confirmation';
                        } else if (emailTitle.startsWith('Reminder') && emailTitle.length > 15) {
                            appointmentTime = emailTitle.substring(9, 13) + "-" +
                                emailTitle.substring(13, 15) + "-" +
                                emailTitle.substring(15, 17) + " " +
                                Constants['bookingDictionary'][emailTitle.substring(18, 20) + ":" + emailTitle.substring(20, 22)] +
                                " (" + emailTitle.substring(23) + ")";
                            emailTitle = 'Reminder';
                        }
                        return <div key={participantId + t} className="participant-attribute-container">
                            <span className="field-label">{t.substring(0, 16).replaceAll('_', ' ')}</span>
                            <span className="email-history-content">
                                <span>{emailTitle} {emailTitle.includes("DR: ") && ['zoltan.bathori@telusinternational.com', 'german.milla01@telusinternational.com'].includes(auth.currentUser.email) && participantInfo['document_approval'] !== "Pass" ?
                                    <a className='copy-email-link fas fa-link'
                                        title='Open upload link'
                                        href={uploadURL}
                                        target="_blank"></a> : ""} </span>
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