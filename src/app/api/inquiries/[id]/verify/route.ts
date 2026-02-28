import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateAccessToken } from '@/lib/access-token';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, error: 'name and phone are required' },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) {
      return NextResponse.json(
        { ok: false, error: 'Not found' },
        { status: 404 }
      );
    }

    if (inquiry.name !== name || inquiry.phone !== phone) {
      return NextResponse.json(
        { ok: false, error: '入力された情報が一致しません' },
        { status: 401 }
      );
    }

    const token = generateAccessToken(id);
    const response = NextResponse.json({ ok: true });
    response.cookies.set('inquiry_access', token, {
      path: '/',
      maxAge: 86400,
      httpOnly: true,
      sameSite: 'strict',
    });
    return response;
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
