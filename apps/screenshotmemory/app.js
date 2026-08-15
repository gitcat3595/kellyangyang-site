const $ = (selector) => document.querySelector(selector);
const tags = ["すべて", "学び", "子供", "旅行", "店", "買い物", "予定", "手続き", "その他"];
let all = [], active = "すべて", query = "";
const escapeHtml = (value) => String(value).replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
const icon = (item) => item.tags.includes("旅行") ? "✈" : item.tags.includes("子供") ? "✉" : "▤";
function render() {
  const normalizedQuery = query.toLowerCase();
  const results = all.filter((item) => (active === "すべて" || item.tags.includes(active)) && `${item.title} ${item.text} ${item.tags.join(" ")}`.toLowerCase().includes(normalizedQuery));
  $("#heading").textContent = query ? `「${query}」の検索結果` : active === "すべて" ? "最近保存したもの" : `#${active} のスクショ`;
  $("#count").textContent = `${results.length} 件表示`;
  $("#cards").innerHTML = results.length ? results.map((item, index) => `<article class="card"><button class="card-main" data-detail="${index}" aria-label="${escapeHtml(item.title)}を開く"><div class="thumb">${icon(item)}</div><div style="min-width:0"><div class="meta">${escapeHtml(item.date)} · 写真ライブラリ</div><h3>${escapeHtml(item.title)}</h3><div class="tags">${item.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}</div></div></button><button class="delete" data-delete="${index}">削除</button></article>`).join("") : '<div class="empty">見つかりませんでした</div>';
  document.querySelectorAll("[data-detail]").forEach((button) => button.onclick = () => detail(results[button.dataset.detail]));
  document.querySelectorAll("[data-delete]").forEach((button) => button.onclick = () => { all = all.filter((item) => item !== results[button.dataset.delete]); render(); });
}
function detail(item) {
  const overlay = document.createElement("div"); overlay.className = "modal-bg";
  const image = item.imageUrl ? `<img class="modal-image" src="${encodeURI(item.imageUrl)}" alt="${escapeHtml(item.title)}">` : `<div class="modal-top">${icon(item)}</div>`;
  overlay.innerHTML = `<section class="modal"><button class="close" aria-label="閉じる">×</button>${image}<div class="modal-body"><p class="eyebrow">${escapeHtml(item.date)} · 写真ライブラリ</p><h2>${escapeHtml(item.title)}</h2><h3 class="ocr-label">読み取ったテキスト</h3><p>${escapeHtml(item.text).replaceAll("\n", "<br>")}</p><div class="tags">${item.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}</div></div></section>`;
  overlay.onclick = () => overlay.remove(); overlay.querySelector(".modal").onclick = (event) => event.stopPropagation(); overlay.querySelector(".close").onclick = () => overlay.remove(); document.body.append(overlay);
}
$("#query").oninput = (event) => { query = event.target.value; render(); };
$("#chips").innerHTML = tags.map((tag) => `<button data-tag="${tag}">${tag}</button>`).join("");
document.querySelectorAll("[data-tag]").forEach((button) => button.onclick = () => { active = button.dataset.tag; document.querySelectorAll("[data-tag]").forEach((item) => item.classList.toggle("active", item === button)); render(); });
document.querySelector('[data-tag="すべて"]').classList.add("active");
(async () => { try { if (window.TEMP_PUBLIC) { all = await (await fetch("index.json")).json(); render(); return; } const payload = await (await fetch("index.enc.json")).json(), password = sessionStorage.getItem("screenshot-memory-password"), salt = CryptoJS.enc.Base64.parse(payload.salt), iv = CryptoJS.enc.Base64.parse(payload.iv), key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 250000, hasher: CryptoJS.algo.SHA256 }), data = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(payload.data) }, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8); if (!data) throw new Error("decrypt failed"); all = JSON.parse(data); render(); } catch { sessionStorage.clear(); location.reload(); } })();
