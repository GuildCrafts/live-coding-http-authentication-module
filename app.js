const express = require('express')
const cookie = require('cookie')
const bodyParser = require('body-parser')
const onHeaders = require('on-headers')
const app = express()
const port = process.env.PORT || 3000

app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({ extended: false }))


app.use((request, response, next) => {
  console.log('A')
  request.cookies = cookie.parse(request.headers.cookie || '');

  try{
    request.session = JSON.parse(decrypt(request.cookies.session))
  }catch(error){
    console.log('ERROR DECRYPTING COOKIE')
    request.session = {}
  }


  onHeaders(response, () =>{
    console.log('setting session cookie')
    response.setHeader('Set-Cookie',
      cookie.serialize('session', encrypt(JSON.stringify(request.session)), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })
    )
  })

  next()
})

app.use((request, response, next) => {
  if (request.session.userId){
    database.getUserById(request.session.userId, (user) => {
      request.user = user
      next()
    })
  }else{
    next()
  }
})


app.get('/', (request, response, next) => {
  console.log('B')
  let name = request.session.name
  response.render('index', {
    name,
    session: request.session
  })
})

app.post('/set-name', (request, response, next) => {
  console.log('B')
  const name = request.body.name
  request.session.name = name
  response.redirect('/')
})

app.post('/login', (request, response, next) => {
  const email = request.body.email
  const password = request.body.password

  // one-way hash the password
  // query the database for email and hashed_password
  database.queryForUser(email, password, (userId) => {
    if (userId){
      request.session.userId = userId
    }else{
      response.render('log-page', { error:  'bad email or password'})
    }
  })
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})






// Nodejs encryption with CTR
const crypto = require('crypto')
const algorithm = 'aes-256-ctr'
const password = 'd6F3Efeq'
// const password = process.env.ENCRUPTION_PASSWORD

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
