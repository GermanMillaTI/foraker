
import axios from 'axios';
import { useEffect, useState } from 'react';
import "./UsersAdmin.css"
import { CSVLink } from 'react-csv';
import Swal from 'sweetalert2';
import LogEvent from './Core/LogEvent';





function UsersAdmin({ database }) {
    const [apiUsers, setApiUsers] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [elbertUsers, setElbertUsers] = useState(null);
    const [searchValue, setSearchValue] = useState('');



    //use effect to call the cloud function that retreives the users


    useEffect(() => {
        const listOfUsers = async () => {
            await axios({
                method: 'post',
                url: 'https://us-central1-denali-51767.cloudfunctions.net/ListElbertUsers',
                data: {
                    message: 'hello'
                }
            }).then((response) => {
                setApiUsers(response.data);
            });
        }
        listOfUsers();
    }, [refreshKey]);

    const manageUser = async (userId, action) => {
        await axios({
            method: 'post',
            url: `https://us-central1-denali2-c0777.cloudfunctions.net/manipulateUser?userId=${userId}`,
            data: {
                message: action,
            }
        }).then((response) => {
            setRefreshKey(prevKey => prevKey + 1);
        })
    }

    const extractNames = (email) => {
        const regex = /^([a-zA-Z]+)\.([a-zA-Z]+)\d*@telusinternational\.com$/;

        const match = email.match(regex);
        return match;
    }

    if (!apiUsers) {
        return <div>loading...</div>
    }

    const filteredUsers = Object.keys(apiUsers).filter(key => {
        const email = apiUsers[key]['email'];

        return email.includes(searchValue.toLowerCase());
    });

    return (
        <div id="usersAdminContainer">

            <div className='usersAdmin-table-container'>
                <input
                    type="text"
                    placeholder="Search by email..."
                    id='searchBar'
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                <button onClick={(e) => { alert("Coming soon") }} className='create-user'>Create user</button>
                <table id='usersAdminTable' className='usersAdmin-table' style={{ paddingTop: "10px" }}>
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Creation Time</th>
                            <th>Last Time Opened</th>
                            <th>Status</th>
                            <th>User Type</th>
                            <th>Actions (Elbert)</th>
                        </tr>

                    </thead>
                    <tbody>
                        {apiUsers && <>{filteredUsers.map((key) => {

                            const names = extractNames(apiUsers[key]['email']) || ["-", "-", "-"];
                            let firstname = names[1].toString().charAt(0).toUpperCase().concat(names[1].toString().substr(1));
                            let lastname = names[2].toString().charAt(0).toUpperCase().concat(names[2].toString().substr(1));


                            return (
                                <tr key={key}>
                                    <td>{firstname}</td>
                                    <td>{lastname}</td>
                                    <td>{apiUsers[key]['email']}</td>
                                    <td>{apiUsers[key]['metadata']['creationTime']}</td>
                                    <td>{apiUsers[key]['metadata']['lastRefreshTime']}</td>
                                    <td>{apiUsers[key]['disabled'] === false ? "Active" : "Disabled"}</td>
                                    <td>{database['users'][apiUsers[key]['uid']]['role']}</td>
                                    <td>
                                        <button type="button" className={'user-disabled-' + apiUsers[key]['disabled']} onClick={() => {
                                            let action = apiUsers[key]['disabled'] === false ? "disable" : "enable";

                                            Swal.fire({
                                                title: `Are you sure?`,
                                                html: `You are about to ${action} ${apiUsers[key]['email']} `,
                                                showCancelButton: true,
                                                confirmButtonText: `Yes, ${action}`,
                                            }).then(result => {
                                                if (result.isConfirmed) {
                                                    manageUser(apiUsers[key]['uid'], action);

                                                    Swal.fire({
                                                        title: "Success",
                                                        text: "Action Complete",
                                                        icon: "success",
                                                        timer: 2000
                                                    });
                                                }
                                            })
                                        }}>{apiUsers[key]['disabled'] === false ? "Disable" : "Enable"}</button>

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