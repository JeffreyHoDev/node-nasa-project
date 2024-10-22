const { parse } = require('csv-parse')
const fs = require('fs')
const path = require("path")

const planetsMongo = require("./planets.mongo")

const planets = []

function isHabitablePlanet (planet) {
    return planet['koi_disposition'] === 'CONFIRMED' && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 && planet['koi_prad'] < 1.6
}

/*
    const promise = new Promise((resolve, reject) => {
        })
    
        promise.then((result) => {
        })
*/

function loadPlanetsData() {
    
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true
            }))
            .on('data', (data) => {
                if(isHabitablePlanet(data)){
                    // planets.push(data)
                    // insert + update = upsert, need to understand what is find in mongo. Upsert only insert if not exist
                    // create method will only insert
                    // await planetsMongo.create({
                    //     kepler_name: data.kepler_name
                    // })
                    savePlanet(data)
                    // first argument finding the kepler name matching, if it not exist, then will insert object in 2nd argument, if it exist, then will update 
                    // By default, the updateOne function only update if it exist, if does not exist it wont do anything. We need to pass third argument, so upsert operation is done
                }
            })
            .on('error', (err) => {
                console.log(err)
                reject(err)
            })
            .on('end', async () => {
                console.log("Done")
                const countPlanets = (await getAllPlanets()).length
                console.log(`${countPlanets} planets found`)
                resolve()
            })
    })

}

async function savePlanet(planet){
    try{
        await planetsMongo.updateOne(
            {kepler_name: planet.kepler_name}, 
            {kepler_name: planet.kepler_name},
            {upsert: true}
        )

    }catch(err){
        console.error(`Could not save planet: ${err}`)
    }
}

async function getAllPlanets() {
    // return planetsMongo.find({
    //     "kepler_name": "Something"
    // }, { kepler_name: 1 }) // The first argument is filter, you can pass {} to get all documents. The second argument is projection, is the list of fields from document that you'd like to include to results (Provide 1 means show, 0 means exclude)
    return await planetsMongo.find({}, {'__v': 0, '_id': 0})

}
// For second argument also can provide string, then use space to separate for the fields, add minus symbol at front of field to exclude

module.exports = {
    loadPlanetsData,
    getAllPlanets
}