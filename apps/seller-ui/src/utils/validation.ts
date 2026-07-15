// utils/validation.ts (or inside your component file)
export const validateWordCount = (
  value: string,
  minWords: number,
  message: string
) => {
  const plainText = value
    ?.replace(/<[^>]+>/g, '') // remove HTML tags
    .replace(/&nbsp;/g, ' ') // replace non-breaking spaces
    .trim();

  const wordCount = plainText?.split(/\s+/).filter((word) => word).length;

  return wordCount >= minWords || message;
};
