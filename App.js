function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("menu-button").style.display = "none"
  if (window.innerWidth < 735) {
  main.style.marginLeft = "0px";
  }
  else {
  main.style.marginLeft = "250px";
  }
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.getElementById("menu-button").style.display = "initial"
}


// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close-task-module")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

var filterModal = document.getElementById("filterModal");

var filterBtn = document.getElementById("filter-button");

var filterSpan = document.getElementById("close-filter");

filterBtn.onclick = function() {
  filterModal.style.display = "block";
}

filterSpan.onclick = function() {
  filterModal.style.display = "none";
}



//Dark mode toggle
function myFunction() {
  // Body light mode
  document.getElementById("main").classList.toggle("dark-mode");

  // Modal contents
  document.getElementById("new-task-modal-content").classList.toggle("light-modal-content");
  document.getElementById("filter-modal-content").classList.toggle("light-filter-content");

  // Modal backgrounds
  document.getElementById("myModal").classList.toggle("light-modal-bg");
  document.getElementById("filterModal").classList.toggle("light-filter-bg");
  const lightInputs = document.querySelectorAll(
    ".task-due-date, .task-priority, .description, .task-search-bar, .category, .status, .asc-desc-select"
  );

  lightInputs.forEach(el => el.classList.toggle("light-input"));
}