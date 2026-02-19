// Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDezeBHfvR0wFRggzxU0ga2AFrrDhhjA00",
    authDomain: "miere-559ac.firebaseapp.com",
    databaseURL: "https://miere-559ac-default-rtdb.firebaseio.com",
    projectId: "miere-559ac",
    storageBucket: "miere-559ac.firebasestorage.app",
    messagingSenderId: "2422302555",
    appId: "1:2422302555:web:d23258dcb323a621099c7e",
    measurementId: "G-4C5HWD9CEX"
  };
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Админы
let predefinedUsers = [
    {name:"Vanovich667_ADM", password:"15fev1215fev12", avatar:"https://static.vecteezy.com/system/resources/thumbnails/019/194/935/small_2x/global-admin-icon-color-outline-vector.jpg", role:"admin"},
    {name:"Maxim32123_ADM", password:"maximadmin12gs2", avatar:"https://static.vecteezy.com/system/resources/thumbnails/019/194/935/small_2x/global-admin-icon-color-outline-vector.jpg", role:"admin"},
    {name:"Ruxxanda_ADM", password:"rux16kwv12b3g7", avatar:"https://static.vecteezy.com/system/resources/thumbnails/019/194/935/small_2x/global-admin-icon-color-outline-vector.jpg", role:"admin"}
    
];

// Добавляем админов в Firebase, если их там нет
predefinedUsers.forEach(admin => {
    database.ref('users').orderByChild('name').equalTo(admin.name).once('value')
    .then(snapshot => {
        if (!snapshot.exists()) {
            database.ref('users').push(admin);
        }
    });
});

let currentUser = JSON.parse(localStorage.getItem('currentUser') || "null");

// Если уже авторизован → сразу в home.html
if(currentUser){
    window.location.href='../index.html';
}

// Переключение форм
function showLoginBox(){document.getElementById('registerBox').style.display='none';document.getElementById('loginBox').style.display='block';document.getElementById('formTitle').innerText="Autentificare";}
function showRegisterBox(){document.getElementById('registerBox').style.display='block';document.getElementById('loginBox').style.display='none';document.getElementById('formTitle').innerText="Inregistrare";}

// Регистрация
function registerUser(){
    const name=document.getElementById('regUsername').value.trim();
    const pass1=document.getElementById('regPassword').value;
    const pass2=document.getElementById('regPassword2').value;
    const fileInput=document.getElementById('regAvatar');

    if(!name || !pass1 || !pass2) return alert("Completați toate câmpurile");
    if(pass1!==pass2) return alert("Parolele nu se potrivesc");
    if(!fileInput.files[0]) return alert("Selectați un avatar");

    if(predefinedUsers.find(u=>u.name===name)) return alert("Există deja un utilizator cu acest nume.");

    const reader = new FileReader();
    reader.onload=function(e){
        const avatarBase64=e.target.result;
        const newUser={name:name,password:pass1,avatar:avatarBase64,role:"user"};

        database.ref('users').orderByChild('name').equalTo(name).once('value').then(snapshot=>{
            if(snapshot.exists()) return alert("Există deja un utilizator cu acest nume.");

            database.ref('users').push(newUser).then(()=>{
                currentUser=newUser;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                // Сохраняем сессию в Firebase
                database.ref('currentSessions/'+name).set(true);
                window.location.href='../index.html';
            }).catch(err=>alert("Erroare: "+err.message));
        });
    }
    reader.readAsDataURL(fileInput.files[0]);
}

// Вход
function loginUser(){
    const name=document.getElementById('loginUsername').value.trim();
    const pass=document.getElementById('loginPassword').value;

    // Админ
    let adminUser = predefinedUsers.find(u=>u.name===name && u.password===pass);
    if(adminUser){
        currentUser=adminUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        database.ref('currentSessions/'+name).set(true);
        window.location.href='../index.html';
        return;
    }

    database.ref('users').once('value').then(snapshot=>{
        const usersDb = snapshot.val() || {};
        const user = Object.values(usersDb).find(u=>u.name===name && u.password===pass);
        if(!user) return alert("Nume de utilizator sau parolă incorecte");

        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        // Сохраняем сессию
        database.ref('currentSessions/'+name).set(true);
        window.location.href='../index.html';
    }).catch(err=>alert("Eroare de conectare: "+err.message));
}


function toggleMenu(){
    document.getElementById('topNav').classList.toggle('active');
}

var data = new Date();
document.getElementById('an').innerHTML = data.getFullYear();

function mobileMenu() {
    document.getElementById("navbar").classList.toggle("mobile");
}



// Форма отзывов
function showReviewBox(){
    document.getElementById('registerBox').style.display='none';
    document.getElementById('loginBox').style.display='none';
    document.getElementById('reviewBox').style.display='block';
    document.getElementById('userDisplay').innerText=currentUser.name;
    document.getElementById('userAvatar').src=currentUser.avatar;
    showReviews();
    showFirebaseMail();
}

// Авто отображение
window.onload=function(){
    if(currentUser) showReviewBox();
    else showLoginBox();
};

// Добавление отзыва
function addReview() {
    if (!currentUser) return alert("Вы не авторизованы"); // 1. Проверка авторизации

    const input = document.getElementById("reviewInput");
    const text = input.value.trim();

    if (!text) return alert("Введите текст отзыва"); // 2. Проверка текста

    // 3. Создаём объект отзыва
    const review = {
        name: currentUser.name,
        avatar: currentUser.avatar,
        text: text,
        role: currentUser.role, // сохраняем роль
        likes: [],
        dislikes: [],
        timestamp: Date.now()
    };

    // 4. Сохраняем отзыв в Firebase
    const newReviewKey = firebase.database().ref().child('reviews').push().key;
    const updates = {};
    updates['/reviews/' + newReviewKey] = review;

    firebase.database().ref().update(updates)
        .then(() => {
            // 5. Очищаем поле ввода и обновляем список
            input.value = "";
            showReviews();
        })
        .catch(err => alert("Ошибка при добавлении отзыва: " + err.message));
}


// Показ отзывов
function showReviews(){
    const div = document.getElementById("reviewsList");
    div.innerHTML = "Загрузка отзывов...";

    firebase.database().ref('reviews').once('value').then(snapshot=>{
        const reviews = snapshot.val();
        div.innerHTML = "";
        if(!reviews){ div.innerHTML="<p>Пока нет отзывов</p>"; return; }

        const reviewsArr = Object.keys(reviews).map(k=>({id:k,...reviews[k]}));
        reviewsArr.sort((a,b)=>b.timestamp-a.timestamp);

        reviewsArr.forEach(r=>{
            r.likes = r.likes||[];
            r.dislikes = r.dislikes||[];
            const liked = r.likes.includes(currentUser.name);
            const disliked = r.dislikes.includes(currentUser.name);
            const canDelete = currentUser.name===r.name || (currentUser.role==="admin" && r.role==="user");

            const reviewDiv=document.createElement("div");
            reviewDiv.className="review";
            reviewDiv.style.borderBottom="1px solid #ccc";
            reviewDiv.style.padding="10px 0";

            reviewDiv.innerHTML=`
                <div style="display:flex; align-items:flex-start; gap:10px;">
                    <img src="${r.avatar}" width="40" height="40" style="border-radius:50%;">
                    <div style="flex:1; word-break: break-word;">
                        <b>${r.name}:</b> ${r.text}
                    </div>
                </div>
                <div style="margin-top:5px; display:flex; gap:10px; align-items:center;">
                    <button onclick="toggleFirebaseLike('${r.id}','like')" style="background:${liked?'#8f8':'#eee'}">👍 ${r.likes.length}</button>
                    <button onclick="toggleFirebaseLike('${r.id}','dislike')" style="background:${disliked?'#f88':'#eee'}">👎 ${r.dislikes.length}</button>
                    ${canDelete? `<button onclick="deleteFirebaseReview('${r.id}')" style="background:red;color:white;">Удалить</button>` : ''}
                </div>
            `;
            div.appendChild(reviewDiv);
        });
    }).catch(err=>{div.innerHTML="Ошибка загрузки отзывов: "+err.message;});
}

// Лайки / Дизлайки
function toggleFirebaseLike(key,type){
    const reviewRef = firebase.database().ref('reviews/'+key);
    reviewRef.once('value').then(snapshot=>{
        const r=snapshot.val();
        if(!r) return;

        r.likes = r.likes||[];
        r.dislikes = r.dislikes||[];

        if(type==='like'){
            r.dislikes = r.dislikes.filter(u=>u!==currentUser.name);
            if(r.likes.includes(currentUser.name)) r.likes = r.likes.filter(u=>u!==currentUser.name);
            else r.likes.push(currentUser.name);
        }

        if(type==='dislike'){
            r.likes = r.likes.filter(u=>u!==currentUser.name);
            if(r.dislikes.includes(currentUser.name)) r.dislikes = r.dislikes.filter(u=>u!==currentUser.name);
            else r.dislikes.push(currentUser.name);
        }

        reviewRef.update({likes:r.likes, dislikes:r.dislikes}).then(()=>showReviews());
    });
}

// Удаление отзыва
function deleteFirebaseReview(key){
    firebase.database().ref('reviews/'+key).remove().then(()=>showReviews()).catch(err=>alert("Ошибка: "+err.message));
}

// Письма
function sendFirebaseMail(){
    if(currentUser.role!=="admin") return alert("Только админ может отправлять письма");

    const to=document.getElementById("mailTo").value.trim();
    const text=document.getElementById("mailInput").value.trim();
    if(!to||!text) return alert("Заполните текст и получателя");

    firebase.database().ref('users').once('value').then(snapshot=>{
        const usersDb=snapshot.val()||{};
        if(!Object.values(usersDb).some(u=>u.name===to)) return alert("Такого пользователя нет");

        const newKey=firebase.database().ref().child('mails').push().key;
        const mail = {id:newKey, from:currentUser.name, to:to, text:text, timestamp:Date.now()};
        const updates = {}; updates['/mails/'+newKey]=mail;

        firebase.database().ref().update(updates).then(()=>{
            document.getElementById("mailTo").value=""; document.getElementById("mailInput").value="";
            showFirebaseMail();
        }).catch(err=>alert("Ошибка: "+err.message));
    });
}

function showFirebaseMail(){
    const list=document.getElementById("mailList");
    list.innerHTML="Загрузка писем...";

    firebase.database().ref('mails').once('value').then(snapshot=>{
        const mails=snapshot.val(); list.innerHTML="";
        if(!mails){ list.innerHTML="<p>Писем нет</p>"; return; }

        const mailsArr=Object.keys(mails).map(k=>({id:k,...mails[k]}));
        mailsArr.sort((a,b)=>b.timestamp-a.timestamp);

        mailsArr.forEach(m=>{
            if(currentUser.role!=="admin" && m.to!==currentUser.name) return;

            const div=document.createElement("div");
            div.style.background="#eee"; div.style.padding="8px"; div.style.marginBottom="6px"; div.style.borderRadius="6px";

            if(currentUser.role==="admin" && m.from===currentUser.name){
                const delBtn=document.createElement("button");
                delBtn.textContent="Удалить"; delBtn.style.background="red"; delBtn.style.color="white"; delBtn.style.marginLeft="10px";
                delBtn.onclick=()=>deleteFirebaseMail(m.id); div.appendChild(delBtn);
            }

            const content=document.createElement("div");
            content.innerHTML=`<b>${m.from} → ${m.to}</b><br>${m.text}`; div.insertBefore(content, div.firstChild);
            list.appendChild(div);
        });
    });
}

function deleteFirebaseMail(id){
    firebase.database().ref('mails/'+id).remove().then(()=>showFirebaseMail()).catch(err=>alert("Ошибка: "+err.message));
}

function toggleMail(){
    const mailBox=document.getElementById("mailBox");
    if(mailBox.style.display==="none" || mailBox.style.display==="") { mailBox.style.display="block"; showFirebaseMail(); }
    else mailBox.style.display="none";
}


// Авто отображение
window.onload=function(){
    if(currentUser) showReviewBox();
    else showLoginBox();
};

if(!currentUser){ window.location.href="/pagini/inreg.html"; }

