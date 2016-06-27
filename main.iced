# start webapi
models = require './models'

express = require 'express'
app = express()

app.set 'port', process.env.PORT or 3000

models.sequelize.sync().then ->
  app.listen app.get('port'), ->
    console.log "listening on port #{ app.get 'port' }"

# start providers
providers = require('config').providers

for provider in providers
  ep = require "./providers/#{ provider }.iced"
  ep.initialize