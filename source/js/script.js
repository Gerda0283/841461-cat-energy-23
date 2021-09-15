var navMain = document.querySelector('.main-nav');
var navToggle = document.querySelector('.main-nav__button');

navMain.classList.remove('main-nav_nojs');

navToggle.addEventListener('click', function() {
  if (navMain.classList.contains('main-nav_closed')) {
    navMain.classList.remove('main-nav_closed');
    navMain.classList.add('main-nav_opened');
  } else {
    navMain.classList.add('main-nav_closed');
    navMain.classList.remove('main-nav_opened');
  }
});
