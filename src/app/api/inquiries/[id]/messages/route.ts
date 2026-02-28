import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/access-token';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token = request.cookies.get('inquiry_access')?.value;
  if (!token || !verifyAccessToken(token, id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { inquiryId: id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(messages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token = request.cookies.get('inquiry_access')?.value;
  if (!token || !verifyAccessToken(token, id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();

  // Validate required fields
  if (!body.role || !body.content) {
    return NextResponse.json(
      { error: 'role and content are required' },
      { status: 400 }
    );
  }

  // Verify inquiry exists
  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      inquiryId: id,
      role: body.role,
      content: body.content,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
