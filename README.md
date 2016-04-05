# goertzel-stream

> Detects the presence of a single frequency in a stream of signal samples.

# example

```js
var goertzel = require('goertzel-stream')
var Generator = require('audio-generator')

var freq = 697

// Generate a sine wave at 697 Hz
var gen = Generator(function (time) {
  if (time > 1) {
    return 0
  } else {
    return Math.sin(Math.PI * 2 * time * freq)
  }
})

// Detection stream looking for the 697 Hz frequency
var detect = goertzel(freq)

// Pipe the signal into the detector
gen.pipe(detect)

detect.on('toneStart', function (tones) {
  console.log('start', tones)
})
detect.on('toneEnd', function (tones) {
  console.log('start', tones)
})
```

```
{ '697': { start: 0 } }
{ '697': { start: 0, end: 1 } }
```

# api

## var detect = goertzel(freq, opts={})

Returns a WriteStream set to detect a single frequency, `freq`. Pipe an audio
source into this.

`opts` is mandatory, and has some required and optional parameters:

- `opts.sampleRate` (required) - how many samples are taken per second. For best
  results, this should be at least twice the [Nyquist
  frequency](https://en.wikipedia.org/wiki/Nyquist_frequency). 2.5x works well.
- `opts.testsPerSecond` (optional) - How many tests for the frequency to perform
  per second's worth of samples. Defaults to 100.

## detect.on('toneStart', function (tones) { ... })

Emitted when a tone begins. `tones` is an object mapping a frequency to its
start time.

```
{ '697': { start: 0 } }
```

## detect.on('toneEnd', function (tones) { ... })

Emitted when a detected tone ends. `tones` is an object mapping a frequency to
its start time and end time.

```
{ '697': { start: 0, end: 1 } }
```

# install

With [npm](https://npmjs.org/) installed, run

```
$ npm install goertzel-stream
```

# license

MIT
