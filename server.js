const Docker = require('dockerode')
const express = require('express')
let app = express()

let data = {
    users: {}
}

app.get('/api/login/', (req, res) => {
    if (data.users[req.query.email]) {
        res.send({url: req.query.email.split("@")[0]})
    } else {
        res.send(false)
    }
})

app.get('/api/new/', (req, res) => {
    if (req.query.email && req.query.name && req.query.password) {
        data.users[req.query.email] = {
            name: req.query.name,
            password: req.query.password
        }
        createContainer(req.query.email)
        res.send(true)
    } else {
        res.send(false)
    }
})

app.use(express.static('client/build'))

let docker = new Docker()

function startContainer(email) {
    let config = {
    Image: 'e531cd37a868',
    Env: [
        `NAME=${data.users[email].name}`,
        `EMAIL=${email}`,
        `PASSWORD=${data.users[email].password}`],
        ExposedPorts: {
            "8443/tcp": {}
        },
        HostConfig: {
            AutoRemove: true,
        }
    }
    //PortBindings: {
    //    '8443/tcp': [{HostPort: 8080}]
    //}

    docker.createContainer(config, (err, container) => {
        if (err) console.log(err)
        container1 = container
        container.start().then(() => {
        container.inspect((err, data) => {
            if (err) console.log(err)
            console.log(data.NetworkSettings.Networks.bridge.IPAddress)
        })
        }
        )
    })
}

app.listen(80)