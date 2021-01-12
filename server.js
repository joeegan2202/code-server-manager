const Docker = require('dockerode')
const express = require('express')
const fs = require('fs')
const { exec } = require('child_process')
let app = express()

let data = {}

fs.writeFileSync('/etc/nginx/sites-enabled/code-server-containers.conf', '')

fs.readFile('datafile.txt', (err, data) => {
    if (err) {
        if (err.errno == -2) {
            docker.listContainers().then((err, containers) => {
                containers.forEach(container => {
                    docker.getContainer(container.Id).stop()
                })
            })
        }
        
        console.log(err)
        process.exit()
    }

    let temp = JSON.parse(data)

    docker.listContainers().then((err, containers) => {
        containers.foreach(container => {
            let found = false
            for (key in temp) {
                if (temp[key].container === container.Id) {
                    found = true
                    data[key] = temp[key]

                    container.inspect((err, data) => {
                        fs.appendFileSync('/etc/nginx/sites-enabled/code-server-containers.conf', 
                        `upstream ${temp[key].email.split('@')[0]} {
                            server ${data.NetworkSettings.Networks.bridge.IPAddress}:8443;
                        }
                        `)
                    })
                }
            }

            if(!found) {
                container.stop()
            }
        })
    })
})

app.get('/api/login/', (req, res) => {
    if (data.users[req.query.email] && data.users[req.query.email].container) {
        res.send({url: `https://${req.query.email.split("@")[0]}.code.eganshub.net`})
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
        if (err) {
            console.log(err)
            return
        }

        container.start().then(() => {
        container.inspect((err, data) => {
            if (err) {
                console.log(err)
                return
            }

            fs.appendFileSync('/etc/nginx/sites-enabled/code-server-containers.conf', 
            `upstream ${email.split('@')[0]} {
                server ${data.NetworkSettings.Networks.bridge.IPAddress}:8443;
            }
            `)

            exec('systemctl restart nginx')
        })
        }
        )
    })
}

app.listen(8080)

process.on('SIGTERM', () => {
    fs.writeFileSync('datafile.txt', JSON.stringify(data))

    process.exit()
})