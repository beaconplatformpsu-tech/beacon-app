import sharp from "sharp";

export async function generateBeaconCover(
  title: string,
  resourceType: string,
  width = 1200,
  height = 630
): Promise<Buffer> {
  // Truncate long titles
  const displayTitle = title.length > 55 ? title.substring(0, 52) + "..." : title;
  
  // A sleek, minimal SVG design with a gradient and centered text
  const svgText = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)" />
      
      <!-- Accent top border -->
      <rect width="100%" height="12" fill="url(#accent)" />
      
      <!-- Beacon Logo / Text -->
      <text x="60" y="80" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" fill="#f8fafc">
        Beacon Platform
      </text>

      <!-- Resource Type Badge -->
      <rect x="60" y="180" width="${resourceType.length * 15 + 40}" height="40" rx="20" fill="#334155" />
      <text x="${60 + (resourceType.length * 15 + 40) / 2}" y="206" font-family="system-ui" font-size="16" font-weight="600" fill="#cbd5e1" text-anchor="middle">
        ${resourceType.toUpperCase()}
      </text>

      <!-- Main Title (Wrapped into 2 lines if needed) -->
      <text x="60" y="300" font-family="system-ui, sans-serif" font-size="64" font-weight="900" fill="#ffffff" letter-spacing="-1">
        ${displayTitle}
      </text>
      
      <!-- Bottom Decorative Element -->
      <circle cx="${width - 100}" cy="${height + 50}" r="250" fill="url(#accent)" opacity="0.1" />
      <circle cx="${width - 50}" cy="${height + 100}" r="150" fill="url(#accent)" opacity="0.2" />
    </svg>
  `;

  // Convert the SVG to a WebP buffer
  const buffer = await sharp(Buffer.from(svgText))
    .webp({ quality: 80 })
    .toBuffer();

  return buffer;
}
