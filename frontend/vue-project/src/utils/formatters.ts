/**
 * Formats a date string into a human-readable format.
 * @param dateString - The date string to format.
 * @returns The formatted date string.
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

/**
 * Strips HTML tags and truncates a string to a specified length.
 * @param content - The HTML string to truncate.
 * @param length - The maximum length of the truncated string.
 * @returns The truncated plain text string.
 */
export const truncateContent = (content: string, length = 100): string => {
  if (!content) return '';
  // Strip HTML tags
  const strippedContent = content.replace(/<\/?[^>]+(>|$)/g, '');
  if (strippedContent.length <= length) {
    return strippedContent;
  }
  return strippedContent.substring(0, length) + '...';
};