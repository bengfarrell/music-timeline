export class AudioFile {
    buffer: AudioBuffer;

    name: string = '';

    constructor(name: string, buffer: AudioBuffer) {
        this.buffer = buffer;
        this.name = name || '';
    }

    static Load(uri: string | File): Promise<AudioFile> {
        return new Promise((resolve, _reject) => {
            const context = new AudioContext();
            if (typeof uri === 'string') {
                fetch(uri)
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
                    .then(audioBuffer => {
                        resolve(new AudioFile(uri, audioBuffer));
                    });
            } else {
                const context = new AudioContext();
                uri.arrayBuffer().then((buffer) => {
                    context.decodeAudioData(buffer).then(audioBuffer => {
                        return new AudioFile(uri.name, audioBuffer);
                    });
                });
            }
        });
    }
}