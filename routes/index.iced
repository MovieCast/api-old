models = require '../models'

express = require 'express'
router = express.Router()

router.get '/', (req, res) ->
  models.Movie.all().then (movies) ->
    res.json movies