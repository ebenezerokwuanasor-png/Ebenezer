/* script.js for RAD. EBENEZER.COM
   Smart admin, strict GitHub raw URL detector (only accepts your repo),
   automatic posts.json append + download, preview, donate, search, background.
*/

/* ========== CONFIG ========== */
const CONFIG = {
  ADMIN_PASS: "@RADEBENEZER3008123400",
  MAX_TRIALS: 5,
  LOCK_KEY: "rad_admin_lock_until_v2",
  TRIALS_KEY: "rad_admin_trials_v2",
  BACKUP_KEY: "rad_posts_backup_v2",
  POSTS_JSON_FILENAME: "posts.json",
  ALLOWED_GITHUB_REPO: "ebenezerokwuanasor-png" // <-- your repo name (confirmed)
};

/* ========== UTILS ========== */
const $ = id => document.getElementById(id);
const now = () => Date.now();
function toast(text, time=2200){
  const el = $("toast");
  el.textContent = text; el.style.display = "block";
  setTimeout(()=> el.style.display = "none", time);
}
function escapeHtml(s){ if(!s) return ""; return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

/* ========== FOOTER YEAR ========== */
$("year").textContent = new Date().getFullYear();

/* ========== BACKGROUND (FLOATING MIX) ========== */
const canvas = $("bgCanvas"), ctx = canvas.getContext("2d");
let W = innerWidth, H = innerHeight;
function resizeCanvas(){ W = innerWidth; H = innerHeight; canvas.width = W; canvas.height = H; initSymbols(); }
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let symbols=[];
function initSymbols(){
  symbols = [];
  const count = Math.max(22, Math.floor(W/70));
  for(let i=0;i<count;i++){
    symbols.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: 6 + Math.random()*28,
      dx: (Math.random()-0.5)*0.5,
      dy: (Math.random()-0.5)*0.5,
      t: Math.random()*1000
    });
  }
}
initSymbols();

function drawSymbol(x,y,r,t){
  ctx.save();
  ctx.translate(x,y);
  ctx.globalAlpha = 0.12 + 0.4 * Math.sin(t*0.02);
  // cross lines
  ctx.strokeStyle = "rgba(10,10,10,0.06)";
  ctx.lineWidth = Math.max(1, r/14);
  ctx.beginPath(); ctx.moveTo(-r/2,0); ctx.lineTo(r/2,0);
  ctx.moveTo(0,-r/2); ctx.lineTo(0,r/2); ctx.stroke();
  // circle
  ctx.beginPath(); ctx.arc(0,0,r/3,0,Math.PI*2); ctx.stroke();
  ctx.restore();
}
function animateBg(){
  ctx.clearRect(0,0,W,H);
  // gradient base heavy mix (1,2,5 dominant; 3,4 slight)
  const g = ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0, "rgba(12,25,48,0.07)"); // dark hint
  g.addColorStop(0.5, "rgba(255,247,224,0.06)"); // soft yellow
  g.addColorStop(1, "rgba(245,247,250,0.06)");
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  // halo (christian subtle)
  ctx.save(); ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = "rgba(196,154,42,0.02)";
  ctx.beginPath(); ctx.ellipse(W*0.82,H*0.22,W*0.6,H*0.6,0,0,Math.PI*2); ctx.fill();
  ctx.restore();
  // neon wave lines (slight)
  for(let i=0;i<3;i++){
    ctx.beginPath();
    const y = H*0.2 + Math.sin(Date.now()/1800 + i)*60;
    ctx.moveTo(0,y);
    for(let x=0;x<W;x+=40) ctx.lineTo(x, y + Math.sin((x+i*50)/80 + Date.now()/1500)*30);
    ctx.strokeStyle = "rgba(12,99,179,0.02)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // symbols
  symbols.forEach(s => {
    drawSymbol(s.x,s.y,s.r,s.t);
    s.x += s.dx; s.y += s.dy; s.t += 0.5;
    if(s.x < -80) s.x = W + 80;
    if(s.x > W + 80) s.x = -80;
    if(s.y < -80) s.y = H + 80;
    if(s.y > H + 80) s.y = -80;
  });
  requestAnimationFrame(animateBg);
}
animateBg();

/* ========== OVERLAY HELPERS ========== */
function setOverlayVisible(id, yes){
  const el = $(id);
  if(!el) return;
  el.style.display = yes ? "flex" : "none";
  el.setAttribute("aria-hidden", !yes);
}
document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", e => {
    const t = e.currentTarget.getAttribute("data-close");
    if(t) setOverlayVisible(t,false);
  });
});

/* ========== STORAGE (trials & lock & backup) ========== */
function getLockUntil(){ return Number(localStorage.getItem(CONFIG.LOCK_KEY) || 0); }
function setLockUntil(ts){ localStorage.setItem(CONFIG.LOCK_KEY, String(ts)); }
function getTrials(){ return Number(localStorage.getItem(CONFIG.TRIALS_KEY) || 0); }
function setTrials(n){ localStorage.setItem(CONFIG.TRIALS_KEY, String(n)); }
function isLocked(){ const u = getLockUntil(); return u && now() < u; }
function lockRemainingMs(){ return Math.max(0, getLockUntil() - now()); }

/* ========== ELEMENTS ========== */
const adminFloatBtn = $("adminFloatBtn");
const adminSurvey = $("adminSurvey");
const adminYes = $("adminYes");
const adminNo = $("adminNo");
const adminOverlay = $("adminOverlay");
const adminStepPassword = $("adminStepPassword");
const adminStepPost = $("adminStepPost");
const trialsLeftEl = $("trialsLeft");
const adminPassInput = $("adminKeyInput");
const adminPassSubmit = $("adminPassSubmit");
const adminPassCancel = $("adminPassCancel");
const adminPassFeedback = $("adminPassFeedback");
const postTitle = $("postTitle");
const postBody = $("postBody");
const postFileURL = $("postFileURL");
const postLocalFile = $("postLocalFile");
const previewBtn = $("previewPostBtn");
const publishBtn = $("publishPostBtn");
const cancelPostBtn = $("cancelPostBtn");
const previewOverlay = $("previewOverlay");
const previewContent = $("previewContent");
const confirmPublishBtn = $("confirmPublishBtn");
const donateBtn = $("donateBtn");
const donateOverlay = $("donateOverlay");
const copyAcc = $("copyAcc");
const searchInput = $("searchInput");
const postsContainer = $("posts");
const emptyHint = $("emptyHint");
const themeToggle = $("themeToggle");

/* ========== POSTS: load posts.json (or local backup) ========== */
let posts = [];
function loadInitialPosts(){
  fetch("posts.json?_=" + Date.now()).then(r => {
    if(!r.ok) throw new Error("no posts");
    return r.json();
  }).then(data => { if(Array.isArray(data)) posts = data; renderPosts(); })
  .catch(()=> { posts = JSON.parse(localStorage.getItem(CONFIG.BACKUP_KEY) || "[]"); renderPosts(); });
}
loadInitialPosts();

/* ========== RENDER POSTS ========== */
function renderPosts(){
  postsContainer.innerHTML = "";
  if(!posts || posts.length===0){ emptyHint.style.display = "block"; return; }
  emptyHint.style.display = "none";
  posts.slice().reverse().forEach(p=>{
    const card = document.createElement("article"); card.className="card";
    const dateTxt = p.date ? new Date(p.date).toLocaleString() : "";
    let html = `<h3>${escapeHtml(p.title)}</h3><div class="meta">${dateTxt}</div><div class="content">${p.content||""}</div>`;
    if(p.fileURL){
      const ext = (p.fileURL.split(".").pop()||"").toLowerCase();
      if(["png","jpg","jpeg","webp","gif"].includes(ext)) html += `<img src="${p.fileURL}" alt="${escapeHtml(p.title)}">`;
      else if(["mp4","webm","ogg"].includes(ext)) html += `<video controls src="${p.fileURL}"></video>`;
      else if(ext==="pdf") html += `<div><a class="download" href="${p.fileURL}" download>Open / Download PDF</a></div>`;
      else html += `<div><a class="download" href="${p.fileURL}" target="_blank">Open file</a></div>`;
      html += `<div style="margin-top:10px"><a class="btn primary" href="${p.fileURL}" download>⬇️ Download</a></div>`;
    }
    html += `<div style="margin-top:10px"><button class="btn ghost" onclick="navigator.share?navigator.share({title:'${encodeURIComponent(p.title)}',text:'${encodeURIComponent(p.title)}',url:'${encodeURIComponent(p.fileURL||window.location.href)}'}):navigator.clipboard.writeText('${p.fileURL||window.location.href}').then(()=>alert('Link copied'))">🔗 Share</button></div>`;
    card.innerHTML = html;
    postsContainer.appendChild(card);
  });
}

/* ========== SHARE helper for inline onclicks ========== */
window.sharePost = (titleEncoded, urlEncoded) => {
  try {
    const url = decodeURIComponent(urlEncoded||"");
    if(navigator.share) navigator.share({title:decodeURIComponent(titleEncoded||""),url});
    else navigator.clipboard.writeText(url||window.location.href).then(()=>toast("Link copied to clipboard"));
  } catch(e){ toast("Share failed"); }
};

/* ========== DONATE UI ========== */
donateBtn.addEventListener("click", ()=> setOverlayVisible("donateOverlay", true));
copyAcc && copyAcc.addEventListener("click", ()=> {
  const txt = "Palmpay Acc: 8116249601 (Okwuanasor Francesca Nwamaka) OR PAGA Acc: 0590180601 (Okwuanasor Francesca Nwamaka)";
  navigator.clipboard.writeText(txt).then(()=> toast("Account details copied"));
});

/* ========== ADMIN FLOW ========== */
adminFloatBtn.addEventListener("click", ()=>{
  if(isLocked()){
    const ms = lockRemainingMs(); const s = Math.floor(ms/1000)%60; const m = Math.floor(ms/60000)%60; const h = Math.floor(ms/3600000);
    return toast(`Admin locked in this browser: ${h}h ${m}m ${s}s`);
  }
  setOverlayVisible("adminSurvey", true);
});
$("adminNo").addEventListener("click", ()=> setOverlayVisible("adminSurvey", false));
$("adminYes").addEventListener("click", ()=> {
  setOverlayVisible("adminSurvey", false);
  setOverlayVisible("adminOverlay", true);
  adminStepPassword.style.display = "block";
  adminStepPost.style.display = "none";
  const t = Math.max(0, CONFIG.MAX_TRIALS - getTrials());
  trialsLeftEl.textContent = t;
  adminPassFeedback.textContent = "";
  adminPassInput.value = "";
});

adminPassCancel.addEventListener("click", ()=> setOverlayVisible("adminOverlay", false));

adminPassSubmit.addEventListener("click", () => {
  if(isLocked()){ toast("Admin locked"); setOverlayVisible("adminOverlay",false); return; }
  const v = (adminPassInput.value||"").trim();
  if(v === CONFIG.ADMIN_PASS){
    setTrials(0);
    adminPassFeedback.style.color = "green"; adminPassFeedback.textContent = "✅ Passkey accepted — opening admin panel";
    setTimeout(()=>{ adminStepPassword.style.display='none'; adminStepPost.style.display='block'; adminPassFeedback.textContent=''; }, 500);
  } else {
    const t = getTrials()+1; setTrials(t);
    const remain = Math.max(0, CONFIG.MAX_TRIALS - t);
    adminPassFeedback.style.color = "#d14343"; adminPassFeedback.textContent = `❌ Incorrect passkey. ${remain} trials remaining.`;
    if(t >= CONFIG.MAX_TRIALS){
      setLockUntil(now() + 24*60*60*1000);
      setOverlayVisible("adminOverlay", false);
      toast("Admin locked for 24 hours (this browser).");
    }
  }
});

/* ========== GITHUB RAW URL VALIDATION (smart & strict) ========== */
async function isValidGithubRawUrl(url){
  try{
    if(!url) return false;
    url = url.trim();
    if(url.startsWith("file:") || url.startsWith("C:\\") || url.includes("/storage/") || url.startsWith("content:")) return false;
    const u = new URL(url);
    // only allow raw.githubusercontent.com OR username.github.io domains but ensure repo matches
    if(u.host.includes("raw.githubusercontent.com")){
      // raw form: raw.githubusercontent.com/{user}/{repo}/{branch}/path
      const parts = u.pathname.split("/").filter(Boolean);
      if(parts.length < 4) return false;
      const repo = parts[1];
      if(repo !== CONFIG.ALLOWED_GITHUB_REPO) return false;
      // test resource exists via fetch (GET)
      const res = await fetch(url, { method: "GET", cache:"no-store" });
      return res.ok;
    }
    // also allow github pages URL like https://{user}.github.io/{repo}/...
    if(u.host === `${CONFIG.ALLOWED_GITHUB_REPO}.github.io` || u.host === `${CONFIG.ALLOWED_GITHUB_REPO}.github.io.` ){
      // allow but still check GET
      const res = await fetch(url, { method: "GET", cache:"no-store" });
      return res.ok;
    }
    return false;
  } catch(e){
    return false;
  }
}

/* ========== PREVIEW & PUBLISH ==========
   previewBtn -> validates and shows preview overlay
   confirmPublish -> appends to posts[], downloads posts.json
*/
previewBtn.addEventListener("click", async () => {
  const title = (postTitle.value||"").trim();
  const body = (postBody.value||"").trim();
  const fileURL = (postFileURL.value||"").trim();
  const localFile = postLocalFile.files[0];
  if(!title || !body) { adminPostFeedback("Title and content required", true); return; }
  let showFile = "";
  if(fileURL){
    adminPostFeedback("Validating GitHub URL...", false);
    const ok = await isValidGithubRawUrl(fileURL);
    if(!ok) return adminPostFeedback("Error 105: Wrong GitHub repo online file URL / URL not found", true);
    showFile = fileURL;
  } else if(localFile){
    showFile = await fileToDataURL(localFile);
  }
  // build preview
  let html = `<h4>${escapeHtml(title)}</h4><p>${escapeHtml(body).replace(/\n/g,"<br>")}</p>`;
  if(showFile){
    const ext = showFile.split(".").pop().split("?")[0].toLowerCase();
    if(showFile.startsWith("data:")){
      if(showFile.startsWith("data:image")) html += `<img src="${showFile}" style="max-width:100%;border-radius:8px">`;
      else if(showFile.startsWith("data:video")) html += `<video src="${showFile}" controls style="max-width:100%"></video>`;
      else html += `<a href="${showFile}" download>Download</a>`;
    } else {
      if(["png","jpg","jpeg","webp","gif"].includes(ext)) html += `<img src="${showFile}" style="max-width:100%;border-radius:8px">`;
      else if(["mp4","webm","ogg"].includes(ext)) html += `<video src="${showFile}" controls style="max-width:100%"></video>`;
      else if(ext==="pdf") html += `<a href="${showFile}" download>Open PDF</a>`;
      else html += `<a href="${showFile}" target="_blank">Open file</a>`;
    }
  }
  previewContent.innerHTML = html;
  setOverlayVisible("previewOverlay", true);
  adminPostFeedback("");
});

confirmPublishBtn.addEventListener("click", async () => {
  const title = (postTitle.value||"").trim();
  const body = (postBody.value||"").trim();
  const fileURL = (postFileURL.value||"").trim();
  const localFile = postLocalFile.files[0];
  if(!title || !body) { adminPostFeedback("Title and content required", true); return; }
  let finalFileURL = "";
  if(fileURL){
    adminPostFeedback("Validating final GitHub URL...", false);
    const ok = await isValidGithubRawUrl(fileURL);
    if(!ok) return adminPostFeedback("Error 105: Wrong GitHub repo online file URL / URL not found on GitHub repo", true);
    finalFileURL = fileURL;
  } else if(localFile){
    finalFileURL = await fileToDataURL(localFile); // data url preview only
  }
  const newPost = {
    id: "p_" + Date.now().toString(36),
    title: title,
    date: new Date().toISOString(),
    content: body,
    fileURL: finalFileURL
  };
  posts.push(newPost);
  localStorage.setItem(CONFIG.BACKUP_KEY, JSON.stringify(posts));
  renderPosts();
  downloadJson(posts, CONFIG.POSTS_JSON_FILENAME);
  setOverlayVisible("previewOverlay", false);
  setOverlayVisible("adminOverlay", false);
  toast("Post created and posts.json downloaded. Upload posts.json + file to GitHub to persist.");
  // clear fields
  postTitle.value=""; postBody.value=""; postFileURL.value=""; postLocalFile.value="";
});

/* publishBtn direct (requests passkey again) */
publishBtn.addEventListener("click", async () => {
  const confirmPass = prompt("Confirm admin passkey to publish:");
  if(confirmPass !== CONFIG.ADMIN_PASS) { adminPostFeedback("Publish confirmation failed.", true); return; }
  confirmPublishBtn.click();
});
cancelPostBtn.addEventListener("click", ()=> setOverlayVisible("adminOverlay", false));

/* helper to show admin post feedback */
function adminPostFeedback(msg, isError=false){
  const el = $("adminPostFeedback");
  if(!el) return;
  el.style.color = isError ? "#d14343" : "green";
  el.textContent = msg || "";
  if(!isError) setTimeout(()=> el.textContent = "", 2500);
}

/* ========== small util: file -> dataURL ========== */
function fileToDataURL(file){
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = ()=> res(fr.result);
    fr.onerror = ()=> rej("read error");
    fr.readAsDataURL(file);
  });
}

/* ========== JSON download helper ========== */
function downloadJson(obj, filename){
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ========== Helper: validate and normalize GitHub raw url pattern =====
   Accept only raw.githubusercontent.com/*/ebenezerokwuanasor-png/*  OR github pages domain user.github.io
*/
function normalizeAndTestRepoUrl(url){
  try {
    const u = new URL(url);
    // block local device paths
    if(u.protocol === "file:" || u.protocol === "content:") return false;
    // allow raw.githubusercontent.com (must contain repo name)
    if(u.hostname.includes("raw.githubusercontent.com")){
      const parts = u.pathname.split("/").filter(Boolean);
      // raw.githubusercontent.com/{user}/{repo}/{branch}/path...
      if(parts.length < 4) return false;
      const repo = parts[1];
      if(repo !== CONFIG.ALLOWED_GITHUB_REPO) return false;
      return true;
    }
    // allow github pages domain user.github.io
    if(u.hostname === `${CONFIG.ALLOWED_GITHUB_REPO}.github.io` || u.hostname.endsWith(".github.io")){
      // ensure path includes repo or root (accept but still will check existence)
      return true;
    }
    return false;
  } catch(e){
    return false;
  }
}

/* ========== fetch helper used inside isValidGithubRawUrl earlier
   (kept minimal: GET and check ok)
*/
async function testUrlExists(url){
  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    return res.ok;
  } catch(e){ return false; }
}

/* isValidGithubRawUrl uses normalizeAndTestRepoUrl and testUrlExists */
async function isValidGithubRawUrl(url){
  if(!normalizeAndTestRepoUrl(url)) return false;
  return await testUrlExists(url);
}

/* ========== Search filter ========== */
searchInput.addEventListener("input", e => {
  const q = (e.target.value||"").toLowerCase();
  document.querySelectorAll(".card").forEach(c => {
    c.style.display = c.textContent.toLowerCase().includes(q) ? "" : "none";
  });
});

/* ========== Overlay close handlers ========== */
document.querySelectorAll(".overlay .close").forEach(btn => {
  btn.addEventListener("click", e => {
    const overlay = e.currentTarget.closest(".overlay");
    if(overlay) overlay.style.display = "none";
  });
});

/* ========== Locking & Trials helpers ==========
   store trials count in localStorage so closing tab doesn't reset attempts
*/
function getTrials(){ return Number(localStorage.getItem(CONFIG.TRIALS_KEY) || 0); }
function setTrials(v){ localStorage.setItem(CONFIG.TRIALS_KEY, String(v)); }
function getLockUntil(){ return Number(localStorage.getItem(CONFIG.LOCK_KEY) || 0); }
function setLockUntil(ts){ localStorage.setItem(CONFIG.LOCK_KEY, String(ts)); }
function isLocked(){ const t = getLockUntil(); return t && now() < t; }
function lockRemainingMs(){ const t = getLockUntil(); return Math.max(0, t - now()); }

/* ========== Export small API for debug/testing ========== */
window.__RAD = {
  posts,
  renderPosts,
  downloadJson
};

/* ========== Load initial posts & render ========== */
function init(){
  // load from posts.json or local backup already attempted earlier; ensure posts array exists
  if(!Array.isArray(posts)) posts = JSON.parse(localStorage.getItem(CONFIG.BACKUP_KEY) || "[]");
  renderPosts();
}
init();