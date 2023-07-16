const express = require('express');
const bodyParser = require('body-parser');
const jsonwebtoken = require("jsonwebtoken");
const turf = require('turf');
const lineIntersect = require('@turf/line-intersect').default;
const booleanCrosses = require('@turf/boolean-crosses').default;
const lines = require('./lines');

const JWT_SECRET =
    "goK!pusp6ThEdURUtRenOwUhAsWUCLheBazl!uJLPlS8EbreWLdrupIwabRAsiBu";

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "admin") {
        return res.json({
            token: jsonwebtoken.sign({ user: "admin" }, JWT_SECRET),
        });
    }
    return res
        .status(401)
        .json({ message: "The username and password your provided are invalid" });
});

app.post('/', (req, res) => {

    const authHeader = req.headers.authorization;
    try {
        const { user } = jsonwebtoken.verify(authHeader, JWT_SECRET);
        console.log(`${user} is authorized`);
    }
    catch (error) {
        return res.status(401).json({ error: "Not Authorized" });
    }

    if (req.body && req.body.type === 'LineString') {
        const numPoints = req.body.coordinates.length;
        console.log(`Received a LineString with ${numPoints} points`);
        var intersections = []
        var line1 = turf.lineString(req.body.coordinates);
        for( let i = 0 ; i<lines.length;i++)
        {
            d={}
            var line2 = turf.lineString(lines[i]["line"]["coordinates"]);
            // if (booleanCrosses(line2, line1))
            // {
                if(i<10)
                {
                    d[`L0${i+1}`]=lineIntersect(line2, line1);
                    if(d[`L0${i+1}`]["features"].length >0){
                        intersections.push(d);
                    }
                }
                else
                {
                    d[`L${i+1}`]=lineIntersect(line2, line1);
                    if(d[`L${i+1}`]["features"].length >0){
                        intersections.push(d);
                    }
                }
            // }
        }
        res.json({
            success: true,
            message: 'Line received',
            "intersections":intersections
        });
    }
    else {
        res.status(500).json({
            error: 'Invalid GeoJSON format or not a LineString',
            success: false
        });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});