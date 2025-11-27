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