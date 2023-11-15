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

function UpdateSession({ database, updateSession, setUpdateSession, setCheckDocuments, setActivityLog, setIdForLog, setTimeslotforLog, timeslotforLog }) {
    const [participantId, setParticipantId] = useState(database['timeslots'][updateSession]['participant_id']);
    const [sessionInfo, setSessionInfo] = useState(database['timeslots'][updateSession]);
    const [hasCompletedSession] = useState(
        [
            'sari.kiiskinen@telusinternational.com',
            'axel.romeo@telusinternational.com',
            'zoltan.bathori@telusinternational.com',
            'denise.bugarin@telusinternational.com',
            'mayghan.brown@telusinternational.com',
            'christopher.warren@telusinternational.com'
        ].includes(auth.currentUser.email) ? false : Object.keys(database['timeslots']).filter(timeslotId => participantId == database['timeslots'][timeslotId]['participant_id'] && database['timeslots'][timeslotId]['status'] == "Completed").length > 0
    );
    const [externalIdForAPI, setExternalIdForAPI] = useState("");
    const [contributions, setContributions] = useState([]);
    const [selectedContribution, setSelectedContribution] = useState("");
    const [isloading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [externalIdParticipants, setExternalIdParticipants] = useState([]);


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
                    arrival_time: "",
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

    function updateDOB() {
        const pInfo = database['participants'][participantId];
        const dob = pInfo['date_of_birth'];
        let selectedDate = dob.substring(0, 10);

        const HTMLContent = () => {

            return <input type="date" id="newDOB" defaultValue={selectedDate} ></input>

        }

        const saveDOB = () => {
            selectedDate = document.getElementById("newDOB").value;
            let formattedDOB = new Date(selectedDate).toISOString();

            updateValue("/participants/" + participantId, { date_of_birth: formattedDOB });

            LogEvent({
                pid: participantId,
                action: "Participant date of birth: '" + formattedDOB.substring(0, 10) + "'"
            })
        }


        Swal.fire({
            title: "Updating Date of Birth",
            confirmButtonText: "Save",
            showCancelButton: true,
            html: renderToString(<HTMLContent />)
        }).then((result) => {
            if (result.isConfirmed) {
                saveDOB();
            }
        });
    }


    function getClientInfo(externalIdForAPI) {
        setExternalIdForAPI(externalIdForAPI);
        setIsLoading(true);

        const scriptURL = "https://script.google.com/macros/s/AKfycbzSU_qQjdAgUx-oFn5CwfbtOCKTeDdjBg0ZbOVZcxqEyl99Qv58rLuFokxTIHSB0-XVMQ/exec";
        fetch(scriptURL, {
            method: 'POST',
            muteHttpExceptions: true,
            body: JSON.stringify({
                externalId: externalIdForAPI
            })
        }).then(res => {
            return res.json();
        }).then(data => {
            //console.log(data);
            if (data['results'].length > 0) {
                setIsLoading(false);
                setErrorMessage("");
                setContributions(data['results'][0]['metadata']);
            } else {
                setIsLoading(false);
                setSelectedContribution("");
                setContributions([]);
                setErrorMessage("Wrong ID: " + externalIdForAPI);
            }
        },
            err => {
                setIsLoading(false);
                setExternalIdForAPI("");
                setSelectedContribution("");
                setContributions([]);
                setErrorMessage("Wrong ID: " + externalIdForAPI);
                console.log('Error');
            });
    }

    useEffect(() => {
        if (participantInfo['external_id']) {
            getClientInfo(participantInfo['external_id']);
            setExternalIdParticipants(Object.keys(database['participants']).filter(pid => database['participants'][pid]['external_id'] == participantInfo['external_id']));
        }
    }, [participantInfo['external_id']])

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

                                        <a className="copy-email-link fas fa-search"
                                            title="Google"
                                            target="_blank"
                                            href={("https://www.google.com/search?q=" + participantInfo['full_name'] + " Los Angeles").replaceAll(" ", "%20")}
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
                                    <td className="participant-table-left">Country, State</td>
                                    <td className="participant-table-right">{participantInfo['country_of_residence'] + ", " + participantInfo['state_of_residence']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">City</td>
                                    <td className="participant-table-right">{participantInfo['city_of_residence']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Registration Source</td>
                                    <td className="participant-table-right">{Constants['sources'][(participantInfo['source'] || 'Other')]}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Documents</td>
                                    <td className="participant-table-right"><a href="" className="signature-link" onClick={(e) => { e.preventDefault(); openDocuments(participantId); }}>Open Documents</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Signatures</td>
                                    <td className="participant-table-right">
                                        <a href={"https://fs30.formsite.com/LB2014/files/" + participantInfo['sla_url']} target="_blank" className="signature-link">SLA</a>

                                        {participantInfo['reg_type'] != 'elbert' && <>
                                            <span> &nbsp;/&nbsp; </span>
                                            {participantInfo['icf'] ?
                                                <a href={participantInfo['icf']} target="_blank" className="signature-link">Denali ICF</a>
                                                : <span className="missing-icf">Missing ICF!</span>
                                            }
                                        </>}

                                        {participantInfo['reg_type'] == 'elbert' &&
                                            <>
                                                <span> &nbsp;/&nbsp; </span>
                                                {participantInfo['icf'] ?
                                                    <a href={participantInfo['icf']} target="_blank" className="signature-link elbert-icf">Elbert ICF</a>
                                                    : <span className="missing-icf">Missing ICF!</span>
                                                }
                                            </>
                                        }
                                    </td>
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

                                <tr>
                                    <td className="participant-table-left">&nbsp;</td>
                                </tr>

                                <tr>
                                    <td className="participant-table-left">Demo bin</td>
                                    <td className="participant-table-right">{sessionInfo['demo_bin']}</td>

                                </tr>
                                <tr>
                                    <td className="participant-table-left">Date of birth</td>
                                    <td className="participant-table-right">
                                        {participantInfo['date_of_birth'].substring(0, 10)}
                                        <a className="copy-email-link fas fa-edit"
                                            title="Update Date of Birth"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (hasCompletedSession) return;
                                                updateDOB();
                                            }} target="_blank" />
                                    </td>
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
                                            title="Update ethnicity"
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
                                    <td className="participant-table-left">Vision correction</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            disabled={hasCompletedSession}
                                            onChange={(e) => {
                                                updateValue("/participants/" + participantId, { vision_correction: e.currentTarget.value });
                                                updateValue("/timeslots/" + updateSession, { glasses: ['Glasses - distance', 'Glasses - pr/ bf/ mf'].includes(e.currentTarget.value) });
                                                LogEvent({
                                                    pid: participantId,
                                                    action: "Vision correction: '" + e.currentTarget.value + "'"
                                                })
                                            }}
                                        >
                                            {Constants['visionCorrections'].map((s, i) => (
                                                <option key={"data-vc" + i} value={s} selected={s == participantInfo['vision_correction']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>

                                {participantInfo['gender'] == "Female" &&
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
                                }
                                {participantInfo['conditions'] != "None of the above" &&
                                    <tr>
                                        <td className="participant-table-left">Health conditions</td>
                                        <td className="participant-table-right">{participantInfo['conditions']}</td>
                                    </tr>
                                }

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
                                    <td className="participant-table-left">&nbsp;</td>
                                </tr>

                                {isloading &&
                                    <tr>
                                        <td className="participant-table-center" colspan="2">Loading...</td>
                                    </tr>
                                }
                                {externalIdForAPI && !isloading &&
                                    <>
                                        {!errorMessage &&
                                            <tr className='client-info-container'>
                                                <td className="participant-table-center" colspan="2">Client info: {externalIdForAPI}</td>
                                            </tr>
                                        }
                                        {errorMessage &&
                                            <tr>
                                                <td className="participant-table-center client-api-error-message" colspan="2">{errorMessage}</td>
                                            </tr>
                                        }
                                        <tr className='client-info-container'>
                                            <td className="participant-table-left" colSpan="2">
                                                {contributions.map(contribution => {
                                                    const tag = contribution['tag'];
                                                    const formatted = tag.substring(0, 4) + "-" +
                                                        tag.substring(4, 6) + "-" +
                                                        tag.substring(6, 8) + " " +
                                                        tag.substring(8, 10) + ":" +
                                                        tag.substring(10, 12);

                                                    const sameDay = updateSession.substring(0, 8) == tag.substring(0, 8);
                                                    if (selectedContribution == "" && sameDay) setSelectedContribution(contribution);
                                                    return <>
                                                        <button
                                                            className={"client-contribution-button" + (tag == selectedContribution['tag'] ? " same-day-contribution" : "")}
                                                            onClick={() => setSelectedContribution(contribution)}
                                                        >
                                                            {sameDay ? formatted + " < Same day" : formatted}
                                                        </button>
                                                        <br />
                                                    </>
                                                })}
                                            </td>
                                        </tr>
                                        <tr className='client-info-container'>
                                            <td className="participant-table-left" colSpan="2">&nbsp;</td>
                                        </tr>
                                        {selectedContribution != "" && <>
                                            <tr className='client-info-container'>
                                                <td className="participant-table-center" colspan="2">Contribution {selectedContribution['tag'].substring(0, 4) + "-" +
                                                    selectedContribution['tag'].substring(4, 6) + "-" +
                                                    selectedContribution['tag'].substring(6, 8) + " " +
                                                    selectedContribution['tag'].substring(8, 10) + ":" +
                                                    selectedContribution['tag'].substring(10, 12)}</td>
                                            </tr>
                                            <tr className='client-info-container'>
                                                <td className="participant-table-left">
                                                    Demo bin
                                                </td>
                                                <td className={"participant-table-right" + ((selectedContribution['answers'].filter(answer => answer['slug'] == 'demo_bin').length > 0 ?
                                                    selectedContribution['answers'].filter(answer => answer['slug'] == 'demo_bin')[0]['values'].join(",")
                                                    : "") != sessionInfo['demo_bin'] ? " not-matching-client-data" : "")}>

                                                    {selectedContribution['answers'].filter(answer => answer['slug'] == 'demo_bin').length > 0 ?
                                                        selectedContribution['answers'].filter(answer => answer['slug'] == 'demo_bin')[0]['values'].join(",")
                                                        : ""}
                                                </td>
                                            </tr>
                                            <tr className='client-info-container'>
                                                <td className="participant-table-left">
                                                    Date of birth
                                                </td>
                                                <td className={"participant-table-right" + (selectedContribution['answers'].filter(answer => answer['slug'] == 'birth_date')[0]['values'].join(",") != participantInfo['date_of_birth'].substring(0, 10) ? " not-matching-client-data" : "")}>
                                                    {selectedContribution['answers'].filter(answer => answer['slug'] == 'birth_date')[0]['values'].join(",")}
                                                </td>
                                            </tr>
                                            <tr className='client-info-container'>
                                                <td className="participant-table-left">
                                                    Gender
                                                </td>
                                                <td className={"participant-table-right" + (selectedContribution['answers'].filter(answer => answer['slug'] == 'gender')[0]['values'].join(",") != participantInfo['gender'] ? " not-matching-client-data" : "")}>
                                                    {selectedContribution['answers'].filter(answer => answer['slug'] == 'gender')[0]['values'].join(",")}
                                                </td>
                                            </tr>
                                            <tr className='client-info-container'>
                                                <td className="participant-table-left">
                                                    Ethnicity
                                                </td>
                                                <td className={"participant-table-right" + ((Constants['clientEthnicities'][selectedContribution['answers'].filter(answer => answer['slug'] == 'ethnicity')[0]['values'].join(",")] || selectedContribution['answers'].filter(answer => answer['slug'] == 'ethnicity')[0]['values'].join(",")) != participantInfo['ethnicities'] ? " not-matching-client-data" : "")}>
                                                    {Constants['clientEthnicities'][selectedContribution['answers'].filter(answer => answer['slug'] == 'ethnicity')[0]['values'].join(",")] || selectedContribution['answers'].filter(answer => answer['slug'] == 'ethnicity')[0]['values'].join(",")}
                                                </td>
                                            </tr>
                                            <tr className='client-info-container'>
                                                <td className="participant-table-left">
                                                    Vision correction
                                                </td>
                                                <td className={"participant-table-right" + (Constants['clientVisionCorrections'][selectedContribution['answers'].filter(answer => answer['slug'] == 'vision_correction')[0]['values'].join(",")] != participantInfo['vision_correction'] ? " not-matching-client-data" : "")}>
                                                    {Constants['clientVisionCorrections'][selectedContribution['answers'].filter(answer => answer['slug'] == 'vision_correction')[0]['values'].join(",")]}
                                                </td>
                                            </tr>
                                        </>}
                                    </>
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
                                        {FormattingFunctions.TimeSlotFormat(updateSession)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Station</td>
                                    <td className="participant-table-right">{updateSession.substring(14) + (sessionInfo['backup'] ? " (backup session)" : "")}</td>
                                </tr>

                                <tr>
                                    <td className="participant-table-left">Arrival time</td>
                                    <td className="participant-table-right">
                                        <input
                                            type="time"
                                            value={database['timeslots'][updateSession]['arrival_time'] || ""}
                                            onChange={(e) => {
                                                updateValue("/timeslots/" + updateSession, { arrival_time: e.currentTarget.value });
                                                LogEvent({
                                                    pid: participantId,
                                                    timeslot: updateSession,
                                                    action: "Arrival time: '" + (e.currentTarget.value || "Blank") + "'"
                                                })
                                            }}
                                        />
                                        {!['Scheduled', 'Rescheduled', 'NoShow', 'Withdrawn'].includes(database['timeslots'][updateSession]['status']) &&
                                            !database['timeslots'][updateSession]['arrival_time'] &&
                                            <span className="missing-arrival-time">Missing!</span>}
                                    </td>
                                </tr>

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
                                            {Constants['participantStatuses'].filter(status => status != "Denali PPT").map((s, i) => (
                                                <option key={"data-ppt-status_" + i} value={s} selected={s == participantInfo['status']}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="participant-table-left">External ID</td>
                                    <td className="participant-table-right">
                                        <button className="external-id-button" onClick={() => modifyExternalId()}>{participantInfo['external_id'] || "Missing ID!"}</button>
                                        {participantInfo['external_id'] &&
                                            <button
                                                className="refresh-api-button"
                                                onClick={() => getClientInfo(participantInfo['external_id'])}
                                                disabled={isloading}
                                            >Get info</button>
                                        }
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

                                <tr>
                                    <td className="participant-table-left">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">&nbsp;</td>
                                </tr>

                                {externalIdParticipants.length > 1 &&
                                    <tr>
                                        <td className="participant-table-left" colspan="2">
                                            <span className="same-external-id-error-message">The same external ID is used for multiple people:</span><br /><br />
                                            {externalIdParticipants.map(participantId => {
                                                const ppt = database['participants'][participantId];
                                                return <><span>{participantId + ": " + ppt['full_name'] + (ppt["parent"] ? "  (child)" : "")}</span><br /></>
                                            })}
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