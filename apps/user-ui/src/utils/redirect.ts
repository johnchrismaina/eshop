let redirectToLogin = () => {
  window.location.href = '/login';
};

export const setRedirecthandler = (handler: () => void) => {
  redirectToLogin = handler;
};

export const runRedirectToLogin = () => {
  redirectToLogin();
};
