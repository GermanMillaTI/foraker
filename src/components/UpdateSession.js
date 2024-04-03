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
    const [selectedContribution, setSelectedContribution] = useState("");
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


    function updateHeight() {
        const pInfo = database['participants'][participantId];
        let height = pInfo['height_cm'];

        const HTMLContent = () => {
            return <input type="number" id="newHeight" defaultValue={height} />
        }

        const saveHeight = () => {
            height = document.getElementById("newHeight").value;

            const inches = height / 2.54;
            const feet = Math.floor(inches / 12);
            const remainingInches = inches % 12;



            updateValue("/participants/" + participantId, { height_cm: height });
            updateValue("/participants/" + participantId, { height_ft: parseFloat(feet) });
            updateValue("/participants/" + participantId, { height_in: parseFloat(remainingInches) });

            LogEvent({
                pid: participantId,
                action: "Participant height (cm): '" + height + "'"
            })
        }


        Swal.fire({
            title: "Updating Height (cm)",
            confirmButtonText: "Save",
            showCancelButton: true,
            html: renderToString(<HTMLContent />)
        }).then((result) => {
            if (result.isConfirmed) {
                saveHeight();
            }
        });
    }

    function updateWeight() {
        const pInfo = database['participants'][participantId];
        let weight = parseFloat(pInfo['weight_kg']).toFixed(2);

        const HTMLContent = () => {
            return <input type="number" id="newWeight" defaultValue={weight} />
        }

        const saveWeight = () => {
            weight = document.getElementById("newWeight").value;
            const weight_lb = weight * 2.205

            updateValue("/participants/" + participantId, { weight_kg: weight });
            updateValue("/participants/" + participantId, { weight_lbs: weight_lb });

            LogEvent({
                pid: participantId,
                action: "Participant weight (kg): '" + weight + "'"
            })
        }


        Swal.fire({
            title: "Updating Weight (kg)",
            confirmButtonText: "Save",
            showCancelButton: true,
            html: renderToString(<HTMLContent />)
        }).then((result) => {
            if (result.isConfirmed) {
                saveWeight();
            }
        });
    }
    function updateSkinColor() {
        const pInfo = database['participants'][participantId];
        let skintone = pInfo['skinTone'];

        const HTMLContent = () => {
            return <select id="newSkinTone" defaultValue={skintone} >
                {
                    Object.keys(Constants['skinTone']).map((i) => {
                        return <option value={Constants['skinTone'][i]}>{Constants['skinTone'][i]}</option>
                    })
                }
            </select>
        }

        const saveSkinColor = () => {
            skintone = document.getElementById("newSkinTone").value

            updateValue("/participants/" + participantId, { skinTone: skintone });

            LogEvent({
                pid: participantId,
                action: "Participant skin tone: '" + skintone + "'"
            })
        }


        Swal.fire({
            title: "Updating Skin tone",
            confirmButtonText: "Save",
            showCancelButton: true,
            html: renderToString(<HTMLContent />)
        }).then((result) => {
            if (result.isConfirmed) {
                saveSkinColor();
            }
        });
    }

    function updateHairLength() {
        const pInfo = database['participants'][participantId];
        let hairlength = pInfo['haiLength'];

        const HTMLContent = () => {
            return <select id="newHairLength" defaultValue={hairlength} >
                {
                    Object.keys(Constants['skinTone']).map((i) => {
                        return <option value={Constants['hairlength'][i]}>{Constants['hairlength'][i]}</option>
                    })
                }
            </select>
        }

        const saveHairLength = () => {
            hairlength = document.getElementById("newHairLength").value

            updateValue("/participants/" + participantId, { haiLength: hairlength });

            LogEvent({
                pid: participantId,
                action: "Participant skin tone: '" + hairlength + "'"
            })
        }


        Swal.fire({
            title: "Updating Hair Length",
            confirmButtonText: "Save",
            showCancelButton: true,
            html: renderToString(<HTMLContent />)
        }).then((result) => {
            if (result.isConfirmed) {
                saveHairLength();
            }
        });
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
                                    <td className="participant-table-right">{participantInfo['state_of_residence']}</td>
                                </tr>

                                <tr>
                                    <td className="participant-table-left">Vision Correction</td>
                                    <td className="participant-table-right">'{participantInfo['visionCorrection']}'</td>
                                </tr>

                                <tr>
                                    <td className="participant-table-left">Signatures</td>
                                    <td className="participant-table-right">
                                        <a href={"https://firebasestorage.googleapis.com/v0/b/tiai-registrations.appspot.com/o/foraker" + participantInfo['sla_url']} target="_blank" className="signature-link" rel='noreferrer'>Open SLA</a>

                                        <span> &nbsp;/&nbsp; </span>

                                        {participantInfo['icf'] ?
                                            <a href={"https://firebasestorage.googleapis.com/v0/b/tiai-registrations.appspot.com/o/foraker" + participantInfo['icf']['icf_url']} target="_blank" className="signature-link" rel='noreferrer'>Open ICF</a>
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
                                    <td className="participant-table-left">Age range / Gender</td>
                                    <td className="participant-table-right">{participantInfo['age_range'] + " / " + participantInfo['gender']}</td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Height (cm) / Range</td>
                                    <td className="participant-table-right">{`${participantInfo['height_cm']} / (${participantInfo['height_range']})`}
                                        <a className='copy-email-link fas fa-edit'
                                            title='Update Height'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                updateHeight();
                                            }} target='_blank'></a>
                                    </td>

                                </tr>
                                <tr>
                                    <td className="participant-table-left">Weight (kg) / Range</td>
                                    <td className="participant-table-right">{`${parseFloat(participantInfo['weight_kg']).toFixed(2)} / (${participantInfo['weight_range']})`}                    <a className='copy-email-link fas fa-edit'
                                        title='Update Weight'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            updateWeight();
                                        }} target='_blank'></a>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="participant-table-left">Skin tone</td>
                                    <td className="participant-table-right">
                                        {participantInfo['skinTone']}
                                        <a className='copy-email-link fas fa-edit'
                                            title='Update Skin tone'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                updateSkinColor();
                                            }} target='_blank'></a>
                                    </td>

                                </tr>
                                <tr>
                                    <td className="participant-table-left">Hair Length</td>
                                    <td className="participant-table-right">
                                        {participantInfo['haiLength']}
                                        <a className='copy-email-link fas fa-edit'
                                            title='Update Height'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                updateHairLength();
                                            }} target='_blank'></a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">Date of birth</td>
                                    <td className="participant-table-right">
                                        {participantInfo['date_of_birth']}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="participant-table-left">&nbsp;</td>
                                </tr>

                                <tr>
                                    <td className="participant-table-left">&nbsp;</td>
                                </tr>

                                {
                                    database['timeslots'][updateSession]['status'] === "Completed" && <tr className='client-info-container'>
                                        <td className="participant-table-center" colSpan="2">Client Info: {participantId}</td>

                                    </tr>
                                }

                                <tr>
                                    <td className="participant-table-left">&nbsp;</td>
                                </tr>


                                {database['timeslots'][updateSession]['status'] === "Completed" && <tr className='client-info-container'>

                                    {
                                        typeof database['client'][participantId] !== "undefined" ?
                                            <>
                                                <td className="participant-table-center" colSpan="2">
                                                    {

                                                        Object.keys(database['client'][participantId]).map(tag => {
                                                            const formatted = FormattingFunctions.TimeSlotFormat(updateSession).slice(0, 10)
                                                            const sameDay = formatted === tag;
                                                            if (selectedContribution == "" && sameDay) setSelectedContribution(tag);

                                                            return <>
                                                                <button
                                                                    key={"client-info-button-" + formatted}
                                                                    className={"client-contribution-button" + (tag == selectedContribution ? " same-day-contribution" : "")}
                                                                    onClick={() => setSelectedContribution(tag)}
                                                                >
                                                                    {sameDay ? formatted + " < Same day" : formatted}
                                                                </button>
                                                                <br />
                                                            </>
                                                        })
                                                    }
                                                </td>
                                            </>

                                            : <td className="not-matching-client-data" colSpan="2">Session not in client's data</td>

                                    }
                                </tr>}
                                <tr>
                                    <td className="participant-table-left">&nbsp;</td>
                                </tr>
                                {
                                    selectedContribution != "" && <>
                                        <tr className='client-info-container'>
                                            <td className="participant-table-center" colSpan="2">Contribution {selectedContribution}</td>
                                        </tr>
                                        <tr className='client-info-container'>
                                            <td className="participant-table-left">
                                                Height
                                            </td>
                                            <td className={
                                                "participant-table-right" + (database['client'][participantId][selectedContribution]['height'] != database['participants'][participantId]['height_cm'] ? " not-matching-client-data" : "")}>
                                                {database['client'][participantId][selectedContribution]['height']}
                                            </td>
                                        </tr>
                                        <tr className='client-info-container'>
                                            <td className="participant-table-left">
                                                Weight
                                            </td>
                                            <td className={
                                                "participant-table-right" + (database['client'][participantId][selectedContribution]['weight'] != database['participants'][participantId]['weight_kg'] ? " not-matching-client-data" : "")}>
                                                {database['client'][participantId][selectedContribution]['weight']}
                                            </td>
                                        </tr>
                                        <tr className='client-info-container'>
                                            <td className="participant-table-left">
                                                Hair Length
                                            </td>
                                            <td className={
                                                "participant-table-right" + (database['client'][participantId][selectedContribution]['hair_length'] != database['participants'][participantId]['haiLength'].toLowerCase() ? " not-matching-client-data" : "")}>
                                                {database['client'][participantId][selectedContribution]['hair_length']}
                                            </td>
                                        </tr>
                                        <tr className='client-info-container'>
                                            <td className="participant-table-left">
                                                Skin Tone
                                            </td>
                                            <td className={
                                                "participant-table-right" + (database['client'][participantId][selectedContribution]['skin_tone'] != database['participants'][participantId]['skinTone'] ? " not-matching-client-data" : "")}>
                                                {database['client'][participantId][selectedContribution]['skin_tone']}
                                            </td>
                                        </tr>
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
                                    <td className="participant-table-left">Session Clothing</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            onChange={(e) => {
                                                updateValue("/timeslots/" + updateSession, { clothing: e.currentTarget.value });
                                                LogEvent({
                                                    pid: participantId,
                                                    timeslot: updateSession,
                                                    action: "Session clothing: '" + (e.currentTarget.value || "Blank") + "'"
                                                })
                                            }}
                                        >
                                            {Constants['clothingCategories'].map((s, i) => {
                                                return <option key={"data-session-clothing" + i} value={s} selected={s == sessionInfo['clothing']}>{s}</option>
                                            })}
                                        </select>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="participant-table-left">Session Hair</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            onChange={(e) => {
                                                updateValue("/timeslots/" + updateSession, { hair: e.currentTarget.value });
                                                LogEvent({
                                                    pid: participantId,
                                                    timeslot: updateSession,
                                                    action: "Session hair: '" + (e.currentTarget.value || "Blank") + "'"
                                                })
                                            }}
                                        >
                                            {Constants['hairCategories'].map((s, i) => {
                                                return <option key={"data-session-hair" + i} value={s} selected={s == sessionInfo['hair']}>{s}</option>
                                            })}
                                        </select>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="participant-table-left">Session Facial Hair</td>
                                    <td className="participant-table-right">
                                        <select className="session-data-selector"
                                            onChange={(e) => {
                                                updateValue("/timeslots/" + updateSession, { facial_hair: e.currentTarget.value });
                                                LogEvent({
                                                    pid: participantId,
                                                    timeslot: updateSession,
                                                    action: "Session facial hair: '" + (e.currentTarget.value || "Blank") + "'"
                                                })
                                            }}
                                        >
                                            {Constants['facialHairCategories'].map((s, i) => {
                                                return <option key={"data-session-facial-hair" + i} value={s} selected={s == sessionInfo['facial_hair']}>{s}</option>
                                            })}
                                        </select>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="participant-table-left">Bulky clothing item</td>
                                    <td className="participant-table-right">
                                        <input type='checkbox'
                                            value={true}
                                            checked={sessionInfo['bulky_clt_item'] === 'true' ? true : false}
                                            onChange={(e) => {
                                                const newValue = e.currentTarget.checked ? 'true' : 'false'
                                                updateValue("/timeslots/" + updateSession, { bulky_clt_item: newValue });
                                                LogEvent({
                                                    pid: participantId,
                                                    timeslot: updateSession,
                                                    action: "Bulky clothing item: '" + (newValue) + "'"
                                                })
                                            }}>
                                        </input>
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