var test = require('tape')
var goertzel = require('../index')
var Generator = require('audio-generator')

// sine wave at some Hz for duration t
function sin (hz, t) {
  return Generator(function (time) {
    if (time <= t) {
      return Math.sin(Math.PI * 2 * time * hz)
    } else {
      return 0
    }
  })
}

test('1 Hz', function (t) {
  t.plan(3)

  var detect = goertzel(1)
  var gen = sin(1, 1)
  gen.pipe(detect)

  detect.once('toneEnd', function (tones) {
    t.ok(tones[1])
    t.ok(tones[1].start === 0)
    t.ok(tones[1].end > 0)
    gen.unpipe()
    t.end()
  })
})

test('1482 Hz', function (t) {
  t.plan(3)

  var detect = goertzel(1482)
  var gen = sin(1482, 1)
  gen.pipe(detect)

  detect.once('toneEnd', function (tones) {
    t.ok(tones[1482])
    t.ok(tones[1482].start === 0)
    t.ok(tones[1482].end > 0)
    gen.unpipe()
    t.end()
  })
})

// 50% of the samples are at 250 Hz
// 50% of the samples are at 559 Hz
test('250 Hz and 559 Hz', function (t) {
  t.plan(8)

  var detect = goertzel([250, 559, 170])

  var gen = Generator(function (time) {
    if (time <= 0.5) {
      return Math.sin(Math.PI * 2 * time * 250)
    } else if (time <= 1) {
      return Math.sin(Math.PI * 2 * time * 559)
    } else {
      return 0
    }
  })

  gen.pipe(detect)

  detect.once('toneEnd', function (tones) {
    t.ok(tones[250])
    t.ok(tones[250].start === 0)
    t.ok(tones[250].end > 0)
    t.ok(!tones[170])

    detect.once('toneEnd', function (tones) {
      t.ok(tones[559])
      t.ok(tones[559].start >= 0.4)
      t.ok(tones[559].end <= 1)
      t.ok(!tones[170])
      gen.unpipe()
    })
  })
})
