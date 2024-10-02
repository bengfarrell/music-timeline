import { MIDITrack, NoteEvent } from './miditrack';

export const generateExample = () => {
    const notes: NoteEvent[] = [];
    for (let i = 0; i < 100; i++) {
        notes.push({
            note: Math.floor(i / 5) + 60,
            time: i * 0.5,
            duration: 0.25,
            velocity: Math.random() * 64 + 60,
        });
    }
    return MIDITrack.fromNoteEvents(notes, { numerator: 4, denominator: 4 }, 1);
};