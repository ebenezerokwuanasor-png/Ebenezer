// firebase-comments.js
// Modular Firebase v12 usage for comments, likes, posts, and admin upload.
// This file initializes Firebase using your project and provides functions
// for the main index to interact with Firestore and Storage.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, deleteDoc, doc, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

// Firebase config (your project)
const firebaseConfig = {
  apiKey: "AIzaSyBA195h8OEGZ0ntVmCdLkQEr9Gjq4f_5DY",
  authDomain: "rad-ebenezer-site.firebaseapp.com",
  projectId: "rad-ebenezer-site",
  storageBucket: "rad-ebenezer-site.appspot.com",
  messagingSenderId: "84682887505",
  appId: "1:84682887505:web:10be93ded66989e31dc370",
  measurementId: "G-JPMGBY6BFP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// expose db/storage to global for index to use if needed
window.db = db;
window.storage = storage;

// helper escape
function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\"','&quot;').replaceAll("'","&#39;"); }

// Render posts container
const postsList = document.getElementById('postsList');

// Load posts from Firestore live; fallback to posts.json
async function loadPosts(){
  try{
    const q = query(collection(db,'posts'), orderBy('createdAt','desc'));
    onSnapshot(q, snap => {
      if(snap.empty){
        loadFallback();
        return;
      }
      postsList.innerHTML = '';
      snap.forEach(docSnap => {
        const data = docSnap.data();
        renderPostCard(docSnap.id, data);
      });
    });
  }catch(e){
    console.warn('Firestore posts load failed', e);
    loadFallback();
  }
}

async function loadFallback(){
  try{
    const res = await fetch('posts.json');
    const arr = await res.json();
    postsList.innerHTML = '';
    arr.forEach((p,i)=> renderPostCard('local-'+i, p));
  }catch(e){
    postsList.innerHTML = '<div class="small">No posts to show.</div>';
  }
}

function renderPostCard(postId, post){
  const card = document.createElement('div');
  card.className = 'card';
  card.id = 'post-'+postId;
  const title = post.title || 'Untitled';
  const date = post.date || '';
  const content = post.content || '';
  const likes = post.likes || 0;
  card.innerHTML = `
    <div class="post-meta">
      <div><strong>${escapeHtml(title)}</strong><div class="small">${escapeHtml(date)}</div></div>
      <div class="post-actions">
        <div class="stat-pill" id="comments-count-${postId}">0 comments</div>
        <button class="like-btn" id="like-btn-${postId}">❤️ <span id="like-count-${postId}">${likes}</span></button>
      </div>
    </div>
    <div style="margin-top:.6rem">${content}</div>
    <div class="comment-box">
      <div style="display:flex;justify-content:space-between;align-items:center"><strong>Comments</strong></div>
      <div id="comments-${postId}" style="margin-top:.6rem"></div>
      <textarea id="input-${postId}" style="width:100%;height:60px;border-radius:8px;padding:.5rem;margin-top:.6rem" placeholder="Write a comment..."></textarea>
      <div style="text-align:right;margin-top:.4rem"><button class="btn" onclick="addComment('${postId}')">Post Comment</button></div>
    </div>
  `;
  postsList.appendChild(card);

  // like handler
  document.getElementById(`like-btn-${postId}`).onclick = async ()=>{
    try{
      const postRef = doc(db,'posts',postId);
      await updateDoc(postRef, { likes: (post.likes||0) + 1 });
    }catch(e){ console.error('like error',e); alert('Unable to like (post might be local fallback).'); }
  };

  // comments listener
  try{
    const q = query(collection(db,'comments'), where('postId','==',postId), orderBy('createdAt','asc'));
    onSnapshot(q, snap=>{
      const container = document.getElementById('comments-'+postId);
      container.innerHTML = '';
      if(snap.empty){ document.getElementById('comments-count-'+postId).textContent='0 comments'; return; }
      document.getElementById('comments-count-'+postId).textContent = snap.size + (snap.size===1?' comment':' comments');
      snap.forEach(cSnap=>{
        const d = cSnap.data();
        const div = document.createElement('div'); div.className='comment';
        const del = window.adminMode ? `<button style="float:right" onclick="deleteComment('${cSnap.id}')">Delete</button>` : '';
        div.innerHTML = `<div style="display:flex;justify-content:space-between"><strong>${escapeHtml(d.name||'Anonymous')}</strong>${del}</div><div style="margin-top:.35rem">${escapeHtml(d.text)}</div><div class="small" style="margin-top:.35rem">${escapeHtml(d.date||'')}</div>`;
        container.appendChild(div);
      });
    });
  }catch(e){ /* ignore */ }
}

// add comment
window.addComment = async function(postId){
  const ta = document.getElementById('input-'+postId);
  const text = ta.value.trim();
  if(!text){ alert('Please write a comment'); return; }
  const name = prompt('Enter your name:')||'Anonymous';
  try{
    await addDoc(collection(db,'comments'), { postId, name, text, date: new Date().toLocaleString(), createdAt: serverTimestamp() });
    ta.value=''; alert('Thank you — your comment is posted.');
  }catch(e){
    console.error('add comment failed',e); alert('Unable to post comment.');
  }
};

// delete comment (admin)
window.deleteComment = async function(commentId){
  if(!window.adminMode){ alert('Admin only'); return; }
  if(!confirm('Delete this comment?')) return;
  try{ await deleteDoc(doc(db,'comments',commentId)); }catch(e){ console.error(e); alert('Delete failed'); }
};

// admin flow: simple client-side pass check then show panel
window.adminMode = false;
window.ADMIN_PASS = "@RADEBENEZER3008123400";

window.openAdminPanel = function(){
  const pass = prompt('Enter admin passcode:');
  if(pass !== window.ADMIN_PASS){ alert('Incorrect passcode'); return; }
  window.adminMode = true;
  buildAdminPanel();
};

function buildAdminPanel(){
  const holder = document.getElementById('adminPanelHolder');
  holder.style.display='block';
  holder.innerHTML = `
    <div class="admin-panel">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3>Admin Panel</h3><div class="small">Admin mode enabled</div>
      </div>
      <div style="margin-top:.6rem" id="adminMessages"></div>
      <div style="margin-top:.6rem">
        <label class="small">Title</label>
        <input id="admin-title" style="width:100%;padding:.5rem;border-radius:8px;border:1px solid #e6e9ef" />
      </div>
      <div style="margin-top:.6rem">
        <label class="small">Content (HTML allowed)</label>
        <textarea id="admin-content" style="width:100%;height:120px;padding:.6rem;border-radius:8px;border:1px solid #e6e9ef"></textarea>
      </div>
      <div style="margin-top:.6rem;display:flex;gap:.6rem;flex-wrap:wrap">
        <input type="file" id="admin-file" />
        <button id="uploadFileBtn" class="btn">Upload File</button>
        <div class="small" id="uploadStatus"></div>
      </div>
      <div style="margin-top:.8rem;display:flex;gap:.6rem;justify-content:flex-end">
        <button id="publishBtn" class="btn">Publish Post</button>
      </div>
    </div>
  `;
  document.getElementById('uploadFileBtn').onclick = uploadAdminFile;
  document.getElementById('publishBtn').onclick = publishAdminPost;
}

// upload file to firebase storage
async function uploadAdminFile(){
  const fin = document.getElementById('admin-file'); const status = document.getElementById('uploadStatus');
  if(!fin.files || !fin.files[0]) return alert('Choose a file first');
  const file = fin.files[0];
  try{
    const ref = storageRef(storage, 'uploads/'+Date.now()+'_'+file.name);
    await uploadBytes(ref, file);
    const url = await getDownloadURL(ref);
    status.innerHTML = `Uploaded: <a href="${url}" target="_blank">Open</a>`;
    const contentEl = document.getElementById('admin-content');
    if(file.type.startsWith('image/')) contentEl.value += `<br><img src="${url}" width="400">`;
    else contentEl.value += `<br><a href="${url}" download>Download file</a>`;
  }catch(e){ console.error('upload failed', e); status.textContent='Upload failed'; alert('Upload failed'); }
}

// publish post to firestore
async function publishAdminPost(){
  const title = document.getElementById('admin-title').value.trim();
  const content = document.getElementById('admin-content').value.trim();
  if(!title || !content) return alert('Title and content required');
  try{
    await addDoc(collection(db,'posts'), { title, content, date: new Date().toISOString().split('T')[0], createdAt: serverTimestamp(), likes:0 });
    document.getElementById('adminMessages').innerHTML = '<div class="small" style="color:green">Published successfully.</div>';
    document.getElementById('admin-title').value=''; document.getElementById('admin-content').value=''; document.getElementById('admin-file').value='';
  }catch(e){ console.error('publish failed', e); alert('Publish failed'); }
}

// init
loadPosts();

export {}; // keep module scope
