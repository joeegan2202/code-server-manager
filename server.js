const Docker = require('dockerode')

let docker = new Docker()

let container1, container2

docker.createContainer({Image: 'e531cd37a868', Env: ["NAME=Joe Egan", "EMAIL=joe@eganshub.net"], ExposedPorts: {"8443/tcp": {}}, HostConfig: {AutoRemove: true}}, (err, container) => {
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

docker.createContainer({Image: 'e531cd37a868', Env: ["NAME=Joe Egan", "EMAIL=joe@eganshub.net"], ExposedPorts: {"8443/tcp": {}}, HostConfig: {AutoRemove: true}}, (err, container) => {
    if (err) console.log(err)
    container2 = container
    container.start().then(() => {
    container.inspect((err, data) => {
        if (err) console.log(err)
        console.log(data.NetworkSettings.Networks.bridge.IPAddress)
    })
    }
    )
})

setTimeout(() => {
    container1.stop()
    container2.stop()
}, 10000)