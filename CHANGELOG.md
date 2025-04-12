### v0.4.0 (2025-4-5)
- add beat detection functionality to audio playback
- change beats per second accessors to beats per minute to be more standard
- drop amp scale from waveform drawing
- allow beat highlighting
- add metronome
- change class names (dropping playback since it comes from playback folder)
- range is actually comes back as measures in timeline event, so change accessor to reflect
- add metronome and grid highlighting and BPM/offset calc in audio demo

### v0.3.2 (2025-1-30)
- firm up note replacement and refreshing
- rename MIDITimedPlayback to MIDIPlayback
- make stop playback function work properly
- pass buffer/MIDI to timeline via .property on rendered HTML to be better in sync with render cycle

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