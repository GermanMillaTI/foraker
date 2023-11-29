import { format } from 'date-fns';

const CalculateSessionProtocol = (database, timeslotId) => {
    const todayNumber = parseInt(format(new Date(), "yyyyMMdd"));
    if (parseInt(timeslotId.substring(0, 8)) != todayNumber) return;

    const participants = database["participants"];
    const timeslots = database["timeslots"];

    // This dictionary is to store the first protocol of the given participant
    var firstProtocols = {};

    // Get the number of the different session protocols / demo bins
    var demoBins = {};
    Object.keys(timeslots).map(timeslotId => {
        const timeslot = timeslots[timeslotId];
        const participantId = timeslot['participant_id'];
        const sessionStatus = timeslot['status'];
        const sessionOutcome = timeslot['session_outcome'];
        const sessionProtocol = timeslot['session_protocol'];
        if (!participantId ||
            sessionOutcome == 'Incomplete - Redo' ||
            !['Scheduled', 'Checked In', 'Completed'].includes(sessionStatus) ||
            !sessionProtocol
        ) return;

        // Fill up the dictionary of the first protocols / participants
        if (!Object.keys(firstProtocols).includes(participantId)) firstProtocols[participantId] = sessionProtocol;

        const demoBin = participants[participantId]['demo_bin'];
        if (demoBin.includes(',') || demoBin.includes('#NA')) return;

        if (!demoBins[demoBin]) demoBins[demoBin] = {
            "Apple TV Only": 0,
            "Random Activity": 0
        }

        demoBins[demoBin][sessionProtocol]++;

    })

    const timeslot = timeslots[timeslotId];
    const participantId = timeslot['participant_id'];
    const sessionProtocol = timeslot['session_protocol'];
    if (!participantId || sessionProtocol) return;

    const lastCharacter = parseInt(participantId.substring(7));
    const demoBin = participants[participantId]['demo_bin'];
    var protocolToSet = "";

    const firstProtocol = firstProtocols[participantId];
    if (firstProtocol) {
        // Set the protocol to the opposite of the first one
        protocolToSet = firstProtocol == "Apple TV Only" ? "Random Activity" : "Apple TV Only";
    } else {
        if (demoBin.includes(',') || demoBin.includes('#NA')) {
            // Set the protocol if the demo bin is unclear...
            if (lastCharacter % 2 == 0) {
                protocolToSet = "Apple TV Only";
            } else {
                protocolToSet = "Random Activity";
            }
        } else {
            // Set the protocol if it's the first session and the demo bin is clear
            if (!demoBins[demoBin]) demoBins[demoBin] = {
                "Apple TV Only": 0,
                "Random Activity": 0
            }

            const ATV = demoBins[demoBin]['Apple TV Only'];
            const RA = demoBins[demoBin]['Random Activity'];
            if (ATV == RA) {
                if (lastCharacter % 2 == 0) {
                    protocolToSet = 'Apple TV Only';
                    demoBins[demoBin]['Apple TV Only']++;
                } else {
                    protocolToSet = 'Random Activity';
                    demoBins[demoBin]['Random Activity']++;
                }
            } else if (ATV > RA) {
                protocolToSet = 'Random Activity';
                demoBins[demoBin]['Random Activity']++;
            } else if (ATV < RA) {
                protocolToSet = 'Apple TV Only';
                demoBins[demoBin]['Apple TV Only']++;
            }
        }
    }

    if (!protocolToSet) return;
    //console.log("Timeslot: " + timeslotId + " >> " + protocolToSet + ", (demo bin: " + demoBin + ")");

    return protocolToSet;
}


export default CalculateSessionProtocol;