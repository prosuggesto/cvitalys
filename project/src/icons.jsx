// Simple line icons — stroke-based, 1.5 weight
const Icon = ({ d, size = 18, fill, stroke = "currentColor", sw = 1.5, viewBox = "0 0 24 24", children }) =>
<svg width={size} height={size} viewBox={viewBox} fill={fill || "none"} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>;


const I = {
  Menu: (p) => <Icon {...p}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></Icon>,
  Close: (p) => <Icon {...p}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></Icon>,
  Brush: (p) => <Icon {...p}><path d="M17 3l4 4-12 12-5 1 1-5z" /><path d="M15 5l4 4" /><line x1="5" y1="19" x2="7" y2="21" /></Icon>,
  Grid: (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></Icon>,
  Eye: (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icon>,
  X: (p) => <Icon {...p}><line x1="7" y1="7" x2="17" y2="17" /><line x1="17" y1="7" x2="7" y2="17" /></Icon>,
  Plus: (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>,
  QR: (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3z" /><path d="M19 14v3h-2" /><path d="M14 19h3" /><path d="M19 19v2" /></Icon>,
  Share: (p) => <Icon {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></Icon>,
  Cv: (p) => <Icon {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><line x1="8" y1="8" x2="14" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="13" y2="16" /></Icon>,
  Chart: (p) => <Icon {...p}><line x1="4" y1="20" x2="20" y2="20" /><rect x="6" y="12" width="3" height="8" /><rect x="11" y="8" width="3" height="12" /><rect x="16" y="14" width="3" height="6" /></Icon>,
  Wifi: (p) => <Icon {...p}><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /></Icon>,
  User: (p) => <Icon {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>,
  Logout: (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon>,
  Copy: (p) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Icon>,
  Open: (p) => <Icon {...p}><path d="M5 12h14" /><polyline points="13 6 19 12 13 18" /></Icon>,
  Mic: (p) => <Icon {...p}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><line x1="12" y1="18" x2="12" y2="22" /></Icon>,
  Play: (p) => <Icon {...p}><path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5z" fill="currentColor" stroke="none" /></Icon>,
  Pause: (p) => <Icon {...p}><rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor" stroke="none" /><rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor" stroke="none" /></Icon>,
  Upload: (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></Icon>,
  Check: (p) => <Icon {...p}><polyline points="20 6 9 17 4 12" /></Icon>,
  Sparkle: (p) => <Icon {...p}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" /></Icon>,
  Mail: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3 7 12 13 21 7" /></Icon>,
  Phone: (p) => <Icon {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></Icon>,
  Globe: (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" /></Icon>,
  Whatsapp: (p) => <Icon {...p}><path d="M20.5 11.5a8.5 8.5 0 1 1-15.7 4.4L3 20l4.3-1.6A8.5 8.5 0 0 0 20.5 11.5z" /><path d="M8.5 9.5c0 4 3 7 7 7l.8-1.7-2.3-1-.8.8a4 4 0 0 1-2.8-2.8l.8-.8-1-2.3-1.7.8z" /></Icon>,
  Linkedin: (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><line x1="8" y1="10" x2="8" y2="17" /><circle cx="8" cy="7" r="0.6" fill="currentColor" /><path d="M12 17v-4a2 2 0 0 1 4 0v4" /><line x1="12" y1="10" x2="12" y2="17" /></Icon>,
  Instagram: (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="3.5" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></Icon>,
  ThumbsUp: (p) => <Icon {...p}><path d="M7 11v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3z" /><path d="M7 11l4-7a2 2 0 0 1 4 1v4h5a2 2 0 0 1 2 2.3l-1.4 7a2 2 0 0 1-2 1.7H7" /></Icon>,
  Feedback: (p) => <Icon {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></Icon>,
  Arrow: (p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></Icon>,
  Trash: (p) => <Icon {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M10 11v6M14 11v6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></Icon>,
  Calendar: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></Icon>,
  Crown: (p) => <Icon {...p}><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" /></Icon>,
  Lock: (p) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 1 1 8 0v4" /></Icon>
};

// Real brand logos using actual images
const BRAND_SRC = {
  linkedin:  "assets/linkedin.png",
  instagram: "assets/instagram.webp",
  gmail:     "assets/gmail.svg",
  whatsapp:  "assets/whatsapp.svg",
};
const BrandLogo = ({ name, size = 18 }) => {
  const src = BRAND_SRC[name];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      style={{ width: size, height: size, display: "block", objectFit: "contain", flexShrink: 0 }} />
  );
};

window.I = I;
window.BrandLogo = BrandLogo;