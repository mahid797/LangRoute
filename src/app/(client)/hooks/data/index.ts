/**
 * Data hooks for server state management using TanStack Query.
 * These hooks provide typed, cached access to API endpoints with loading states.
 */

export { default as useLoginMutation } from './auth/useLoginMutation';
export { default as useRegisterMutation } from './auth/useRegisterMutation';
export { default as useForgotPasswordMutation } from './auth/useForgotPasswordMutation';
export { default as useResetPasswordMutation } from './auth/useResetPasswordMutation';

export { useSessionUser } from './useSessionUser';
export { useGoogleSignInMutation } from './useGoogleSignInMutation';
export { useSignOutMutation } from './useSignOutMutation';
