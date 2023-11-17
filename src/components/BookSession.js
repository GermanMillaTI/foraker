import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { realtimeDb } from '../firebase/config';
import Swal from 'sweetalert2';

import './BookSession.css';
import LogEvent from './Core/LogEvent';
import FormattingFunctions from './Core/FormattingFunctions';

function BookSession({ database, setShowBookSession, selectedSessionId, setJustBookedSession }) {
    const [searchBarText, setSearchBarText] = useState("");

    function participantFilter(pid) {
        let searchText = searchBarText.trim();
        if (!searchBarText) return false;

        let pInfo = database['participants'][pid];
        let pName = pInfo['full_name'].toLocaleLowerCase();
        let email = pInfo['email'];
        let phone = pInfo['phone'].replaceAll('T: ', '').replaceAll(' ', '');
        let dateOfBirth = pInfo['date_of_birth'].substring(0, 10);

        let output = [];
        if (pid.includes(searchText)) output.push('Participant ID');
        if (pName.includes(searchText)) output.push('Name');
        if (email.includes(searchText)) output.push('E-mail');
        if (phone.includes(searchText)) output.push('Phone');
        if (dateOfBirth.includes(searchText)) output.push('Date of birth');

        return output;
    }

    function bookSession(pid) {
        let visionCorrection = database['participants'][pid]['vision_correction'];
        let glasses = ['Glasses - distance', 'Glasses - pr/ bf/ mf'].includes(visionCorrection);
        let backupSession = database['timeslots'][selectedSessionId]['backup'] === true;

        Swal.fire({
            title: "Booking an appointment",
            showCancelButton: true,
            confirmButtonText: backupSession ? 'Yes (backup)' : 'Yes',
            html: "<b>" + FormattingFunctions.TimeSlotFormat(selectedSessionId) +
                "<br/>Station: " + selectedSessionId.substring(14) + "<br/>" +
                database['participants'][pid]['full_name'] + "</b>" +
                (backupSession ? "<br/><br/><b><u>!!! BACKUP SESSION !!!</u></b><br/>" : ""),

        }).then((result) => {
            if (result.isConfirmed) {
                let data = {
                    status: 'Scheduled',
                    participant_id: pid,
                    confirmed: "no",
                    remind: true
                }

                if (data['locked'] === true) data['locked'] = false;
                if (glasses) data['glasses'] = true;

                // Save the session
                let path = "/timeslots/" + selectedSessionId;
                realtimeDb.ref(path).update(data);
                setJustBookedSession(selectedSessionId);
                setShowBookSession(false);

                LogEvent({
                    pid: pid,
                    timeslot: selectedSessionId,
                    action: "Book session"
                })
            }
        })
    }

    useEffect(() => {
        const handleEsc = (event) => { if (event.keyCode === 27) setShowBookSession(false) };
        window.addEventListener('keydown', handleEsc);
        return () => { window.removeEventListener('keydown', handleEsc) };
    }, []);

    return ReactDOM.createPortal((
        <div className="modal-book-session-backdrop" onClick={(e) => { if (e.target.className == "modal-book-session-backdrop") setShowBookSession(false) }}>
            <div className="modal-book-session-main-container">
                <div className="modal-book-session-header">
                    Schedule session
                </div>
                <div
                    className="modal-book-session-sub-header">
                    Station {selectedSessionId.substring(14)}:&nbsp;
                    {FormattingFunctions.TimeSlotFormat(selectedSessionId)}
                </div>
                <input
                    className="search-bar-for-schedule"
                    placeholder="Search..."
                    value={searchBarText}
                    onChange={(e) => setSearchBarText(e.target.value.toLocaleLowerCase())}
                    autoFocus
                />
                <div className="search-table-for-schedule-container">
                    <table className="search-table-for-schedule">
                        <thead>
                            <tr>
                                <th>Participant ID</th>
                                <th>Name</th>
                                <th>E-mail</th>
                                <th>Phone</th>
                                <th>Gender</th>
                                <th>Date of birth</th>
                                <th>Status</th>
                                <th>Participant comments</th>
                            </tr>
                        </thead>
                        <tbody>

                            {Object.keys(database['participants'])
                                .sort((a, b) => {
                                    return a < b ? -1 : 1;
                                })
                                .map(key => {
                                    const participantStatus = database['participants'][key]['status'];
                                    if (participantStatus == 'Denali PPT') return null;

                                    const filterResult = participantFilter(key);
                                    if (filterResult.length > 0) return (
                                        <tr onClick={() => bookSession(key)}>
                                            <td className={(filterResult.includes('Participant ID') ? "filter-highlighted-cell" : "") + " center-tag"}>
                                                {key}
                                            </td>
                                            <td className={filterResult.includes('Name') ? "filter-highlighted-cell" : ""}>
                                                {database['participants'][key]['full_name']}
                                            </td>
                                            <td className={filterResult.includes('E-mail') ? "filter-highlighted-cell" : ""}>
                                                {database['participants'][key]['email']}
                                            </td>
                                            <td className={(filterResult.includes('Phone') ? "filter-highlighted-cell" : "") + " center-tag"}>
                                                {database['participants'][key]['phone'].replace("T: ", "")}
                                            </td>
                                            <td className="center-tag">
                                                {database['participants'][key]['gender']}
                                            </td>
                                            <td className={(filterResult.includes('Date of birth') ? "filter-highlighted-cell" : "") + " center-tag"}>
                                                {database['participants'][key]['date_of_birth'].substring(0, 10)}
                                            </td>
                                            <td className="center-tag">
                                                {database['participants'][key]['status']}
                                            </td>
                                            <td>
                                                {database['participants'][key]['comment']}
                                            </td>
                                        </tr>
                                    )
                                }
                                )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    ), document.body);
}

export default BookSession;