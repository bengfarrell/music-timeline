import { IMidiFile } from 'midi-json-parser-worker';
import { parseArrayBuffer } from 'midi-json-parser';
import { MIDITrack } from './miditrack';

export interface TimeSignature {
    numerator: number;
    denominator: number;
    metronome?: number;
    thirtyseconds?: number;
}

export interface TimeMeta {
    timeSignature?: TimeSignature;
    tempo?: number;
    division?: number;
    duration?: number;
}

export class MIDIFile {
    data?: IMidiFile;

    public name: string = '';

    public tracks: MIDITrack[] = [];

    public timeMeta: TimeMeta = {};

    static Load(uri: string | File): Promise<MIDIFile> {
        const midireader = (buffer: ArrayBuffer, name: string): Promise<MIDIFile> => {
            return new Promise((resolve, _reject) => {
                parseArrayBuffer(buffer).then((json: IMidiFile) => {
                    const midi = new MIDIFile();
                    midi.data = json;
                    midi.name = name;
                    midi.timeMeta.division = json.division;

                    midi.data.tracks.forEach((_track, i) => {
                        const track = midi.parseTrack(i);
                        if (track?.events.length === 0) {
                            if (i !== 0 && track.hasTimingInfo) console.warn('Timing information is coming from a track that is not the first track');
                            // this might be a timing track, record the info and don't add it to the list
                            if (track.timeSignature && track.hasTimingInfo) midi.timeMeta.timeSignature = track.timeSignature;
                            if (track.tempo && track.hasTimingInfo) midi.timeMeta.tempo = track.tempo;
                        } else if (track) midi.tracks.push(track);
                    });

                    midi.tracks.forEach((track) => {
                        track.populateMissingTimeData(midi.timeMeta);
                    });

                    resolve(midi);
                });
            });
        }

        return new Promise((resolve, _reject) => {
            if (typeof uri === 'string') {
                fetch(uri).then((response) => {
                    response.arrayBuffer().then((buffer) => {
                        resolve(midireader(buffer, uri));
                    });
                });
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result instanceof ArrayBuffer) {
                        resolve(midireader(e.target.result, uri.name));
                    }
                };
                reader.readAsArrayBuffer(uri);
            }
        });
    }

    protected parseTrack(track: number) {
        if (this.data && this.data.tracks[track]) {
            return MIDITrack.fromMIDI(this.data.tracks[track]);
        }
        return undefined;
    }
}