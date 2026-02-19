const navlinks=document.querySelectorAll(".nav-menu .nav-link");
const menuOpenButton=document.querySelector("#menu-open-button");
const menuCloseButton=document.querySelector("#menu-close-button");

menuOpenButton.addEventListener("click", ()=>{
    //comutați vizibilitatea meniului mobil
    document.body.classList.toggle("show-mobile-menu");
});
//inchide meniul mobil
menuCloseButton.addEventListener("click",()=>menuOpenButton.click());
//inchide meniul mobil fara x
navlinks.forEach(link=>{
    link.addEventListener("click", () => menuOpenButton.click());
})

//swiper
const swiper = new Swiper('.slider-wrapper', {
    loop: true,
    grapCursor: true,
    spaceBetween: 25,
  
    // If we need pagination
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },
  
    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
//
    breakpoints: {
        0: {
            slidesPerView: 1
        },
        768: {
            slidesPerView: 2
        },
        1024: {
            slidesPerView: 3
        }
    }
  })





// schimbarea anului
function updateYear() {
    const yearElement = document.getElementById("year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

updateYear();



document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".section");

    function revealSections() {
        const triggerBottom = window.innerHeight * 0.8;

        sections.forEach((section) => {
            const sectionTop = section.getBoundingClientRect().top;

            if (sectionTop < triggerBottom) {
                section.classList.add("show");
            }
        });
    }

    window.addEventListener("scroll", revealSections);
    revealSections(); // Verifică secțiunile la încărcare
});


function contSubmit() {
        // Firebase config
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
    
    // inregistrare
    let currentUser = JSON.parse(localStorage.getItem('currentUser') || "null");
    if(!currentUser){ window.location.href="/pagini/inreg.html"; }

}