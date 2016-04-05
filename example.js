var mic = require('../mic-stream/index')
var goertzel = require('./index')
var through = require('through2')
var athrough = require('audio-through')
var fs = require('fs')
var Generator = require('audio-generator')

var dtmf = [ 1209, 1336, 1477, 1633, 697, 770, 852, 941 ]

var toneX = [ 1209, 1336, 1477, 1633 ]
var toneY = [ 697, 770, 852, 941 ]

var toneMap = {
  1209: 0,
  1336: 1,
  1477: 2,
  1633: 3,
  697: 0,
  770: 1,
  852: 2,
  941: 3,
}

var symbolMap = [
  [ '1', '2', '3', 'A' ],
  [ '4', '5', '6', 'B' ],
  [ '7', '8', '9', 'C' ],
  [ '#', '0', '*', 'D' ]
]

var detector = goertzel(dtmf, 44100, 66)

// mic().pipe(detector)

var tones = new Array(10).fill().map(function () {
  return dtmf[Math.floor(Math.random() * dtmf.length)]
})
console.log(tones)

Generator(
    function (time) {
        // if (time > tones.length) { return 0 }
        // console.log(tones[Math.floor(time/2)])
        // console.log(tones[Math.floor(time)])
        return [
            Math.sin(Math.PI * 2 * time * tones[Math.floor(time)]),
            // Math.sin(Math.PI * 2 * time * tones[Math.floor(time)])
        ]
    },
    {
        duration: Infinity,
        period: Infinity,
        frequency: undefined
    })
.pipe(detector)

detector.on('onToneStart', function (tones) {
  console.log('start', tones)
})
detector.on('onToneEnd', function (tones) {
  console.log('end', tones)
  tones.map(function (tone) {
    // console.log(tone[0], tone[2] - tone[1])
  })
  if (tones.length === 2) {
    var x = toneMap[tones[0][0]]
    var y = toneMap[tones[1][0]]
    if (tones[0][0] < 1000) {
      var tmp = x
      x = y
      y = tmp
    }

    var symbol = symbolMap[y][x]

    // console.log(symbol)
  }
})
