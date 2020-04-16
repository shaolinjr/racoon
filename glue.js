const partOne = require('./results/partial-result-remedios')
const partTwo = require('./results/partial-result-remedios-2')
const partThree = require('./results/partial-result-remedios-3')
const partFour = require('./results/remedios')
const fs = require('fs')
const final = [].concat(partOne, partTwo, partThree, partFour)

// fs.writeFileSync('./results/araujo-testes.json',JSON.stringify(final))
