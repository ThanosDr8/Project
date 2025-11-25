function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
  document.getElementById("menu-button").style.display = "none"
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

// When the user clicks on <span> (x), close the modal
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
function myFunction() {
    var input, filter, i, a, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}