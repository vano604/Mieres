const form = document.getElementById('contactForm');
  
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  fetch("https://script.google.com/macros/s/AKfycbxuUOp_TJUorX_Wl1gHSX1L6eQbsjXqgp9pycorbG9yUdzCaE1IEUA4rYHZQQE1MSRNUw/exec", {
    method: 'POST',
    body: formData
  })
  .then(response => response.text())
  .then(result => {
    alert('Datele sunt trimise: ' + result);
    form.reset(); // curatim formularul dupa trimitere
  })
  .catch(error => {
    alert('Eroare: ' + error.message);
  });
});