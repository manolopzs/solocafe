import type { NextConfig } from "next";

function imageRemotePatterns(): NonNullable<NextConfig['images']>['remotePatterns'] {
  const patterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
    { protocol: 'https', hostname: 'images.unsplash.com' },
  ]
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    try {
      const url = new URL(apiUrl)
      patterns.push({
        protocol: url.protocol === 'http:' ? 'http' : 'https',
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: '/rails/active_storage/**',
      })
    } catch {
      // Leave the default patterns when the API URL is not parseable.
    }
  }
  return patterns
}

export function apiOrigin(): string | null {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) return null
  try {
    const url = new URL(apiUrl)
    const port = url.port && ![ '80', '443' ].includes(url.port) ? `:${url.port}` : ''
    return `${url.protocol}//${url.hostname}${port}`
  } catch {
    return null
  }
}

export function contentSecurityPolicyReportOnly(): string {
  const api = apiOrigin()
  const directives: Record<string, string[]> = {
    'default-src': [ "'self'" ],
    'script-src': [ "'self'", "'unsafe-inline'", 'https://js.stripe.com' ],
    'style-src': [ "'self'", "'unsafe-inline'" ],
    'connect-src': [ "'self'", 'https://api.stripe.com', 'https://hooks.stripe.com', 'https://m.stripe.network' ],
    'img-src': [ "'self'", 'data:', 'blob:', 'https://images.unsplash.com' ],
    'font-src': [ "'self'", 'data:' ],
    'worker-src': [ "'self'" ],
    'manifest-src': [ "'self'" ],
    'object-src': [ "'none'" ],
    'base-uri': [ "'self'" ],
    'form-action': [ "'self'" ],
    'frame-src': [ 'https://*.stripe.com', 'https://js.stripe.com' ],
    'frame-ancestors': [ "'none'" ],
  }
  if (api) {
    directives['connect-src'].push(api)
    directives['img-src'].push(api)
  }
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

export async function securityHeaders() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicyReportOnly() },
      ],
    },
  ]
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageRemotePatterns(),
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  headers: securityHeaders,
};

export default nextConfig;
