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
        backgroundColor: "rgba(1, 69, 94, 1)",
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
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
                            <TableCell align="center" colSpan={13} >
                                <strong>Height / Weight / Gender</strong>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">
                                <strong>Height Range (cm)</strong>
                            </TableCell>

                            {
                                heights.map(header => (
                                    <TableCell align="center" colSpan={2}>
                                        <strong>{header}</strong>
                                    </TableCell>
                                ))
                            }
                        </TableRow>

                        <TableRow>

                            <StyledTableCell>Gender</StyledTableCell>
                            {
                                [...Array(6)].map((_, index) => (
                                    ['Male', 'Female'].map((gender) => (
                                        <StyledTableCell key={index} align="center">{gender}</StyledTableCell>
                                    ))
                                ))
                            }
                        </TableRow>
                        <TableRow>
                            <TableCell align="center">
                                <strong>Weigth Range (kg)</strong>
                            </TableCell>
                            {
                                [...Array(6)].map((_, index) => (
                                    ['Male', 'Female'].map((gender) => (
                                        <TableCell key={index} align="center"> </TableCell>
                                    ))
                                ))
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {weights.map(weight => {
                            return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">
                                    {weight}
                                </TableCell>
                                {heights.map(height => {
                                    return ["Male", "Female"].map(gender => {
                                        return <TableCell style={{
                                            backgroundColor: stats[height][weight][gender]['Completed'] > 0 ? 'rgba(1, 69, 94, 0.20)' : 'inherit',
                                            color: stats[height][weight][gender]['Completed'] === 0 ? '#999' : 'inherit',
                                            fontWeight: stats[height][weight][gender]['Completed'] === 0 ? 'lighter' : 'bolder',
                                        }} align="center">{stats[height][weight][gender]['Completed']}</TableCell>
                                    })
                                })}


                            </TableRow >
                        })}
                    </TableBody>
                </Table>
                <Grid container spacing={2} style={{ marginTop: "10em" }}>
                    <Grid item sm={6}>
                        <Table sx={{ minWidth: 450, border: "1px solid rgba(240, 240, 240, 1)" }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center" colSpan={2}>
                                        Age (N =  150)
                                    </StyledTableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" >
                                        <strong>Age</strong>
                                    </TableCell>
                                    <TableCell align="center" >
                                        <strong>N</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ages.map(age => {
                                    return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {age}
                                        </TableCell>
                                        {
                                            <TableCell align='center'>
                                                {ageStats[age]['Completed']}
                                            </TableCell>
                                        }
                                    </TableRow>
                                })}
                                <TableRow>
                                    <TableCell>
                                        <strong>Total:</strong>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <strong>{ageStats['total']}</strong>

                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                    <Grid item sm={6}>
                        <Table sx={{ minWidth: 450, border: "1px solid rgba(224, 224, 224, 1)" }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center" colSpan={2}>
                                        Age (N =  150)
                                    </StyledTableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" >
                                        <strong>Age</strong>
                                    </TableCell>
                                    <TableCell align="center" >
                                        <strong>N</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ages.map(age => {
                                    return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {age}
                                        </TableCell>
                                        {
                                            <TableCell align='center'>
                                                {((ageStats[age]['Completed']) / 50 * 100).toFixed(2)} %
                                            </TableCell>
                                        }

                                    </TableRow>
                                })}
                                <TableRow>
                                    <TableCell>
                                        <strong>Total:</strong>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <strong>{(ageStats['total'] / 150 * 100).toFixed(2)} %</strong>

                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                </Grid>
                <Grid container spacing={2} style={{ marginTop: "10em" }}>
                    <Grid item sm={6}>
                        <Table sx={{ minWidth: 450, border: "1px solid rgba(224, 224, 224, 1)" }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center" colSpan={2}>
                                        Skin Tone (N =  120)
                                    </StyledTableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" >
                                        <strong>Skin Tone</strong>
                                    </TableCell>
                                    <TableCell align="center" >
                                        <strong>N</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {skinTones.map(skin => {
                                    return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {skin}
                                        </TableCell>
                                        {
                                            <TableCell align='center'>
                                                {skinStats[skin]['Completed']}
                                            </TableCell>
                                        }

                                    </TableRow>
                                })}
                                <TableRow>
                                    <TableCell>
                                        <strong>Total:</strong>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <strong>{skinStats['total']}</strong>

                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                    <Grid item sm={6}>
                        <Table sx={{ minWidth: 450, border: "1px solid rgba(224, 224, 224, 1)" }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center" colSpan={2}>
                                        Skin Tone (N =  120)
                                    </StyledTableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" >
                                        <strong>Skin Tone</strong>
                                    </TableCell>
                                    <TableCell align="center" >
                                        <strong>N</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {skinTones.map(skin => {
                                    return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {skin}
                                        </TableCell>
                                        {
                                            <TableCell align='center'>
                                                {(skinStats[skin]['Completed'] / 20 * 100).toFixed(2)} %
                                            </TableCell>
                                        }

                                    </TableRow>
                                })}
                                <TableRow>
                                    <TableCell>
                                        <strong>Total:</strong>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <strong>{(skinStats['total'] / 120 * 100).toFixed(2)} %</strong>

                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                </Grid>
                <Grid container spacing={2} style={{ marginTop: "10em" }}>
                    <Grid item sm={6}>
                        <Table sx={{ minWidth: 450, border: "1px solid rgba(224, 224, 224, 1)" }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center" colSpan={2}>
                                        Hair (N = 40)
                                    </StyledTableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" >
                                        <strong>Hair</strong>
                                    </TableCell>
                                    <TableCell align="center" >
                                        <strong>N</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {hairCategories.filter(cat => cat !== "").map(hair => {
                                    return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {hair}
                                        </TableCell>
                                        {
                                            <TableCell align='center'>
                                                {hairStats[hair]['Completed']}
                                            </TableCell>
                                        }

                                    </TableRow>
                                })}
                                <TableRow>
                                    <TableCell>
                                        <strong>Total:</strong>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <strong>{hairStats['total']}</strong>

                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                    <Grid item sm={6}>
                        <Table sx={{ minWidth: 450, border: "1px solid rgba(224, 224, 224, 1)" }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center" colSpan={2}>
                                        Hair (N = 40)
                                    </StyledTableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" >
                                        <strong>Hair</strong>
                                    </TableCell>
                                    <TableCell align="center" >
                                        <strong>N</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {hairCategories.filter(cat => cat !== "").map(hair => {
                                    return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {hair}
                                        </TableCell>
                                        {
                                            <TableCell align='center'>
                                                {(hairStats[hair]['Completed'] / 10 * 100).toFixed(2)} %
                                            </TableCell>
                                        }

                                    </TableRow>
                                })}
                                <TableRow>
                                    <TableCell>
                                        <strong>Total:</strong>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <strong>{(hairStats['total'] / 40 * 100).toFixed(2)} %</strong>

                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                </Grid>
                <Grid container spacing={2} style={{ marginTop: "10em" }}>
                    <Grid item sm={6}>
                        <Table sx={{ minWidth: 450, border: "1px solid rgba(224, 224, 224, 1)" }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center" colSpan={2}>
                                        Facial Hair (N = 30)
                                    </StyledTableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" >
                                        <strong>Facial Hair</strong>
                                    </TableCell>
                                    <TableCell align="center" >
                                        <strong>N</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {facialhairCategories.filter(cat => cat !== "").map(hair => {
                                    return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {hair}
                                        </TableCell>
                                        {
                                            <TableCell align='center'>
                                                {facialHairStats[hair]['Completed']}
                                            </TableCell>
                                        }

                                    </TableRow>
                                })}
                                <TableRow>
                                    <TableCell>
                                        <strong>Total:</strong>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <strong>{facialHairStats['total']}</strong>

                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                    <Grid item sm={6}>
                        <Table sx={{ minWidth: 450, border: "1px solid rgba(224, 224, 224, 1)" }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center" colSpan={2}>
                                        Facial Hair (N = 30)
                                    </StyledTableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" >
                                        <strong>Facial Hair</strong>
                                    </TableCell>
                                    <TableCell align="center" >
                                        <strong>N</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {facialhairCategories.filter(cat => cat !== "").map(hair => {
                                    return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {hair}
                                        </TableCell>
                                        {
                                            <TableCell align='center'>
                                                {(facialHairStats[hair]['Completed'] / 10 * 100).toFixed(2)} %
                                            </TableCell>
                                        }

                                    </TableRow>
                                })}
                                <TableRow>
                                    <TableCell>
                                        <strong>Total:</strong>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <strong>{(facialHairStats['total'] / 30 * 100).toFixed(2)} %</strong>

                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                </Grid>
                <Grid container spacing={2} style={{ marginTop: "10em" }}>
                    <Grid item sm={6}>
                        <Table sx={{ minWidth: 450, border: "1px solid rgba(224, 224, 224, 1)" }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center" colSpan={2}>
                                        Clothing (N = 50)
                                    </StyledTableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" >
                                        <strong>Clothing</strong>
                                    </TableCell>
                                    <TableCell align="center" >
                                        <strong>N</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {clothingCategories.filter(clt => clt !== "").map(clothing => {
                                    return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {clothing}
                                        </TableCell>
                                        {
                                            <TableCell align='center'>
                                                {clothingStats[clothing]['Completed']}
                                            </TableCell>
                                        }

                                    </TableRow>
                                })}
                                <TableRow>
                                    <TableCell>
                                        <strong>Total:</strong>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <strong>{clothingStats['total']}</strong>

                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                    <Grid item sm={6}>
                        <Table sx={{ minWidth: 450, border: "1px solid rgba(224, 224, 224, 1)" }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center" colSpan={2}>
                                        Clothing (N = 50)
                                    </StyledTableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" >
                                        <strong>Clothing</strong>
                                    </TableCell>
                                    <TableCell align="center" >
                                        <strong>N</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {clothingCategories.filter(clt => clt !== "").map(clothing => {
                                    return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {clothing}
                                        </TableCell>
                                        {
                                            <TableCell align='center'>
                                                {(clothingStats[clothing]['Completed'] / 10 * 100).toFixed(2)} %
                                            </TableCell>
                                        }

                                    </TableRow>
                                })}
                                <TableRow>
                                    <TableCell>
                                        <strong>Total:</strong>
                                    </TableCell>
                                    <TableCell align='center'>
                                        <strong>{(clothingStats['total'] / 50 * 100).toFixed(2)} %</strong>

                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Grid>
                </Grid>

            </TableContainer>



        </div>
    );
}

export default External;