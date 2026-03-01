import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { integrationId, credentials } = body

    if (!integrationId) {
      return NextResponse.json({ verified: false, error: 'Missing integrationId' }, { status: 400 })
    }

    // Stub: always return verified. Wire real verification later.
    console.log(`[integrations/verify] Stub verify for ${integrationId}`, Object.keys(credentials || {}))

    return NextResponse.json({ verified: true, integrationId })
  } catch {
    return NextResponse.json({ verified: false, error: 'Invalid request' }, { status: 400 })
  }
}
