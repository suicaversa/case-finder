import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobCategory = searchParams.get('jobCategory');
  const industry = searchParams.get('industry');

  const where: Record<string, unknown> = {};
  if (jobCategory) {
    where.jobCategories = { has: jobCategory };
  }
  if (industry) {
    where.industries = { has: industry };
  }

  const cases = await prisma.caseStudy.findMany({ where });
  return NextResponse.json(cases);
}
