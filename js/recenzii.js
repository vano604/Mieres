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

// formularul recenziei
function showReviewBox(){
    document.getElementById('registerBox').style.display='none';
    document.getElementById('loginBox').style.display='none';
    document.getElementById('reviewBox').style.display='block';
    document.getElementById('userDisplay').innerText=currentUser.name;
    document.getElementById('userAvatar').src=currentUser.avatar;
    showReviews();
    showFirebaseMail();
}

// adaugam recenzia
function addReview() {
    if (!currentUser) return alert("Dumneavoastră nu aveți cont"); 

    const input = document.getElementById("reviewInput");
    const text = input.value.trim();

    if (!text) return alert("Scriți textul recenziei");

    // 3. facem obiectul
    const review = {
        name: currentUser.name,
        avatar: currentUser.avatar,
        text: text,
        role: currentUser.role, 
        likes: [],
        dislikes: [],
        timestamp: Date.now()
    };

    // 4. salvam in Firebase
    const newReviewKey = firebase.database().ref().child('reviews').push().key;
    const updates = {};
    updates['/reviews/' + newReviewKey] = review;

    firebase.database().ref().update(updates)
        .then(() => {
            // 5. Очищаем поле ввода и обновляем список
            input.value = "";
            showReviews();
        })
        .catch(err => alert("Erroare în adăugarea recenziei: " + err.message));
}


// aratam recenziile
function showReviews(){
    const div = document.getElementById("reviewsList");
    div.innerHTML = "Încărcarea recenziilor...";

    firebase.database().ref('reviews').once('value').then(snapshot=>{
        const reviews = snapshot.val();
        div.innerHTML = "";
        if(!reviews){ div.innerHTML="<p>Nu sunt recenzii</p>"; return; }

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
    }).catch(err=>{div.innerHTML="Erroare în încărcarea recenziei: "+err.message;});
}

// likes / dislikes
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

// stergerea recenziei
function deleteFirebaseReview(key){
    firebase.database().ref('reviews/'+key).remove().then(()=>showReviews()).catch(err=>alert("Eroare: "+err.message));
}