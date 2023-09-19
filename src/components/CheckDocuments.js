import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { auth, realtimeDb } from '../firebase/config';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

import './CheckDocuments.css';

function CheckDocuments({ database, checkDocuments, setCheckDocuments }) {

    return ReactDOM.createPortal((
        <div className="modal-check-documents-backdrop" onClick={(e) => { if (e.target.className == "modal-check-documents-backdrop") setCheckDocuments("") }}>
            <div className="modal-check-documents-main-container">
                <div className="modal-check-documents-header">
                    Documents of {checkDocuments}
                </div>
                <div className="documents-container">
                    {Object.values(database['participants'][checkDocuments]['documents']).map(upload => {
                        let uploadDate = upload['date'].substring(0, 19).replace('T', ' ');
                        let document1 = upload['document1'];
                        let document2 = upload['document2'];
                        return (
                            <>
                                {document1 && <>
                                    <span className="document-upload-date">Upload date: {uploadDate}</span>
                                    <iframe className="document-preview" src={"https://drive.google.com/file/d/" + document1 + "/preview"} />
                                </>
                                }
                                {document2 && <>
                                    <span className="document-upload-date">Upload date: {uploadDate}</span>
                                    <iframe className="document-preview" src={"https://drive.google.com/file/d/" + document2 + "/preview"} />
                                </>
                                }
                            </>
                        )
                    })}
                </div>
            </div>
        </div>
    ), document.body);
}

export default CheckDocuments;