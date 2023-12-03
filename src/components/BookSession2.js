import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { realtimeDb } from '../firebase/config';
import Swal from 'sweetalert2';

import './BookSession2.css';
import Constants from './Constants';
import LogEvent from './Core/LogEvent';
import FormattingFunctions from './Core/FormattingFunctions';

function BookSession2({ database, setShowBookSession2, participantId }) {
    const [days, setDays] = useState([]);
    const [timeslots, setTimeslots] = useState([]);

    function bookSession(sessionId) {
        let visionCorrection = database['participants'][participantId]['vision_correction'];
        let glasses = ['Glasses - distance', 'Glasses - pr/ bf/ mf'].includes(visionCorrection);
        let backupSession = database['timeslots'][sessionId]['backup'] === true;
        let externalId = database['participants'][participantId]['external_id'];
        let clientInfo = {};
        let size = "N/A";
        if (externalId) {
            clientInfo = database['client']['contributions'][externalId];
            if (clientInfo) size = clientInfo[0]['w'] ? Constants['sizeDirectory'][clientInfo[0]['w']] : "N/A";
        }

        Swal.fire({
            title: "Booking an appointment",
            showCancelButton: true,
            confirmButtonText: backupSession ? 'Yes (backup)' : 'Yes',
            html: "<b>" + FormattingFunctions.TimeSlotFormat(sessionId) +
                "<br/>Station: " + sessionId.substring(14) + "<br/>" +
                database['participants'][participantId]['full_name'] + "</b>" +
                (backupSession ? "<br/><br/><b><u>!!! BACKUP SESSION !!!</u></b><br/>" : ""),

        }).then((result) => {
            if (result.isConfirmed) {
                let data = {
                    status: 'Scheduled',
                    participant_id: participantId,
                    confirmed: "no",
                    remind: true
                }

                if (Object.values(Constants['sizeDirectory']).includes(size)) data['dl'] = size;
                if (data['locked'] === true) data['locked'] = false;
                if (glasses) data['glasses'] = true;

                // Save the session
                realtimeDb.ref("/timeslots/" + sessionId).update(data);
                setShowBookSession2("");

                LogEvent({
                    pid: participantId,
                    timeslot: sessionId,
                    action: "Book session"
                })
            }
        })
    }

    useEffect(() => {
        let tempDays = [];
        let tempTimeslots = [];
        const now = new Date();
        Object.keys(database['timeslots']).map(sessionId => {
            const day = sessionId.substring(0, 4) + "-" + sessionId.substring(4, 6) + "-" + sessionId.substring(6, 8);
            const dateOfSession = new Date(day);
            const diffTime = dateOfSession - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < -7) return;

            if (!tempDays.includes(day)) tempDays.push(day);

            const timeslot = sessionId.substring(9, 11) + ":" + sessionId.substring(11, 13);
            if (!tempTimeslots.includes(timeslot)) tempTimeslots.push(timeslot);
        });

        setDays(tempDays);

        tempTimeslots.sort();
        setTimeslots(tempTimeslots);
    }, [])

    return ReactDOM.createPortal((
        <div className="modal-book-session2-backdrop" onClick={(e) => { if (e.target.className == "modal-book-session2-backdrop") setShowBookSession2("") }}>
            <div className="modal-book-session2-main-container">
                <div className="modal-book-session2-header">
                    Schedule session
                </div>
                <div
                    className="modal-book-session2-sub-header">
                    {database['participants'][participantId]['full_name']} ({participantId})
                </div>
                <div className="session2-table-container">
                    <table className="session2-table">
                        <thead>
                            <tr>
                                <th className="session2-table-header-cell">

                                </th>
                                {days.map(day => {
                                    return (
                                        <th key={"scheduler-table-item-" + day} className="session2-table-header-cell">
                                            {day}
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>

                            {timeslots.map(timeslot => {
                                return (
                                    <tr key={"scheduler-table-item-" + timeslot}>
                                        <th className="session2-table-header-cell">
                                            {FormattingFunctions.FormatTime(timeslot)}
                                        </th>
                                        {days.map(day => {
                                            let sessionId = day.replaceAll('-', '') + '_' + timeslot.replaceAll(':', '') + '_';
                                            let sessionIdWithLab = "";
                                            let bookedSessions = Object.keys(database['timeslots']).filter(key => key.startsWith(sessionId) && database['timeslots'][key]['status']).length;
                                            let totalOfSessions = Object.keys(database['timeslots']).filter(key => key.startsWith(sessionId) && !database['timeslots'][key]['locked']).length;
                                            let nextFreeLab = "";
                                            let free = bookedSessions < totalOfSessions;
                                            if (free) {
                                                nextFreeLab = Object.keys(database['timeslots']).filter(key => key.startsWith(sessionId) && !database['timeslots'][key]['status']).sort((a, b) => a < b ? 1 : -1).sort((a, b) => database['timeslots'][a]['backup'] ? 1 : -1)[0].substring(14);
                                                sessionIdWithLab = day.replaceAll('-', '') + '_' + timeslot.replaceAll(':', '') + '_' + nextFreeLab;
                                            }
                                            return (
                                                <td
                                                    className={"session2-table-cell " + (free ? "free-sessions" : "booked-sessions")}
                                                    onClick={() => { if (free) bookSession(sessionIdWithLab) }}
                                                >
                                                    {bookedSessions + " / " + totalOfSessions}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    ), document.body);
}

export default BookSession2;