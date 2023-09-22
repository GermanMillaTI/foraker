import { format, parse } from 'date-fns';

const DateFromLog = (rawString) => {
    let formattedKey = "";
    let formattedTime = ""
    let dateString = rawString.substring(0, 6);
    let timeString = rawString.substring(6, 12);

    for (let i = 0; i < dateString.length; i+=2){
        formattedKey += dateString.substring(i, i + 2);
        formattedTime += timeString.substring(i, i + 2);
        if (i + 2 < dateString.length){
            formattedKey += "-";
            formattedTime += ":";
        }
    }
    formattedKey = "20" + formattedKey+ "T"+formattedTime;
    const parsedDate = new Date(formattedKey);
    parsedDate.setHours(parsedDate.getHours() - 7);    

    return format(parsedDate, "yyyy-MM-dd  hh:mm a");
};


const StationFromSlot = (timeslot) => {
    let station = null;
    typeof timeslot !== "undefined" ? 
        timeslot.substring(14) === "101" ? 
            station = "Backup" : 
        station = "St. " + timeslot.substring(14) :
    station = "";

    return station
}

const TimeSlotFormat = (timeslot) => {

    if(typeof timeslot === "undefined") return "";

    let formattedslot = `${timeslot.substring(0, 4)}-${timeslot.substring(4, 6)}-${timeslot.substring(6, 8)}T${timeslot.substring(9, 11)}:${timeslot.substring(11, 13)}`;
    const parsedDate = new Date(formattedslot)
    
    return format(parsedDate, "yyyy-MM-dd hh:mm a");
}

const FormattingFunctions = {
    DateFromLog,
    StationFromSlot,
    TimeSlotFormat
}


export default FormattingFunctions;