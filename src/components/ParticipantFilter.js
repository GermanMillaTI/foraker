import React from "react";
import { useState, useEffect, useReducer } from 'react';

import './ParticipantFilter.css';
import Constants from './Constants';

const filterReducer = (state, event) => {
  // If the filter is called from stats
  if (event.fromStats) return event;

  if (event.target.name == "resetFilter") {
    return {
      ethnicities: Constants['ethnicities'],
      multipleEthnicities: ['Yes', 'No'],
      genders: Constants['genders'],
      ageRanges: Constants['listOfAgeRanges'],
      statuses: ["Blank", ...Constants['participantStatuses']],
      icfs: ['Yes', 'No'],
      demoBinStatuses: Constants['demoBinStatuses'],
      sources: Object.keys(Constants['sources']),
      documentStatuses: ["Blank", ...Constants['documentStatuses']],
      visionCorrections: Constants['visionCorrections'],
      parentRegistered: ['Yes', 'No'],
      newDocuments: ['Yes', 'No'],
      highlighted: ['Yes', 'No'],
      stillInterested: ['Yes', 'No', 'N/A'],
      unsubscribed: ['Yes', 'No'],
      unreadEmails: ['Yes', 'No'],
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

    if (['externalId', 'email'].includes(filterName)) filterValue = filterValue.trim();

    if (filterName == "externalId") {
      filterValue = filterValue.replaceAll("tl_", "TL_").replaceAll("Tl_", "TL_").replaceAll("tL_", "TL_");
    }
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
    ethnicities: Constants['ethnicities'],
    multipleEthnicities: ['Yes', 'No'],
    genders: Constants['genders'],
    ageRanges: Constants['listOfAgeRanges'],
    statuses: ["Blank", ...Constants['participantStatuses']],
    icfs: ['Yes', 'No'],
    demoBinStatuses: Constants['demoBinStatuses'],
    sources: Object.keys(Constants['sources']),
    documentStatuses: ["Blank", ...Constants['documentStatuses']],
    visionCorrections: Constants['visionCorrections'],
    parentRegistered: ['Yes', 'No'],
    newDocuments: ['Yes', 'No'],
    highlighted: ['Yes', 'No'],
    stillInterested: ['Yes', 'No', 'N/A'],
    unsubscribed: ['Yes', 'No'],
    unreadEmails: ['Yes', 'No']
  });

  useEffect(() => {
    if (filterDataFromStats) {
      setFilterData(filterDataFromStats);
      setFilterDataFromStats(false);
    }
  }, [filterDataFromStats])


  function resetFilterStats() {
    return {
      ethnicities: Object.assign({}, ...Constants['ethnicities'].map(k => ({ [k]: 0 }))),
      multipleEthnicities: { 'Yes': 0, 'No': 0 },
      ageRanges: Object.assign({}, ...[...['<18', ...Constants['listOfAgeRanges']], ...['75+']].map(k => ({ [k]: 0 }))),
      genders: Object.assign({}, ...Constants['genders'].map(k => ({ [k]: 0 }))),
      statuses: Object.assign({}, ...Constants['participantStatuses'].map(k => ({ [k || "Blank"]: 0 }))),
      icfs: { Yes: 0, No: 0 },
      demoBinStatuses: Object.assign({}, ...Constants['demoBinStatuses'].map(k => ({ [k]: 0 }))),
      sources: Object.assign({}, ...Object.keys(Constants['sources']).map(k => ({ [k]: 0 }))),
      documentStatuses: Object.assign({}, ...Constants['documentStatuses'].map(k => ({ [k || "Blank"]: 0 }))),
      visionCorrections: Object.assign({}, ...Constants['visionCorrections'].map(k => ({ [k]: 0 }))),
      parentRegistered: { Yes: 0, No: 0 },
      newDocuments: { Yes: 0, No: 0 },
      highlighted: { 'Yes': 0, 'No': 0 },
      stillInterested: { 'Yes': 0, 'No': 0, 'N/A': 0 },
      unsubscribed: { 'Yes': 0, 'No': 0 },
      unreadEmails: { 'Yes': 0, 'No': 0 }
    }
  }

  let unreadItems = database['mailbox_unread']['items'].split(", ");

  function filterFunction(participantId) {
    let participantInfo = database['participants'][participantId];
    unreadItems.includes(participantId) ? participantInfo['unread_emails'] = 'Yes'
      : participantInfo['unread_emails'] = 'No'

    // Check if the participant data is imported, not just the ICF which could generate issue...
    // It's required because Formsite doesn't export the data sometimes...
    if (!participantInfo['date']) return false;

    let parentRegistered = participantInfo['parent_first_name'] ? "Yes" : "No";
    let firstName = participantInfo['first_name'].toLowerCase();
    let lastName = participantInfo['last_name'].toLowerCase();
    let gender = participantInfo['gender'];
    let email = participantInfo['email'].toLowerCase();
    let phone = participantInfo['phone'].toLowerCase();
    let visionCorrection = participantInfo['vision_correction'];
    let source = participantInfo['source'] || 'Other';
    let demoBinStatus = participantInfo['open_demo_bin'] ? 'Open' : 'Closed';
    let highlighted = participantInfo['highlighted'] ? 'Yes' : 'No';
    let stillInterested = participantInfo['still_interested'] == 'Yes' ? 'Yes' : participantInfo['still_interested'] == 'No' ? 'No' : 'N/A';
    let unsubscribed = participantInfo['unsubscribed_comms'] == 'Yes' ? 'Yes' : 'No';
    let unreadEmails = participantInfo['unread_emails'] == "Yes" ? "Yes" : "No";
    let externalId = participantInfo['external_id'] || "";

    let ageRange = participantInfo['age_range'];

    let ethnicity = participantInfo['ethnicities'];
    let ethnicities = ethnicity.split(',');
    let multipleEthnicities = ethnicities.length > 1 ? "Yes" : "No";
    var ethnicityOk = false;
    ethnicities.map(eth => {
      if (!ethnicityOk && filterData['ethnicities'].includes(eth.trim())) ethnicityOk = true;
    })

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
    let documentStatus = participantInfo['document_approval'] || "Blank";
    let hasNewDocument = participantInfo['documents']['pending'] ? "Yes" : "No";

    return ethnicityOk &&
      dateOk &&
      sessionDateOk &&
      filterData['multipleEthnicities'].includes(multipleEthnicities) &&
      filterData['genders'].includes(gender) &&
      filterData['ageRanges'].includes(ageRange) &&
      filterData['visionCorrections'].includes(visionCorrection) &&
      icfSignedIsOk &&
      filterData['statuses'].includes(status) &&
      filterData['demoBinStatuses'].includes(demoBinStatus) &&
      filterData['sources'].includes(source) &&
      filterData['documentStatuses'].includes(documentStatus) &&
      filterData['parentRegistered'].includes(parentRegistered) &&
      filterData['newDocuments'].includes(hasNewDocument) &&
      filterData['highlighted'].includes(highlighted) &&
      filterData['stillInterested'].includes(stillInterested) &&
      filterData['unsubscribed'].includes(unsubscribed) &&
      filterData['unreadEmails'].includes(unreadEmails) &&
      (!filterData['participantId'] || participantId.includes(filterData['participantId'])) &&
      (!filterData['firstName'] || firstName.includes(filterData['firstName'].trim())) &&
      (!filterData['lastName'] || lastName.includes(filterData['lastName'].trim())) &&
      (!filterData['email'] || email.includes(filterData['email'].trim())) &&
      (!filterData['phone'] || phone.includes(filterData['phone'].trim())) &&
      (!filterData['externalId'] || externalId.includes(filterData['externalId'].trim()));
  }


  useEffect(() => {
    let tempShown = JSON.parse(JSON.stringify(Object.keys(database['participants']).filter(pid => filterFunction(pid))));
    setShownParticipants(tempShown);

    // Reset filterstats
    let defaultFilterStats = resetFilterStats();
    let output = JSON.parse(JSON.stringify(defaultFilterStats));

    tempShown.map(pid => {
      let participantInfo = database['participants'][pid];
      let gender = participantInfo['gender'];
      let ageRange = participantInfo['age_range'];
      let visionCorrection = participantInfo['vision_correction'];
      let parentRegistered = participantInfo['parent_first_name'] ? "Yes" : "No";
      let hasNewDocument = participantInfo['documents']['pending'] ? "Yes" : "No";
      let demoBinStatus = participantInfo['open_demo_bin'] ? 'Open' : 'Closed';
      let source = participantInfo['source'] || 'Other';
      let highlighted = participantInfo['highlighted'] ? 'Yes' : 'No';
      let stillInterested = participantInfo['still_interested'] == 'Yes' ? 'Yes' : participantInfo['still_interested'] == 'No' ? 'No' : 'N/A';
      let unsubscribed = participantInfo['unsubscribed_comms'] == 'Yes' ? 'Yes' : 'No';
      let unreadEmails = participantInfo['unread_emails'] == "Yes" ? "Yes" : "No";
      let ethnicities = participantInfo['ethnicities'].split(',');
      let multipleEthnicities = ethnicities.length > 1 ? "Yes" : "No";
      ethnicities.map((eth) => {
        output['ethnicities'][eth]++;
      })

      let icfSigned = participantInfo['icf'] ? "Yes" : "No";
      let status = participantInfo['status'] || "Blank";
      let documentStatus = participantInfo['document_approval'] || "Blank";

      output['multipleEthnicities'][multipleEthnicities]++;
      output['genders'][gender]++;
      output['demoBinStatuses'][demoBinStatus]++;
      output['sources'][source]++;
      output['visionCorrections'][visionCorrection]++;
      output['ageRanges'][ageRange]++;
      output['icfs'][icfSigned]++;
      output['statuses'][status]++;
      output['documentStatuses'][documentStatus]++;
      output['parentRegistered'][parentRegistered]++;
      output['newDocuments'][hasNewDocument]++;
      output['highlighted'][highlighted]++;
      output['stillInterested'][stillInterested]++;
      output['unsubscribed'][unsubscribed]++;
      output['unreadEmails'][unreadEmails]++;
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
        <input name="externalId" type="text" maxLength="9" placeholder="External ID (TL_......)" className="main-input" autoComplete="off" onChange={setFilterData} value={filterData['externalId'] || ""} />
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
        <input name="dateOfSessionsFrom" type="date" className="main-input" onChange={setFilterData} min="2023-07-13" max="2024-12-31" value={filterData['dateOfSessionsFrom'] || ""} />
      </div>
      <div className="filter-element">
        <input name="dateOfSessionsTo" type="date" className="main-input" onChange={setFilterData} min="2023-07-13" max="2024-12-31" value={filterData['dateOfSessionsTo'] || ""} />
      </div>
      <div className="filter-element">
        <button name="resetFilter" className="reset-filter-button" onClick={setFilterData}>Reset filter</button>
      </div>
    </div>

    <div className="filter-container">
      <div className="filter-element">
        <span className="filter-container-header">Ethnicity</span>
        {Constants['ethnicities'].map((val, i) => {
          return <div key={"filter-eth" + i} className="filter-object">
            <input id={"filter-" + val} name={val} type="checkbox" alt="ethnicities" onChange={setFilterData} checked={filterData['ethnicities'].includes(val) ? true : false} />
            <label htmlFor={"filter-" + val}>{(val.length > 30 ? val.substring(0, 30) + '...' : val) + " (" + filterStats['ethnicities'][val] + ")"}</label>
            <button name={val} alt="ethnicities" className="filter-this-button" onClick={setFilterData}>!</button>
          </div>
        })}
      </div>

      <div className="filter-element gap">
        <span className="filter-container-header">Multiple ethnicities</span>
        <div className="filter-object">
          <input id="filter-multiple-ethnicities-yes" name="Yes" type="checkbox" alt="multipleEthnicities" onChange={setFilterData} checked={filterData['multipleEthnicities'].includes('Yes')} />
          <label htmlFor="filter-multiple-ethnicities-yes">Yes ({filterStats['multipleEthnicities']['Yes']})</label>
          <button name="Yes" alt="multipleEthnicities" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
        <div className="filter-object">
          <input id="filter-multiple-ethnicities-no" name="No" type="checkbox" alt="multipleEthnicities" onChange={setFilterData} checked={filterData['multipleEthnicities'].includes('No')} />
          <label htmlFor="filter-multiple-ethnicities-no">No ({filterStats['multipleEthnicities']['No']})</label>
          <button name="No" alt="multipleEthnicities" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
      </div>
    </div>

    <div className="filter-container">
      <div className="filter-element">
        <span className="filter-container-header">Age range</span>
        {[...['<18', ...Constants['listOfAgeRanges']], ...['75+']].map((val, i) => {
          return <div key={"filter-age" + i} className="filter-object">
            <input id={"filter-" + val} name={val} type="checkbox" alt="ageRanges" onChange={setFilterData} checked={filterData['ageRanges'].includes(val)} />
            <label htmlFor={"filter-" + val}>{val + " (" + filterStats['ageRanges'][val] + ")"}</label>
            <button name={val} alt="ageRanges" className="filter-this-button" onClick={setFilterData}>!</button>
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
        <span className="filter-container-header">Vision correction</span>
        {Constants['visionCorrections'].map((val, i) => {
          return <div key={"filter-vc" + i} className="filter-object">
            <input id={"filter-vc-" + val} name={val} type="checkbox" alt="visionCorrections" onChange={setFilterData} checked={filterData['visionCorrections'].includes(val)} />
            <label htmlFor={"filter-vc-" + val}>{val + " (" + filterStats['visionCorrections'][val] + ")"}</label>
            <button name={val} alt="visionCorrections" className="filter-this-button" onClick={setFilterData}>!</button>
          </div>
        })}
      </div>

      <div className="filter-element gap">
        <span className="filter-container-header">Registered by parent <br /> or guardian</span>
        <div className="filter-object">
          <input id="filter-parent-yes" name="Yes" type="checkbox" alt="parentRegistered" onChange={setFilterData} checked={filterData['parentRegistered'].includes('Yes')} />
          <label htmlFor="filter-parent-yes">Yes ({filterStats['parentRegistered']['Yes']})</label>
          <button name="Yes" alt="parentRegistered" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
        <div className="filter-object">
          <input id="filter-parent-no" name="No" type="checkbox" alt="parentRegistered" onChange={setFilterData} checked={filterData['parentRegistered'].includes('No')} />
          <label htmlFor="filter-parent-no">No ({filterStats['parentRegistered']['No']})</label>
          <button name="No" alt="parentRegistered" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
      </div>

      <div className="filter-element gap">
        <span className="filter-container-header">Registration source</span>
        {Object.keys(Constants['sources']).map((val, i) => {
          return <div key={"filter-source" + i} className="filter-object">
            <input id={"filter-source-" + val} name={val} type="checkbox" alt="sources" onChange={setFilterData} checked={filterData['sources'].includes(val)} />
            <label htmlFor={"filter-source-" + val}>{Constants['sources'][val] + " (" + filterStats['sources'][val] + ")"}</label>
            <button name={val} alt="sources" className="filter-this-button" onClick={setFilterData}>!</button>
          </div>
        })}
      </div>
    </div>

    <div className="filter-container">
      <div className="filter-element">
        <span className="filter-container-header">Document status</span>
        {Constants['documentStatuses'].map((val, i) => {
          return <div key={"filter-ds" + i} className="filter-object">
            <input id={"filter-doc-status-" + (val || "Blank")} name={val || "Blank"} type="checkbox" alt="documentStatuses" onChange={setFilterData} checked={val == "" ? filterData['documentStatuses'].includes("Blank") : filterData['documentStatuses'].includes(val)} />
            <label htmlFor={"filter-doc-status-" + (val || "Blank")}>{(val || "Blank") + " (" + filterStats['documentStatuses'][val || "Blank"] + ")"}</label>
            <button name={val || "Blank"} alt="documentStatuses" className="filter-this-button" onClick={setFilterData}>!</button>
          </div>
        })}
      </div>

      <div className="filter-element gap">
        <span className="filter-container-header">New documents</span>
        <div className="filter-object">
          <input id="filter-docs-yes" name="Yes" type="checkbox" alt="newDocuments" onChange={setFilterData} checked={filterData['newDocuments'].includes('Yes')} />
          <label htmlFor="filter-docs-yes">Yes ({filterStats['newDocuments']['Yes']})</label>
          <button name="Yes" alt="newDocuments" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
        <div className="filter-object">
          <input id="filter-docs-no" name="No" type="checkbox" alt="newDocuments" onChange={setFilterData} checked={filterData['newDocuments'].includes('No')} />
          <label htmlFor="filter-docs-no">No ({filterStats['newDocuments']['No']})</label>
          <button name="No" alt="newDocuments" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
      </div>

      <div className="filter-element gap">
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
        <span className="filter-container-header">Status</span>
        {Constants['participantStatuses'].map((val, i) => {
          return <div key={"filter-status" + i} className="filter-object">
            <input id={"filter-participant-status-" + (val || "Blank")} name={val || "Blank"} type="checkbox" alt="statuses" onChange={setFilterData} checked={val == "" ? filterData['statuses'].includes("Blank") : filterData['statuses'].includes(val)} />
            <label htmlFor={"filter-participant-status-" + (val || "Blank")}>{(val || "Blank") + " (" + filterStats['statuses'][val || "Blank"] + ")"}</label>
            <button name={val || "Blank"} alt="statuses" className="filter-this-button" onClick={setFilterData}>!</button>
          </div>
        })}
      </div>

      <div className="filter-element gap">
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

      <div className="filter-element gap">
        <span className="filter-container-header">Highlighted participant</span>
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

    <div className="filter-container">

      <div className="filter-element">
        <span className="filter-container-header">Still Interested?</span>
        <div className="filter-object">
          <input id="filter-interested-yes" name="Yes" type="checkbox" alt="stillInterested" onChange={setFilterData} checked={filterData['stillInterested'].includes('Yes')} />
          <label htmlFor="filter-interested-yes">Yes ({filterStats['stillInterested']['Yes']})</label>
          <button name={"Yes"} alt="stillInterested" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
        <div className="filter-object">
          <input id="filter-interested-no" name="No" type="checkbox" alt="stillInterested" onChange={setFilterData} checked={filterData['stillInterested'].includes('No')} />
          <label htmlFor="filter-interested-no">No ({filterStats['stillInterested']['No']})</label>
          <button name={"No"} alt="stillInterested" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
        <div className="filter-object">
          <input id="filter-interested-na" name="N/A" type="checkbox" alt="stillInterested" onChange={setFilterData} checked={filterData['stillInterested'].includes('N/A')} />
          <label htmlFor="filter-interested-na">N/A ({filterStats['stillInterested']['N/A']})</label>
          <button name={"N/A"} alt="stillInterested" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
      </div>

      <div className="filter-element gap">
        <span className="filter-container-header">Unsubscribed</span>
        <div className="filter-object">
          <input id="filter-unsubscribed-yes" name="Yes" type="checkbox" alt="unsubscribed" onChange={setFilterData} checked={filterData['unsubscribed'].includes('Yes')} />
          <label htmlFor="filter-unsubscribed-yes">Yes ({filterStats['unsubscribed']['Yes']})</label>
          <button name={"Yes"} alt="unsubscribed" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
        <div className="filter-object">
          <input id="filter-unsubscribed-no" name="No" type="checkbox" alt="unsubscribed" onChange={setFilterData} checked={filterData['unsubscribed'].includes('No')} />
          <label htmlFor="filter-unsubscribed-no">No ({filterStats['unsubscribed']['No']})</label>
          <button name={"No"} alt="unsubscribed" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
      </div>

      <div className="filter-element gap">
        <span className="filter-container-header">Unread in Mailbox</span>
        <div className="filter-object">
          <input id="filter-unreadEmails-yes" name="Yes" type="checkbox" alt="unreadEmails" onChange={setFilterData} checked={filterData['unreadEmails'].includes('Yes')} />
          <label htmlFor="filter-unreadEmails-yes">Yes ({filterStats['unreadEmails']['Yes']})</label>
          <button name={"Yes"} alt="unreadEmails" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
        <div className="filter-object">
          <input id="filter-unreadEmails-no" name="No" type="checkbox" alt="unreadEmails" onChange={setFilterData} checked={filterData['unreadEmails'].includes('No')} />
          <label htmlFor="filter-unreadEmails-no">No ({filterStats['unreadEmails']['No']})</label>
          <button name={"No"} alt="unreadEmails" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
      </div>

    </div>

  </div>);
}

export default ParticipantFilter;

