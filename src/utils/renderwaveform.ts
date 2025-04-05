export const renderWaveform = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, width: number, height: number, samples: Float32Array[], smoothing: number = 0) => {
    const step = Math.ceil(samples[0].length / width);

    // below approach adapted from https://github.com/meandavejustice/draw-wave/blob/master/index.js
    const firstChannel = samples[0];
    let lastDrawnAmplitude;
    const samplesToRender = [];
    let maxAmplitude = -Infinity;
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
            lastDrawnAmplitude = Math.min(1, max - min);
        }

        const amp = Math.max(Math.min(Math.min(1, max - min), lastDrawnAmplitude * (1 + (1 - smoothing))), lastDrawnAmplitude * (1 - (1 - smoothing)));
        if (amp > 0) {
            lastDrawnAmplitude = amp;
            samplesToRender.push(amp);
            maxAmplitude = Math.max(maxAmplitude, amp);
        }
    }
    samplesToRender.forEach((sample, i) => {
        ctx?.fillRect(i, height - sample * height * (1 / maxAmplitude), 1, sample * height * (1 / maxAmplitude));
    });
    return { maxAmplitude };
}