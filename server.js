// modules
const express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  app = express()

// headers
app.use(
  bodyParser.urlencoded({
    extended: false
  })
)

app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

// root
app.get('/', (req, res, next) => {
  res.send('Invisible reCAPTCHA Validation Server')
})

// process recaptcha
app.post('/', (req, res) => {
  if (
    req.body.captcha === undefined ||
    req.body.captcha === '' ||
    req.body.captcha === null
  ) {
    return res.json({
      success: false,
      msg: 'reCAPTCHA not defined'
    })
  }

  // heroku config variable
  const secretKey = process.env.RECAPTCHA_SECRET

  // verification url
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`

  // make request
  request(verifyUrl, (err, response, body) => {
    body = JSON.parse(body)

    // failure
    if (body.success !== undefined && !body.success) {
      return res.json({
        success: false,
        msg: 'reCAPTCHA failed'
      })
    }

    // success
    return res.json({
      success: true,
      msg: 'reCAPTCHA verified'
    })
  })
})

// port
let port = process.env.PORT || 4000

// listen for connections
app.listen(port, function() {
  console.log('Listening on port ' + port)
})
