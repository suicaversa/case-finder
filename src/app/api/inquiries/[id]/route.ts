import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/access-token';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify access token from cookie
    const token = request.cookies.get('inquiry_access')?.value;
    if (!token || !verifyAccessToken(token, id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: { chatMessages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!inquiry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Failed to fetch inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiry' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify access token from cookie
    const token = request.cookies.get('inquiry_access')?.value;
    if (!token || !verifyAccessToken(token, id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.shownCaseIds !== undefined) data.shownCaseIds = body.shownCaseIds;
    if (body.generatedCases !== undefined) data.generatedCases = body.generatedCases;
    if (body.initialComment !== undefined) data.initialComment = body.initialComment;

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data,
      include: { chatMessages: { orderBy: { createdAt: 'asc' } } },
    });
    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Failed to update inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}
