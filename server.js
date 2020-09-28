const proxy = require('express-http-proxy')
const app = require('express')()

app.use('/', proxy('localhost:8080'))

app.listen('8000')
