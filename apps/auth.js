(() => {
  const KEY = "kelly-apps-unlocked";
  const HASH = "9b39f8342f0e7a361d55cd758e67be2a653ccfae7c39ae482089de1831c44d13";
  const email = "nnsh774@gmail.com";
  const digest = (value) => CryptoJS.SHA256(value).toString();
  const unlock = () => { document.documentElement.classList.remove("apps-locked"); document.documentElement.classList.add("apps-unlocked"); };
  if (sessionStorage.getItem(KEY) === "yes") { unlock(); return; }
  document.documentElement.classList.add("apps-locked");
  document.addEventListener("DOMContentLoaded", () => {
    const cover = document.createElement("div");
    cover.id = "apps-lock";
    cover.innerHTML = `<form><p class="lock-kicker">KELLY'S APPS</p><h1>Private apps</h1><p>パスワードを入力してください。</p><input type="password" autocomplete="current-password" placeholder="Password" aria-label="Password" required><button>開く</button><small><a href="mailto:${email}?subject=Apps%20password%20reset">パスワードをリセット</a></small><b aria-live="polite"></b></form>`;
    document.body.prepend(cover);
    const form = cover.querySelector("form"), input = cover.querySelector("input"), error = cover.querySelector("b");
    form.addEventListener("submit", (event) => { event.preventDefault(); if (digest(input.value) === HASH) { sessionStorage.setItem(KEY, "yes"); sessionStorage.setItem("screenshot-memory-password", input.value); unlock(); cover.remove(); } else { error.textContent = "パスワードが違います。"; input.select(); } });
    input.focus();
  });
})();
