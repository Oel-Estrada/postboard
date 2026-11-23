/**
 * Builds a two-letter monogram from a person's name.
 *
 * Words ending in `.` (honorifics such as "Mrs.") are skipped.
 *
 * @param name - Full name, for example `'Mrs. Dennis Schulist'`.
 * @returns The upper-case first letters of the first two remaining words (`'DS'`).
 */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word && !word.endsWith('.'))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}
