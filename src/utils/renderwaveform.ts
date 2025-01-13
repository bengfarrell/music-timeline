export const renderWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number, samples: Float32Array[], ampScale: number = 1, smoothing: number = 0) => {
    const step = Math.ceil(samples[0].length / width);

    // below approach adapted from https://github.com/meandavejustice/draw-wave/blob/master/index.js
    const firstChannel = samples[0];
    let lastDrawnAmplitude;
    for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
            const datum = firstChannel[(i * step) + j] || 0;
            if (datum < min)
                min = datum;
            if (datum > max)
                max = datum;
        }

        if (!lastDrawnAmplitude) {
            lastDrawnAmplitude = Math.min(1, max - min * ampScale);
        }

        //console.log('min', min, 'max', max, 'lastDrawnAmplitude', lastDrawnAmplitude);
        const amp = Math.max(Math.min(Math.min(1, max - min * ampScale), lastDrawnAmplitude * (1 + (1 - smoothing))), lastDrawnAmplitude * (1 - (1 - smoothing)));
        if (amp > 0) {
            lastDrawnAmplitude = amp;
            ctx?.fillRect(i, height - amp * height, 1, amp * height);
        }
    }
}