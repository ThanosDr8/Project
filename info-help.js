function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("menu-button").style.display = "none"
  document.getElementById("main").style.marginLeft = "250px";
}
function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.getElementById("menu-button").style.display = "initial"
}
//Dark mode toggle
function myFunction() {
  // Body light mode
  document.getElementById("main").classList.toggle("light-mode");

  lightInputs.forEach(el => el.classList.toggle("light-input"));
}