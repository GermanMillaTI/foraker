import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { auth, realtimeDb } from '../firebase/config';
import { format } from 'date-fns';
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
                let userEmail = auth.currentUser.email;
                let data = {
                    status: 'Scheduled',
                    participant_id: participantId,
                    confirmed: "no",
                    remind: true
                }

                if (glasses) data['glasses'] = true;

                // Save the session
                let path = "/timeslots/" + sessionId;
                realtimeDb.ref(path).update(data);
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
        let now = new Date();
        Object.keys(database['timeslots']).map(sessionId => {
            let day = sessionId.substring(0, 4) + "-" + sessionId.substring(4, 6) + "-" + sessionId.substring(6, 8);

            let dateOfSession = new Date(day);
            let diffTime = dateOfSession - now;
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < -7) return;

            if (!tempDays.includes(day)) tempDays.push(day);

            let timeslot = sessionId.substring(9, 11) + ":" + sessionId.substring(11, 13);
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
                                        <th className="session2-table-header-cell">
                                            {day}
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>

                            {timeslots.map(timeslot => {
                                return (
                                    <tr>
                                        <th className="session2-table-header-cell">
                                            {FormattingFunctions.FormatTime(timeslot)}
                                        </th>
                                        {days.map(day => {
                                            let sessionId = day.replaceAll('-', '') + '_' + timeslot.replaceAll(':', '') + '_';
                                            let sessionIdWithLab = "";
                                            let bookedSessions = Object.keys(database['timeslots']).filter(key => key.startsWith(sessionId) && database['timeslots'][key]['status']).length;
                                            let totalOfSessions = Object.keys(database['timeslots']).filter(key => key.startsWith(sessionId)).length;
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