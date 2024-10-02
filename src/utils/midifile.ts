import { IMidiFile } from 'midi-json-parser-worker';
import { parseArrayBuffer } from 'midi-json-parser';
import { MIDITrack } from './miditrack';

export class MIDIFile {
    data?: IMidiFile;

    public name: string = '';

    parseTrack(track: number) {
        if (this.data && this.data.tracks[track]) {
            return MIDITrack.fromMIDI(this.data.tracks[track], this.data!.division);
        }
        return undefined;
    }

    static Load(uri: string): Promise<MIDIFile> {
        return new Promise((resolve) => {
            fetch(uri).then((response) => {
                response.arrayBuffer().then((buffer) => {
                    parseArrayBuffer(buffer).then((json: IMidiFile) => {
                        const midi = new MIDIFile()
                        midi.data = json;
                        midi.name = uri;
                        resolve(midi);
                    });
                });
            });
        });
    }
}