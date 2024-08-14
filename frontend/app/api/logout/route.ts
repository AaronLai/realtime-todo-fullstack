import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  cookies().delete('authToken');
  return Response.redirect(new URL('/login', request.url));
}
