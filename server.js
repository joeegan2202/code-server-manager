const Docker = require('dockerode')
const express = require('express')
const fs = require('fs')
let app = express()

let data

fs.readFile('datafile.txt', (err, data) => {
    if (err) {
        if (err.errno != -2) {
            console.log(err)
            process.exit()
        }
    }

    data = JSON.parse(data) | {
        users: {},
        containers: []
    }
})

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
        startContainer(req.query.email)
        res.send({url: `https://${req.query.email.split("@")[0]}.code.eganshub.net`})
    } else {
        res.send(false)
    }
})

app.use(express.static('client/build'))

let docker = new Docker()

function startContainer(email) {
    let config = {
    Image: process.env.IMAGE,
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

        data.containers.push(container)
        container.start().then(() => {
        container.inspect((err, data) => {
            if (err) console.log(err)
            fs.appendFileSynch('/etc/nginx/sites-enabled/code-server-containers.conf', 
            `upstream ${email.split('@')[0]} {
                server ${data.NetworkSettings.Networks.bridge.IPAddress}:8443;
            }
            `)
        })
        }
        )
    })
}

app.listen(8080)

process.on('SIGTERM', () => {
    for(container in data.containers) {
        container.stop()
    }

    fs.writeFileSync('datafile.txt', JSON.stringify(data))

    fs.writeFileSync('/etc/nginx/sites-enabled/code-server-containers.conf', null)

    process.exit()
})