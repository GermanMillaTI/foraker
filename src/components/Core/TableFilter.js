import React, { useEffect, useState, useRef } from "react";

import './TableFilter.css';

function TableFilter({ filterName, alt, values, filterData, setFilterData, selectedEach }) {
    const [filterIsOpen, setFilterIsOpen] = useState(false);
    const [each, setEach] = useState(selectedEach);
    const [scroller, setScroller] = useState(false);
    const myRef = useRef();

    const handleClickOutside = e => {
        if (!myRef.current.contains(e.target)) {
            setFilterIsOpen(false);
        }
    };



    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    });

    useEffect(() => {
        if (filterIsOpen) {
            let filterContainer = document.getElementById("tableFilter" + filterName.toString().toLowerCase());
            if (scroller === false) {
                filterContainer.scrollTop = filterContainer.scrollHeight;
                setScroller(filterContainer.scrollHeight);
            } else {
                filterContainer.scrollTop = scroller;
            }
        }
    }, [filterIsOpen])

    // If pressing escape
    useEffect(() => {
        const handleEsc = (event) => { if (event.keyCode === 27) setFilterIsOpen(false) };
        window.addEventListener('keydown', handleEsc);
        return () => { window.removeEventListener('keydown', handleEsc) };
    }, []);

    return (
        <div ref={myRef}>
            <label style={{ color: 'white' }}>{filterName}</label>
            <button
                onClick={() => setFilterIsOpen(!filterIsOpen)}
                className={"filter-button fas fa-filter filter-button-" +
                    (JSON.stringify(JSON.parse(JSON.stringify(values)).sort()) == JSON.stringify(JSON.parse(JSON.stringify(filterData[alt])).sort()) ? "inactive" : "active")}
            />
            {filterIsOpen &&
                <div id={"tableFilter" + filterName.toString().toLowerCase()} className="table-filter-container" onScroll={(e) => setScroller(e.currentTarget.scrollTop)}>

                    <button
                        className="check-all-button"
                        name="checkAll"
                        field={alt}
                        values={each ? values : ""}
                        onClick={(e) => { setEach(!each); setFilterData(e); }}
                    >
                        {each ? "Select all" : "Deselect all"}
                    </button>
                    {values.filter(key => key).map(key => {
                        return (
                            <div key={key} className="table-filter-container-row">
                                <input
                                    id={filterName + "-" + key}
                                    type="checkbox"
                                    alt={alt}
                                    name={key}
                                    onChange={setFilterData}
                                    checked={filterData[alt].includes(key)}
                                />
                                <label htmlFor={filterName + "-" + key}>{key}</label>
                            </div>
                        )
                    })}
                </div>
            }
        </div>
    )
}

export default TableFilter;