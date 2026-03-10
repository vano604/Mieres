
let cos = JSON.parse(localStorage.getItem("cos")) || [];
actualizeazaContor();

// adaugă produs + deschide fereastra
function adaugaProdus(nume, pret, img) {
    let produs = cos.find(p => p.nume === nume);

    if(produs){
        produs.cantitate++;
    } else {
        cos.push({ nume, pret, img, cantitate: 1 });
    }

    salveazaCos();
}

// afișează produsele din coș
function afiseazaCos() {
    const lista = document.getElementById("cart-list");
    const totalEl = document.getElementById("cart-total");

    lista.innerHTML = "";
    let total = 0;

    cos.forEach((prod, index) => {

        total += prod.pret * prod.cantitate;

        const li = document.createElement("li");

        li.innerHTML = `
        <div class="cart-card">
            <button class="remove-btn"
                onclick="stergeProdus(${index})">❌</button>

            <img src="${prod.img}" class="cart-img">

            <h4>${prod.nume}</h4>
            <p>${prod.pret} lei</p>

            <span class="badge">x${prod.cantitate}</span>
        </div>
        `;

        lista.appendChild(li);
    });

    totalEl.innerHTML = `<strong>Total: ${total} lei</strong>`;
}


// șterge produs din coș
// function stergeProdus(nume) {
//     let produs = cos.find(p => p.nume === nume);

//     if(produs.cantitate > 1){
//         produs.cantitate--;
//     } else {
//         cos = cos.filter(p => p.nume !== nume);
//     }

//     salveazaCos();
//     afiseazaCos();
// }

function stergeProdus(index) {
    if(!cos[index]) return;

    if(cos[index].cantitate > 1){
        cos[index].cantitate--;
    } else {
        cos.splice(index, 1);
    }

    salveazaCos();
    afiseazaCos();
}


// deschide / închide fereastra
function deschideCos() {
    document.getElementById("cart-modal").style.display = "block";
 }

function inchideCos() {
    document.getElementById("cart-modal").style.display = "none";
}

// salvare + contor
function salveazaCos() {
    localStorage.setItem("cos", JSON.stringify(cos));
    actualizeazaContor();
}

function actualizeazaContor() {
    let total = 0;
    cos.forEach(p => total += p.cantitate);
    let el = document.getElementById("cart-count");
    if(el) el.innerText = total;

}




function maresteCantitate(index){
    cos[index].cantitate++;
    salveazaCos();
    afiseazaCos();
}

function scadeCantitate(index){
    if(cos[index].cantitate > 1){
        cos[index].cantitate--;
    } else {
        cos.splice(index,1);
    }
    salveazaCos();
    afiseazaCos();
}


window.onload = function() {
    if(document.getElementById("cart-list")){
        afiseazaCos();
    }
}


function deschideComanda(){
    if(cos.length === 0){
        alert("Coșul este gol!");
        return;
    }
    document.getElementById("order-modal").style.display = "block";
}

function inchideComanda(){
    document.getElementById("order-modal").style.display = "none";
}

function trimiteComanda(e){
    e.preventDefault();

    alert("Comanda a fost trimisă!");

    localStorage.removeItem("cos");
    cos = [];

    afiseazaCos();
    actualizeazaContor();
    inchideComanda();
}


