import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.shownCaseIds !== undefined) data.shownCaseIds = body.shownCaseIds;

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
