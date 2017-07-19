const express = require('express')
const cookie = require('cookie')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000

app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (request, response, next) => {
  const cookies = cookie.parse(request.headers.cookie || '');
  let name = cookies.name
  if (name) {
    try{
      name = decrypt(name)
    }catch(error){
      console.log('error decruypting cookie', error)
      // TODO delete the name cookie
      name = null
    }
  }
  response.render('index', { name })
})

app.post('/set-name', (request, response, next) => {
  const name = request.body.name

  response.setHeader('Set-Cookie', cookie.serialize('name', encrypt(name), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7 // 1 week
  }))
  response.redirect('/')
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})






// Nodejs encryption with CTR
const crypto = require('crypto')
const algorithm = 'aes-256-ctr'
const password = 'd6F3Efeq'

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
