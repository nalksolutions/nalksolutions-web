import { contactMethodNotAllowed, handleContact } from '../../../lib/contact/handler';

export const runtime = 'nodejs';
export const maxDuration = 25;
export const POST = handleContact;
export const GET = contactMethodNotAllowed;
export const HEAD = contactMethodNotAllowed;
export const OPTIONS = contactMethodNotAllowed;
export const PUT = contactMethodNotAllowed;
export const PATCH = contactMethodNotAllowed;
export const DELETE = contactMethodNotAllowed;
