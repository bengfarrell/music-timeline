### v0.3.1 (2025-1-28)
- Property set through reactivity and clean up some confusing bits that don't render audio in demo or app at the same time

### v0.3.0 (2025-1-27)
- Broke out range selection event to be its own thing
- Add refresh methods to allow note array modification without having to set the whole track again
- Choose synth and allow transpose on MIDI playback
- Make grid lines editable with beats per measure, beats per second, and beat offset seconds
- fix looping and range looping

### v0.2.5 (2025-1-13)
- Fix audio player usage to properly shut down when stopped and better handle switching sources

### v0.2.2 (2025-1-12)
- Break out waveform rendering to be imported externally from this library

### v0.2.0 (2025-1-07)
- Major refactor and project rename to include audio in addition to MIDI

### v0.1.3 (2024-12-21)
- Finally needed file handler processing (vs the URL) to load MIDI files, so made MidiFile.load accept URI or files

### v0.1.2 (2024-12-08)
- Add util in baseplayback to cancel loop
- Add clone, trim actions and UUID property in MIDITrack