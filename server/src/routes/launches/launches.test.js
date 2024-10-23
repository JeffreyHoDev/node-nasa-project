const request = require('supertest')

const app = require("../../app") // The server
const { mongoConnect, mongoDisconnect } = require("../../services/mongo")
const { loadPlanetsData } = require("../../models/planets.model")


describe("Launches API", () => {

    // First argument is the callback that need to run first
    beforeAll(async () => {
        await mongoConnect()
        await loadPlanetsData()
    })

    afterAll(async () => {
        await mongoDisconnect()
    })

    describe("Test GET /launches", () => {
        test('It should response with 200 success', async () => {
            await request(app)
            .get('/v1/launches')
            .expect("Content-type", /json/)
            .expect(200)
        })
    })
    
    
    describe("Test POST /launches", () => {
    
    
        const completeLaunchData = {
            mission: 'USS Enterprise',
            rocket: "Test Rocket 1",
            target: "Kepler-1652 b",
            launchDate: "January 12, 2028"
        }
        const launchDataWithInvalidDate = {
            mission: 'USS Enterprise',
            rocket: "Test Rocket 1",
            target: "Kepler-1652 b",
            launchDate: "Hello"
        }
    
        const launchDataWithoutDate = {
            mission: 'USS Enterprise',
            rocket: "Test Rocket 1",
            target: "Kepler-1652 b"
        }
    
        test('It should response with 201 success', async () => {
            const response = await request(app)
            .post('/v1/launches')
            .send(completeLaunchData)
            .expect('content-type', /json/)
            .expect(201)
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf()
            const responseDate = new Date(response.body.launchDate).valueOf()
    
            expect(responseDate).toBe(requestDate)
    
            expect(response.body).toMatchObject(launchDataWithoutDate)
        })
    
        test("It should catch missing required properties", async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('content-type', /json/)
                .expect(400)
    
            expect(response.body).toStrictEqual({
                error: "Missing required launch property"
            })
        })
    
        test("It should catch invalid dates", async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithInvalidDate)
                .expect('content-type', /json/)
                .expect(400)
    
            expect(response.body).toStrictEqual({
                error: "Invalid Launch Date"
            })
        })
    })
})




