import { SessionManager } from '@/lib/session/manager'

export async function GET() {
    const sessionManager = SessionManager.getInstance()

    const session = await sessionManager.getSession()
    const status = await sessionManager.checkSessionStatus()

    return Response.json({ session, status })
}