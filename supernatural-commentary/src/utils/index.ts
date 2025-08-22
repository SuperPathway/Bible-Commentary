export function createPageUrl(pageName: string): string {
  const key = pageName.trim().toLowerCase();
  switch (key) {
    case 'home':
      return '/';
    case 'about':
      return '/about';
    case 'pricing':
      return '/pricing';
    case 'contact':
      return '/contact';
    case 'admindashboard':
      return '/admin';
    default:
      return '/';
  }
}