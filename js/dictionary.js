/* 4-language dictionary search: exact → starts-with → substring */
(function(){
  function norm(s){
    return (s||'').toLowerCase()
      .replace(/[\u064A\u06CC]/g,'\u06CC')   // Arabic Yeh -> Farsi Yeh
      .replace(/\u0643/g,'\u06A9')            // Arabic Kaf -> Keheh
      .replace(/[\u064B-\u0652\u0670]/g,'')   // diacritics
      .replace(/\u0640/g,'')                  // tatweel
      .replace(/\u06BE/g,'\u0647')            // heh doachashmee -> heh
      .trim();
  }

  var DATA = window.DICT || [];
  var lang = 'all', query = '';

  function matches(it, q){
    // fields: [urdu, english, pos, fa, ps]
    var fields = [it[0], it[1], it[3], it[4]];
    if(lang === 'en') fields = [it[1]];
    else if(lang === 'ur') fields = [it[0]];
    else if(lang === 'fa') fields = [it[3]];
    else if(lang === 'ps') fields = [it[4]];
    var best = 3;
    for(var i=0;i<fields.length;i++){
      var f = norm(fields[i]);
      if(!f) continue;
      if(f === q) return 0;
      if(f.indexOf(q) === 0 && best > 1) best = 1;
      else if(f.indexOf(q) !== -1 && best > 2) best = 2;
    }
    return best;
  }

  function esc(s){
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function row(label, val, en){
    if(!val) return '';
    return '<div class="mean"><div class="lab">'+label+'</div><div class="val'+(en?' en':'')+'">'+esc(val)+'</div></div>';
  }

  function render(){
    var box = document.getElementById('results');
    var cnt = document.getElementById('count');
    var q = norm(query);
    if(!q){
      box.innerHTML = '';
      cnt.textContent = 'تلاش کے لیے اوپر لفظ لکھیں';
      return;
    }
    var exact=[], start=[], sub=[];
    for(var i=0;i<DATA.length;i++){
      var m = matches(DATA[i], q);
      if(m===0) exact.push(DATA[i]);
      else if(m===1) start.push(DATA[i]);
      else if(m===2) sub.push(DATA[i]);
    }
    var all = exact.concat(start, sub).slice(0, 60);
    cnt.textContent = all.length + ' نتائج ملے';
    if(!all.length){
      box.innerHTML = '<div class="no-result">کوئی نتیجہ نہیں ملا — ہجے چیک کریں</div>';
      return;
    }
    box.innerHTML = all.map(function(it){
      return '<div class="entry"><div class="head"><div class="en">'+esc(it[1])+'</div>'+
        (it[2]?'<div class="pos">'+esc(it[2])+'</div>':'')+'</div>'+
        row('اردو', it[0]) + row('فارسی', it[3]) + row('پشتو', it[4]) + '</div>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function(){
    var input = document.getElementById('q');
    var params = new URLSearchParams(location.search);
    var pre = params.get('q');
    if(pre){ input.value = pre; query = pre; }
    input.addEventListener('input', function(){ query = input.value; render(); });
    document.querySelectorAll('.chipbtn').forEach(function(b){
      b.addEventListener('click', function(){
        document.querySelectorAll('.chipbtn').forEach(function(x){x.classList.remove('active');});
        b.classList.add('active');
        lang = b.getAttribute('data-lang');
        render();
      });
    });
    render();
  });
})();
