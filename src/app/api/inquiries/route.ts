import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const inquiries = await prisma.inquiry.findMany({
      include: { chatMessages: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Failed to fetch inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.jobCategory || !body.industry) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, phone, jobCategory, industry' },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        companyName: body.companyName,
        companyUrl: body.companyUrl,
        jobCategory: body.jobCategory,
        jobCategoryOther: body.jobCategoryOther,
        industry: body.industry,
        industryOther: body.industryOther,
        consultationContent: body.consultationContent,
        shownCaseIds: body.shownCaseIds ?? [],
      },
      include: { chatMessages: true },
    });
    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error('Failed to create inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 }
    );
  }
}
