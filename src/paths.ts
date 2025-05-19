export const paths = {
  home: '/',
  auth: { signIn: '/auth/login', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/perfil',
    customers: '/dashboard/posto',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/definicoes',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
