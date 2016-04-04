var goertzel = require('goertzel')
var EventEmitter = require('events')
var util = require('util')
var WritableStream = require('stream').Writable

util.inherits(GoertzelStream, EventEmitter)
util.inherits(GoertzelStream, WritableStream)

function GoertzelStream(freqs, sampleRate, testsPerSecond) {
  if (!(this instanceof GoertzelStream)) {
    return new GoertzelStream(freqs, sampleRate, testsPerSecond)
  }

  // Validate arguments.
  if (!freqs || (typeof freqs != 'object') || freqs.length === 0) {
    throw new Error('first argument must be an array of frequencies to detect')
  }
  sampleRate = sampleRate || 44100
  testsPerSecond = testsPerSecond || 50

  // This is an event emitter and a writable stream.
  EventEmitter.call(this)
  WritableStream.call(this, { objectMode: true })

  // Create the goertzel detectors for the frequencies.
  var detectors = freqs.map(function (f) {
    return goertzel({
      targetFrequency: f,
      sampleRate: sampleRate
    })
  })

  // Track time elapsed (audio time, not wall clock time).
  var t = 0

  // Track which tones are actively being detected.
  var active = {}

  this._write = function (buffer, enc, next) {
    var chunk = buffer.getChannelData(0)
    var chunkSize = sampleRate / testsPerSecond
    var chunks = Math.floor(chunk.length / chunkSize)
    // console.log(buffer.length, chunkSize)
    var self = this
    // TODO: accumulate in buffer when buffer.length < chunkSize
    if (chunks <= 0) { throw new Error('chunk size too small') }
    for (var i=0; i < chunks; i++) {
      var slice = chunk.slice(i * chunkSize, i * chunkSize + chunkSize)

      process(slice)

      // Move the current time forward.
      t += 1 / testsPerSecond
    }

    next()

    function process (slice) {
      var justStarted = []
      var justEnded = []

      // Run the slice of samples through each goertzel detector.
      for (var j=0; j < detectors.length; j++) {
        var freq = freqs[j]

        if (detectors[j](slice)) {
          if (active[freq] === undefined) {
            // console.log(i, 'yes', freq)
            active[freq] = t
            justStarted.push([freq, t])
          }
        } else if (active[freq] !== undefined) {
          justEnded.push([freq, active[freq], t + 1 / testsPerSecond])
          // console.log(i, 'no', freq)
          delete active[freq]
        }
      }

      if (justStarted.length > 0) {
        self.emit('onToneStart', justStarted)
      }
      if (justEnded.length > 0) {
        self.emit('onToneEnd', justEnded)
      }
    }
  }
}

module.exports = GoertzelStream
