/**
 * Retorna a rota inicial baseada no role do usuário
 * @param {string} role - Role do usuário (admin, suporte, user, profissional)
 * @returns {string} - Rota inicial para o usuário
 */
export const getInitialRoute = (role) => {
  switch (role) {
    case 'admin':
      return '/lista-usuarios';
    case 'suporte':
      return '/mensagens';
    case 'user':
    case 'profissional':
      return '/agenda';
    default:
      return '/agenda';
  }
};

