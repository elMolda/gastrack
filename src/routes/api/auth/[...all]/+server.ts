import { auth } from '$lib/auth';

export const GET = (event: { request: Request }) => auth.handler(event.request);
export const POST = (event: { request: Request }) => auth.handler(event.request);
