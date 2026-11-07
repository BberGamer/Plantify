let loading;

export default function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const fail = () => {
      clearTimeout(timer);
      script.remove();
      reject(Object.assign(new Error("Google script unavailable"), { code: "GOOGLE_SCRIPT_ERROR" }));
    };
    const timer = setTimeout(fail, 15000);
    script.src = "https://accounts.google.com/gsi/client?hl=vi";
    script.async = true;
    script.onload = () => {
      clearTimeout(timer);
      if (window.google?.accounts?.id) resolve(window.google.accounts.id);
      else fail();
    };
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch((failure) => { loading = undefined; throw failure; });
  return loading;
}
