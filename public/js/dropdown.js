(function(){
  function closeAll(){
    document.querySelectorAll('.dropdown.open').forEach(d=>d.classList.remove('open'));
    document.querySelectorAll('.nav-dropdown.open').forEach(d=>d.classList.remove('open'));
  }
  document.addEventListener('click', function(e){
    const btn = e.target.closest('[data-toggle="dropdown"]');
    if (btn){
      const dropdown = btn.closest('.dropdown');
      if (dropdown.classList.contains('open')){
        dropdown.classList.remove('open');
      } else {
        closeAll();
        dropdown.classList.add('open');
      }
      return;
    }

    const navBtn = e.target.closest('[data-toggle="nav-dropdown"]');
    if (navBtn){
      const dropdown = navBtn.closest('.nav-dropdown');
      if (dropdown.classList.contains('open')){
        dropdown.classList.remove('open');
      } else {
        closeAll();
        dropdown.classList.add('open');
      }
      return;
    }

    // click outside
    if (!e.target.closest('.dropdown') && !e.target.closest('.nav-dropdown')) closeAll();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeAll();
  });
})();
