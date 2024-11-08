import { parseArrayBuffer } from 'midi-json-parser';
import { MIDITrack } from './miditrack';
export class MIDIFile {
    constructor() {
        this.name = '';
        this.tracks = [];
        this.timeMeta = {};
    }
    static Load(uri) {
        return new Promise((resolve) => {
            fetch(uri).then((response) => {
                response.arrayBuffer().then((buffer) => {
                    parseArrayBuffer(buffer).then((json) => {
                        const midi = new MIDIFile();
                        midi.data = json;
                        midi.name = uri;
                        midi.timeMeta.division = json.division;
                        midi.data.tracks.forEach((_track, i) => {
                            const track = midi.parseTrack(i);
                            if (track?.events.length === 0) {
                                if (i !== 0 && track.hasTimingInfo)
                                    console.warn('Timing information is coming from a track that is not the first track');
                                // this might be a timing track, record the info and don't add it to the list
                                if (track.timeSignature && track.hasTimingInfo)
                                    midi.timeMeta.timeSignature = track.timeSignature;
                                if (track.tempo && track.hasTimingInfo)
                                    midi.timeMeta.tempo = track.tempo;
                            }
                            else if (track)
                                midi.tracks.push(track);
                        });
                        midi.tracks.forEach((track) => {
                            track.populateMissingTimeData(midi.timeMeta);
                        });
                        resolve(midi);
                    });
                });
            });
        });
    }
    parseTrack(track) {
        if (this.data && this.data.tracks[track]) {
            return MIDITrack.fromMIDI(this.data.tracks[track]);
        }
        return undefined;
    }
}
//# sourceMappingURL=midifile.js.map