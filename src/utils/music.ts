export const NOTES = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const getNotation = (note: number): string => {
    return NOTES[note % NOTES.length] + Math.floor(note / NOTES.length - 2);
}

export const getNotations = (min: number, max: number) => {
    const result = [];
    for (let c=  min; c < max; c++ ){
        result.push(getNotation(c));
    }
    return result;
}