const $ = (selector) => document.querySelector(selector);
const tags = ["すべて", "学び", "子供", "旅行", "店", "買い物", "予定", "手続き", "その他"];
let all = [], active = "すべて", query = "";
const bytes = (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
const encoder = new TextEncoder(), decoder = new TextDecoder();
async function deriveKey(password, salt) { return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" }, await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]), { name: "AES-GCM", length: 256 }, false, ["decrypt"]); }
function render() {
  const results = all.filter((item) => (active === "すべて" || item.tags.includes(active)) && `${item.title} ${item.text} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  $("#heading").textContent = query ? `「${query}」の検索結果` : active === "すべて" ? "最近保存したもの" : `#${active} のスクショ`;
  $("#count").textContent = `${results.length} 件表示`;
  $("#cards").innerHTML = results.length ? results.map((item, index) => `<article class="card"><button class="card-main" data-detail="${index}"><div class="thumb">${item.tags.includes("旅行") ? "✈" : item.tags.includes("子供") ? "✉" : "▤"}</div><div style="min-width:0"><div class="meta">${item.date} · 写真ライブラリ</div><h3>${item.title}</h3><div class="tags">${item.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}</div></div></button><button class="delete" data-delete="${index}">削除</button></article>`).join("") : '<div class="empty">見つかりませんでした</div>';
  document.querySelectorAll("[data-detail]").forEach((button) => button.onclick = () => detail(results[button.dataset.detail]));
  document.querySelectorAll("[data-delete]").forEach((button) => button.onclick = () => { all = all.filter((item) => item !== results[button.dataset.delete]); render(); });
}
function detail(item) { const overlay = document.createElement("div"); overlay.className = "modal-bg"; overlay.innerHTML = `<section class="modal"><button class="close">×</button><div class="modal-top">${item.tags.includes("旅行") ? "✈" : "▤"}</div><div class="modal-body"><p class="eyebrow">${item.date} · 写真ライブラリ</p><h2>${item.title}</h2><p>${item.text.replaceAll("\n", "<br>")}</p><div class="tags">${item.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}</div></div></section>`; overlay.onclick = () => overlay.remove(); overlay.querySelector(".modal").onclick = (event) => event.stopPropagation(); document.body.append(overlay); }
$("#query").oninput = (event) => { query = event.target.value; render(); };
$("#chips").innerHTML = tags.map((tag) => `<button data-tag="${tag}">${tag}</button>`).join("");
document.querySelectorAll("[data-tag]").forEach((button) => button.onclick = () => { active = button.dataset.tag; document.querySelectorAll("[data-tag]").forEach((item) => item.classList.toggle("active", item === button)); render(); });
document.querySelector('[data-tag="すべて"]').classList.add("active");
(async () => { try { const payload = await (await fetch("index.enc.json")).json(); const password = sessionStorage.getItem("screenshot-memory-password"); const raw = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(payload.iv) }, await deriveKey(password, bytes(payload.salt)), bytes(payload.data)); all = JSON.parse(decoder.decode(raw)); render(); } catch { sessionStorage.clear(); location.reload(); } })();
