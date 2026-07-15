// Client-serveur authentification
const PROJECTS = [ {id:'p6',  t:'Client-Serveur Auth',  d:'Sockets, threads, authentification par mot de passe.'}];
const SERVICES = {21:'FTP',22:'SSH',23:'Telnet',25:'SMTP',53:'DNS',80:'HTTP',110:'POP3',
  143:'IMAP',443:'HTTPS',445:'SMB',3306:'MySQL',3389:'RDP',5432:'PostgreSQL',8080:'HTTP-Alt',6379:'Redis'};
const COMMON_PORTS = Object.keys(SERVICES).map(Number);
function rnd(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function pick(arr){ return arr[rnd(0,arr.length-1)]; }
function randIP(){ return `${rnd(1,223)}.${rnd(0,255)}.${rnd(0,255)}.${rnd(1,254)}`; }
function randMAC(){ const h=()=>rnd(0,255).toString(16).padStart(2,'0'); return Array.from({length:6},h).join(':'); }
function nowStr(){ return new Date().toLocaleTimeString('fr-FR',{hour12:false}); }
function esc(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function download(filename, content, mime='text/plain'){
  const blob=new Blob([content],{type:mime});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download=filename; a.click();
  URL.revokeObjectURL(a.href);
}
function log(termId, html){
  const t=document.getElementById(termId);
  const div=document.createElement('div');
  div.className='l'; div.innerHTML=html;
  t.appendChild(div); t.scrollTop=t.scrollHeight;
}

(function(){
  const USERS={admin:'admin123', guest:'guest'};
  let attempts=0, authed=false;
  const cmdInput=document.getElementById('p6-cmd');
  document.getElementById('p6-connect').onclick=()=>{
    const u=document.getElementById('p6-user').value.trim();
    const p=document.getElementById('p6-pass').value;
    const flash=document.getElementById('p6-flash');
    if(authed) return;
    if(USERS[u]!==undefined && USERS[u]===p){
      authed=true;
      log('p6-term', `<span class="t-ok">[${nowStr()}] authentification réussie pour ${esc(u)}</span>`);
      log('p6-term', `<span class="t-muted">Bienvenue — tape "help" pour la liste des commandes</span>`);
      cmdInput.disabled=false; cmdInput.focus();
      flash.innerHTML='<div class="flash ok">Connecté.</div>';
    } else {
      attempts++;
      log('p6-term', `<span class="t-bad">[${nowStr()}] échec d'authentification pour ${esc(u)} (tentative ${attempts}/6)</span>`);
      if(attempts>=6){
        flash.innerHTML='<div class="flash bad">Trop de tentatives — accès bloqué.</div>';
        document.getElementById('p6-connect').disabled=true;
      } else {
        flash.innerHTML=`<div class="flash bad">Identifiants invalides (${attempts}/6).</div>`;
      }
    }
  };
  cmdInput.addEventListener('keydown', e=>{
    if(e.key!=='Enter' || !authed) return;
    const cmd=cmdInput.value.trim(); cmdInput.value='';
    if(!cmd) return;
    log('p6-term', `<span class="t-info">&gt; ${esc(cmd)}</span>`);
    const [base,...rest]=cmd.split(' ');
    if(base==='date') log('p6-term', new Date().toString());
    else if(base==='echo') log('p6-term', esc(rest.join(' ')));
    else if(base==='help') log('p6-term', 'commandes: date | echo [message] | quit | help');
    else if(base==='quit'){ log('p6-term','<span class="t-muted">connexion fermée par le serveur</span>'); cmdInput.disabled=true; }
    else log('p6-term', `<span class="t-bad">commande inconnue: ${esc(base)}</span>`);
  });
})();