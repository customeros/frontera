export function validLinkedInProfileUrl(url: string): boolean {
  const re = /linkedin\.com\/in\/[^/]+\/?$/;

  return re.test(url);
}
