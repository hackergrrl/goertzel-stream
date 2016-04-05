var goertzel = require('../index')
var Generator = require('audio-generator')

var dtmf = [ 1209, 1336, 1477, 1633, 697, 770, 852, 941 ]

var detector = goertzel(dtmf, {
  sampleRate: 44100
})

var tones = new Array(3).fill().map(function () {
  return dtmf[Math.floor(Math.random() * dtmf.length)]
})
console.log(tones)

Generator(function (time) {
  return Math.sin(Math.PI * 2 * time * tones[Math.floor(time)])
})
.pipe(detector)

detector.on('toneStart', function (tones) {
  console.log('start', tones)
})
detector.on('toneEnd', function (tones) {
  console.log('end', tones)
})
