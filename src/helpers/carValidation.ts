const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 20;

export const isValidCarName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= MIN_NAME_LENGTH && trimmed.length <= MAX_NAME_LENGTH;
};

export const normalizeCarName = (name: string): string => name.trim();

export { MAX_NAME_LENGTH, MIN_NAME_LENGTH };
