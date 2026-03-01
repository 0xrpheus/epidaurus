# Ayre

While discussing the joy instrumental music brings to people, our team realized that learning and playing instruments isn’t equally accessible to everyone. Traditional lessons and instruments can be expensive, and many digital music tools assume the user can physically interact with a keyboard, mouse, or instrument in conventional ways.

For QuackHacks 2026, we specifically built this project for the **Accessibility track**: traditional music creation is locked behind expensive gear and years of practice. Epidaurus removes both barriers. It runs in a browser or as a desktop app, requires no installation beyond a webcam, and includes features specifically designed for users with motor impairments.


## How it works

- **Hand 1** controls the arpeggio — raise your hand to raise the pitch, pinch your thumb and index finger to control volume. Make a fist to cycle synth presets.
- **Hand 2** controls the drum machine — raise individual fingers to toggle kick, snare, hi-hat, and clap patterns.

Both hands are tracked in real time via your webcam. No touching required.

## Accessibility features

**Tremor smoothing** — an adjustable stabilization slider reduces jitter caused by hand tremors or conditions like Parkinson's or essential tremor. The underlying smoothing was already in the codebase; Ayre surfaces it as a first-class control.

**One-hand mode** *(in progress)* — redesigned control scheme so the full instrument is playable with a single hand, for users with limb differences or upper-limb impairments.

**Voice-only mode** *(in progress)* — trigger drums and change synth presets via voice commands using the Web Speech API, for users who cannot use hand gestures at all.

**Customizable finger assignment** — reassign which finger controls which drum or instrument. Accommodates non-standard hand anatomy or personal preference.

**No hardware required** — runs on any modern laptop or desktop with a webcam. The barrier to entry is a camera, which most people already have.

## Running it

### In the browser

```bash
git clone https://github.com/0xrpheus/epidaurus 
cd epidaurus 
python -m http.server
```

Navigate to `http://localhost:8000`.

### As a desktop app (Electron)

```bash
npm install
npm start
```

To build a distributable `.app` / `.exe`:

```bash
npm install electron-builder --save-dev
npx electron-builder
```

## Tech stack

- **MediaPipe** — hand tracking and landmark detection
- **Tone.js** — synthesizer, sequencer, and audio effects
- **Three.js** — real-time WebGL waveform visualizer
- **Electron** — desktop app wrapper
- **Web Speech API** — voice command support *(in progress)*

## Requirements

- Modern browser with WebGL support (Chrome recommended)
- Webcam access

## License

MIT

## Credits

Built on top of the [hand gesture arpeggiator](https://github.com/collidingScopes/arpeggiator) by [@collidingScopes](https://github.com/collidingScopes). Epidaurus extends it with an accessibility-focused UI, tremor smoothing controls, customizable finger assignment, and one-hand / voice modes.

- Three.js — https://threejs.org/
- MediaPipe — https://mediapipe.dev/
- Tone.js — https://tonejs.github.io/
