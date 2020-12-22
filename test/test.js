let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
const assert = require("chai").assert


//Assertion Style
chai.should();

chai.use(chaiHttp);

describe('Tasks API', () => {

    /**
     * Test the GET route
     */
    describe("GET /", () => {
        it("It should send a welcome message", (done) => {
            chai.request(server)
                .get("/")
                .end((err, response) => {
                    response.should.have.status(200);
                    assert.equal(response.text, "Welocme to the landing page")
                    // response.body.should.be.a('array');
                    // response.body.length.should.be.eq(3);
                done();
                });
        });

        it("It should not show the welcome message", (done) => {
            chai.request(server)
                .get("/dnd")
                .end((err, response) => {
                    response.should.have.status(404);
                done();
                });
        });

     });

//     /**
//      * Test the POST route
//      */
    describe("POST to /register", () => {
        it("It should POST a new task", (done) => {
            const task = {
                username: "user5",
                fullname: "full name",
                password: 1234568,
                email: "user5email@gmail.com"
            };
            chai.request(server)                
                .post("/register")
                .set('content-type', 'application/x-www-form-urlencoded')
                .send(task)
                .end((err, response) => {
                    console.log(response)
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    // response.body.should.have.property('_id').eq(4);
                    response.body.should.have.property('username');
                    response.body.should.have.property('fullname')
                    response.body.should.have.property('email')
                done();
                });
        });

     });

 });


