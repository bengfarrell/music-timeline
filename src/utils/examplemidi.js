import { MIDITrack } from './miditrack';
export const generateExample = (iterations = 100) => {
    const bpm = 120;
    const notes = [];
    for (let i = 0; i < iterations; i++) {
        notes.push({
            note: Math.floor(i / 5) + 60,
            time: i * 0.5 * bpm,
            duration: 0.25 * bpm,
            velocity: Math.random() * 64 + 60,
        });
    }
    return MIDITrack.fromNoteEvents(notes, {
        timeSignature: {
            numerator: 4,
            denominator: 4
        },
        division: bpm
    });
};
//# sourceMappingURL=examplemidi.js.map