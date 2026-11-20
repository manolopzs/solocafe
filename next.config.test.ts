import { securityHeaders, contentSecurityPolicyReportOnly } from './next.config'

describe('securityHeaders', () => {
  it('returns the required security headers', async () => {
    const headers = await securityHeaders()
    const rules = headers[0].headers

    expect(rules).toContainEqual({ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' })
    expect(rules).toContainEqual({ key: 'X-Content-Type-Options', value: 'nosniff' })
    expect(rules).toContainEqual({ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' })
    expect(rules).toContainEqual({ key: 'X-Frame-Options', value: 'DENY' })
    expect(rules).toContainEqual({ key: 'Content-Security-Policy', value: "frame-ancestors 'none'" })
    expect(rules).toContainEqual({ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' })

    const reportOnly = rules.find((h) => h.key === 'Content-Security-Policy-Report-Only')
    expect(reportOnly).toBeDefined()
    const csp = reportOnly!.value
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("script-src 'self' 'unsafe-inline' https://js.stripe.com")
    expect(csp).toContain("style-src 'self' 'unsafe-inline'")
    expect(csp).toContain("connect-src 'self'")
    expect(csp).toContain("img-src 'self' data: blob: https://images.unsplash.com")
    expect(csp).toContain("font-src 'self' data:")
    expect(csp).toContain("worker-src 'self'")
    expect(csp).toContain("manifest-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("form-action 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
  })

  it('includes the API origin in connect-src and img-src when NEXT_PUBLIC_API_URL is set', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://solocafe-api.onrender.com'
    const csp = contentSecurityPolicyReportOnly()
    expect(csp).toContain('https://solocafe-api.onrender.com')
  })
})
