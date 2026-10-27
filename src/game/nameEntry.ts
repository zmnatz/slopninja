export const NAME_LENGTH = 3;

const LETTER = /^[A-Z]$/;

/** Adds a letter to the next free slot. Anything that isn't a letter, or a full name, is ignored. */
export function typeLetter(name: string, letter: string): string {
  if (name.length >= NAME_LENGTH || !LETTER.test(letter)) return name;
  return name + letter;
}

export function backspace(name: string): string {
  return name.slice(0, -1);
}

export function isComplete(name: string): boolean {
  return name.length === NAME_LENGTH;
}
