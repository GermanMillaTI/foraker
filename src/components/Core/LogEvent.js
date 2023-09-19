import { auth, realtimeDb } from '../../firebase/config';
import { format } from 'date-fns';

function LogEvent(input) {

    let pid, timeslot, action;
    ({ pid, timeslot, action } = input);

    // Create unique log ID
    var dateBasis = new Date();
    var dateString = ("00" + dateBasis.getUTCFullYear()).slice(-2) +
        ("00" + (dateBasis.getUTCMonth() + 1)).slice(-2) +
        ("00" + dateBasis.getUTCDate()).slice(-2) +
        ("00" + dateBasis.getUTCHours()).slice(-2) +
        ("00" + dateBasis.getUTCMinutes()).slice(-2) +
        ("00" + dateBasis.getUTCSeconds()).slice(-2) +
        dateBasis.getUTCMilliseconds();

    const logId = dateString + makeid(1);
    const path = "/log/" + logId;
    const userEmail = auth.currentUser.email;
    const user = userEmail.split("@")[0];

    const data = {
        user: user,
        action: action
    }

    if (pid) data['pid'] = pid;
    if (timeslot) data['timeslot'] = timeslot;

    realtimeDb.ref(path).update(data);
}

function makeid(length) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}


export default LogEvent;