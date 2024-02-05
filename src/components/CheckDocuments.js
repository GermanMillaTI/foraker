import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import './CheckDocuments.css';

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
                            database['participants'][checkDocuments]['pptId_url'].includes(".jpg") || database['participants'][checkDocuments]['pptId_url'].includes(".jpeg") || database['participants'][checkDocuments]['pptId_url'].includes(".JPG") || database['participants'][checkDocuments]['pptId_url'].includes(".png") ?
                                <TransformWrapper defaultScale={1}>
                                    <TransformComponent style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}>
                                        <img className="document-preview" style={{ maxWidth: "50vh", height: "fit-content", marginRight: "auto", marginLeft: "auto" }} src={"https://firebasestorage.googleapis.com/v0/b/tiai-registrations.appspot.com/o/foraker" + database['participants'][checkDocuments]['pptId_url']} title='documents' alt='preview' />
                                    </TransformComponent>
                                </TransformWrapper>

                                : <iframe className="document-preview" src={"https://firebasestorage.googleapis.com/v0/b/tiai-registrations.appspot.com/o/foraker" + database['participants'][checkDocuments]['pptId_url']} title='documents' />


                        }
                    </>

                </div>
            </div>
        </div>
    ), document.body);
}

export default CheckDocuments;