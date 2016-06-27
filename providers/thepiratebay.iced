request = require 'request'
cheerio = require 'cheerio'

models = require '../models'

class ThePirateBayProvider
  initialize: ->
    # fetch movies every 60 seconds
    setTimeout(->
      @fetchMovies()
    , 60000)

  fetchMovies: ->
    console.log 'fetching movies from ThePirateBay...'

module.exports = new ThePirateBayProvider()