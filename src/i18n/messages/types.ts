import type { he } from './he';

/** Turns every literal text of a message tree into a plain string, so another language fits the same shape. */
type Widen<T> = T extends string ? string : { -readonly [K in keyof T]: Widen<T[K]> };

/** The shape of the messages of every language: the keys of Hebrew, with any text as a value. */
export type Messages = Widen<typeof he>;
