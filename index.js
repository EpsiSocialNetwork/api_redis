require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const redis = require('redis')
// Openapi Documentation
const openapi = require('openapi-comment-parser')
const swagger_ui = require('swagger-ui-express')



// --- REDIS ---
const db = redis.createClient({host:process.env.HOST_REDIS, port:process.env.PORT_REDIS,password:process.env.PASSWORD_REDIS})

db.on('connect', () =>  console.log('Connected to Redis...') )
// --- === ---


// --- CORS ---
var CORS_OPTION = {
  origin: '*',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  preflightContinue: true, // default is false
  optionsSuccessStatus: 204 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
// --- === ---


// --- EXPRESS ---
const app = express()
app.enable('trust proxy')
app.use(helmet())
app.use(morgan('common'))
app.use(express.json())
app.options('*', cors())
app.use('/docs', swagger_ui.serve, swagger_ui.setup(openapi()))

// - HOME -
/**
 * GET /
 * @summary Returns a helloworld string 
 * @response 200 - OK
 */
app.get('/', cors(CORS_OPTION), async (req, res) => {
  res.json('Welcome on REDIS API')
})

// - GET - retrieve like share view and react for a post id
/**
 * GET /{id}
 * @summary Returns post status where id is uid_post
 * @description retrieve like share view and react for a post id
 * @response 200 - OK
 * @responseContent {} 200.application/json
 */
app.get('/:id', cors(CORS_OPTION), async (req, res, next) => {
  // SET post:test:view 10
  // SET post:test:share 3
  // SADD post:test:like username1 username2
  // ZADD post:test:react 1 react1
  // ZADD post:test:react 2 react3
  // SADD post:test:react:react1 user1 user2 user3
  // SADD post:test:react:react3 user2
  // ZRANGE post:test:react 0 -1
  const view = await new Promise((resv, rej) => db.get(`post:${req.params.id}:view`, (err, data) => err? next(err): resv(data)))
  const share = await new Promise((resv, rej) => db.get(`post:${req.params.id}:share`, (err, data) => err? next(err): resv(data)))
  const like = await new Promise((resv, rej) => db.scard(`post:${req.params.id}:like`, (err, data) => err? next(err): resv(data)))
  
  //const nbreact = await new Promise((resv, rej) => db.zcard(`post:${req.params.id}:react`, (err, data) => err? (function(){throw err}()): resv(data)))
  
  const react = await new Promise((resv, rej) => db.zrange(`post:${req.params.id}:react`,0,-1, (err, data) => err? (function(){throw err}()): resv(data)))
  
  const react_by_user = await Promise.all(
    react.map(
      async e => {
        return {
          text:e,
          user:await new Promise((resv, rej) => db.smembers(`post:${req.params.id}:react:${e}`, (err, data) => err? next(err): resv(data) ))
        } 
      }
    )).then(v=>v)

  res.json({'view':view,'share':share,'like':like, 'react':react_by_user})
})

/**
 * GET /{id}/like/{uid_user}
 * @summary Returns 1 if user liked this post
 * @description id is uid_post, uid_user is uid_user
 * @response 200 - OK
 */
app.get('/:id/like/:uid_user', cors(CORS_OPTION), async (req, res, next) => {
  //SISMEMBER post:UID_POST:like UID_USER
  const redis_output = await new Promise((resv, rej) => db.SISMEMBER(`post:${req.params.id}:like`,req.params.uid_user, (err, data) => err? next(err): resv(data)))
  res.json(redis_output)
})

// - POST -
/**
 * POST /{id}/like/{uid_user}
 * @summary Returns 1 after added like on this id_post for uid_user 
 * @response 200 - OK
 */
app.post('/:id/like/:uid_user', cors(CORS_OPTION), async (req, res, next) => {
  //SADD post:uid:like username1
  //const redis_output = await new Promise((resv, rej) => db.sadd(`post:${req.params.id}:like`,req.body.uid_user, (err, data) => err? next(err): resv(data)))
  const redis_output = await new Promise((resv, rej) => db.sadd(`post:${req.params.id}:like`,req.params.uid_user, (err, data) => err? next(err): resv(data)))
  res.json(redis_output)
})

/**
 * POST /{id}/react/{uid_user}/{react}
 * @summary Add reaction(react) on this post(id) for this user (uid_user)
 * @response 200 - OK
 */
app.post('/:id/react/:uid_user/:react', cors(CORS_OPTION), async (req, res, next) => {
  // ZADD post:test:react 2 react3
  // SADD post:test:react:react1 user1 user2 user3
  await new Promise((resv, rej) => db.zadd(`post:${req.params.id}:react`, Date.now(), req.params.react, (err, data) => err? next(err): resv(data)))
  const redis_output = await new Promise((resv, rej) => db.sadd(`post:${req.params.id}:react:${req.params.react}`, req.params.uid_user, (err, data) => err? next(err): resv(data)))
  res.json(redis_output)
})

// - PUT -
/**
 * PUT /{id}/view
 * @summary Returns view counter after increment it by 1
 * @response 200 - OK
 */
app.put('/:id/view', cors(CORS_OPTION), async (req, res, next) => {
  const redis_output = await new Promise((resv, rej) => db.incr(`post:${req.params.id}:view`, (err, data) => err? next(err): resv(data)))
  res.json(redis_output)
})

/**
 * PUT /{id}/share
 * @summary Returns share counter after increment it by 1
 * @response 200 - OK
 */
app.put('/:id/share', cors(CORS_OPTION), async (req, res, next) => {
  const redis_output = await new Promise((resv, rej) => db.incr(`post:${req.params.id}:share`, (err, data) => err? next(err): resv(data)))
  res.json(redis_output)
})

// - DELETE -
/**
 * DELETE /{id}/like/{uid_user}
 * @summary Remove like on post(id) for this user(uid_user)
 * @response 200 - OK
 */
app.delete('/:id/like/:uid_user', cors(CORS_OPTION), async (req, res, next) => {
  const redis_output = await new Promise((resv, rej) => db.srem(`post:${req.params.id}:like`,req.params.uid_user, (err, data) => err? next(err): resv(data)))
  res.json(redis_output)
})
/**
 * DELETE /{id}/react/{uid_user}/{react}
 * @summary Remove reaction(react) on post(id) for this user(uid_user)
 * @response 200 - OK
 */
app.delete('/:id/react/:uid_user/:react', cors(CORS_OPTION), async (req, res, next) => {
  const tmp_redis_output = await new Promise((resv, rej) => db.srem(`post:${req.params.id}:react:${req.params.react}`, req.params.uid_user, (err, data) => err? next(err): resv(data)))
  const redis_output = await new Promise((resv, rej) => db.scard(`post:${req.params.id}:react:${req.params.react}`, (err, data) => err? next(err): resv(data)))?tmp_redis_output:await new Promise((resv, rej) => db.zrem(`post:${req.params.id}:react`, req.params.react, (err, data) => err? next(err): resv(data)))
  res.json(redis_output)
})

// - ERROR -
app.use((req, res, next) => res.status(404))

app.use((error, req, res, next) => {
  error.status ? res.status(error.status) : res.status(500)
  res.json({
    message: error.message,
    stack: process.env.ENVIRONMENT === 'production' ? '🥞' : error.stack,
  })
})

// - RUN -
const port = process.env.PORT || 5225
app.listen(port, () => console.log(`Listening at http://localhost:${port}`))
// --- === ---