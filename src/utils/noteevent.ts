
export interface NoteEvent {
    delta?: number,
    note: number;
    channel?: number;
    velocity: number;
    duration: number;
    time: number;
}
