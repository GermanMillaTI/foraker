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
      genders: Constants['genders'],
      ageRanges: Constants['listOfAgeRanges'],
      statuses: ["Blank", ...Constants['participantStatuses']],
      icfs: ['Yes', 'No'],
      phases: Constants['phases'],
      demoBinStatuses: Constants['demoBinStatuses'],
      sources: Object.keys(Constants['sources']),
      documentStatuses: ["Blank", ...Constants['documentStatuses']],
      visionCorrections: Constants['visionCorrections'],
      parentRegistered: ['Yes', 'No'],
      newDocuments: ['Yes', 'No']
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
    genders: Constants['genders'],
    ageRanges: Constants['listOfAgeRanges'],
    statuses: ["Blank", ...Constants['participantStatuses']],
    icfs: ['Yes', 'No'],
    phases: Constants['phases'],
    demoBinStatuses: Constants['demoBinStatuses'],
    sources: Object.keys(Constants['sources']),
    documentStatuses: ["Blank", ...Constants['documentStatuses']],
    visionCorrections: Constants['visionCorrections'],
    parentRegistered: ['Yes', 'No'],
    newDocuments: ['Yes', 'No']
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
      ageRanges: Object.assign({}, ...[...['<13', ...Constants['listOfAgeRanges']], ...['75+']].map(k => ({ [k]: 0 }))),
      genders: Object.assign({}, ...Constants['genders'].map(k => ({ [k]: 0 }))),
      statuses: Object.assign({}, ...Constants['participantStatuses'].map(k => ({ [k || "Blank"]: 0 }))),
      icfs: { Yes: 0, No: 0 },
      phases: Object.assign({}, ...Constants['phases'].map(k => ({ [k]: 0 }))),
      demoBinStatuses: Object.assign({}, ...Constants['demoBinStatuses'].map(k => ({ [k]: 0 }))),
      sources: Object.assign({}, ...Object.keys(Constants['sources']).map(k => ({ [k]: 0 }))),
      documentStatuses: Object.assign({}, ...Constants['documentStatuses'].map(k => ({ [k || "Blank"]: 0 }))),
      visionCorrections: Object.assign({}, ...Constants['visionCorrections'].map(k => ({ [k]: 0 }))),
      parentRegistered: { Yes: 0, No: 0 },
      newDocuments: { Yes: 0, No: 0 }
    }
  }

  function filterFunction(participantId) {
    let participantInfo = database['participants'][participantId];

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
    let ipAddress = participantInfo['ip_address'];
    let phase = participantInfo['phase'] ? "Phase " + participantInfo['phase'] : 'Blank';
    let source = participantInfo['source'] || 'Other';
    let demoBinStatus = participantInfo['open_demo_bin'] ? 'Open' : 'Closed';

    let ageRange = participantInfo['age_range'];

    let ethnicity = participantInfo['ethnicities'];
    let ethnicities = ethnicity.split(',');
    var ethnicityOk = false;
    ethnicities.map(eth => {
      if (!ethnicityOk && filterData['ethnicities'].includes(eth.trim())) ethnicityOk = true;
    })

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

    let icfSigned = participantInfo['icf'] ? "Yes" : "No";
    let icfSignedIsOk = filterData['icfs'].includes(icfSigned);
    let status = participantInfo['status'] || "Blank";
    let documentStatus = participantInfo['document_approval'] || "Blank";
    let hasNewDocument = participantInfo['documents']['pending'] ? "Yes" : "No";

    return ethnicityOk &&
      dateOk &&
      filterData['genders'].includes(gender) &&
      filterData['ageRanges'].includes(ageRange) &&
      filterData['visionCorrections'].includes(visionCorrection) &&
      icfSignedIsOk &&
      filterData['statuses'].includes(status) &&
      filterData['phases'].includes(phase) &&
      filterData['demoBinStatuses'].includes(demoBinStatus) &&
      filterData['sources'].includes(source) &&
      filterData['documentStatuses'].includes(documentStatus) &&
      filterData['parentRegistered'].includes(parentRegistered) &&
      filterData['newDocuments'].includes(hasNewDocument) &&
      (!filterData['participantId'] || participantId.includes(filterData['participantId'])) &&
      (!filterData['firstName'] || firstName.includes(filterData['firstName'].trim())) &&
      (!filterData['lastName'] || lastName.includes(filterData['lastName'].trim())) &&
      (!filterData['email'] || email.includes(filterData['email'].trim())) &&
      (!filterData['phone'] || phone.includes(filterData['phone'].trim())) &&
      (!filterData['ipAddress'] || ipAddress.includes(filterData['ipAddress'].trim()));
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
      let phase = participantInfo['phase'] ? "Phase " + participantInfo['phase'] : 'Blank';
      let demoBinStatus = participantInfo['open_demo_bin'] ? 'Open' : 'Closed';
      let source = participantInfo['source'] || 'Other';

      let ethnicities = participantInfo['ethnicities'].split(',');
      ethnicities.map((eth) => {
        output['ethnicities'][eth]++;
      })

      let icfSigned = participantInfo['icf'] ? "Yes" : "No";
      let status = participantInfo['status'] || "Blank";
      let documentStatus = participantInfo['document_approval'] || "Blank";

      output['genders'][gender]++;
      output['phases'][phase]++;
      output['demoBinStatuses'][demoBinStatus]++;
      output['sources'][source]++;
      output['visionCorrections'][visionCorrection]++;
      output['ageRanges'][ageRange]++;
      output['icfs'][icfSigned]++;
      output['statuses'][status]++;
      output['documentStatuses'][documentStatus]++;
      output['parentRegistered'][parentRegistered]++;
      output['newDocuments'][hasNewDocument]++;
    })
    setFilterStats(output);
  }, [filterData])

  return (<div className="filter-main-container">

    <div className="filter-container">
      <span className="filter-container-header">Filter</span>
      <div className="filter-element">
        <input name="participantId" type="number" placeholder="Participant Id" className="main-input" autoComplete="off" onChange={setFilterData} value={filterData['participantId'] || ""} />
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
      <div className="filter-element">
        <input name="ipAddress" type="text" placeholder="IP address" className="main-input" autoComplete="off" onChange={setFilterData} value={filterData['ipAddress'] || ""} />
      </div>
      <div className="filter-element gap">
        <span>Date of registration</span>
        <input name="dateOfRegistrationFrom" type="date" className="main-input" onChange={setFilterData} min="2023-05-31" max="2023-12-31" value={filterData['dateOfRegistrationFrom'] || ""} />
      </div>
      <div className="filter-element">
        <input name="dateOfRegistrationTo" type="date" className="main-input" onChange={setFilterData} min="2023-04-14" max="2023-12-31" value={filterData['dateOfRegistrationTo'] || ""} />
      </div>
      <div className="filter-element">
        <button name="resetFilter" className="reset-filter-button" onClick={setFilterData}>Reset filter</button>
      </div>
    </div>

    <div className="filter-container">
      <span className="filter-container-header">Ethnicity</span>
      {Constants['ethnicities'].map((val, i) => {
        return <div key={"filter-eth" + i} className="filter-object">
          <input id={"filter-" + val} name={val} type="checkbox" alt="ethnicities" onChange={setFilterData} checked={filterData['ethnicities'].includes(val) ? true : false} />
          <label htmlFor={"filter-" + val}>{(val.length > 30 ? val.substring(0, 30) + '...' : val) + " (" + filterStats['ethnicities'][val] + ")"}</label>
          <button name={val} alt="ethnicities" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
      })}
    </div>

    <div className="filter-container">
      <div className="filter-element">
        <span className="filter-container-header">Age range</span>
        {[...['<13', ...Constants['listOfAgeRanges']], ...['75+']].map((val, i) => {
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
            <label htmlFor={"filter-vc-" + val}>{val.replace("progressive, bifocal or multifocal", "pr/ bf/ mf") + " (" + filterStats['visionCorrections'][val] + ")"}</label>
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
        <span className="filter-container-header">Phase</span>
        <div className="filter-object">
          <input id="filter-phases-blank" name="Blank" type="checkbox" alt="phases" onChange={setFilterData} checked={filterData['phases'].includes('Blank')} />
          <label htmlFor="filter-phases-blank">Blank ({filterStats['phases']['Blank']})</label>
          <button name="Blank" alt="phases" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
        <div className="filter-object">
          <input id="filter-phases-phase-1" name="Phase 1" type="checkbox" alt="phases" onChange={setFilterData} checked={filterData['phases'].includes('Phase 1')} />
          <label htmlFor="filter-phases-phase-1">Phase 1 ({filterStats['phases']['Phase 1']})</label>
          <button name="Phase 1" alt="phases" className="filter-this-button" onClick={setFilterData}>!</button>
        </div>
        <div className="filter-object">
          <input id="filter-phases-phase-2" name="Phase 2" type="checkbox" alt="phases" onChange={setFilterData} checked={filterData['phases'].includes('Phase 2')} />
          <label htmlFor="filter-phases-phase-2">Phase 2 ({filterStats['phases']['Phase 2']})</label>
          <button name="Phase 2" alt="phases" className="filter-this-button" onClick={setFilterData}>!</button>
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
        </div>
        <div className="filter-object">
          <input id="filter-icf-no" name="No" type="checkbox" alt="icfs" onChange={setFilterData} checked={filterData['icfs'].includes('No')} />
          <label htmlFor="filter-icf-no">No ({filterStats['icfs']['No']})</label>
        </div>
      </div>
    </div>

  </div>);
}

export default ParticipantFilter;
