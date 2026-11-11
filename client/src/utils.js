/**
 * LaunchBoard UI & Format Utilities
 */

const GRADIENTS = [
  { bg: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', text: '#593400' },
  { bg: 'linear-gradient(135deg, #FED7AA 0%, #FB923C 100%)', text: '#682600' },
  { bg: 'linear-gradient(135deg, #FEF08A 0%, #FBBF24 100%)', text: '#5C3800' },
  { bg: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)', text: '#1E293B' },
  { bg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', text: '#312E81' },
  { bg: 'linear-gradient(135deg, #D1FAE5 0%, #6EE7B7 100%)', text: '#064E3B' },
  { bg: 'linear-gradient(135deg, #FFEDD5 0%, #FDBA74 100%)', text: '#7C2D12' },
  { bg: 'linear-gradient(135deg, #F5F5F4 0%, #D6D3D1 100%)', text: '#292524' }
];

/**
 * Returns deterministic soft gradient style and dark text color for a given string
 */
export function getDeterministicGradient(seedString = '') {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

/**
 * Extracts 1-2 uppercase initials from a string
 */
export function getInitials(text = '') {
  const clean = text.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'LB';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Safely reads liked project IDs from localStorage
 */
export function getLikedProjectIds() {
  try {
    const raw = localStorage.getItem('launchboard_liked_ids');
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

/**
 * Safely saves a liked project ID to localStorage
 */
export function markProjectAsLiked(id) {
  try {
    const set = getLikedProjectIds();
    set.add(id);
    localStorage.setItem('launchboard_liked_ids', JSON.stringify(Array.from(set)));
  } catch {
    // Ignore storage quota or disabled storage errors
  }
}

/**
 * Formats ISO date string to readable format (e.g. "Mar 15, 2026")
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return isoString;
  }
}
