/* 4-language dictionary search — field-aware ranking:
   the typed word's OWN entry comes first, then group entries containing it,
   then words starting with it, then other matches. Data: window.DICT objects {e,u,fa,ps,p}. */
(function(){
  function norm(s){
    return String(s == null ? '' : s).toLowerCase().normalize('NFKC')
      .replace(/[ً-ٰٟۖ-ۭ]/g,'')
      .replace(/ـ/g,'')
      .replace(/ي/g,'ی')
      .replace(/ك/g,'ک')
      .replace(/\s+/g,' ').trim();
  }
  function parts(s){ return String(s || '').split('/').map(norm).filter(Boolean); }

  var DATA = window.DICT || [];
  var lang = 'all', query = '';

  // Precompute normalized fields once
  var IDX = DATA.map(function(it){
    return { it: it,
      enW: norm(it.e), urW: norm(it.u), faW: norm(it.fa), psW: norm(it.ps),
      enP: parts(it.e), urP: parts(it.u), faP: parts(it.fa), psP: parts(it.ps) };
  });

  function has(P, q){ return P.indexOf(q) !== -1; }
  function startsW(P, q){ for (var i=0;i<P.length;i++) if (P[i].indexOf(q) === 0) return true; return false; }
  function inclW(P, q){ for (var i=0;i<P.length;i++) if (P[i].indexOf(q) !== -1) return true; return false; }

  function fieldScore(W, P, q){
    if (W === q) return 100;
    if (has(P, q)) return 90;
    if (W.indexOf(q) === 0) return 70;
    if (startsW(P, q)) return 60;
    if (W.indexOf(q) !== -1) return 40;
    if (inclW(P, q)) return 10;
    return 0;
  }

  function score(x, q){
    if (lang === 'en') return fieldScore(x.enW, x.enP, q);
    if (lang === 'ur') return fieldScore(x.urW, x.urP, q);
    if (lang === 'fa') return fieldScore(x.faW, x.faP, q);
    if (lang === 'ps') return fieldScore(x.psW, x.psP, q);
    var latin = /[a-z]/.test(q);
    if (latin) {
      if (x.enW === q) return 100;
      if (has(x.enP, q)) return 90;
      if (x.enW.indexOf(q) === 0) return 70;
      if (startsW(x.enP, q)) return 60;
      if (x.enW.indexOf(q) !== -1) return 40;
      if (has(x.urP, q) || has(x.faP, q) || has(x.psP, q)) return 30;
      if (startsW(x.urP, q) || startsW(x.faP, q) || startsW(x.psP, q)) return 20;
      if (inclW(x.urP, q) || inclW(x.faP, q) || inclW(x.psP, q) || inclW(x.enP, q)) return 10;
      return 0;
    }
    if (x.urW === q) return 100;
    if (x.faW === q || x.psW === q) return 95;
    if (has(x.urP, q)) return 90;
    if (has(x.faP, q) || has(x.psP, q)) return 85;
    if (x.urW.indexOf(q) === 0 || x.faW.indexOf(q) === 0 || x.psW.indexOf(q) === 0) return 70;
    if (startsW(x.urP, q) || startsW(x.faP, q) || startsW(x.psP, q)) return 60;
    if (x.urW.indexOf(q) !== -1 || x.faW.indexOf(q) !== -1 || x.psW.indexOf(q) !== -1) return 40;
    if (has(x.enP, q)) return 30;
    if (startsW(x.enP, q)) return 20;
    if (inclW(x.urP, q) || inclW(x.faP, q) || inclW(x.psP, q) || inclW(x.enP, q)) return 10;
    return 0;
  }

  function esc(s){
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function row(label, val, en){
    if (!val) return '';
    return '<div class="mean"><div class="lab">'+label+'</div><div class="val'+(en?' en':'')+'">'+esc(val)+'</div></div>';
  }

  function render(){
    var box = document.getElementById('results');
    var cnt = document.getElementById('count');
    var q = norm(query);
    if (!q){
      box.innerHTML = '';
      cnt.textContent = 'تلاش کے لیے اوپر لفظ لکھیں';
      return;
    }
    var scored = [];
    for (var i=0;i<IDX.length;i++){
      var s = score(IDX[i], q);
      if (s > 0) scored.push({ x: IDX[i], s: s, i: i });
    }
    scored.sort(function(a, b){ return (b.s - a.s) || (a.i - b.i); });
    var all = scored.slice(0, 60);
    cnt.textContent = scored.length + ' نتائج ملے';
    if (!all.length){
      box.innerHTML = '<div class="no-result">کوئی نتیجہ نہیں ملا — ہجے چیک کریں</div>';
      return;
    }
    box.innerHTML = all.map(function(r){
      var it = r.x.it;
      return '<div class="entry"><div class="head"><div class="en">'+esc(it.e)+'</div>'+
        (it.p ? '<div class="pos">'+esc(it.p)+'</div>' : '') + '</div>'+
        row('اردو', it.u) + row('فارسی', it.fa) + row('پشتو', it.ps) + '</div>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function(){
    var input = document.getElementById('q');
    var params = new URLSearchParams(location.search);
    var pre = params.get('q');
    if (pre){ input.value = pre; query = pre; }
    input.addEventListener('input', function(){ query = input.value; render(); });
    document.querySelectorAll('.chipbtn').forEach(function(b){
      b.addEventListener('click', function(){
        document.querySelectorAll('.chipbtn').forEach(function(x){ x.classList.remove('active'); });
        b.classList.add('active');
        lang = b.getAttribute('data-lang');
        render();
      });
    });
    render();
  });
})();
