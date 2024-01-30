import React from "react";
import { useState, useEffect, useReducer } from 'react';

import './ParticipantFilter.css';
import Constants from './Constants';

const filterReducer = (state, event) => {
  // If the filter is called from stats
  if (event.fromStats) return event;

  if (event.target.name == "resetFilter") {
    return {
      genders: Constants['genders'],
      ageRanges: Constants['listOfAgeRanges'],
      statuses: ["Blank", ...Constants['participantStatuses']],
      icfs: ['Yes', 'No'],
      demoBinStatuses: Constants['demoBinStatuses'],
      highlighted: ['Yes', 'No'],
      skinTones: Constants['skinTone'],
      hairlength: Constants['hairlength'],
      weightRanges: Constants['listOfWeights'],
      heightRanges: Constants['listOfHeights']
    }
  }

  let newState = JSON.parse(JSON.stringify(state));
  if (event.target.tagName == "BUTTON") {
    // Use this to 'filter only...'
    let value = event.target.name;
    let arrayName = event.target.getAttribute('alt');
    newState[arrayName] = [value];
    return newState;
  } else if (event.target.type == "checkbox") {
    let filterValue = event.target.name;
    let checked = event.target.checked;
    let filterType = event.target.alt;
    if (checked && !newState[filterType].includes(filterValue)) {
      newState[filterType].push(filterValue);
    } else if (!checked && state[filterType].includes(filterValue)) {
      const index = newState[filterType].indexOf(filterValue);
      newState[filterType].splice(index, 1);
    }
  }

  if (event.target.type == "text" || event.target.type == "number") {
    let filterName = event.target.name;
    let filterValue = event.target.value.toLowerCase();

    if (['email'].includes(filterName)) filterValue = filterValue.trim();

    if (filterValue == "") {
      if (newState[filterName]) delete newState[filterName];
    } else {
      newState[filterName] = filterValue;
    }
  }

  if (event.target.type == "date") {
    let filterName = event.target.name;
    let filterValue = event.target.value;
    if (filterValue == "") {
      if (newState[filterName]) delete newState[filterName];
    } else {
      newState[filterName] = filterValue;
    }
  }

  return newState;
}


function ParticipantFilter({ database, setShownParticipants, filterDataFromStats, setFilterDataFromStats }) {
  const [filterStats, setFilterStats] = useState(resetFilterStats());
  const [filterData, setFilterData] = useReducer(filterReducer, {
    genders: Constants['genders'],
    ageRanges: Constants['listOfAgeRanges'],
    statuses: ["Blank", ...Constants['participantStatuses']],
    icfs: ['Yes', 'No'],
    demoBinStatuses: Constants['demoBinStatuses'],
    highlighted: ['Yes', 'No'],
    skinTones: Constants['skinTone'],
    hairlength: Constants['hairlength'],
    weightRanges: Constants['listOfWeights'],
    heightRanges: Constants['listOfHeights']
  });

  useEffect(() => {
    if (filterDataFromStats) {
      setFilterData(filterDataFromStats);
      setFilterDataFromStats(false);
    }
  }, [filterDataFromStats])


  function resetFilterStats() {
    return {
      ageRanges: Object.assign({}, ...[...['<18', ...Constants['listOfAgeRanges']]].map(k => ({ [k]: 0 }))),
      genders: Object.assign({}, ...Constants['genders'].map(k => ({ [k]: 0 }))),
      statuses: Object.assign({}, ...Constants['participantStatuses'].map(k => ({ [k || "Blank"]: 0 }))),
      icfs: { Yes: 0, No: 0 },
      demoBinStatuses: Object.assign({}, ...Constants['demoBinStatuses'].map(k => ({ [k]: 0 }))),
      skinTones: Object.assign({}, ...Constants['skinTone'].map(k => ({ [k]: 0 }))),
      highlighted: { 'Yes': 0, 'No': 0 },
      hairlength: Object.assign({}, ...Constants['hairlength'].map(k => ({ [k]: 0 }))),
      weightRanges: Object.assign({}, ...Constants['listOfWeights'].map(k => ({ [k]: 0 }))),
      heightRanges: Object.assign({}, ...Constants['listOfHeights'].map(k => ({ [k]: 0 }))),
    }
  }

  function filterFunction(participantId) {
    let participantInfo = database['participants'][participantId];

    // Check if the participant data is imported, not just the ICF which could generate issue...
    // It's required because Formsite doesn't export the data sometimes...
    if (!participantInfo['date']) return false;
    let firstName = participantInfo['first_name'].toLowerCase();
    let lastName = participantInfo['last_name'].toLowerCase();
    let gender = participantInfo['gender'];
    let ageRange = participantInfo['age_range'];
    let weightRange = participantInfo['weight_range'];
    let heightRange = participantInfo['height_range'];
    let email = participantInfo['email'].toLowerCase();
    let phone = participantInfo['phone'].toLowerCase();
    let demoBinStatus = participantInfo['open_demo_bin'] ? 'Open' : 'Closed';
    let highlighted = participantInfo['highlighted'] ? 'Yes' : 'No';

    // Check date of registration
    let dateOk = true;
    let dateOfRegistration;
    let dateFrom = filterData['dateOfRegistrationFrom'];
    let dateTo = filterData['dateOfRegistrationTo'];
    if (dateFrom) {
      dateOfRegistration = new Date(participantInfo['date']);
      dateFrom = new Date(dateFrom);
      if (dateOfRegistration < dateFrom) {
        dateOk = false;
      }
    }
    if (dateTo) {
      if (!dateOfRegistration) dateOfRegistration = new Date(participantInfo['date']);
      dateTo = new Date(dateTo);
      dateTo.setDate(dateTo.getDate() + 1)
      if (dateOfRegistration > dateTo) {
        dateOk = false;
      }
    }

    // Check date of sessions
    let sessionDateOk = true;
    let sessionDate;
    let sessionDateFrom = filterData['dateOfSessionsFrom'];
    let sessionDateTo = filterData['dateOfSessionsTo'];

    if (sessionDateFrom || sessionDateTo) {
      sessionDateOk = false;
      Object.keys(participantInfo['sessions'] || {}).map(sessionId => {
        if (sessionDateOk) return;

        if (sessionDateFrom) {
          sessionDate = new Date(sessionId.substring(0, 4) + "-" + sessionId.substring(4, 6) + "-" + sessionId.substring(6, 8));
          sessionDateFrom = new Date(sessionDateFrom);
          sessionDateOk = sessionDate >= sessionDateFrom;
        }
        if (sessionDateTo) {
          if (!sessionDate) sessionDate = new Date(sessionId.substring(0, 4) + "-" + sessionId.substring(4, 6) + "-" + sessionId.substring(6, 8));
          sessionDateTo = new Date(sessionDateTo);
          //sessionDateTo.setDate(sessionDateTo.getDate() + 1)
          sessionDateOk = sessionDate <= sessionDateTo && (sessionDateFrom ? sessionDate >= sessionDateFrom : true);
        }
      })
    }

    let icfSigned = participantInfo['icf'] ? "Yes" : "No";
    let icfSignedIsOk = filterData['icfs'].includes(icfSigned);
    let status = participantInfo['status'] || "Blank";
    let skinTone = participantInfo['skinTone'];
    let hairlength = participantInfo['haiLength'];

    return dateOk &&
      sessionDateOk &&
      filterData['genders'].includes(gender) &&
      filterData['ageRanges'].includes(ageRange) &&
      filterData['weightRanges'].includes(weightRange) &&
      filterData['heightRanges'].includes(heightRange) &&
      icfSignedIsOk &&
      filterData['statuses'].includes(status) &&
      filterData['skinTones'].includes(skinTone) &&
      filterData['hairlength'].includes(hairlength) &&
      filterData['demoBinStatuses'].includes(demoBinStatus) &&
      filterData['highlighted'].includes(highlighted) &&
      (!filterData['participantId'] || participantId.includes(filterData['participantId'])) &&
      (!filterData['firstName'] || firstName.includes(filterData['firstName'].trim())) &&
      (!filterData['lastName'] || lastName.includes(filterData['lastName'].trim())) &&
      (!filterData['email'] || email.includes(filterData['email'].trim())) &&
      (!filterData['phone'] || phone.includes(filterData['phone'].trim()));
  }


  useEffect(() => {
    let tempShown = JSON.parse(JSON.stringify(Object.keys(database['participants']).filter(pid => filterFunction(pid))));
    setShownParticipants(tempShown);

    // Reset filterstats
    let defaultFilterStats = resetFilterStats();
    let output = JSON.parse(JSON.stringify(defaultFilterStats));

    tempShown.map(participantId => {
      let participantInfo = database['participants'][participantId];
      let gender = participantInfo['gender'];
      let ageRange = participantInfo['age_range'];
      let heightRange = participantInfo['height_range'];
      let weightRange = participantInfo['weight_range'];
      let demoBinStatus = participantInfo['open_demo_bin'] ? 'Open' : 'Closed';
      let highlighted = participantInfo['highlighted'] ? 'Yes' : 'No';

      let icfSigned = participantInfo['icf'] ? "Yes" : "No";
      let status = participantInfo['status'] || "Blank";
      let skinTone = participantInfo['skinTone'];
      let hairlength = participantInfo['haiLength'];

      output['genders'][gender]++;
      output['demoBinStatuses'][demoBinStatus]++;
      output['ageRanges'][ageRange]++;
      output['weightRanges'][weightRange]++;
      output['heightRanges'][heightRange]++;
      output['icfs'][icfSigned]++;
      output['statuses'][status]++;
      output['skinTones'][skinTone]++;
      output['hairlength'][hairlength]++;
      output['highlighted'][highlighted]++;
    })
    setFilterStats(output);
  }, [filterData])

  return (<div className="filter-main-container">

    <div className="filter-container">
      <span className="filter-container-header">Filter</span>
      <div className="filter-element">
        <input name="participantId" type="number" placeholder="Participant ID" className="main-input" autoComplete="off" onChange={setFilterData} value={filterData['participantId'] || ""} />
      </div>
      <div className="filter-element">
        <input name="firstName" type="text" placeholder="First name" className="main-input" autoComplete="off" onChange={setFilterData} value={filterData['firstName'] || ""} />
      </div>
      <div className="filter-element">
        <input name="lastName" type="text" placeholder="Last name" className="main-input" autoComplete="off" onChange={setFilterData} value={filterData['lastName'] || ""} />
      </div>
      <div className="filter-element">
        <input name="email" type="text" placeholder="E-mail" className="main-input" autoComplete="off" onChange={setFilterData} value={filterData['email'] || ""} />
      </div>
      <div className="filter-element">
        <input name="phone" type="text" placeholder="Phone" className="main-input" autoComplete="off" onChange={setFilterData} value={filterData['phone'] || ""} />
      </div>
      <div className="filter-element gap">
        <span>Date of registration</span>
        <input name="dateOfRegistrationFrom" type="date" className="main-input" onChange={setFilterData} min="2023-04-14" max="2024-12-31" value={filterData['dateOfRegistrationFrom'] || ""} />
      </div>
      <div className="filter-element">
        <input name="dateOfRegistrationTo" type="date" className="main-input" onChange={setFilterData} min="2023-04-15" max="2024-12-31" value={filterData['dateOfRegistrationTo'] || ""} />
      </div>
      <div className="filter-element gap">
        <span>Date of session(s)</span>
        <input name="dateOfSessionsFrom" type="date" className="main-input" onChange={setFilterData} min="2023-04-14" max="2024-12-31" value={filterData['dateOfSessionsFrom'] || ""} />
      </div>
      <div className="filter-element">
        <input name="dateOfSessionsTo" type="date" className="main-input" onChange={setFilterData} min="2023-04-15" max="2024-12-31" value={filterData['dateOfSessionsTo'] || ""} />
      </div>
      <div className="filter-element">
        <button name="resetFilter" className="reset-filter-button" onClick={setFilterData}>Reset filter</button>
      </div>
    </div>

    <div className="filter-container">
      <div className="filter-element">
        <span className="filter-container-header">Age range</span>
        {[...['<18', ...Constants['listOfAgeRanges']]].map((val, i) => {
          return <div key={"filter-age" + i} className="filter-object">
            <input id={"filter-" + val} name={val} type="checkbox" alt="ageRanges" onChange={setFilterData} checked={filterData['ageRanges'].includes(val)} />
            <label htmlFor={"filter-" + val}>{val + " (" + filterStats['ageRanges'][val] + ")"}</label>
            <button name={val} alt="ageRanges" className="filter-this-button" onClick={setFilterData}>!</button>
          </div>
        })}
      </div>

    </div>

    <div className="filter-container">
      <div className="filter-element">
        <span className="filter-container-header">Height range (cm)</span>
        {Constants['listOfHeights'].map((val, i) => {
          return <div key={"filter-height" + i} className="filter-object">
            <input id={"filter-" + val} name={val} type="checkbox" alt="heightRanges" onChange={setFilterData} checked={filterData['heightRanges'].includes(val)} />
            <label htmlFor={"filter-" + val}>{val + " (" + filterStats['heightRanges'][val] + ")"}</label>
            <button name={val} alt="heightRanges" className="filter-this-button" onClick={setFilterData}>!</button>
          </div>
        })}
      </div>

      <div className="filter-element gap">
        <span className="filter-container-header">Weight range (kg)</span>
        {Constants['listOfWeights'].map((val, i) => {
          return <div key={"filter-weight" + i} className="filter-object">
            <input id={"filter-" + val} name={val} type="checkbox" alt="weightRanges" onChange={setFilterData} checked={filterData['weightRanges'].includes(val)} />
            <label htmlFor={"filter-" + val}>{val + " (" + filterStats['weightRanges'][val] + ")"}</label>
            <button name={val} alt="weightRanges" className="filter-this-button" onClick={setFilterData}>!</button>
          </div>
        })}
      </div>
    </div>

    <div className="filter-container">
      <div className="filter-element">
        <span className="filter-container-header">Skin tones</span>
        {Constants['skinTone'].map((val, i) => {
          return <div key={"filter-skinTones" + i} className="filter-object">
            <input id={"filter-" + val} name={val} type="checkbox" alt="skinTones" onChange={setFilterData} checked={filterData['skinTones'].includes(val)} />
            <label htmlFor={"filter-" + val}>{val + " (" + filterStats['skinTones'][val] + ")"}</label>
            <button name={val} alt="skinTones" className="filter-this-button" onClick={setFilterData}>!</button>
          </div>
        })}
      </div>
    </div>
    <div className="filter-container">

      <div className="filter-element">
        <span className="filter-container-header">Hair Length</span>
        {Constants['hairlength'].map((val, i) => {
          return <div key={"filter-hairlength" + i} className="filter-object">
            <input id={"filter-" + val} name={val} type="checkbox" alt="hairlength" onChange={setFilterData} checked={filterData['hairlength'].includes(val)} />
            <label htmlFor={"filter-" + val}>{val + " (" + filterStats['hairlength'][val] + ")"}</label>
            <button name={val} alt="hairlength" className="filter-this-button" onClick={setFilterData}>!</button>
          </div>
        })}
      </div>

      <div className="filter-element gap">
        <span className="filter-container-header">Gender</span>
        {Constants['genders'].map((val, i) => {
          return <div key={"filter-gender" + i} className="filter-object">
            <input id={"filter-" + val} name={val} type="checkbox" alt="genders" onChange={setFilterData} checked={filterData['genders'].includes(val)} />
            <label htmlFor={"filter-" + val}>{val + " (" + filterStats['genders'][val] + ")"}</label>
            <button name={val} alt="genders" className="filter-this-button" onClick={setFilterData}>!</button>
          </div>
        })}
      </div>
    </div>

    <div className="filter-container">
      <div className="filter-element">
        <span className="filter-container-header">Status</span>
        {Constants['participantStatuses'].map((val, i) => {
          return <div key={"filter-status" + i} className="filter-object">
            <input id={"filter-participant-status-" + (val || "Blank")} name={val || "Blank"} type="checkbox" alt="statuses" onChange={setFilterData} checked={val == "" ? filterData['statuses'].includes("Blank") : filterData['statuses'].includes(val)} />
            <label htmlFor={"filter-participant-status-" + (val || "Blank")}>{(val || "Blank") + " (" + filterStats['statuses'][val || "Blank"] + ")"}</label>
            <button name={val || "Blank"} alt="statuses" className="filter-this-button" onClick={setFilterData}>!</button>
          </div>
        })}
      </div>
    </div>



    <div className="filter-container">
      <div className="filter-element">
        <span className="filter-container-header">ICF signed</span>
        <div className="filter-object">
          <input id="filter-icf-yes" name="Yes" type="checkbox" alt="icfs" onChange={setFilterData} checked={filterData['icfs'].includes('Yes')} />
          <label htmlFor="filter-icf-yes">Yes ({filterStats['icfs']['Yes']})</label>
          <button name={"Yes"} alt="icfs" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
        <div className="filter-object">
          <input id="filter-icf-no" name="No" type="checkbox" alt="icfs" onChange={setFilterData} checked={filterData['icfs'].includes('No')} />
          <label htmlFor="filter-icf-no">No ({filterStats['icfs']['No']})</label>
          <button name={"No"} alt="icfs" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
      </div>
    </div>

    <div className="filter-container">
      <div className="filter-element">
        <span className="filter-container-header">Demo bin status</span>
        {Constants['demoBinStatuses'].map((val, i) => {
          return <div key={"filter-demo-bin-status" + i} className="filter-object">
            <input id={"filter-demo-bin-status-" + val} name={val} type="checkbox" alt="demoBinStatuses" onChange={setFilterData} checked={filterData['demoBinStatuses'].includes(val)} />
            <label htmlFor={"filter-demo-bin-status-" + val}>{val + " (" + filterStats['demoBinStatuses'][val] + ")"}</label>
            <button name={val} alt="demoBinStatuses" className="filter-this-button" onClick={setFilterData}>!</button>
          </div>
        })}
      </div>
    </div>

    <div className="filter-container">
      <div className="filter-element">
        <span className="filter-container-header">Highlighted</span>
        <div className={"filter-object" + (filterStats['highlighted']['Yes'] > 0 ? " red-highlighted-filter" : "")}>
          <input id="filter-highlighted-yes" name="Yes" type="checkbox" alt="highlighted" onChange={setFilterData} checked={filterData['highlighted'].includes('Yes')} />
          <label htmlFor="filter-highlighted-yes">Yes ({filterStats['highlighted']['Yes']})</label>
          <button name={"Yes"} alt="highlighted" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
        <div className="filter-object">
          <input id="filter-highlighted-no" name="No" type="checkbox" alt="highlighted" onChange={setFilterData} checked={filterData['highlighted'].includes('No')} />
          <label htmlFor="filter-highlighted-no">No ({filterStats['highlighted']['No']})</label>
          <button name={"No"} alt="highlighted" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
      </div>
    </div>
  </div >);
}

export default ParticipantFilter;

