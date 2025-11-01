<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RAD. Ebenezer.com</title>
<style>
/* Reset & basic styling */
* { margin:0; padding:0; box-sizing:border-box; font-family: 'Segoe UI', sans-serif; }
body { min-height:100vh; background: url('https://i.ibb.co/YkPZyJD/radiography-bg.png') repeat; background-size: 150px; color:#333; transition: background-color 0.3s, color 0.3s; }
body.dark { background-color: #121212; color: #eee; background-image: url('https://i.ibb.co/YkPZyJD/radiography-bg.png'); background-blend-mode: overlay; }

header { position:sticky; top:0; background: rgba(255,255,255,0.85); padding:20px; text-align:center; border-bottom:2px solid #fff; z-index:999; transition: background 0.3s; }
body.dark header { background: rgba(0,0,0,0.85); }
header h1 { font-size:2.5em; color:#333; }
body.dark header h1 { color:#fff; }
header p { font-size:1em; color:#555; }
body.dark header p { color:#ccc; }

main { max-width:1000px; margin:20px auto; padding:0 20px; }
#newPostForm { background: rgba(255,255,255,0.95); padding:20px; border-radius:15px; margin-bottom:30px; box-shadow:0 5px 15px rgba(0,0,0,0.1); transition: background 0.3s, color 0.3s; }
body.dark #newPostForm { background: rgba(30,30,30,0.95); color:#eee; }

#newPostForm input, #newPostForm textarea, #newPostForm select { width:100%; padding:10px; margin-bottom:10px; border-radius:8px; border:1px solid #ccc; }
body.dark #newPostForm input, body.dark #newPostForm textarea, body.dark #newPostForm select { background:#222; color:#eee; border:1px solid #555; }

#newPostForm button, #newPostForm .format-btn { background:#ff6f61; color:white; padding:10px 15px; border:none; border-radius:8px; cursor:pointer; font-weight:bold; margin-right:5px; }
#newPostForm button:hover, #newPostForm .format-btn:hover { background:#ff4a3d; }

.format-btn { padding:5px 10px; font-size:0.9em; }

.blog-container { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap:20px; }
.post-card { background: rgba(255,255,255,0.85); padding:20px; border-radius:15px; box-shadow:0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s, background 0.3s, color 0.3s; word-wrap: break-word; position:relative; overflow:hidden; }
body.dark .post-card { background: rgba(40,40,40,0.85); color:#eee; }
.post-card:hover { transform: translateY(-5px); }

.post-card h2 { color:#ff6f61; margin-bottom:10px; }
body.dark .post-card h2 { color:#ffa07a; }
.post-card p { color:#555; margin-bottom:10px; }
body.dark .post-card p { color:#ddd; }
.post-card img, .post-card iframe { max-width:100%; border-radius:10px; margin-bottom:10px; cursor:pointer; }
.post-card .date { font-size:0.8em; color:#888; margin-bottom:5px; }
.post-card .tags { font-size:0.9em; color:#ff6f61; }
body.dark .post-card .tags { color:#ffa07a; }

.post-card button { position:absolute; top:10px; right:10px; margin-left:5px; border:none; padding:5px 8px; border-radius:5px; cursor:pointer; font-size:0.8em; }
.edit-btn { background:#4CAF50; color:white; }
.delete-btn { background:#f44336; color:white; }
.edit-btn:hover { background:#45a049; }
.delete-btn:hover { background:#da190b; }

/* Image/file popup */
#popup { display:none; position:fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.8); justify-content:center; align-items:center; z-index:1000; }
#popup img, #popup iframe { max-width:90%; max-height:90%; border-radius:10px; }

footer { text-align:center; padding:20px; color:#fff; font-weight:bold; margin-top:40px; }

#darkModeToggle { position:fixed; top:20px; right:20px; background:#555; color:white; border:none; padding:10px; border-radius:50px; cursor:pointer; z-index:1001; }
#darkModeToggle:hover { background:#777; }
</style>
</head>
<body>

<button id="darkModeToggle">🌙</button>

<header>
    <h1>RAD. Ebenezer.com</h1>
    <p>Your creative radiography-inspired blog with WYSIWYG editing and file uploads!</p>
</header>

<main>
    <div id="newPostForm">
        <h2>Add / Edit Post</h2>
        <div>
            <button class="format-btn" onclick="formatText('bold')">B</button>
            <button class="format-btn" onclick="formatText('italic')">I</button>
            <button class="format-btn" onclick="formatText('underline')">U</button>
            <button class="format-btn" onclick="formatText('insertOrderedList')">OL</button>
            <button class="format-btn" onclick="formatText('insertUnorderedList')">UL</button>
            <button class="format-btn" onclick="formatText('createLink')">Link</button>
        </div>
        <input type="text" id="postTitle" placeholder="Post Title" required>
        <div id="postContent" contenteditable="true" style="width:100%;height:150px;border:1px solid #ccc;padding:10px;margin-bottom:10px;border-radius:8px;overflow:auto;"></div>
        <input type="text" id="postTags" placeholder="Tags (comma-separated)">
        <input type="text" id="postCategory" placeholder="Category">
        <input type="file" id="postFile" multiple>
        <button onclick="addOrEditPost()">Add / Save Post</button>
    </div>

    <div style="margin-bottom:10px;">
        <input type="text" id="filterTags" placeholder="Filter by Tag" oninput="renderPosts()">
        <input type="text" id="searchPosts" placeholder="Search posts..." oninput="renderPosts()">
    </div>

    <div class="blog-container" id="blogPosts"></div>
</main>

<div id="popup" onclick="this.style.display='none'"><img id="popupImg"><iframe id="popupFile" frameborder="0"></iframe></div>

<footer>
    &copy; 2025 RAD. Ebenezer.com | Made with ❤️
</footer>

<script>
let posts = JSON.parse(localStorage.getItem('radEbenezerPosts')) || [
    {title:"Welcome!", content:"Your first post. Fully editable, rich text, with tags, categories, and uploads!", tags:["Welcome"], category:"Intro", date:new Date().toLocaleDateString(), files:[]}
];
let editIndex = null;

// Dark mode toggle
if(localStorage.getItem('darkMode')==='true') document.body.classList.add('dark');
document.getElementById('darkModeToggle').addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
});

// WYSIWYG formatting
function formatText(command){
    if(command==='createLink'){ 
        let url = prompt("Enter link URL:");
        if(url) document.execCommand(command,false,url);
    } else { document.execCommand(command,false,null); }
}

function renderPosts(){
    const container