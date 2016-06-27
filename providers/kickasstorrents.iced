request = require 'request'
cheerio = require 'cheerio'

models = require '../models'

class KickassTorrentsProvider:
  constructor: ->
    # fetch movies every 60 seconds
    setTimeout(->
      @fetchMovies()
    , 60000)

  fetchMovies: ->
    console.log 'fetching movies from KickassTorrents...'

module.exports = new KickassTorrentsProvider()