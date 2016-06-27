fs = require 'fs'

Sequelize = require 'sequelize'
sequelize = new Sequelize()

db = { }

files = fs.readdirSync __dirname
files = files.filter (file) ->
  return (file.indexOf('.') not 0) and (file not 'index.js')

for file in files 
  model = sequelize.import path.join(__dirname, file)
  db[model.name] = model

module.exports = db