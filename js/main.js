/* Shared: theme toggle + nav state */
(function(){
  var root = document.documentElement;
  var saved = null;
  try{ saved = localStorage.getItem('dict_theme'); }catch(e){}
  if(saved) root.setAttribute('data-theme', saved);

  window.toggleTheme = function(){
    var cur = root.getAttribute('data-theme') === 'dark' ? '' : 'dark';
    if(cur) root.setAttribute('data-theme', cur); else root.removeAttribute('data-theme');
    try{ localStorage.setItem('dict_theme', cur); }catch(e){}
    var b = document.getElementById('themeBtn');
    if(b) b.textContent = cur === 'dark' ? '☀' : '◐';
  };

  document.addEventListener('DOMContentLoaded', function(){
    var b = document.getElementById('themeBtn');
    if(b) b.textContent = root.getAttribute('data-theme') === 'dark' ? '☀' : '◐';
    // mark active nav link
    var page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav.links a').forEach(function(a){
      if(a.getAttribute('href') === page) a.classList.add('active');
    });
    // home search shortcut
    var hs = document.getElementById('homeSearch');
    if(hs){
      var go = function(){
        var q = hs.value.trim();
        location.href = 'dictionary.html' + (q ? '?q=' + encodeURIComponent(q) : '');
      };
      document.getElementById('homeSearchBtn').addEventListener('click', go);
      hs.addEventListener('keydown', function(e){ if(e.key === 'Enter') go(); });
    }
  });
})();
