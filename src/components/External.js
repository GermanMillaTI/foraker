import { useState } from 'react';
import { CSVLink } from 'react-csv';

import './External.css';
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Constants from './Constants';
import { Grid } from '@mui/material';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#444",
        color: theme.palette.common.white,
    }
}));





function External({ database }) {
    const [stats, setStats] = useState(getDefaultNumbers());
    const [ageStats, setAgeStats] = useState(getDefaultAgeNumbers());
    const [skinStats, setSkinStats] = useState(getDefaultSkinNumbers());
    const [hairStats, setHairStats] = useState(getDefaultHairTypes());
    const [facialHairStats, setfacialHairStats] = useState(getDefaultFacialHair());
    const [clothingStats, setClothingStats] = useState(getDefaultClothingNumbers())

    const weights = Constants['listOfWeights'];
    const heights = Constants['listOfHeights'];
    const ages = Constants['listOfAgeRanges'];
    const skinTones = Constants['skinTone'];
    const hairCategories = Constants['hairCategories'];
    const facialhairCategories = Constants['facialHairCategories'];
    const clothingCategories = Constants['clothingCategories'];


    function getDefaultNumbers() {
        let temp = Object.assign({}, ...Constants['listOfHeights'].map(k => ({
            [k]: Object.assign({}, ...Constants['listOfWeights'].map(k => ({
                [k]: Object.assign({}, ...Constants['genders'].map(k => ({
                    [k]: Object.assign({}, ...Constants['participantStatuses'].map(k => ({ [k || "Blank"]: 0 })))
                })))
            })))
        })))

        return (temp);
    }

    function getDefaultAgeNumbers() {
        let temp = Object.assign({}, ...Constants['listOfAgeRanges'].map(k => ({
            [k]: Object.assign({}, ...Constants['participantStatuses'].map(k => ({ [k || "Blank"]: 0 })))
        })))

        return (temp);
    }
    function getDefaultSkinNumbers() {
        let temp = Object.assign({}, ...Constants['skinTone'].map(k => ({
            [k]: Object.assign({}, ...Constants['participantStatuses'].map(k => ({ [k || "Blank"]: 0 })))
        })))
        return (temp);
    }

    function getDefaultHairTypes() {
        let temp = Object.assign({}, ...Constants['hairCategories'].filter(hair => hair !== "").map(k => ({
            [k]: Object.assign({}, ...Constants['sessionStatuses'].map(k => ({ [k || "Blank"]: 0 })))
        })))
        return (temp);
    }

    function getDefaultFacialHair() {
        let temp = Object.assign({}, ...Constants['facialHairCategories'].filter(hairCat => hairCat !== "").map(k => ({
            [k]: Object.assign({}, ...Constants['sessionStatuses'].map(k => ({ [k || "Blank"]: 0 })))
        })))
        return (temp);
    }

    function getDefaultClothingNumbers() {
        let temp = Object.assign({}, ...Constants['clothingCategories'].filter(hairCat => hairCat !== "").map(k => ({
            [k]: Object.assign({}, ...Constants['sessionStatuses'].map(k => ({ [k || "Blank"]: 0 })))
        })))
        return (temp);
    }

    React.useEffect(() => {
        let tempStats = getDefaultNumbers();

        let participants = database['participants'];
        Object.values(participants).map(participant => {


            let gender = participant['gender'];
            let weightRange = participant['weight_range'];
            let heightRange = participant['height_range'];
            let ethValue = 1
            let status = participant['status'] || "Blank";

            if (!Constants['listOfWeights'].includes(weightRange)) return;
            if (!Constants['listOfAgeRanges'].includes(participant['age_range'])) return;
            tempStats[heightRange][weightRange][gender][status] += ethValue;

        })
        setStats(tempStats);
    }, []);


    React.useEffect(() => {
        // Fill stats
        let tempStats = getDefaultAgeNumbers();
        let participants = database['participants'];
        tempStats['total'] = 0;

        Object.values(participants).map(participant => {
            let ageRange = participant['age_range'];
            let status = participant['status'] || "Blank";
            if (!Constants['listOfWeights'].includes(participant['weight_range'])) return;
            if (!Constants['listOfAgeRanges'].includes(participant['age_range'])) return;
            tempStats[ageRange][status] += 1;

            if (status === "Completed") {
                tempStats['total'] += 1;
            }

        })
        setAgeStats(tempStats);
    }, []);

    React.useEffect(() => {
        // Fill stats
        let tempStats = getDefaultSkinNumbers();
        let participants = database['participants'];
        tempStats['total'] = 0;
        Object.values(participants).map(participant => {
            let skintone = participant['skinTone'];
            let status = participant['status'] || "Blank";
            if (!Constants['skinTone'].includes(skintone)) return;
            if (!Constants['listOfAgeRanges'].includes(participant['age_range'])) return;

            tempStats[skintone][status] += 1;

            if (status === "Completed") {
                tempStats['total'] += 1;
            }

        })
        setSkinStats(tempStats);
    }, []);

    React.useEffect(() => {
        let tempStats = getDefaultHairTypes();
        let sessions = database['timeslots'];
        tempStats['total'] = 0;
        Object.values(sessions).map(session => {

            if (!session['participant_id']) return;
            let hairCat = session['hair'];
            let status = session['status'];
            if (!Constants['hairCategories'].includes(hairCat)) return;
            if (hairCat === "") return;

            tempStats[hairCat][status] += 1


            if (status === "Completed") {
                tempStats['total'] += 1;
            }

        })

        setHairStats(tempStats)

    }, []);

    React.useEffect(() => {
        let tempStats = getDefaultFacialHair();
        let sessions = database['timeslots'];
        tempStats['total'] = 0;
        Object.values(sessions).map(session => {

            if (!session['participant_id']) return;
            let hairCat = session['facial_hair'];
            let status = session['status'];
            if (!Constants['facialHairCategories'].includes(hairCat)) return;
            if (hairCat === "") return;

            tempStats[hairCat][status] += 1


            if (status === "Completed") {
                tempStats['total'] += 1;
            }

        })

        setfacialHairStats(tempStats)

    }, []);

    React.useEffect(() => {
        let tempStats = getDefaultClothingNumbers();
        let sessions = database['timeslots'];
        tempStats['total'] = 0;
        Object.values(sessions).map(session => {

            if (!session['participant_id']) return;
            let clothing = session['clothing'];
            let status = session['status'];
            if (!Constants['clothingCategories'].includes(clothing)) return;
            if (clothing === "") return;

            tempStats[clothing][status] += 1


            if (status === "Completed") {
                tempStats['total'] += 1;
            }

        })

        setClothingStats(tempStats)

    }, []);


    console.log(facialHairStats)
    return (
        <div>
            <TableContainer style={{ width: "1200px", marginLeft: "auto", marginRight: "auto", marginTop: "2em", padding: "0.5em" }} component={Paper}>
                <Table sx={{ minWidth: 450, border: "1px solid rgba(224, 224, 224, 1)" }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" colSpan={13} sx={{ border: "1px solid black" }} >
                                <strong>Height / Weight / Gender</strong>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center" sx={{ border: "1px solid black" }}>
                                <strong>Height Range (cm)</strong>
                            </TableCell>

                            {
                                heights.map(header => (
                                    <TableCell align="center" colSpan={2} sx={{ border: "1px solid black" }}>
                                        <strong>{header}</strong>
                                    </TableCell>
                                ))
                            }
                        </TableRow>

                        <TableRow>

                            <StyledTableCell sx={{ border: "1px solid black" }}>Gender</StyledTableCell>
                            {
                                [...Array(6)].map((_, index) => (
                                    ['Male', 'Female'].map((gender) => (
                                        <StyledTableCell key={index} align="center" sx={{ borderBottom: "1px solid black", borderRight: gender === "Female" ? "1px solid black" : "none" }}>{gender}</StyledTableCell>
                                    ))
                                ))
                            }
                        </TableRow>
                        <TableRow>
                            <TableCell align="center" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                <strong>Weight Range (kg)</strong>
                            </TableCell>
                            {
                                [...Array(6)].map((_, index) => (
                                    ['Male', 'Female'].map((gender) => (
                                        <TableCell key={index} align="center" sx={{ borderRight: gender === "Female" ? "1px solid black" : "none" }}> </TableCell>
                                    ))
                                ))
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {weights.map(weight => {
                            return <TableRow>
                                <TableCell component="th" scope="row" sx={{
                                    borderRight: "1px solid black",
                                    borderLeft: "1px solid black",
                                    borderBottom: weight === ">110" ? "1px solid black" : ""
                                }}
                                >
                                    {weight}
                                </TableCell>
                                {heights.map(height => {
                                    return ["Male", "Female"].map(gender => {
                                        return <TableCell style={{
                                            backgroundColor: stats[height][weight][gender]['Completed'] > 0 ? 'rgb(120, 240, 120, 0.5)' : 'inherit',
                                            color: stats[height][weight][gender]['Completed'] === 0 ? 'rgb(220, 220, 220)' : 'inherit',
                                            fontWeight: stats[height][weight][gender]['Completed'] === 0 ? 'lighter' : 'bolder',
                                            borderRight: gender === "Female" ? "1px solid black" : "none",
                                            borderBottom: weight === ">110" ? "1px solid black" : ""
                                        }} align="center">{stats[height][weight][gender]['Completed']}</TableCell>
                                    })
                                })}


                            </TableRow >
                        })}
                    </TableBody>
                </Table>
                <Grid item sx={{ marginTop: "10em" }}>
                    <Table sx={{ width: 650, border: "1px solid rgba(240, 240, 240, 1)", marginLeft: "auto", marginRight: "auto" }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align="center" colSpan={3} sx={{ border: "1px solid black" }}>
                                    Age (N =  150)
                                </StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>Age</strong>
                                </TableCell>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>N</strong>
                                </TableCell>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>%</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ages.map(age => {
                                return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                        {age}
                                    </TableCell>
                                    {
                                        <TableCell align='center' sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                            {ageStats[age]['Completed']}
                                        </TableCell>

                                    }
                                    {
                                        <TableCell align='center' sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                            {((ageStats[age]['Completed']) / 50 * 100).toFixed(2)} %
                                        </TableCell>
                                    }
                                </TableRow>
                            })}
                            <TableRow>
                                <TableCell sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>Total:</strong>
                                </TableCell>
                                <TableCell align="center" sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>{ageStats['total']}</strong>

                                </TableCell>
                                <TableCell align="center" sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>{(ageStats['total'] / 150 * 100).toFixed(2)} %</strong>

                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Grid>

                <Grid item sx={{ marginTop: "10em" }}>
                    <Table sx={{ width: 650, border: "1px solid rgba(240, 240, 240, 1)", marginLeft: "auto", marginRight: "auto" }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align="center" colSpan={3} sx={{ border: "1px solid black" }}>
                                    Skin Tone (N =  120)
                                </StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>Skin Tone</strong>
                                </TableCell>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>N</strong>
                                </TableCell>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>%</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {skinTones.map(skin => {
                                return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                        {skin}
                                    </TableCell>
                                    {
                                        <TableCell align="center" component="th" scope="row" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                            {skinStats[skin]['Completed']}
                                        </TableCell>
                                    }
                                    {
                                        <TableCell align='center' component="th" scope="row" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                            {(skinStats[skin]['Completed'] / 20 * 100).toFixed(2)} %
                                        </TableCell>
                                    }
                                </TableRow>
                            })}
                            <TableRow>
                                <TableCell sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>Total:</strong>
                                </TableCell>
                                <TableCell align='center' sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>{skinStats['total']}</strong>

                                </TableCell>
                                <TableCell align='center' sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>{(skinStats['total'] / 120 * 100).toFixed(2)} %</strong>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Grid>

                <Grid item sx={{ marginTop: "10em" }}>
                    <Table sx={{ width: 650, border: "1px solid rgba(240, 240, 240, 1)", marginLeft: "auto", marginRight: "auto" }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align="center" colSpan={3} sx={{ border: "1px solid black" }}>
                                    Hair (N = 40)
                                </StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>Hair</strong>
                                </TableCell>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>N</strong>
                                </TableCell>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>%</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {hairCategories.filter(cat => cat !== "").map(hair => {
                                return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell scope="row" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                        {hair.slice(0, 1) + hair.toLowerCase().slice(1)}
                                    </TableCell>
                                    {
                                        <TableCell align='center' scope="row" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                            {hairStats[hair]['Completed']}
                                        </TableCell>
                                    }
                                    {
                                        <TableCell align='center' scope="row" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                            {(hairStats[hair]['Completed'] / 10 * 100).toFixed(2)} %
                                        </TableCell>
                                    }

                                </TableRow>
                            })}
                            <TableRow>
                                <TableCell sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>Total:</strong>
                                </TableCell>
                                <TableCell align='center' sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>{hairStats['total']}</strong>
                                </TableCell>
                                <TableCell align='center' sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>{(hairStats['total'] / 40 * 100).toFixed(2)} %</strong>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Grid>

                <Grid item sx={{ marginTop: "10em" }}>
                    <Table sx={{ width: 650, border: "1px solid rgba(240, 240, 240, 1)", marginLeft: "auto", marginRight: "auto" }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align="center" colSpan={3} sx={{ border: "1px solid black" }}>
                                    Facial Hair (N = 30)
                                </StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>Facial Hair</strong>
                                </TableCell>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>N</strong>
                                </TableCell>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>%</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {facialhairCategories.filter(cat => cat !== "").map(hair => {
                                return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell scope="row" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                        {hair}
                                    </TableCell>
                                    {
                                        <TableCell align='center' scope="row" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                            {facialHairStats[hair]['Completed']}
                                        </TableCell>
                                    }
                                    {
                                        <TableCell align='center' scope="row" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                            {(facialHairStats[hair]['Completed'] / 10 * 100).toFixed(2)} %
                                        </TableCell>
                                    }

                                </TableRow>
                            })}
                            <TableRow>
                                <TableCell sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>Total:</strong>
                                </TableCell>
                                <TableCell align='center' sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>{facialHairStats['total']}</strong>

                                </TableCell>
                                <TableCell align='center' sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>{(facialHairStats['total'] / 30 * 100).toFixed(2)} %</strong>

                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Grid>

                <Grid item sx={{ marginTop: "10em" }}>
                    <Table sx={{ width: 650, border: "1px solid rgba(240, 240, 240, 1)", marginLeft: "auto", marginRight: "auto" }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align="center" colSpan={3} sx={{ border: "1px solid black" }}>
                                    Clothing (N = 50)
                                </StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>Clothing</strong>
                                </TableCell>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>N</strong>
                                </TableCell>
                                <TableCell align="center" sx={{ border: "1px solid black" }}>
                                    <strong>%</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clothingCategories.filter(clt => clt !== "").map(clothing => {
                                return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell scope="row" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                        {clothing.slice(0, 1) + clothing.toLowerCase().slice(1)}
                                    </TableCell>
                                    {
                                        <TableCell align='center' scope="row" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                            {clothingStats[clothing]['Completed']}
                                        </TableCell>
                                    }
                                    {
                                        <TableCell align='center' scope="row" sx={{ borderRight: "1px solid black", borderLeft: "1px solid black" }}>
                                            {(clothingStats[clothing]['Completed'] / 10 * 100).toFixed(2)} %
                                        </TableCell>
                                    }

                                </TableRow>
                            })}
                            <TableRow>
                                <TableCell sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>Total:</strong>
                                </TableCell>
                                <TableCell align='center' sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>{clothingStats['total']}</strong>

                                </TableCell>
                                <TableCell align='center' sx={{ borderTop: "3px solid black", borderBottom: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", backgroundColor: "rgb(240,240,240)" }}>
                                    <strong>{(clothingStats['total'] / 50 * 100).toFixed(2)} %</strong>

                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Grid>

            </TableContainer>



        </div>
    );
}

export default External;