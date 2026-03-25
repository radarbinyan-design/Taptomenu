import { NextRequest, NextResponse } from 'next/server'
import { getJob } from '@/lib/menu-store'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const job = getJob(params.jobId)

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    currentStep: job.currentStep,
    result: job.status === 'completed' ? job.result : undefined,
    error: job.error,
  })
}
