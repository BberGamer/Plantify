// API đọc phiên qua callback, không import authStore và không giữ bản token thứ hai.
let access = {
  getContext: () => ({ version: 0, token: null, userId: null }),
  expire: () => {},
};

export function bindSessionAccess(provider) {
  access = provider;
}
export const getSessionContext = () => access.getContext();
export function isSessionCurrent(context) {
  const current = getSessionContext();
  return (
    !!context &&
    context.version === current.version &&
    context.token === current.token &&
    context.userId === current.userId
  );
}
export const expireRequestSession = (context) => access.expire(context);

export function sessionError(code) {
  return Object.assign(new Error("Không thể hoàn tất thao tác phiên."), {
    code,
  });
}
