import { listAll, ref as storeRef, deleteObject } from "firebase/storage";
import { storage } from '../firebase/registrationsConfig';
import { useEffect, useState } from "react";

function FilesView({ database }) {
    const [files, setFiles] = useState([]);

    useEffect(() => {

        const fetchFiles = async () => {
            const listRef = storeRef(storage, '/foraker/participants');
            const res = await listAll(listRef);

            const items = res.prefixes.map(item => item.name);

            const notIncluded = items.filter((ppt) => {
                let data = database['participants'][ppt];

                if (typeof data === "undefined" && ppt.length > 0) {
                    return ppt;
                }


            })


            setFiles(notIncluded)
            console.log(files)
        };


        files.forEach(async (ppt) => {
            //await deleteObject(storeRef(storage, `/foraker/participants/${ppt}`));
        })

        fetchFiles();
    }, [database])

    return <>
        Files View
    </>


};
export default FilesView