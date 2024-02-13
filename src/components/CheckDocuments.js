import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import './CheckDocuments.css';
import { upload } from '@testing-library/user-event/dist/upload';

function CheckDocuments({ database, checkDocuments, setCheckDocuments }) {

    useEffect(() => {
        const handleEsc = (event) => { if (event.keyCode === 27) setCheckDocuments("") };
        window.addEventListener('keydown', handleEsc);
        return () => { window.removeEventListener('keydown', handleEsc) };
    }, []);

    return ReactDOM.createPortal((
        <div className="modal-check-documents-backdrop" onClick={(e) => { if (e.target.className == "modal-check-documents-backdrop") setCheckDocuments("") }}>
            <div className="modal-check-documents-main-container">
                <div className="modal-check-documents-header">
                    Document of {checkDocuments}
                </div>
                <div className="documents-container">

                    <>
                        {

                            Object.values(database['participants'][checkDocuments]['documents']).map(upload => {
                                return Object.keys(upload).map(docKey => {
                                    const docUrl = `https://firebasestorage.googleapis.com/v0/b/tiai-registrations.appspot.com/o/foraker%2Fparticipants%2F${checkDocuments}%2Fidentification%2F${upload[docKey]}`

                                    if (docUrl.includes(".jpg") || docUrl.includes(".jpeg") || docUrl.includes(".JPG") || docUrl.includes(".png")) {
                                        return (
                                            <TransformWrapper defaultScale={1}>
                                                <TransformComponent style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}>
                                                    <img className="document-preview" style={{ maxWidth: "40vh", height: "fit-content", marginRight: "auto", marginLeft: "auto" }} src={docUrl} title='document' alt='preview' />
                                                </TransformComponent>
                                            </TransformWrapper>
                                        )

                                    } else {
                                        return (
                                            <iframe className='document-preview' src={docUrl} />
                                        )

                                    }



                                })
                            })
                        }
                    </>

                </div>
            </div>
        </div>
    ), document.body);
}

export default CheckDocuments;