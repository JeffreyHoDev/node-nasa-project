const { getAllLaunches, scheduleLaunch, existLaunchWithId, abortLaunchById } = require("../../models/launches.model")
const { getPagination } = require("../../services/query")

async function httpGetAllLaunches(req, res) {

    const { skip, limit } = getPagination(req.query)

    return res.status(200).json(await getAllLaunches(skip, limit))
}

async function httpPostNewLaunch(req, res){
    const launch = req.body

    if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target){
        return res.status(400).json({
            error: "Missing required launch property"
        })
    }

    launch.launchDate = new Date(launch.launchDate)

    if(launch.launchDate.toString() === 'Invalid Date'){
        return res.status(400).json({
            error: "Invalid Launch Date"
        })
    }
    // or use isNaN for invalid date
    if(isNaN(launch.launchDate)){
        return res.status(400).json({
            error: "Invalid Launch Date"
        })
    }

    await scheduleLaunch(launch)

    return res.status(201).json(launch)
}


async function httpAbortLaunch(req, res) {
    const launchID = Number(req.params.id)
    // if launch doesnt exist
    const existLaunch = await existLaunchWithId(launchID)
    if(!existLaunch){
        return res.status(404).json({
            error: 'Launch not found'
        })
    }


    const aborted = await abortLaunchById(launchID)

    if(!aborted){
        return res.status(400).json({
            error: 'Launch not aborted'
        })
    }
    return res.status(200).json({
        ok: true
    })
    
}

module.exports = {
    httpGetAllLaunches,
    httpPostNewLaunch,
    httpAbortLaunch
}