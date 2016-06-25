express = require 'express'
app = express()

Sequelize = require 'sequelize'
sequelize = new Sequelize('')

Movie = sequelize.define('movie',
  name: Sequelize.STRING
  description: Sequelize.STRING
)

# todo: sequelize.sync()

app.get '/', (req, res) ->
  Movie.findAll().then (projects) ->
    res.json(projects)

app.listen 3000
