# Ayre

While discussing the joy instrumental music brings to people, our team realized that learning and playing instruments isn’t equally accessible to everyone. Traditional lessons and instruments can be expensive, and many digital music tools assume the user can physically interact with a keyboard, mouse, or instrument in conventional ways.

The word "Ayre" originates from the Rennaissance Era and refers to a genre of solo songs, which perfectly encompasses the user's experience with our product.  

For QuackHacks 2026, we specifically built this project for the **Accessibility track**: traditional music creation is locked behind expensive gear and years of practice. Epidaurus removes both barriers. It runs in a browser or as a desktop app, requires no installation beyond a webcam, and includes features specifically designed for users with motor impairments.


## How it works
- **Hand 1** controls the arpeggio — raise your hand to raise the pitch, pinch your thumb and index finger to control volume. Make a fist to cycle synth presets.
- **Hand 2** controls the instrument sounds — raise individual fingers to toggle kick, snare, hi-hat, clap patterns, etc.

Both hands are tracked in real time via your webcam. No touching required.

## Accessibility features

**Tremor smoothing** — an adjustable stabilization slider reduces jitter caused by hand tremors or conditions like Parkinson's or muscle weakness. The underlying smoothing was already in the codebase; Ayre surfaces it as a first-class control.

**One-hand mode** — redesigned control scheme so the instrument sounds and volume adjustment is controllable from one hand for users with limb differences/impairments.

**Voice-only mode** — trigger instrument sounds and change synth presets via voice commands using the Web Speech API, for users who cannot use hand gestures at all.

**Customizable finger assignment** — reassign which finger controls which instrument. Accommodates non-standard hand anatomy or personal preference.

**No specialized hardware required** — runs on any modern laptop or desktop with a webcam and microphone.

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
- **Gemini API** — automates synthesizer presets based on user input
- **Hosting** — Vercel (frontend) and Railway (backend)
- **Web Speech API** — voice command support *(in progress)*

## Requirements

- Modern browser with WebGL support (Chrome recommended)
- Webcam and microphone access

## License

MIT

## Credits

Built on top of the [hand gesture arpeggiator](https://github.com/collidingScopes/arpeggiator) by [@collidingScopes](https://github.com/collidingScopes). Ayre extends it with an accessibility-focused UI, tremor smoothing controls, customizable finger assignment, and one-hand / voice modes.

- Three.js — https://threejs.org/
- MediaPipe — https://mediapipe.dev/
- Tone.js — https://tonejs.github.io/

## Contributors
- Vaibhav Achuthananda
- Shasha Alvares
- Ravisara Cheakdkaipejchara

## Team Name: Ayre

## Screenshots
Two Hand Demo <img width="1465" height="875" alt="Screenshot 2026-03-01 at 3 19 22 AM" src="https://github.com/user-attachments/assets/c9d4b132-f92e-443a-84e0-83c032bc393d" />

One Hand Demo <img width="1465" height="874" alt="Screenshot 2026-03-01 at 3 22 33 AM" src="https://github.com/user-attachments/assets/8c4fcb82-2556-46ec-8538-04e5c1b4e9ce" />


Voice Command Control Panel <img width="257" height="514" alt="Screenshot 2026-03-01 at 3 24 01 AM" src="https://github.com/user-attachments/assets/f20ad16a-d8a0-43bd-ae5e-d6086eb6d7d2" />



