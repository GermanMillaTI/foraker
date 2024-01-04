import React, { useEffect, useState, useRef } from "react";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import format from 'date-fns/format';

import './SessionInfo.css';
import Constants from '../Constants';
import FormattingFunctions from '../Core/FormattingFunctions';

function SessionInfo({ database, participantId, sessionId }) {
    const participantInfo = database['participants'][participantId] || {};
    const sessionInfo = database['timeslots'][sessionId];

    return (
        <Tooltip
            disableInteractive
            placement="right"
            TransitionProps={{ timeout: 100 }}
            componentsProps={{ tooltip: { sx: { fontSize: '1em', maxWidth: '100em' }, } }}
            title={
                <table className="popup-table-participant-info center-tag">
                    <tbody>
                        <tr>
                            <th># {participantId}</th>
                            <td>{participantInfo['full_name']}</td>
                        </tr>
                        <tr>
                            <th>Age range</th>
                            <td>{participantInfo['age_range']}</td>
                        </tr>
                        <tr>
                            <th>Gender</th>
                            <td>{participantInfo['gender']}</td>
                        </tr>
                        <tr>
                            <th>Handedness</th>
                            <td>{participantInfo['hand']}</td>
                        </tr>
                        <tr>
                            <th>Tattoo</th>
                            <td>{participantInfo['tattoo']}</td>
                        </tr>
                        <tr>
                            <th>Demo bin</th>
                            <td>{sessionInfo['demo_bin'] || ""}</td>
                        </tr>

                    </tbody>
                </table>
            }
        >
            <td className="participant-id-cell center-tag">{sessionInfo['participant_id']}</td>
        </Tooltip>
    )
}

export default SessionInfo;