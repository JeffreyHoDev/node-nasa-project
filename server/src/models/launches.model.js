const axios = require("axios")

const launchesMongo = require("./launches.mongo")
const planetsMongo = require("./planets.mongo")


// OLD
const launches = new Map()
let latestFlightNumber = 100;
// const launch = {
//     flightNumber: 100, // flight_number
//     mission: "Kepler exploration", // name
//     rocket: "Explorer", // rocket.name
//     launchDate: new Date('December 27, 2030'), // date_local
//     target: "Kepler-442 b", // not applicable
//     customer: ["NASA", "ZTM"], // payload.customers
//     upcoming: true, // upcoming
//     success: true // success
// }
// OLD

const DEFAULT_FLIGHT_NUMBER = 100

// saveLaunch(launch)

// launches.set(launch.flightNumber, launch)

async function getLatestFlightNumber(){
    const latestLaunch = await launchesMongo
        .findOne()
        .sort('-flightNumber') // Get minus at front for descending order

    if(!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER
    }

    return latestLaunch.flightNumber
}

async function getAllLaunches(skip, limit) {

    return await launchesMongo
        .find({}, {'_id': 0, '__v': 0})
        .sort({ flightNumber: 1 }) 
        .skip(skip)
        .limit(limit)
    // return Array.from(launches.values())
}

async function saveLaunch(launch) {

    await launchesMongo.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {upsert: true})
}


async function scheduleLaunch(launch) {
    const planet = await planetsMongo.findOne({
        kepler_name: launch.target
    })
    
    if(!planet) {
        throw new Error("Target Planet not found")
    }

    const newFlightNumber = await getLatestFlightNumber() + 1
    const newLaunch = Object.assign(launch, {
        customers: ['ZTM', 'NASA'],
        upcoming: true,
        success: true,
        flightNumber: newFlightNumber 
    })

    await saveLaunch(newLaunch)
    
}

function addNewLaunch(launch) {
    // latestFlightNumber++
    // launches.set(latestFlightNumber, Object.assign(launch, { 
    //     customers: ['ZTM', 'NASA'],
    //     upcoming: true,
    //     success: true,
    //     flightNumber: latestFlightNumber 
    // }))



}


async function findLaunch(filter){
    return await launchesMongo.findOne(filter)
}


async function existLaunchWithId(id){
    return await launchesMongo.findOne({
        flightNumber: id
    })
}

async function abortLaunchById(id) {
    // const aborted = launches.get(id)
    // aborted.upcoming = false;
    // aborted.success = false;
    // return aborted

    const aborted = await launchesMongo.updateOne({
        flightNumber: id
    }, {
        upcoming: false,
        success: false
    })

    return aborted.modifiedCount === 1;

}

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query"

async function populateLaunches(){


    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                },

            ]
        }
    })

    if(response.status !== 200){
        console.log("Problem downloading launch data")
        throw new Error("Launch Data download failed")
    }

    const launchDocs = response.data["docs"]
    for(const launchDoc of launchDocs){

        const payloads = launchDoc["payloads"]
        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        })

        const launch = {
            flightNumber: launchDoc.flight_number, // flight_number
            mission: launchDoc.name, // name
            rocket: launchDoc.rocket.name, // rocket.name
            launchDate: launchDoc.date_local, // date_local
            // target: "Kepler-442 b", // not applicable
            customer: customers, // payload.customers
            upcoming: launchDoc.upcoming, // upcoming
            success: launchDoc.success // success
        }

        console.log(`${launch.flightNumber} : ${launch.mission}`)
        // TODO: Populate launches collection

        await saveLaunch(launch)
    }



}

async function loadLaunchData(){

    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    })

    if(firstLaunch){
        console.log("already loaded")
        
    }else {
        await populateLaunches()
    }


} 


module.exports = {
    launches,
    getAllLaunches,
    addNewLaunch,
    existLaunchWithId,
    abortLaunchById,
    scheduleLaunch, 
    loadLaunchData
}