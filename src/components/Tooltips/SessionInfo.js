import React, { useEffect, useState, useRef } from "react";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import './SessionInfo.css';
import Constants from '../Constants';
import FormattingFunctions from '../Core/FormattingFunctions';

function SessionInfo({ database, participantId, sessionId }) {
    const participantInfo = database['participants'][participantId] || {};
    const externalId = participantInfo['external_id'] || "";
    const clientContributons = database['client']['contributions'][externalId] || [];

    var discrepancies = {
        demoBin: false,
        dateOfBirth: false,
        gender: false,
        ethnicity: false,
        visionCorrection: false,
        phase: false
    }

    let clientParticipantInfo = {};
    if (clientContributons.length == 1) {
        clientParticipantInfo = clientContributons[clientContributons.length - 1];
    } else if (clientContributons.length > 1) {
        const telusDate = new Date(sessionId.substring(0, 4) + "-" + sessionId.substring(4, 6) + "-" + sessionId.substring(6, 8) + " " + sessionId.substring(9, 11) + ":" + sessionId.substring(11, 13));

        var diff = 1000000;

        clientContributons.map(contribution => {
            const appleDateRaw = contribution['d'];
            if (appleDateRaw) {
                let appleDate = new Date(appleDateRaw);
                appleDate.setTime(appleDate.getTime() - (7 * 60 * 60 * 1000));

                const diffTime = Math.abs(telusDate - appleDate);
                const diffMinutes = Math.abs(Math.ceil(diffTime / (1000 * 60)));
                if (diffMinutes <= diff) {
                    diff = diffMinutes;
                    clientParticipantInfo = contribution;
                };
            }
        })
    }

    if (clientParticipantInfo !== {} && externalId) {
        // Check if the ppt or the session has different info from the client
        if (participantInfo['demo_bin'] != clientParticipantInfo['db'] && clientParticipantInfo['db']) discrepancies['demoBin'] = true;
        if (participantInfo['date_of_birth'].substring(0, 10) != clientParticipantInfo['b']) discrepancies['dateOfBirth'] = true;
        if (participantInfo['gender'] != clientParticipantInfo['g']) discrepancies['gender'] = true;
        if (participantInfo['ethnicities'] != clientParticipantInfo['e']) discrepancies['ethnicity'] = true;
        if (participantInfo['vision_correction'] != clientParticipantInfo['v'] && clientParticipantInfo['v']) discrepancies['visionCorrection'] = true;
        if (participantInfo['phase'] != clientParticipantInfo['p'] && clientParticipantInfo['p']) discrepancies['phase'] = true;
    }
    var discrepancy = Object.values(discrepancies).includes(true);

    return (
        <Tooltip
            disableInteractive
            TransitionProps={{ timeout: 100 }}
            componentsProps={{ tooltip: { sx: { fontSize: '1em', maxWidth: '100em' }, } }}
            title={
                <table className="popup-table-participant-info center-tag">
                    {externalId && <thead>
                        <tr>
                            <th>Property</th>
                            <th>Telus</th>
                            {externalId && <th>Apple</th>}
                        </tr>
                    </thead>}
                    <tbody>
                        {externalId && <tr>
                            <th>ID</th>
                            <td>{participantId}</td>
                            {externalId && <td>{externalId || ""}</td>}
                        </tr>}
                        <tr className={discrepancies['demoBin'] ? "session-item-discrepancy" : ""}>
                            <th>Demo bin</th>
                            <td>{participantInfo['demo_bin'] || ""}</td>
                            {externalId && <td>{clientParticipantInfo['db'] || ""}</td>}
                        </tr>
                        <tr className={discrepancies['dateOfBirth'] ? "session-item-discrepancy" : ""}>
                            <th>Date of birth</th>
                            <td>{participantInfo['date_of_birth'].substring(0, 10)}</td>
                            {externalId && <td>{clientParticipantInfo['b'] || ""}</td>}
                        </tr>
                        <tr className={discrepancies['gender'] ? "session-item-discrepancy" : ""}>
                            <th>Gender</th>
                            <td>{participantInfo['gender']}</td>
                            {externalId && <td>{clientParticipantInfo['g'] || ""}</td>}
                        </tr>
                        <tr className={discrepancies['ethnicity'] ? "session-item-discrepancy" : ""}>
                            <th>Ethnicity</th>
                            <td>{participantInfo['ethnicities']}</td>
                            {externalId && <td>{clientParticipantInfo['e'] || ""}</td>}
                        </tr>
                        <tr className={discrepancies['visionCorrection'] ? "session-item-discrepancy" : ""}>
                            <th>Vision corr.</th>
                            <td>{participantInfo['vision_correction']}</td>
                            {externalId && <td>{clientParticipantInfo['v'] || ""}</td>}
                        </tr>
                        <tr className={discrepancies['phase'] ? "session-item-discrepancy" : ""}>
                            <th>Phase</th>
                            <td>{participantInfo['phase'] ? "Phase " + participantInfo['phase'] : ""}</td>
                            {externalId && <td>{clientParticipantInfo['p'] ? "Phase " + clientParticipantInfo['p'] : ""}</td>}
                        </tr>
                        <tr>
                            <th>Date of info</th>
                            <td>Realtime</td>
                            {externalId && <td>{FormattingFunctions.ClientTimeslotFormat(clientParticipantInfo['d'])}</td>}
                        </tr>

                        {clientContributons.length > 0 && <>
                            <tr colSpan="3">
                                <td>&nbsp;</td>
                            </tr>
                            <tr colSpan="3">
                                <td>&nbsp;</td>
                            </tr>
                            <tr>
                                <th>Day</th>
                                <th>Telus</th>
                                <th>Apple</th>
                            </tr>
                            {clientContributons.map(contribution => {
                                const appleContributionDate = FormattingFunctions.ClientTimeslotFormat(contribution['d']);
                                const appleContributionStatus = Constants['clientContributionStatuses'][contribution['s']];
                                const telusContributions = participantInfo['sessions'];
                                const sameDayTelusContribution = (Object.keys(telusContributions).filter(sessionId => sessionId.startsWith(appleContributionDate.substring(0, 10).replaceAll("-", ""))) || [])[0];
                                const sameDayTelusContributionDate = FormattingFunctions.TimeSlotFormat(sameDayTelusContribution);
                                const sameDayTelusContributionStatus = sameDayTelusContribution ? database['timeslots'][sameDayTelusContribution]['status'] : "";

                                return <tr>
                                    <th>{appleContributionDate.substring(0, 11)}</th>
                                    <td>{sameDayTelusContributionDate.substring(11) + ": " + sameDayTelusContributionStatus}</td>
                                    <td>{appleContributionDate.substring(11) + ": " + appleContributionStatus}</td>
                                </tr>
                            })}
                        </>
                        }

                    </tbody>
                </table>
            }
        >
            <td className={"center-tag" + (discrepancy ? " session-discrepancy" : "")}>{database['timeslots'][sessionId]['participant_id']}</td>
        </Tooltip>
    )
}

export default SessionInfo;