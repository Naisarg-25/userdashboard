axios.get("http://localhost:3000/users")
.then(res => {
  const users = res.data;
  const userrow = document.querySelector('#usertable tbody');
  users.forEach(user => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = user.name;
    const emailCell = document.createElement('td');
    emailCell.textContent = user.email;
    const passwordCell = document.createElement('td');
    passwordCell.textContent = user.password;
    const editCell = document.createElement('button');
    editCell.textContent = "Edit";
    editCell.onclick = function() {
      const newName = prompt("Enter new name:", user.name);
      if (newName === null) return; // user cancelled
      axios.put(`http://localhost:3000/users/${user._id}`, {
          name: newName,
        })
        .then(res => {  
          nameCell.textContent = res.data.name;
        })
        .catch(err => console.error(err));
      };   
    const deleteCell = document.createElement('button');
    deleteCell.textContent = "Delete";
    deleteCell.onclick = function() {
      axios.delete(`http://localhost:3000/users/${user._id}`)
        .then(() => {
          userrow.removeChild(row);
        })
        .catch(err => console.error(err));
    };
    row.appendChild(nameCell);
    row.appendChild(emailCell);
    row.appendChild(passwordCell);
    row.appendChild(editCell);
    row.appendChild(deleteCell);
    userrow.appendChild(row);
  });
})
.catch(err => console.error(err));



document.getElementById('userform').addEventListener('submit', function(event) {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

axios.post("http://localhost:3000/users", {
  name,
  email,
  password
})
.then(res => console.log("user created:", res.data))
.catch(err => console.error(err));
});

addEventListener('input', function() {
  const searchTerm = document.getElementById('search').value.toLowerCase();
  const rows = document.querySelectorAll('#usertable tbody tr');
  rows.forEach(row => {
    const name = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
    const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
    if (name.includes(searchTerm) || email.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
});



document.getElementById('loginform').addEventListener('submit', function(event) {
  event.preventDefault();
    const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  axios.post("http://localhost:3000/login", {email, password})
  .then(res => {
    localStorage.setItem("token", res.data.token);
    alert("Login successful");
    resetLoginForm();
  })
  .catch(err => alert("Login failed: " + err));
});
document.getElementById('getprofile').addEventListener('click', function() {
  let token = localStorage.getItem("token");

  if (!token) {
    alert("You are not logged in");
    return;
  }
  
  axios.get("http://localhost:3000/profile", {
    headers:{
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => {
    document.getElementById('profile').textContent = JSON.stringify(res.data, null, 2);
  })
  .catch(err => alert("Failed to fetch profile: " + err));
});