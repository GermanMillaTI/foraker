
import axios from 'axios';
import { useEffect, useState } from 'react';
import "./UsersAdmin.css"
import { CSVLink } from 'react-csv';


function UsersAdmin({ database }) {
    const [apiUsers, setApiUsers] = useState(null);
    const [csvUsersData, setCsvUsersData] = useState([])
    //use effect to call the cloud function that retreives the users
    useEffect(() => {
        const listOfUsers = async () => {
            await axios({
                method: 'post',
                url: 'https://us-central1-denali-51767.cloudfunctions.net/ListUsers',
                data: {
                    message: 'hello'
                }
            }).then((response) => {
                setApiUsers(response.data);
            })
        }
        listOfUsers();
    }, []);

    return (<div className="usersAdminContainer">

        <div className='usersAdmin-table-container'>
            <table id='usersAdminTable' className='usersAdmin-table'>
                <thead>
                    <th>UID</th>
                    <th>Email</th>
                    <th>Creation Time</th>
                    <th>Last time opened</th>
                    <th>Status</th>
                    <th>User Type</th>
                    <th>Action</th>
                </thead>
                <tbody>
                    {apiUsers && <>{Object.keys(apiUsers).map((key) => {
                        return (
                            <tr>
                                <td>{apiUsers[key]['uid']}</td>
                                <td>{apiUsers[key]['email']}</td>
                                <td>{apiUsers[key]['metadata']['creationTime']}</td>
                                <td>{apiUsers[key]['metadata']['lastRefreshTime']}</td>
                                <td>{apiUsers[key]['disabled'] === false ? "Active" : "Disabled"}</td>
                                <td>{database['users'][apiUsers[key]['uid']['role']]}</td>
                                <td>
                                    <button type="button">Disable</button>
                                </td>
                            </tr>
                        )
                    })}</>}
                </tbody>
            </table>

        </div>



    </div>)
}

export default UsersAdmin;