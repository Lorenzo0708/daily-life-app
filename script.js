if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js');
    });
  }


var d=0,pr=0,l=0;
var s,a=null,b=null,c=null,op,i,form,r=null;
var atris=null,itris=0,x=0,o=0,ntris=0;
var mistake=0,word='',points1=0,points2=0,currentPlayer;
var acalc=null,bcalc=null,unit1=null,unit2=null,unit3=null;
var i_array,d_array=4,index,colors=['red','green','yellow','blue','black','white'],colorCode=[],Id_Col=0,rowCount=0,endGuessed=null,selectedButton=null,id_div=0;
var checkEntry=0,password_test=null,password='';
var activeButtons = false;
var activeTextarea = null;
var button_options = ['BASE','VARIAZIONI','FINANZA','ANALISI','UTILITÀ'];
var option_number = Number(localStorage.getItem("option_number"));
if(isNaN(option_number) || option_number < 0 || option_number >= button_options.length)
option_number = 0;
var defaultMethod = button_options[option_number];
var currentSessionId = "ID_" + Math.random().toString(16).slice(2);
var dbRef = null;
var dateFields = [
 "insgiornouno", "insmeseuno", "insannouno",
 "insgiornodue", "insmesedue", "insannodue"
];


var firebaseConfig = {
 apiKey: "AIzaSyADRHmsJEpBHXHQxfJa0pRJ3FQvrAXZ1zY",
 authDomain: "dailylife-eb517.firebaseapp.com",
 databaseURL: "https://dailylife-eb517-default-rtdb.firebaseio.com",
 projectId: "dailylife-eb517",
 storageBucket: "dailylife-eb517.firebasestorage.app",
 messagingSenderId: "768028676668",
 appId: "1:768028676668:web:278ef937a95bc653a8e939",
 measurementId: "G-12JNQ59C6N"
};

firebase.initializeApp(firebaseConfig);


var interactionSoundEffects = localStorage.getItem('interactionSoundEffects') != 'false';
var gamesMusic = localStorage.getItem('gamesMusic') != 'false';
var mobileVibration = localStorage.getItem('mobileVibration') != 'false';





const ua = navigator.userAgent;
const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isMac = /Macintosh/.test(ua) && !isIOS;

function applicaCorrezioniApple() {
    if (isIOS || isMac) {
        
        document.body.classList.add('ios-device');
        
        
        
        document.querySelectorAll('input[type="date"], input[type="time"]').forEach(el => {
            el.style.minWidth = '35vw'; 
        });
    }
}


document.addEventListener('DOMContentLoaded', applicaCorrezioniApple);




window.onload = function() {
 var datiLocali = localStorage.getItem("datiAppCompleti");
 if (datiLocali) {
  var parsed = JSON.parse(datiLocali);
  timesList = parsed.timesList || [];
  namesList = parsed.namesList || [];
 } else {
  if (localStorage.getItem("timesList")) {
   timesList = JSON.parse(localStorage.getItem("timesList"));
  }
  if (localStorage.getItem("namesList")) {
   namesList = JSON.parse(localStorage.getItem("namesList"));
  }
 }
 if (timesList && !Array.isArray(timesList)) {
  timesList = Object.values(timesList);
 }
 if (namesList && !Array.isArray(namesList)) {
  namesList = Object.values(namesList);
 }

 if (timesList && !Array.isArray(timesList)) { timesList = Object.values(timesList); }
if (namesList && !Array.isArray(namesList)) { namesList = Object.values(namesList); }

if(timesList && timesList.length > 0) {
 var paired = timesList.map((t, i) => ({ name: namesList[i], time: t }));
  paired.sort((a, b) => timeToMs(a.time) - timeToMs(b.time));
  timesList = paired.map(p => p.time);
  namesList = paired.map(p => p.name);
  printTimes();
 }
 dateFields.forEach(id => {
  var input = document.getElementById(id);
  if(input) onlyNumbers(input);
 });
 autoNext(document.getElementById("insgiornouno"), document.getElementById("insmeseuno"), 2);
 autoNext(document.getElementById("insmeseuno"), document.getElementById("insannouno"), 2);
 autoNext(document.getElementById("insgiornodue"), document.getElementById("insmesedue"), 2);
 autoNext(document.getElementById("insmesedue"), document.getElementById("insannodue"), 2);
 option_number = Number(localStorage.getItem("option_number") || 0);
 if (option_number < 0 || option_number >= button_options.length || isNaN(option_number)) {
  option_number = 0;
 }
 defaultMethod = button_options[option_number];
 writeOnDefaultButton();
 if(typeof modeArray !== 'undefined') {
  percentageMode = modeArray[option_number];
 }
 checkClick.checked = interactionSoundEffects;
 checkSottofondo.checked = gamesMusic;
 checkVibrazione.checked = mobileVibration;
 document.addEventListener('selectstart', function(e) {
  const allowedTags = ['INPUT', 'TEXTAREA'];
  if (!allowedTags.includes(e.target.tagName) && !e.target.isContentEditable) {
   e.preventDefault();
  }
 });
};

function salvaDatiSincronizzati(inviaSubitoAlCloud = false) {
 var pacchetto = {
  timesList: timesList,
  namesList: namesList,
  ultimoAggiornamento: Date.now()
 };
 //localStorage.setItem("datiAppCompleti", JSON.stringify(pacchetto));
 localStorage.setItem("timesList", JSON.stringify(pacchetto.timesList));
 localStorage.setItem("namesList", JSON.stringify(pacchetto.namesList));
 localStorage.setItem("ultimoAggiornamento", pacchetto.ultimoAggiornamento);
 if (dbRef && inviaSubitoAlCloud) {
  dbRef.set(pacchetto);
 }
}

async function syncTotaleSuCloud() {
 if(!dbRef) return;
 var orarioAttuale = Date.now();
 localStorage.setItem('ultimoAggiornamento', orarioAttuale);
 var datiDaSalvare = {};
 for(var i=0; i<localStorage.length; i++) {
  var k = localStorage.key(i);
  if(!k.match(/[.#$\[\]]/))
   datiDaSalvare[k] = localStorage.getItem(k);
 }
 datiDaSalvare['ultimoAggiornamento'] = orarioAttuale;
 try {
  await dbRef.set(datiDaSalvare);
  sessionStorage.setItem('ultimo_sync_time', orarioAttuale);
  ultimoSalvataggio = orarioAttuale; 
  if (typeof aggiornaTestoTempo === 'function') aggiornaTestoTempo();
 } catch (e) {
  console.error("Errore sync:", e);
 }
}

var timerSalvataggio; 
function segnaModificaE_Salva() {
 clearTimeout(timerSalvataggio);
 localStorage.setItem('ultimoAggiornamento', Date.now());
 timerSalvataggio = setTimeout(() => {
  syncTotaleSuCloud();
 }, 5000); 
}

firebase.auth().onAuthStateChanged(async (user) => {
 var infoEmailPnl = document.getElementById('infoEmailPannello');
 var opzioniGuest = document.getElementById('opzioniGuest');
 var opzioniUser = document.getElementById('opzioniUser');
 var btnChiudi = document.getElementById('btnChiudiPannello');
 var loader = document.getElementById('loaderGlobale');
 if(user) {
  localStorage.setItem("user_email", user.email);
  var emailKey = user.email.replace(/\./g, ',');
  var sessionRef = firebase.database().ref('active_sessions/' + emailKey);
  sessionRef.set({ id: currentSessionId, time: Date.now() });
  sessionRef.on('value', (snapshot) => {
   var data = snapshot.val();
   if (data && data.id !== currentSessionId) {
    sessionRef.off();
    bloccaAccessoMultiplo();
   }
  });
  dbRef = firebase.database().ref('users/' + user.uid + '/dati');
  dbRef.on('value', (snapshot) => {
   var datiCloud = snapshot.val();
   var timestampLocale = Number(localStorage.getItem("ultimoAggiornamento") || 0);
   if (datiCloud) {
    var timestampCloud = datiCloud.ultimoAggiornamento || 0;
    if (timestampCloud >= timestampLocale) {
     localStorage.setItem("ultimoAggiornamento", timestampCloud);
     for (var chiave in datiCloud) {
      if (chiave !== "datiAppCompleti" && chiave !== "dati" && chiave !== "datiLocali") {
       if (typeof datiCloud[chiave] === 'object') {
        localStorage.setItem(chiave, JSON.stringify(datiCloud[chiave]));
       } else {
        localStorage.setItem(chiave, datiCloud[chiave]);
       }
      }
     }
     if (localStorage.getItem("timesList")) {
      try {
       timesList = JSON.parse(localStorage.getItem("timesList"));
      } catch(e) {
       timesList = [];
      }
     }
     if (localStorage.getItem("namesList")) {
      try {
       namesList = JSON.parse(localStorage.getItem("namesList"));
      } catch(e) {
       namesList = [];
      }
     }
     if (timesList && !Array.isArray(timesList)) { timesList = Object.values(timesList); }
     if (namesList && !Array.isArray(namesList)) { namesList = Object.values(namesList); }
     if (timesList && timesList.length > 0) {
      var paired = timesList.map((t, i) => ({ name: namesList[i], time: t }));
      paired.sort((a, b) => timeToMs(a.time) - timeToMs(b.time));
      timesList = paired.map(p => p.time);
      namesList = paired.map(p => p.name);
     }
     if (typeof printTimes === 'function') {
      printTimes();
     }
    }
   }
  });
  aggiornaAvatar(user.email);
  if(infoEmailPnl) infoEmailPnl.innerText = user.email;
  if(opzioniGuest) opzioniGuest.style.display = 'none';
  if(opzioniUser) opzioniUser.style.display = 'block';
  if(btnChiudi) btnChiudi.style.display = 'block';
  if(loader) loader.style.display = 'none';
 }
});

function ottieniPacchettoDati() {
 return {
  timesList: timesList,
  namesList: namesList,
  ultimoAggiornamento: Date.now()
 };
}

async function logoutSicuro() {
 const loader = document.getElementById('loaderGlobale');
 if (loader) loader.style.display = 'flex';
 try {
  if (typeof dbRef !== 'undefined' && dbRef) {
   await Promise.race([
    syncTotaleSuCloud(),
    new Promise(resolve => setTimeout(resolve, 2000))
   ]);
  }
  await firebase.auth().signOut();
  localStorage.clear();
 } catch (error) {
  console.error("Errore durante il logout:", error);
  localStorage.clear();
 }
}

function aggiornaAvatar(email) {
 if(!email) return;
 var iniziale = email.charAt(0).toUpperCase();
 var elementoIniziale = document.getElementById('inizialeAvatar');
 var bottone = document.getElementById('simboloEmail');
 var colori = {
  'A': '#F44336', 'B': '#E91E63', 'C': '#9C27B0', 'D': '#673AB7',
  'E': '#3F51B5', 'F': '#2196F3', 'G': '#03A9F4', 'H': '#00BCD4',
  'I': '#009688', 'J': '#4CAF50', 'K': '#8BC34A', 'L': '#CDDC39',
  'M': '#FFEB3B', 'N': '#FFC107', 'O': '#FF9800', 'P': '#FF5722',
  'Q': '#795548', 'R': '#9E9E9E', 'S': '#607D8B', 'T': '#000000',
  'U': '#888888', 'V': '#555555', 'W': '#333333', 'X': '#222222',
  'Y': '#111111', 'Z': '#444444'
 };
 if(elementoIniziale) elementoIniziale.innerText = iniziale;
 if(bottone) {
  bottone.innerText = iniziale;
  bottone.style.backgroundColor = colori[iniziale] || '#757575';
  bottone.style.color = '#FFFFFF';
 }
}





function salvaDatiSincronizzati() {
 var pacchetto = {
  timesList: timesList,
  namesList: namesList,
  ultimoAggiornamento: Date.now()
 };
 //localStorage.setItem("datiAppCompleti", JSON.stringify(pacchetto));
 localStorage.setItem("timesList", JSON.stringify(pacchetto.timesList));
 localStorage.setItem("namesList", JSON.stringify(pacchetto.namesList));
 if (dbRef) {
  dbRef.set(pacchetto);
 }
}


function inviaNotificaAttivitaUtente(tipoEvento, emailDestinatario) {
    var templateParams = {
        tipo_evento: tipoEvento,
        email_utente: emailDestinatario,
        data_ora: new Date().toLocaleString('it-IT')
    };

    return emailjs.send('service_bwvozbg', 'template_3stvlv8', templateParams);
}





function bloccaAccessoMultiplo() {
    document.body.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:#1e3c72; color:white; display:flex; align-items:center; justify-content:center; z-index:999999; font-family:sans-serif; text-align:center;">
            <div style="padding:30px; background:rgba(0,0,0,0.3); border:2px solid white; border-radius:20px; max-width:80%;">
                <h1 style="font-size:50px; margin:0;">⚠️</h1>
                <h2 style="margin:10px 0;">Impossibile accedere!</h2>
                <p>L'app è già in uso su un altro dispositivo o browser con questa mail.</p>
                <button onclick="location.reload()" style="margin-top:20px; padding:12px 25px; cursor:pointer; border:none; border-radius:50px; font-weight:bold; background:white; color:#1e3c72;">USA QUI</button>
            </div>
        </div>`;
    window.stop(); 
}





function applySettings()
{
 interactionSoundEffects = checkClick.checked;
 gamesMusic = checkSottofondo.checked;
 mobileVibration = checkVibrazione.checked;
 localStorage.setItem('interactionSoundEffects', interactionSoundEffects);
 localStorage.setItem('gamesMusic', gamesMusic);
 localStorage.setItem('mobileVibration', mobileVibration);
 
}


function playMusic()
{
 if(gamesMusic==true)
 playSoundtrack();
}


function writeOnDefaultButton()
{
 predefinitoBtn.value = '★ ' +defaultMethod;
}
function setNextOption()
{
 if(option_number==button_options.length-1)
 option_number=0;
 else
 option_number++;
 defaultMethod=button_options[option_number];
 if(option_number==0)
 percentageMode='base';
 else if(option_number==1)
 percentageMode='variations';
 else if(option_number==2)
 percentageMode='finance';
 else if(option_number==3)
 percentageMode='analysis';
 else if(option_number==4)
 percentageMode='utility';
 localStorage.setItem("option_number", option_number);
 writeOnDefaultButton();
}















var absolute_zero=false;

function resetWidth()
{
 prima.style.width = '50vw';
 quarta.style.width = '50vw';
 sesta.style.width = '50vw';
 seconda.style.width = '15vw';
 quinta.style.width = '15vw';
 settima.style.width = '15vw';
}
function changeColors(n)
{
 var kg = document.getElementById('kg');
 var lbs = document.getElementById('lbs');
 var g = document.getElementById('g');
 var rad = document.getElementById('rad');
 var grad = document.getElementById('grad');
 var k = document.getElementById('k');
 var cels = document.getElementById('cels');
 var far = document.getElementById('far');
 var kmh = document.getElementById('kmh');
 var mi = document.getElementById('mi');
 var kn = document.getElementById('kn');
 var mt = document.getElementById('mt');
 var ft = document.getElementById('ft');
 var inc = document.getElementById('inc');
 var yd = document.getElementById('yd');
 if(n=='Kg')
 {
  kg.style.backgroundColor = '#00bb00';
  lbs.style.backgroundColor = '#a9a9a9';
  acalc=1;
  unit1='lbs';
  coloredButton='chi';
 }
 else if(n=='lbs')
 {
  lbs.style.backgroundColor = '#00bb00';
  kg.style.backgroundColor = '#a9a9a9';
  acalc=2;
  unit1='Kg';
  coloredButton='lib';
 }
 else if(n=='°')
 {
  g.style.backgroundColor = '#00bb00';
  rad.style.backgroundColor = '#a9a9a9';
  grad.style.backgroundColor = '#a9a9a9';
  acalc=3;
  unit1='rad';
  unit2='grad';
  coloredButton='gra';
 }
 else if(n=='rad')
 {
  rad.style.backgroundColor = '#00bb00';
  g.style.backgroundColor = '#a9a9a9';
  grad.style.backgroundColor = '#a9a9a9';
  acalc=4;
  unit1='°';
  unit2='grad';
  coloredButton='rad';
 }
 else if(n=='grad')
 {
  grad.style.backgroundColor = '#00bb00';
  g.style.backgroundColor = '#a9a9a9';
  rad.style.backgroundColor = '#a9a9a9';
  acalc=5;
  unit1='°';
  unit2='rad';
  coloredButton='grd';
 }
 else if(n=='k')
 {
  k.style.backgroundColor = '#00bb00';
  cels.style.backgroundColor = '#a9a9a9';
  far.style.backgroundColor = '#a9a9a9';
  acalc=6;
  unit1='°C';
  unit2='°f';
  coloredButton='kel';
  if(terza.value.indexOf('-')!=-1)
  terza.value=-(Number(terza.value));
 }
 else if(n=='°C')
 {
  cels.style.backgroundColor = '#00bb00';
  k.style.backgroundColor = '#a9a9a9';
  far.style.backgroundColor = '#a9a9a9';
  acalc=7;
  unit1='k';
  unit2='°f';
  coloredButton='cel';
  if(terza.value.indexOf('-')==-1 && Number(terza.value)<-273.15)
  terza.value=-(Number(terza.value));
 }
 else if(n=='°f')
 {
  far.style.backgroundColor = '#00bb00';
  k.style.backgroundColor = '#a9a9a9';
  cels.style.backgroundColor = '#a9a9a9';
  acalc=8;
  unit1='k';
  unit2='°C';
  coloredButton='far';
  if(terza.value.indexOf('-')==-1 && Number(terza.value)<-459.67)
  terza.value=-(Number(terza.value));
 }
 else if(n=='km')
 {
  kmh.style.backgroundColor = '#00bb00';
  mi.style.backgroundColor = '#a9a9a9';
  kn.style.backgroundColor = '#a9a9a9';
  acalc=9;
  unit1='mi';
  unit2='kn';
  coloredButton='klm';
 }
 else if(n=='mi')
 {
  mi.style.backgroundColor = '#00bb00';
  kmh.style.backgroundColor = '#a9a9a9';
  kn.style.backgroundColor = '#a9a9a9';
  acalc=10;
  unit1='km';
  unit2='kn';
  coloredButton='mig';
 }
 else if(n=='kn')
 {
  kn.style.backgroundColor = '#00bb00';
  kmh.style.backgroundColor = '#a9a9a9';
  mi.style.backgroundColor = '#a9a9a9';
  acalc=11;
  unit1='km';
  unit2='mi';
  coloredButton='nod';
 }
 else if(n=='m')
 {
  mt.style.backgroundColor = '#00bb00';
  ft.style.backgroundColor = '#a9a9a9';
  inc.style.backgroundColor = '#a9a9a9';
  yd.style.backgroundColor = '#a9a9a9';
  acalc=12;
  unit1='ft';
  unit2='"';
  unit3='yd';
  coloredButton='met';
 }
 else if(n=='ft')
 {
  ft.style.backgroundColor = '#00bb00';
  mt.style.backgroundColor = '#a9a9a9';
  inc.style.backgroundColor = '#a9a9a9';
  yd.style.backgroundColor = '#a9a9a9';
  acalc=13;
  unit1='m';
  unit2='"';
  unit3='yd';
  coloredButton='pie';
 }
 else if(n=='"')
 {
  inc.style.backgroundColor = '#00bb00';
  mt.style.backgroundColor = '#a9a9a9';
  ft.style.backgroundColor = '#a9a9a9';
  yd.style.backgroundColor = '#a9a9a9';
  acalc=14;
  unit1='m';
  unit2='ft';
  unit3='yd';
  coloredButton='pol';
 }
 else if(n=='yd')
 {
  yd.style.backgroundColor = '#00bb00';
  mt.style.backgroundColor = '#a9a9a9';
  ft.style.backgroundColor = '#a9a9a9';
  inc.style.backgroundColor = '#a9a9a9';
  acalc=15;
  unit1='m';
  unit2='ft';
  unit3='"';
  coloredButton='yar';
 }
 activeButtons = true;
 calculateConvertion();
}
var coloredButton=null;
function oppositeNumber()
{
 checkPossibleOpposite();
 if(absolute_zero==true)
 return;
 if(terza.value != '0')
 terza.value=-(Number(terza.value));
 calculateConvertion();
}
function checkPossibleOpposite()
{
 absolute_zero=false;
 if(coloredButton=='kel')
 {
  if(terza.value.indexOf('-')==-1)
  {
   showTemperatureTimeout();
   absolute_zero=true;
  }
 }
 else if(coloredButton=='cel')
 {
  if(terza.value.indexOf('-')==-1 && Number(terza.value)>273.15)
  {
   showTemperatureTimeout();
   absolute_zero=true;
  }
 }
 else
 {
  if(terza.value.indexOf('-')==-1 && Number(terza.value)>459.67)
  {
   showTemperatureTimeout();
   absolute_zero=true;
  }
 }
}
function showTemperatureTimeout()
{
 setTimeout(() => {
  avvisozeroassoluto.style.display = 'none';
 },3000);
 avvisozeroassoluto.style.display = 'block';
}
function cancCalc()
{
 var buttons = [
        document.getElementById('kg'),
        document.getElementById('lbs'),
        document.getElementById('g'),
        document.getElementById('rad'),
        document.getElementById('grad'),
        document.getElementById('k'),
        document.getElementById('cels'),
        document.getElementById('far'),
        document.getElementById('kmh'),
        document.getElementById('mi'),
        document.getElementById('kn'),
        document.getElementById('mt'),
        document.getElementById('ft'),
        document.getElementById('inc'),
        document.getElementById('yd')
    ];

    buttons.forEach(btn => {
        if (btn) btn.style.backgroundColor = '#ff5500';
    });
 prima.value = '';
 seconda.value = '';
 quarta.value = '';
 quinta.value = '';
 sesta.value = '';
 settima.value = '';
 terza.value = '0';
 acalc=null;
 bcalc=null;
 activeButtons = false;
 coloredButton=null;
}
function calculateConvertion()
{
 
 if(!activeButtons)
 return;
 bcalc = parseFloat(terza.value);
 if(acalc==1)
 prima.value = bcalc/0.453592;
 else if(acalc==2)
 prima.value = bcalc*0.453592;
 else if(acalc==3)
 {
  prima.value = bcalc*0.0174533;
  quarta.value = bcalc*(10/9);
 }
 else if(acalc==4)
 {
  prima.value = bcalc*57.2958;
  quarta.value = bcalc*63.66198;
 }
 else if(acalc==5)
 {
  prima.value = bcalc*(10/9);
  quarta.value = bcalc/63.66198;
 }
 else if(acalc==6)
 {
  prima.value = bcalc-273.15;
  quarta.value = (bcalc-273.15)*(9/5)+32
 }
 else if(acalc==7)
 {
  prima.value = bcalc+273.15;
  quarta.value = (bcalc*9/5)+32;
 }
 else if(acalc==8)
 {
  prima.value = (bcalc-32)*(5/9);
  quarta.value = (bcalc-32)*(5/9)+273.15;
 }
 else if(acalc==9)
 {
  prima.value = bcalc/1.60943;
  quarta.value = bcalc/1.852;
 }
 else if(acalc==10)
 {
  prima.value = bcalc*1.60943;
  quarta.value = bcalc/1.15078;
 }
 else if(acalc==11)
 {
  prima.value = bcalc*1.852;
  quarta.value = bcalc*1.15078;
 }
 else if(acalc==12)
 {
  prima.value = bcalc*3.28;
  quarta.value = bcalc*39.37;
  sesta.value = bcalc*1.09;
 }
 else if(acalc==13)
 {
  prima.value = bcalc*0.3048;
  quarta.value = bcalc*12;
  sesta.value = bcalc*0.333;
 }
 else if(acalc==14)
 {
  prima.value = bcalc*0.0254;
  quarta.value = bcalc*0.0833;
  sesta.value = bcalc*0.0278;
 }
 else if(acalc==15)
 {
  prima.value = bcalc*0.9144;
  quarta.value = bcalc*3;
  sesta.value = bcalc*36;
 }
 seconda.value = unit1;
 quinta.value = unit2;
 settima.value = unit3;
}
function backSpace()
{
 terza.value = terza.value.slice(0, -1);
 if(terza.value == '-')
 terza.value = terza.value.slice(0, -1);
 if(terza.value == '')
 terza.value = '0';
 calculateConvertion();
}
function writePoint()
{
 if(!terza.value.includes('.'))
 terza.value += '.';
}
function writeNumber(number)
{
 if(coloredButton!=null)
 {
  var virtualNumber=Number(terza.value + number);
  if(coloredButton=='kel' && virtualNumber < 0)
  return;
  if(coloredButton=='cel' && virtualNumber < -273.15)
  return;
  if(coloredButton=='far' && virtualNumber < -459.67)
  return;
 }
 else
 {
  setTimeout(() => {
   selezionaunitamisura.style.display = 'none';
  },3000);
  selezionaunitamisura.style.display = 'block';
  return;
 }
 if(terza.value == '0')
 terza.value = number;
 else
 terza.value += number;
 calculateConvertion();
}
function showCalc()
{
 showtabella.style.display = 'none';
 altrodiv.style.display = 'none';
 if(containercalc.style.display == 'none' || containercalc.style.display == '')
 {
  giochi.style.display = 'none';
  containercalc.style.display = 'block';
  simboloEmail.style.display = 'none';
  btnImpostazioni.style.display = 'none';
 }
 else
 {
  containercalc.style.display = 'none';
  giochi.style.display = 'block';
  simboloEmail.style.display = 'block';
  btnImpostazioni.style.display = 'block';
 }
}
function showOnly(...daMostrare) {
  var figli = containercalc.querySelectorAll('div');
  figli.forEach(div => {
    
    div.style.display = daMostrare.includes(div) ? 'block' : 'none';
  });
}
function createGlobalVar()
{
 if(globalThis.moreLess==undefined)
 globalThis.moreLess=document.getElementById('n');
}
function showCalcWeight()
{
 createGlobalVar();
 moreLess.style.display = 'none';
 resetWidth();
 cancCalc();
 showOnly(calc1,bottonimassa);
 prima.style.width = '47vw';
 seconda.style.width = '18vw';
}
function showCalcAngles()
{
 createGlobalVar();
 moreLess.style.display = 'block';
 cancCalc();
 showOnly(calc1,bottoniangoli);
 prima.style.width = '40vw';
 quarta.style.width = '40vw';
 seconda.style.width = '25vw';
 quinta.style.width = '25vw';
 secondariga.style.display = 'block';
}
function showCalcTemperature()
{
 createGlobalVar();
 moreLess.style.display = 'block';
 resetWidth();
 cancCalc();
 showOnly(calc1,bottonitemperatura);
 secondariga.style.display = 'block';
}
function showCalcSpeed()
{
 createGlobalVar();
 moreLess.style.display = 'none';
 resetWidth();
 cancCalc();
 showOnly(calc1,bottonivelocita);
 secondariga.style.display = 'block';
}
function showCalcLength()
{
 createGlobalVar();
 moreLess.style.display = 'none';
 resetWidth();
 cancCalc();
 showOnly(calc1,bottonilunghezza);
 secondariga.style.display = 'block';
 terzariga.style.display = 'block';
}
function showProbability()
{
 if(probabilitadiv.style.display == 'none' || probabilitadiv.style.display == '')
 {
  probabilitadiv.style.display = 'block';
  altrodiv.style.display = 'none';
 }
 else
 {
  probabilitadiv.style.display = 'none';
  altrodiv.style.display = 'block';
 }
}
function factorial(n)
{
 if(n>=150)
 {
  setTimeout(() => {
   insnumerofattoriale.style.color = 'black';
   insnumerofattoriale.value = '';
   insnumerofattoriale.readOnly = false;
  },2000);
  insnumerofattoriale.style.color = 'red';
  insnumerofattoriale.value = 'Invalido';
  insnumerofattoriale.readOnly = true;
 }
 else
 {
  if(n<0 || (n%1)!=0 || isNaN(n))
  {
   var message;
   risultato2.style.color = 'red';
   message = 'Parametro non valido';
   return(message);
   return;
  }
  risultato2.style.color = 'black';
  var c;
  for(c=1;n>1;n--)
  c=c*n;
  return(c);
 }
}
function calcProbability(N,m,p)
{
 if(N<=0 || m<0 || m>N || p<0 || p>1 || numeroesp.value == '' || numeroevento.value == '' || numeroverifica.value == '' || numeroverifica.value == 'Invalido')
 {
  risultato1.style.color = 'red';
  risultato1.textContent = 'Parametri non validi';
  return;
 }
 var a,b,c;
 a=N-m;
 b=factorial(N)/(factorial(m)*factorial(a));
 c=Math.pow(p,m)*Math.pow(1-p,a);
 if(risultato1.style.color != 'black')
 risultato1.style.color = 'black';
 risultato1.textContent = (b*c*100).toFixed(2)+ '%';
}
function showFactorial()
{
 if(fattorialediv.style.display == 'none' || fattorialediv.style.display == '')
 {
  altrodiv.style.display = 'none';
  fattorialediv.style.display = 'block';
 }
 else
 {
  altrodiv.style.display = 'block';
  fattorialediv.style.display = 'none';
 }
}
function showCalcForProbability()
{
 if(eventidiv.style.display == 'none' || eventidiv.style.display == '')
 {
  calcolaprobabilita.style.display = 'none';
  risultato1.style.display = 'none';
  eventidiv.style.display = 'flex';
 }
 else
 {
  calcolaprobabilita.style.display = 'block';
  risultato2.style.display = 'block';
  eventidiv.style.display = 'none';
  numeroprobabilita.value = '';
  numeroprobabilita.placeholder = 'Numero intero > 0';
 }
}

function createNumberForProbability()
{
 var numeroprobabilita = document.getElementById('numeroprobabilita');
 var value = numeroprobabilita.value.trim();
 var check=true,i;
 for(i=0;i<value.length;i++)
 {
  if(value[i]<'0' || value[i]>'9')
  check=false;
 }
 if(!check)
 return;
 var n=parseInt(value,10);
 if((n%1)!=0 || n<0)
 {
  setTimeout(() => {
   numeroverifica.value = '';
   numeroverifica.style.color = 'black';
   numeroverifica.readOnly = false;
   numeroprobabilita.placeholder = 'Numero intero > 0';
  }, 2000);
  numeroverifica.style.color = 'red';
  numeroverifica.value = 'Invalido';
  numeroverifica.readOnly = true;
 }
 else 
 numeroverifica.value = (1/n).toFixed(9);
 showCalcForProbability();
}
function showCalculationsInfo(n)
{
 if(n=='0')
 {
  if(cosacalcolerai.style.display == 'none' || cosacalcolerai.style.display == '')
  {
   cosacalcolerai.style.display = 'block';
   probabilitadiv.style.display = 'none';
  }
  else
  {
   cosacalcolerai.style.display = 'none';
   probabilitadiv.style.display = 'block';
  }
 }
 else if(n=='1')
 {
  if(spiegazioneprobabilitauno.style.display == 'none' || spiegazioneprobabilitauno.style.display == '')
  {
   spiegazioneprobabilitauno.style.display = 'block';
   probabilitadiv.style.display = 'none';
  }
  else
  {
   spiegazioneprobabilitauno.style.display = 'none';
   probabilitadiv.style.display = 'block';
  }
 }
 else if(n=='2')
 {
  if(spiegazioneprobabilitadue.style.display == 'none' || spiegazioneprobabilitadue.style.display == '')
  {
   spiegazioneprobabilitadue.style.display = 'block';
   probabilitadiv.style.display = 'none';
  }
  else
  {
   spiegazioneprobabilitadue.style.display = 'none';
   probabilitadiv.style.display = 'block';
  }
 }
 else if(n=='3')
 {
  if(spiegazioneprobabilitatre.style.display == 'none' || spiegazioneprobabilitatre.style.display == '')
  {
   spiegazioneprobabilitatre.style.display = 'block';
   probabilitadiv.style.display = 'none';
  } 
  else
  {
   spiegazioneprobabilitatre.style.display = 'none';
   probabilitadiv.style.display = 'block';
  }
 }
 else if(n=='4')
 {
  if(spiegazionefattoriale.style.display == 'none' || spiegazionefattoriale.style.display == '')
  {
   spiegazionefattoriale.style.display = 'block';
   fattorialediv.style.display = 'none';
  } 
  else
  {
   spiegazionefattoriale.style.display = 'none';
   fattorialediv.style.display = 'block';
  }
 }
 else if(n=='5')
 {
  if(spiegazionebmi.style.display == 'none' || spiegazionebmi.style.display == '')
  {
   spiegazionebmi.style.display = 'block';
   bmidiv.style.display = 'none';
  } 
  else
  {
   spiegazionebmi.style.display = 'none';
   bmidiv.style.display = 'block';
  }
 }
}
function showSemplificator()
{
 if(semplificatorediv.style.display == 'none' || semplificatorediv.style.display == '')
 {
  altrodiv.style.display = 'none';
  semplificatorediv.style.display = 'block';
 }
 else
 {
  altrodiv.style.display = 'block';
  semplificatorediv.style.display = 'none';
 }
}
var clickButton = false;
var fraction=false;
function setButtonCondition()
{
 clickButton = true;
}
function calculateFactors(num)
{
 var div,factors=[],num_A=num;
 if((num%2)!=0)
 div=3;
 else
 div=2;
 while(div<=num)
 {
  if((num%div)==0)
  {
   num=num/div;
   factors.push(div);
  }
  else
  div++;
 }
 if(clickButton==true)
 {
  writeFactors(factors,num_A);
  clickButton=false;
 }
 else
 {
  return(restituishFactors(factors));
 }
}
function writeFactors(factors,num_A)
{
 var base=[],elevation=[];
 var risultatoDiv = document.getElementById('risultato3_3');
 risultatoDiv.innerHTML = '';
 if(factors.length==0)
 {
  risultatoDiv.textContent = num_A;
  return;
 }
 var position,currentNumber=factors[0],quantity=1,empty=true,action=false;
 for(position=1;position<factors.length;position++)
 {
  if(factors[position]==currentNumber)
  {
   quantity++;
   action=true;
  }
  else
  {
   base.push(currentNumber);
   elevation.push(quantity);
   if(empty==false)
   risultatoDiv.textContent += ' x ';
   empty=false;
   risultatoDiv.textContent += currentNumber;
   if(quantity>1)
   risultatoDiv.textContent += '^' +quantity;
   currentNumber=factors[position];
   quantity=1;
   action=false;
  }
 }
 if(action==true || quantity==1)
 {
  if(empty==false)
  risultatoDiv.textContent += ' x ';
  risultatoDiv.textContent += currentNumber;
  if(quantity>1)
  risultatoDiv.textContent += '^' +quantity;
  base.push(currentNumber);
  elevation.push(quantity);
 }
}
function restituishFactors(factors)
{
 var base=[],elevation=[];
 if(factors.length==0)
 return;
 var position,currentNumber=factors[0],quantity=1,action=false;
 for(position=1;position<factors.length;position++)
 {
  if(factors[position]==currentNumber)
  {
   quantity++;
   action=true;
  }
  else
  {
   base.push(currentNumber);
   elevation.push(quantity);
   currentNumber=factors[position];
   quantity=1;
   action=false;
  }
 }
 if(action==true || quantity==1)
 {
  base.push(currentNumber);
  elevation.push(quantity);
 }
 return[base,elevation];
}
function calculateRoots(num)
{
 document.getElementById("risultato3_1").innerHTML = '';
 var [base,elevation]=calculateFactors(num);
 var index_write,esp;
 var outRoot=[],inRoot=[];
 for(index_write=0;index_write<elevation.length;index_write++)
 {
  esp=elevation[index_write];
  if((esp%2)==0)
  outRoot.push(evenEsponents(esp,base[index_write]));
  else
  {
   inRoot.push(base[index_write]);
   outRoot.push(evenEsponents(esp-1,base[index_write]));
  }
 }
 var molt1,molt2;
 for(index_write=0,molt1=1;index_write<outRoot.length;index_write++) 
 molt1=molt1*outRoot[index_write];
 for(index_write=0,molt2=1;index_write<inRoot.length;index_write++) 
 molt2=molt2*inRoot[index_write];
 if(molt1!=1)
 document.getElementById("risultato3_1").textContent = molt1;
 if(molt2!=1)
 document.getElementById("risultato3_1").textContent += '√' +molt2;
}
function evenEsponents(esp,base)
{
 var molt=1;
 if(esp==0)
 {
  return(1);
  return;
 }
 for(esp=esp/2;esp>=1;esp--)
 molt=molt*base;
 return(molt);
}
function calcMCD(a,b)
{
 var ind_for;
 for(ind_for=a;((a%ind_for)!=0 || (b%ind_for)!=0) && ind_for>1;ind_for--);
 return(ind_for);
}
function getNumbersByFraction(par)
{
 var slash = par.indexOf('/');
 if(slash!=-1)
 {
  var numeratore = par.substr(0,slash);
  var denominatore = par.substr(slash+1,par.length-slash);
  return[numeratore,denominatore];
 }
 else
 return[0,0];
}
function calculateFraction(num)
{
 var [numeratore,denominatore]=getNumbersByFraction(num);
 risultato3_2.innerHTML = '';
 if(numeratore==0 && denominatore!=0 && fraction==false)
 risultato3_2.textContent = 0;
 else if(denominatore==0)
 {
  risultato3_2.innerHTML = '';
  setTimeout(() => {
   frazione.style.color = 'black';
   frazione.value = '';
   frazione.readOnly = false;
  },2000);
  frazione.style.color = 'red';
  frazione.value = 'Invalido';
  frazione.readOnly = true;
 }
 else
 {
  var divisor;
  divisor = calcMCD(numeratore,denominatore);
  if(divisor==1)
  {
   risultato3_2.textContent = num;
   return;
  }
  numeratore=numeratore/divisor;
  denominatore=denominatore/divisor;
  if(fraction==true)
  {
   return(numeratore+ '/' +denominatore);
   return;
  }
  risultato3_2.textContent = numeratore;
  if(denominatore!=1)
  risultato3_2.textContent += '/' +denominatore;
 }
}
var typeFraction;
function typeData(num)
{
 if(num.indexOf('/')!=-1)
 typeFraction=true;
 else
 typeFraction=false;
 return(typeFraction);
}
function getFraction(num)
{
 if(num.indexOf(',')!=-1 || num.indexOf('.')!=-1)
 {
  var numeratore;
  var ten=10,beforeDot;
  beforeDot = num.search(/[.,]/); 
  numeratore = num.replace(/[.,]/g, '');
  var denominatore;
  denominatore = Math.pow(ten,num.length-(beforeDot+1))
  var divisor;
  divisor = calcMCD(numeratore,denominatore);
  if(divisor!=1)
  {
   numeratore=numeratore/divisor;
   denominatore=denominatore/divisor;
  }
  if(numeratore.toString().indexOf('0')!=-1)
  numeratore = numeratore.slice(0, beforeDot - 1) + numeratore.toString().slice(beforeDot);
  return(numeratore+ '/' +denominatore);
 }
}
function getFractionByPeriodicInput(num,checkPar)
{
 var numeratore;
 var denominatore='9',beforeDot,periodic,intNumber;
 beforeDot = num.search(/[.,]/);
  var antiperiodo;
 antiperiodo = num.indexOf('(')-(beforeDot+1);
  intNumber = num.substr(0,num.length-(beforeDot+3));
 numeratore = num.replace(/[.,]/g, '');
  var parTonde;
 parTonde=numeratore.substr(0,numeratore.length-(numeratore.indexOf('(')+1));
 numeratore = numeratore.replace(/[()]/g, '');
 if(antiperiodo!=0)
 numeratore=numeratore-parTonde;
 else
 numeratore=numeratore-intNumber;
 var addToDen;
 for(addToDen=0;addToDen<checkPar-2;addToDen++)
 denominatore+='9';
 for(addToDen=0;addToDen<antiperiodo;addToDen++)
 denominatore+='0';
 var divisor = calcMCD(numeratore,denominatore);
 if(divisor!=1)
 {
  numeratore=numeratore/divisor;
  denominatore=denominatore/divisor;
 }
 return(numeratore+ '/' +denominatore);
}
function getDecimal(num)
{
 var [numeratore,denominatore]=getNumbersByFraction(num);
 var result=numeratore/denominatore;
 if(result.toString().length<7)
 return(result);
 else
 return(result).toExponential(5);
}
function calculateFloats_Fractions(num)
{
 if(num.indexOf('/')==-1 && (num.indexOf(',')!=-1 || num.indexOf('.')!=-1))
 {
  if(num.indexOf('(')!=-1 || num.indexOf(')')!=-1)
  {
   var checkPar1 = num.indexOf('(');
   var checkPar2 = num.indexOf(')');
   if(checkPar1!=-1 && checkPar2!=-1)
   {
    if(num.substr(num.indexOf('(')+1,num.indexOf(')')-(num.indexOf('(')+1))=='')
    {
     risultato3_4.innerHTML = '';
     setTimeout(() => {
      reali_frazioni.style.color = 'black';
      reali_frazioni.value = '';
      reali_frazioni.readOnly = false;
     },2000);
     reali_frazioni.style.color = 'red';
     reali_frazioni.value = 'Invalido';
     reali_frazioni.readOnly = true;
    }
    else
    risultato3_4.textContent = getFractionByPeriodicInput(num,checkPar2-checkPar1);
   }
   else
   {
    risultato3_4.innerHTML = '';
    setTimeout(() => {
     reali_frazioni.style.color = 'black';
     reali_frazioni.value = '';
     reali_frazioni.readOnly = false;
    },2000);
    reali_frazioni.style.color = 'red';
    reali_frazioni.value = 'Invalido';
    reali_frazioni.readOnly = true;
   } 
  }
  else
  {
   risultato3_4.textContent = getFraction(num);
  }
 }
 else if(num.indexOf('/')!=-1)
 risultato3_4.textContent = getDecimal(num);
 else
 {
  if(!isNaN(parseInt(num)))
  {
   risultato3_4.textContent = num;
   return;
  }
  risultato3_4.innerHTML = '';
  setTimeout(() => {
   reali_frazioni.style.color = 'black';
   reali_frazioni.value = '';
   reali_frazioni.readOnly = false;
  },2000);
  reali_frazioni.style.color = 'red';
  reali_frazioni.value = 'Invalido';
  reali_frazioni.readOnly = true;
 }
}
function showCalcMCD_mcm()
{
 if(mcd_mcm_div.style.display == 'none' || mcd_mcm_div.style.display == '')
 {
  altrodiv.style.display = 'none';
  mcd_mcm_div.style.display = 'block';
 }
 else
 {
  altrodiv.style.display = 'block';
  mcd_mcm_div.style.display = 'none';
 }
}
var numbers_quantity=true;
var mcmNumbers_quantity=true;
function quantityMCDTrue()
{
 numbers_quantity=true;
}
function quantityMCDFalse()
{
 numbers_quantity=false;
}
function quantity_mcm_True()
{
 mcmNumbers_quantity=true;
}
function quantity_mcm_False()
{
 mcmNumbers_quantity=false;
}
function showOpen_MCD_Menu()
{
 if(menuMCD.style.display == 'none' || menuMCD.style.display == '')
 {
  risultato4_1.style.display = 'none';
  openmcdmenu.value = 'Quantità ▲';
  menuMCD.style.display = 'block';
 }
 else
 {
  risultato4_1.style.display = 'block';
  openmcdmenu.value = 'Quantità ▼';
  menuMCD.style.display = 'none';
 }
}
function showOpen_mcm_Menu()
{
 if(menumcm.style.display == 'none' || menumcm.style.display == '')
 {
  risultato4_2.style.display = 'none';
  openmcmmenu.value = 'Quantità ▲';
  menumcm.style.display = 'block';
 }
 else
 {
  risultato4_2.style.display = 'block';
  openmcmmenu.value = 'Quantità ▼';
  menumcm.style.display = 'none';
 }
}
function separateNumbersByText(testo)
{
 testo = testo.replace(/ /g, '');
 var position = testo.indexOf(',')
 var a,b;
 a = testo.substr(0,position);
 b = testo.substr(position+1,testo.length-position);
 return[a,b];
}
function separateThreeNumbersByText(testo)
{
 testo = testo.replace(/ /g, '');
 var position = testo.indexOf(',')
 var a,b,c;
 a = testo.substr(0,position);
 virgola2 = testo.indexOf(',',position+1);
 b = testo.substr(position+1,virgola2-(position+1));
 c = testo.substr(virgola2+1,testo.length-virgola2);
 return[a,b,c];
}
function calcMCDByText(testo)
{
 if(testo.indexOf(',')!=-1 && (a!='' && b!=''))
 {
  if(numbers_quantity==true)
  {
   if(/^[0-9]+$/.test(testo.slice(testo.indexOf(',') + 1)))
   {
    var [a,b] = separateNumbersByText(testo);
    risultato4_1.textContent = calcMCD(a,b);
   }
   else
   {
    risultato4_1.innerHTML = '';
    setTimeout(() => {
     insnumeromcd.style.color = 'black';
     insnumeromcd.value = '';
     insnumeromcd.readOnly = false;
    },2000);
    insnumeromcd.style.color = 'red';
    insnumeromcd.value = 'Invalido';
    insnumeromcd.readOnly = true;
   }
  }
  else
  {
   var [a,b,c] = separateThreeNumbersByText(testo);
   if(/^[0-9,]+$/.test(testo.slice(testo.indexOf(',') + 1))  && (!isNaN(a) && !isNaN(b) && !isNaN(c)))
   {
    risultato4_1.textContent = calcMCD(calcMCD(a,b),c);
   }
   else
   {
    risultato4_1.innerHTML = '';
    setTimeout(() => {
     insnumeromcd.style.color = 'black';
     insnumeromcd.value = '';
     insnumeromcd.readOnly = false;
    },2000);
    insnumeromcd.style.color = 'red';
    insnumeromcd.value = 'Invalido';
    insnumeromcd.readOnly = true;
   }
  }
 }
 else
 {
  risultato4_1.innerHTML = '';
  setTimeout(() => {
   insnumeromcd.style.color = 'black';
   insnumeromcd.value = '';
   insnumeromcd.readOnly = false;
  },2000);
  insnumeromcd.style.color = 'red';
  insnumeromcd.value = 'Invalido';
  insnumeromcd.readOnly = true;
 }
}
function calc_mcm(a,b)
{
 var primo;
 primo=(a*b)/calcMCD(a,b);
 return(primo);
}
function calc_mcm_ByText(testo)
{
 if(testo.indexOf(',')!=-1 && (a!='' && b!=''))
 {
  if(mcmNumbers_quantity==true)
  {
   if(/^[0-9]+$/.test(testo.slice(testo.indexOf(',') + 1)))
   {
    var [a,b] = separateNumbersByText(testo);
    risultato4_2.textContent = (a*b)/calcMCD(a,b);
   }
   else
   {
    risultato4_2.innerHTML = '';
    setTimeout(() => {
     insnumeromcm.style.color = 'black';
     insnumeromcm.value = '';
     insnumeromcm.readOnly = false;
    },2000);
    insnumeromcm.style.color = 'red';
    insnumeromcm.value = 'Invalido';
    insnumeromcm.readOnly = true;
   }
  }
  else
  {
   var [a,b,c] = separateThreeNumbersByText(testo);
   if(/^[0-9,]+$/.test(testo.slice(testo.indexOf(',') + 1))  && (!isNaN(a) && !isNaN(b) && !isNaN(c)))
   {
    risultato4_2.textContent = calc_mcm(calc_mcm(a,b),c);
   }
   else
   {
    risultato4_2.innerHTML = '';
    setTimeout(() => {
     insnumeromcm.style.color = 'black';
     insnumeromcm.value = '';
     insnumeromcm.readOnly = false;
    },2000);
    insnumeromcm.style.color = 'red';
    insnumeromcm.value = 'Invalido';
    insnumeromcm.readOnly = true;
   }
  }
 }
 else
 {
  risultato4_2.innerHTML = '';
  setTimeout(() => {
   insnumeromcm.style.color = 'black';
   insnumeromcm.value = '';
   insnumeromcm.readOnly = false;
  },2000);
  insnumeromcm.style.color = 'red';
  insnumeromcm.value = 'Invalido';
  insnumeromcm.readOnly = true;
 } 
}
function showPasswordSicurity()
{
 if(sicurezzapasswordDiv.style.display == 'none' || sicurezzapasswordDiv.style.display == '')
 {
  altrodiv.style.display = 'none';
  sicurezzapasswordDiv.style.display = 'block';
 }
 else
 {
  altrodiv.style.display = 'block';
  sicurezzapasswordDiv.style.display = 'none';
 }
}
function showDaysDistance()
{
 if(distanzadateDiv.style.display == 'none' || distanzadateDiv.style.display == '')
 {
  altrodiv.style.display= 'none';
  distanzadateDiv.style.display = 'block';
 }
 else
 {
  altrodiv.style.display= 'block';
  distanzadateDiv.style.display = 'none';
 }
}
function showPercentageCalculation()
{
 if(percentualidiv.style.display == 'none' || percentualidiv.style.display == '')
 {
  altrodiv.style.display= 'none';
  percentualidiv.style.display = 'block';
 }
 else
 {
  altrodiv.style.display= 'block';
  percentualidiv.style.display = 'none';
 }
}
function showTable()
{
 containercalc.style.display = 'none';
 calc1.style.display = 'none';
 if(showtabella.style.display == 'none' || showtabella.style.display == '')
 {
  giochi.style.display = 'none';
  showtabella.style.display = 'block';
  simboloEmail.style.display = 'none';
  btnImpostazioni.style.display = 'none';
 }
 else
 {
  giochi.style.display = 'block';
  showtabella.style.display = 'none';
  simboloEmail.style.display = 'block';
  btnImpostazioni.style.display = 'block';
 }
}
document.addEventListener("DOMContentLoaded", function () {
 var savedElements = document.querySelectorAll('.save');
 savedElements.forEach((el, index) => {
  var key = `save_field_${index}`;
  var savedValue = localStorage.getItem(key);
  if(savedValue !== null)
  {
   el.value = savedValue;
  }
  el.addEventListener('input', () => {
   localStorage.setItem(key, el.value);
  });
 });
});
function showHomeWorks()
{
 if(compiti.style.display == 'none' || compiti.style.display == '')
 {
  compiti.style.display = 'block';
  giochi.style.display = 'none';
  simboloEmail.style.display = 'none';
  btnImpostazioni.style.display = 'none';
 }
 else
 {
  compiti.style.display = 'none';
  giochi.style.display = 'block';
  simboloEmail.style.display = 'block';
  btnImpostazioni.style.display = 'block';
 }
}
function showPromemoria()
{
 if(promemoria.style.display == 'none' || promemoria.style.display == '')
 {
  promemoria.style.display = 'block';
  giochi.style.display = 'none';
  simboloEmail.style.display = 'none';
  btnImpostazioni.style.display = 'none';
 }
 else
 {
  promemoria.style.display = 'none';
  giochi.style.display = 'block';
  simboloEmail.style.display = 'block';
  btnImpostazioni.style.display = 'block';
 }
}
function showActivity()
{
 if(activity.style.display == 'none' || activity.style.display == '')
 {
  activity.style.display = 'block';
  giochi.style.display = 'none';
  simboloEmail.style.display = 'none';
  btnImpostazioni.style.display = 'none';
 }
 else
 {
  activity.style.display = 'none';
  giochi.style.display = 'block';
  simboloEmail.style.display = 'block';
  btnImpostazioni.style.display = 'block';
 }
 container3.style.display = 'none';
 containerSL.style.display = 'none';
 containerP.style.display = 'none';
 studiolavoro.style.width = '70vw';
 studiolavoro.style.height = '20vw';
 personale.style.width = '70vw';
 personale.style.height = '20vw';
 studiolavoro.style.border = '0.1vw solid black';
 personale.style.border = '0.1vw solid black';
}
function showStudioLavoro()
{
 var container;
 container = document.getElementById('container3');
 if(containerSL.style.display == 'none' || containerSL.style.display == '')
 {
  container.style.display = 'block';
  studiolavoro.style.width = '77vw';
  studiolavoro.style.height = '22vw';
  personale.style.width = '70vw';
  personale.style.height = '20vw';
  studiolavoro.style.border = '0.2vw solid black';
  personale.style.border = '0.1vw solid black';
  containerSL.style.display = 'block';
  if(containerP.style.display == 'block')
  containerP.style.display = 'none';
 }
 else
 {
  containerSL.style.display = 'none';
  container.style.display = 'none';
  studiolavoro.style.width = '70vw';
  studiolavoro.style.height = '20vw';
  studiolavoro.style.border = '0.1vw solid black';
 }
}
function showPersonale()
{
 var container;
 container = document.getElementById('containerP');
 if(containerP.style.display == 'none' || containerP.style.display == '')
 {
  container.style.display = 'block';
  personale.style.width = '77vw';
  personale.style.height = '22vw';
  studiolavoro.style.width = '70vw';
  studiolavoro.style.height = '20vw';
  personale.style.border = '0.2vw solid black';
  studiolavoro.style.border = '0.1vw solid black';
  containerP.style.display = 'block';
  if(container3.style.display == 'block')
  container3.style.display = 'none';
  if(containerSL.style.display == 'block')
  containerSL.style.display = 'none';
 }
 else
 {
  containerP.style.display = 'none';
  personale.style.width = '70vw';
  personale.style.height = '20vw';
  personale.style.border = '0.1vw solid black';
 }
}
function showList()
{
 var lista;
 lista = document.getElementById('lista');
 if(lista.style.display == 'none' || lista.style.display == '')
 {
  lista.style.display = 'block';
  activity.style.display = 'none';
 }
 else
 {
  lista.style.display = 'none';
  activity.style.display = 'block';
  containerP.style.display = 'block';
 }
}
function showSport()
{
 if(sport.style.display == 'none' || sport.style.display == '')
 {
  sport.style.display = 'block';
 }
 else
 {
  sport.style.display = 'none';
 }
}
function showWeeklyPlan()
{
 if(containerTAB.style.display == 'none' || containerTAB.style.display == '')
 {
  containerTAB.style.display = 'block';
  settimanale.style.width = '77vw';
  settimanale.style.height = '22vw';
  giornaliero.style.width = '70vw';
  giornaliero.style.height = '20vw';
  obiettivi.style.width = '70vw';
  obiettivi.style.height = '20vw';
  fisico.style.width = '70vw';
  fisico.style.height = '20vw';
  settimanale.style.border = '0.2vw solid black';
  giornaliero.style.border = '0.1vw solid black';
  obiettivi.style.border = '0.1vw solid black';
  fisico.style.border = '0.1vw solid black';
  dailyplan.style.display = 'none';
 }
 else
 {
  containerTAB.style.display = 'none';
  settimanale.style.width = '70vw';
  settimanale.style.height = '20vw';
  settimanale.style.border = '0.1vw solid black';
 }
}
function showDaily()
{
 if(dailyplan.style.display == 'none' || dailyplan.style.display == '')
 {
  dailyplan.style.display = 'block';
  giornaliero.style.width = '77vw';
  giornaliero.style.height = '22vw';
  settimanale.style.width = '70vw';
  settimanale.style.height = '20vw';
  obiettivi.style.width = '70vw';
  obiettivi.style.height = '20vw';
  fisico.style.width = '70vw';
  fisico.style.height = '20vw';
  giornaliero.style.border = '0.2vw solid black';
  settimanale.style.border = '0.1vw solid black';
  obiettivi.style.border = '0.1vw solid black';
  fisico.style.border = '0.1vw solid black';
  containerTAB.style.display = 'none';
 }
 else
 {
  dailyplan.style.display = 'none';
  giornaliero.style.width = '70vw';
  giornaliero.style.height = '20vw';
  giornaliero.style.border = '0.1vw solid black';
 }
}
function showNotes()
{
 if(appunti.style.display == 'none' || appunti.style.display == '')
 {
  appunti.style.display = 'block';
  giochi.style.display = 'none';
  simboloEmail.style.display = 'none';
  btnImpostazioni.style.display = 'none';
 }
 else
 {
  appunti.style.display = 'none';
  giochi.style.display = 'block';
  simboloEmail.style.display = 'block';
  btnImpostazioni.style.display = 'block';
 }
}
function showFastNotes()
{
 var appuntirapidi = document.getElementById('appuntirapidi');
 if(appuntirapidi.style.display == 'none' || appuntirapidi.style.display == '')
 {
  appuntirapidi.style.display = 'block';
  giochi.style.display = 'none';
  simboloEmail.style.display = 'none';
  btnImpostazioni.style.display = 'none';
  setTimeout(() => {
   var ta = document.getElementById('testoappuntirapidi');
   ta.focus();
   ta.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, 250);
 }
 else
 {
  appuntirapidi.style.display = 'none';
  giochi.style.display = 'block';
  simboloEmail.style.display = 'block';
  btnImpostazioni.style.display = 'block';
 }
}
function getSaveAndSost()
{
 if(casellasalva.style.display == 'none' || casellasalva.style.display == '')
 {
  sfondoopaco.style.display = 'block';
  casellasalva.style.display = 'block';
  giochi.style.display = 'none';
  simboloEmail.style.display = 'none';
  btnImpostazioni.style.display = 'none';
 }
 else
 {
  sfondoopaco.style.display = 'none';
  casellasalva.style.display = 'none';
  giochi.style.display = 'block';
  simboloEmail.style.display = 'block';
  btnImpostazioni.style.display = 'block';
 }
}
function showSections(a)
{
 if(a=='close')
 {
  casellaaddappunti.style.display = 'none';
  casellacapitoli.style.display = 'none';
  casellasostituisci.style.display = 'none';
 }
 else if(a=='na')
 {
  if(casellaaddappunti.style.display == 'none' || casellaaddappunti.style.display == '')
  casellaaddappunti.style.display = 'block';
  else
  casellaaddappunti.style.display = 'none';
 }
 else if(a=='nc')
 {
  if(casellacapitoli.style.display == 'none' || casellacapitoli.style.display == '')
  casellacapitoli.style.display = 'block';
  else
  casellacapitoli.style.display = 'none';
 }
 else if(a=='sa')
 {
  if(sosttitolisecondo.style.display == 'none' || sosttitolisecondo.style.display == '')
  sosttitolisecondo.style.display = 'block';
  else
  sosttitolisecondo.style.display = 'none';
 }
 else if(a=='sc')
 {
  if(casellasostituire.style.display == 'none' || casellasostituire.style.display == '')
  casellasostituire.style.display = 'block';
  else
  casellasostituire.style.display = 'none';
 }
}
function showTris()
{
 if(trisdiv.style.display == 'none' || trisdiv.style.display == '')
 {
  trisdiv.style.display = 'block';
  giochi.style.display = 'none';
  simboloEmail.style.display = 'none';
  btnImpostazioni.style.display = 'none';
 }
 else
 {
  trisdiv.style.display = 'none';
  giochi.style.display = 'block';
  simboloEmail.style.display = 'block';
  btnImpostazioni.style.display = 'block';
 }
} 
function onWithSostTitle()
{
 if(sosttitoliterzo.style.display == 'none' || sosttitoliterzo.style.display == '')
 sosttitoliterzo.style.display = 'block';
 else
 sosttitoliterzo.style.display = 'none';
}
function showHanged()
{
 if(impiccatodiv.style.display == 'none' || impiccatodiv.style.display == '')
 {
  impiccatodiv.style.display = 'block';
  giochi.style.display = 'none';
  simboloEmail.style.display = 'none';
  btnImpostazioni.style.display = 'none';
 }
 else
 {
  impiccatodiv.style.display = 'none';
  giochi.style.display = 'block';
  simboloEmail.style.display = 'block';
  btnImpostazioni.style.display = 'block';
 }
}
function showKeyboardForHanged()
{
 if(tastieraimpiccato.style.display == 'none' || tastieraimpiccato.style.display == '')
 tastieraimpiccato.style.display = 'block';
 else
 tastieraimpiccato.style.display = 'none';
}
function showMastermind()
{
 if(masterminddiv.style.display == 'none' || masterminddiv.style.display == '')
 {
  masterminddiv.style.display = 'block';
  giochi.style.display = 'none';
  simboloEmail.style.display = 'none';
  btnImpostazioni.style.display = 'none';
 }
 else
 {
  masterminddiv.style.display = 'none';
  giochi.style.display = 'block';
  simboloEmail.style.display = 'block';
  btnImpostazioni.style.display = 'block';
 }
}
function showMemory()
{
 if(memorydiv.style.display == 'none' || memorydiv.style.display == '')
 {
  memorydiv.style.display = 'block';
  giochi.style.display = 'none';
  simboloEmail.style.display = 'none';
  btnImpostazioni.style.display = 'none';
 }
 else
 {
  memorydiv.style.display = 'none';
  giochi.style.display = 'block';
  simboloEmail.style.display = 'block';
  btnImpostazioni.style.display = 'block';
 }
}
function showMore()
{
 containercalc.style.display = 'none';
 showtabella.style.display = 'none';
 if(altrodiv.style.display == 'none' || altrodiv.style.display == '')
 {
  altrodiv.style.display = 'block';
  giochi.style.display = 'none';
  simboloEmail.style.display = 'none';
  btnImpostazioni.style.display = 'none';
 }
 else
 {
  altrodiv.style.display = 'none';
  giochi.style.display = 'block';
  simboloEmail.style.display = 'block';
  btnImpostazioni.style.display = 'block';
 }
}
function salvaCompiti()
{
 var inputs = document.querySelectorAll('#container input.save');
 var textareas = document.querySelectorAll('#container textarea.save');
 var checks = document.querySelectorAll('#container button.check');
 var valori = [];
 for(var j = 0; j < inputs.length; j += 2)
 {
  var data = inputs[j].value;
  var materia = inputs[j + 1].value;
  var testo = textareas[j / 2]?.value || '';
  var colore = checks[j / 2]?.style.backgroundColor || 'white';
  valori.push({
   data,
   materia,
   testo,
   colore
  });
 }
 localStorage.setItem('campiSalvati', JSON.stringify(valori));
}
function salvaPromemoria()
{
 var inputs = document.querySelectorAll('#container2 input.save');
 var textareas = document.querySelectorAll('#container2 textarea.save');
 var checks = document.querySelectorAll('#container2 button.check');
 var promemoria = [];
 for(var j = 0; j < inputs.length; j += 2)
 {
  var data = inputs[j].value;
  var ora = inputs[j + 1].value;
  var testo = textareas[j / 2]?.value || '';
  var colore = checks[j / 2]?.style.backgroundColor || 'white';
  promemoria.push({
   data,
   ora,
   testo,
   colore
  });
 }
 localStorage.setItem('promemoriaSalvati', JSON.stringify(promemoria));
}
function salvaAttivita()
{
 var container = document.getElementById('container3');
 var attivita = [];
 var rows = container.children; 
 for (var i=0;i<rows.length;i++)
 {
  var row = rows[i];
  var dataVal = row.children[0].value;
  var titoloVal = row.children[1].value;
  var checkCol = row.children[2].style.backgroundColor;
  var statoVal = (checkCol == 'cyan') ? 'compvarato' : 'da_fare';
  var noteVal = row.children[4].value;
  attivita.push({
   data: dataVal,
   titolo: titoloVal,
   stato: statoVal,
   note: noteVal
  });
 }
 localStorage.setItem('attivitaSalvate', JSON.stringify(attivita));
}
function salvaLista()
{
 var container = document.getElementById('container4');
 var inputs = container.querySelectorAll('input.save');
 var checks = container.querySelectorAll('button.check');
 var lista = [];
 for (var i = 0; i < inputs.length; i++)
 {
  var val = inputs[i].value;
  var colore = checks[i]?.style.backgroundColor || 'white';
  lista.push({
    valore: val,
    colore: colore
  });
 }
 localStorage.setItem('listaSalvata', JSON.stringify(lista));
}
function salvaPianoSettimanale()
{
 var giorni = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];
 var dati = {};
 giorni.forEach(g => {
   var textarea = document.getElementById(`att${g}`);
   dati[g] = textarea.value;
 });
 localStorage.setItem('pianoSettimanale', JSON.stringify(dati));
}
function caricaPianoSettimanale()
{
 var datiJSON = localStorage.getItem('pianoSettimanale');
 if(!datiJSON)
 return;
 var dati = JSON.parse(datiJSON);
 var giorni = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];
 giorni.forEach(g => {
  var textarea = document.getElementById(`att${g}`);
  if(textarea && dati[g] !== undefined)
  textarea.value = dati[g];
 });
}
function salvaDaily()
{
 var container = document.getElementById('containerG');
 var blocks = [];
 var children = container.children;
 for (var i = 0; i < children.length; i++)
 {
  var el = children[i];
  if(el.tagName == 'BUTTON' && el.classList.contains('save'))
  {
   var id = el.dataset.id;
   var titolo = el.textContent;
   var table = el.nextElementSibling;
   var righe = [];
   if(table && table.tagName == 'TABLE')
   {
    var rows = table.rows;
    for (var r = 0; r < rows.length; r++)
    {
     var textarea = rows[r].cells[0].querySelector('textarea');
     if(textarea)
     righe.push(textarea.value);
    }
   }
   blocks.push({
   id: id,
   titolo: titolo,
   righe: righe
   });
  }
 }
 localStorage.setItem('dailyData', JSON.stringify(blocks));
}
function caricaDaily()
{
 var salvati = localStorage.getItem('dailyData');
 if(!salvati) return;
 var blocks = JSON.parse(salvati);
 blocks.reverse().forEach(blocco => addDaily(blocco.titolo, blocco.righe, blocco.id));
}
function salvaNote() {
    var container = document.getElementById('container5');
    var blocks = [];
    var children = container.children;

    for (var i = 0; i < children.length; i++) {
        var el = children[i];
        
        
        if (el.tagName == 'BUTTON' && el.classList.contains('save')) {
            var id = el.dataset.id;
            var titoloPrincipale = el.textContent;
            var table = el.nextElementSibling; 
            var righeCapitoli = [];

            
            if (table && table.tagName == 'TABLE') {
                var rows = table.rows;
                for (var r = 0; r < rows.length; r++) {
                    var row = rows[r];

                    
                    var titleDiv = row.querySelector('.chapter-title'); 
                    var textarea = row.querySelector('textarea.save');

                    if (titleDiv && textarea) {
                        righeCapitoli.push({
                            titolo: titleDiv.textContent, 
                            contenuto: textarea.value     
                        });
                    }
                }
            }

            
            blocks.push({
                id: id,
                titolo: titoloPrincipale,
                capitoli: righeCapitoli
            });
        }
    }
    
    
    localStorage.setItem('noteData', JSON.stringify(blocks));
}
function caricaNote() {
    var salvate = localStorage.getItem('noteData');
    if (!salvate) return;

    
    var blocks = JSON.parse(salvate).reverse();
    var container = document.getElementById('container5');
    container.innerHTML = ''; 

    blocks.forEach(blocco => {
        
        addNotes(blocco.titolo, blocco.capitoli || [], blocco.id);
        
        
    });
}
var loading = true;
function addHomeWorks(valore = '', valoreData = '', valoreTesto = '', coloreCheck = 'white')
{
 var container,date,input,check,button,textarea;
 container = document.getElementById('container');
 date = document.createElement('input');
 date.type = 'date';
 date.classList.add('save');
 date.style.width = '30vw';
 date.style.height = '8vw';
 date.style.fontSize = '3.5vw';
 date.style.fontFamily = "inherit";
 date.style.padding = '1vw';
 date.style.border = '0.2vw solid #ccc';
 date.style.borderRadius = '2vw';
 date.style.outline = 'none';
 if(!valoreData)
 {
  var domani = new Date();
  domani.setDate(domani.getDate() + 1);
  valoreData = domani.toISOString().split('T')[0];
 }
 date.value = valoreData;
 date.addEventListener('input', salvaCompiti);
 input = document.createElement('input');
 input.type = 'text';
 input.classList.add('save');
 input.style.width = '30vw';
 input.style.height = '8vw';
 input.style.fontSize = '3.5vw';
 input.style.fontFamily = "inherit";
 input.style.padding = '1vw';
 input.style.marginLeft = '2vw';
 input.style.border = '0.2vw solid #ccc';
 input.style.borderRadius = '2vw';
 input.style.outline = 'none';
 input.placeholder = 'Materia:';
 input.value = valore;
 input.addEventListener('input', salvaCompiti);
 check = document.createElement('button');
 check.textContent = '✓';
 check.classList.add('save', 'check');
 check.style.width = '8vw';
 check.style.height = '8vw';
 check.style.marginLeft = '2vw';
 check.style.fontSize = '4vw';
 check.style.borderRadius = '2vw';
 check.style.border = 'none';
 check.style.cursor = 'pointer';
 check.style.boxShadow = '0 0.5vw 1vw rgba(0,0,0,0.1)';
 check.style.backgroundColor = coloreCheck;
 check.addEventListener('click', () => {
  check.style.backgroundColor = (check.style.backgroundColor == 'white') ? '#00f2ff' : 'white';
  if(!loading)
  salvaCompiti();
 });
 button = document.createElement('button');
 button.textContent = '✕';
 button.style.width = '6vw';
 button.style.height = '6vw';
 button.style.marginTop = '6vw'; 
 button.style.marginLeft = '2vw';
 button.style.border = 'none';
 button.style.borderRadius = '50%';
 button.style.backgroundColor = '#ff4d4d';
 button.style.color = 'white';
 button.style.fontSize = '3.5vw';
 button.style.cursor = 'pointer';
 button.style.display = 'flex';
 button.style.alignItems = 'center';
 button.style.justifyContent = 'center';
 button.style.flexShrink = '0';
 button.style.userSelect = 'none';
 button.style.webkitUserSelect = 'none';
 button.style.msUserSelect = 'none';
 var holdTimeout;
 button.addEventListener('mousedown', () => {
  holdTimeout = setTimeout(() => {
   container.removeChild(riga);
   d--;
   compitinumber.value = +d;
   if(!loading)
   salvaCompiti();
  }, 1000);
 });
 button.addEventListener('mouseup', () => clearTimeout(holdTimeout));
 button.addEventListener('mouseleave', () => clearTimeout(holdTimeout));
 button.addEventListener('touchstart', (e) => {
  e.preventDefault();
  holdTimeout = setTimeout(() => {
   container.removeChild(riga);
   d--;
   compitinumber.value = +d;
   if(!loading)
   salvaCompiti();
  }, 1000);
 });
 button.addEventListener('touchend', () => clearTimeout(holdTimeout));
 button.addEventListener('touchcancel', () => clearTimeout(holdTimeout));
 button.addEventListener('click', () => {
  comeeliminarecontenuto.style.display = 'block';
  setTimeout(() => {
   comeeliminarecontenuto.style.display = 'none';
  }, 3000);
 });
 textarea = document.createElement('textarea');
 textarea.placeholder = 'Descrizione compito...';
 textarea.classList.add('save');
 textarea.style.width = '88%';
 textarea.style.minHeight = '15vw';
 textarea.style.fontSize = '3.8vw';
 textarea.style.fontFamily = "inherit";
 textarea.style.marginTop = '2vw';
 textarea.style.padding = '2vw';
 textarea.style.border = '0.2vw solid #eee';
 textarea.style.borderRadius = '2vw';
 textarea.style.backgroundColor = '#f9f9f9';
 textarea.style.resize = 'none';
 textarea.style.overflow = 'hidden';
 textarea.style.boxSizing = 'border-box';
 textarea.style.transition = 'height 0.2s ease';
 textarea.value = valoreTesto;
 const adattaAltezza = () => {
  textarea.style.height = 'auto';
  let scrollHeightVw = (textarea.scrollHeight / window.innerWidth) * 100;
  textarea.style.height = Math.max(scrollHeightVw, 15) + 'vw';
 };
 const riduciAltezza = () => {
  textarea.style.height = '15vw';
 };
 textarea.addEventListener('input', () => {
  adattaAltezza();
  if(!loading)
  salvaCompiti();
 });
 textarea.addEventListener('focus', adattaAltezza);
 textarea.addEventListener('blur', riduciAltezza);
 var riga = document.createElement('div');
 riga.style.display = 'flex';
 riga.style.flexWrap = 'wrap';
 riga.style.alignItems = 'flex-start';
 riga.style.padding = '3vw';
 riga.style.marginBottom = '4vw';
 riga.style.backgroundColor = 'white';
 riga.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
 riga.style.borderRadius = '3vw';
 riga.style.boxShadow = '0 1vw 4vw rgba(0,0,0,0.05)';
 riga.style.border = '0.2vw solid #f0f0f0';
 riga.appendChild(date);
 riga.appendChild(input);
 riga.appendChild(check);
 riga.appendChild(textarea);
 riga.appendChild(button);
 container.prepend(riga);
 riduciAltezza();
 if(!loading)
 salvaCompiti();
 d++;
 compitinumber.value = +d;
 return(riga);
}
function addPromemoria(valoreData = '', valoreOra = '', coloreCheck = 'white', valoreTesto = '')
{
 var container,date,ora,check,textarea,button;
 container = document.getElementById('container2');
 date = document.createElement('input');
 date.type = 'date';
 date.classList.add('save');
 date.style.width = '31vw';
 date.style.height = '7vw';
 date.style.fontSize = '3.5vw';
 date.style.fontFamily = "inherit";
 date.style.padding = '1vw';
 date.style.border = '0.2vw solid #ccc';
 date.style.borderRadius = '2vw';
 date.style.outline = 'none';
 if(!valoreData)
 {
  var domani = new Date();
  domani.setDate(domani.getDate() + 1);
  valoreData = domani.toISOString().split('T')[0];
 }
 date.value = valoreData;
 date.addEventListener('input', salvaPromemoria);
 ora = document.createElement('input');
 ora.type = 'time';
 ora.classList.add('save');
 ora.style.width = '31vw';
 ora.style.height = '7vw';
 ora.style.fontSize = '4vw';
 ora.style.fontFamily = "inherit";
 ora.style.padding = '1vw';
 ora.style.marginLeft = '2vw';
 ora.style.border = '0.2vw solid #ccc';
 ora.style.borderRadius = '2vw';
 ora.style.outline = 'none';
 if(!valoreOra)
 {
  var now = new Date();
  valoreOra = now.toTimeString().slice(0, 5);
 }
 ora.value = valoreOra;
 ora.addEventListener('input', salvaPromemoria);
 check = document.createElement('button');
 check.textContent = '✓';
 check.classList.add('save', 'check');
 check.style.width = '6.9vw';
 check.style.height = '6.9vw';
 check.style.marginLeft = '2vw';
 check.style.fontSize = '3.5vw';
 check.style.borderRadius = '2vw';
 check.style.border = 'none';
 check.style.cursor = 'pointer';
 check.style.boxShadow = '0 0.5vw 1vw rgba(0,0,0,0.1)';
 check.style.backgroundColor = coloreCheck;
 check.addEventListener('click', () => {
  check.style.backgroundColor = (check.style.backgroundColor == 'white') ? 'cyan' : 'white';
  if(!loading)
  salvaPromemoria();
 });
 button = document.createElement('button');
 button.textContent = '✕';
 button.style.width = '6vw';
 button.style.height = '6vw';
 button.style.marginTop = '6vw'; 
 button.style.marginLeft = '2vw';
 button.style.border = 'none';
 button.style.borderRadius = '50%';
 button.style.backgroundColor = '#ff4d4d';
 button.style.color = 'white';
 button.style.fontSize = '3.5vw';
 button.style.cursor = 'pointer';
 button.style.display = 'flex';
 button.style.alignItems = 'center';
 button.style.justifyContent = 'center';
 button.style.flexShrink = '0';
 button.style.userSelect = 'none';
 button.style.webkitUserSelect = 'none';
 button.style.msUserSelect = 'none';
 var holdTimeout;
 button.addEventListener('mousedown', () => {
  holdTimeout = setTimeout(() => {
   container.removeChild(riga);
   pr--;
   promemorianumber.value = +pr;
   if(!loading)
   salvaPromemoria();
  }, 1000);
 });
 button.addEventListener('mouseup', () => clearTimeout(holdTimeout));
 button.addEventListener('mouseleave', () => clearTimeout(holdTimeout));
 button.addEventListener('touchstart', (e) => {
  e.preventDefault();
  holdTimeout = setTimeout(() => {
   container.removeChild(riga);
   pr--;
   promemorianumber.value = +pr;
   if(!loading)
   salvaPromemoria();
  }, 1000);
 });
 button.addEventListener('touchend', () => clearTimeout(holdTimeout));
 button.addEventListener('touchcancel', () => clearTimeout(holdTimeout));
 button.addEventListener('click', () => {
  comeeliminarecontenuto.style.display = 'block';
  setTimeout(() => {
   comeeliminarecontenuto.style.display = 'none';
  }, 3000);
 });
 textarea = document.createElement('textarea');
 textarea.placeholder = 'Titolo:';
 textarea.classList.add('save');
 textarea.style.width = '88%';
 textarea.style.minHeight = '15vw';
 textarea.style.fontSize = '3.8vw';
 textarea.style.fontFamily = "inherit";
 textarea.style.marginTop = '2vw';
 textarea.style.padding = '2vw';
 textarea.style.border = '0.2vw solid #eee';
 textarea.style.borderRadius = '2vw';
 textarea.style.backgroundColor = '#f9f9f9';
 textarea.style.resize = 'none';
 textarea.style.overflow = 'hidden';
 textarea.style.boxSizing = 'border-box';
 textarea.style.transition = 'height 0.2s ease';
 textarea.value = valoreTesto;
 const adattaAltezza = () => {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
 };
 const riduciAltezza = () => {
  textarea.style.height = '20vw';
 };
 textarea.addEventListener('input', () => {
  adattaAltezza();
  if(!loading)
  salvaPromemoria();
 });
 textarea.addEventListener('focus', adattaAltezza);
 textarea.addEventListener('blur', riduciAltezza);
 var riga = document.createElement('div');
 riga.style.display = 'flex';
 riga.style.flexWrap = 'wrap';
 riga.style.alignItems = 'flex-start';
 riga.style.padding = '3vw';
 riga.style.marginBottom = '4vw';
 riga.style.backgroundColor = 'white';
 riga.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
 riga.style.borderRadius = '3vw';
 riga.style.boxShadow = '0 1vw 4vw rgba(0,0,0,0.05)';
 riga.style.border = '0.2vw solid #f0f0f0';
 riga.appendChild(date);
 riga.appendChild(ora);
 riga.appendChild(check);
 riga.appendChild(textarea);
 riga.appendChild(button);
 container.prepend(riga);
 riduciAltezza();
 if(!loading)
 salvaPromemoria();
 pr++;
 promemorianumber.value = +pr;
 return(riga);
}
function addStudioLavoro(dataVal = '', titoloVal = '', statoVal = 'da_fare', noteVal = '')
{
 var container, date, input, check, button, textarea;
 container = document.getElementById('container3');
 date = document.createElement('input');
 date.type = 'date';
 date.classList.add('save');
 date.style.width = '30vw';
 date.style.height = '8vw';
 date.style.fontSize = '3.5vw';
 date.style.fontFamily = "inherit";
 date.style.padding = '1vw';
 date.style.border = '0.2vw solid #ccc';
 date.style.borderRadius = '2vw';
 date.style.outline = 'none';
 if(!dataVal)
 {
  var domani = new Date();
  domani.setDate(domani.getDate() + 1);
  dataVal = domani.toISOString().split('T')[0];
 }
 date.value = dataVal;
 date.addEventListener('input', salvaAttivita);
 input = document.createElement('input');
 input.type = 'text';
 input.classList.add('save');
 input.style.width = '30vw';
 input.style.height = '8vw';
 input.style.fontSize = '3.5vw';
 input.style.fontFamily = "inherit";
 input.style.padding = '1vw';
 input.style.marginLeft = '2vw';
 input.style.border = '0.2vw solid #ccc';
 input.style.borderRadius = '2vw';
 input.style.outline = 'none';
 input.placeholder = 'Titolo:';
 input.value = titoloVal;
 input.addEventListener('input', salvaAttivita);
 check = document.createElement('button');
 check.textContent = '✓';
 check.classList.add('save', 'check');
 check.style.width = '8vw';
 check.style.height = '8vw';
 check.style.marginLeft = '2vw';
 check.style.fontSize = '4vw';
 check.style.borderRadius = '2vw';
 check.style.border = 'none';
 check.style.cursor = 'pointer';
 check.style.boxShadow = '0 0.5vw 1vw rgba(0,0,0,0.1)';
 var coloreCheck = (statoVal == 'compvarato') ? 'cyan' : 'white';
 check.style.backgroundColor = coloreCheck;
 check.addEventListener('click', () => {
  check.style.backgroundColor = (check.style.backgroundColor == 'white') ? '#00f2ff' : 'white';
  if(!loading)
  salvaAttivita();
 });
 button = document.createElement('button');
 button.textContent = '✕';
 button.style.width = '6vw';
 button.style.height = '6vw';
 button.style.marginTop = '6vw'; 
 button.style.marginLeft = '2vw';
 button.style.border = 'none';
 button.style.borderRadius = '50%';
 button.style.backgroundColor = '#ff4d4d';
 button.style.color = 'white';
 button.style.fontSize = '3.5vw';
 button.style.cursor = 'pointer';
 button.style.display = 'flex';
 button.style.alignItems = 'center';
 button.style.justifyContent = 'center';
 button.style.flexShrink = '0';
 button.style.userSelect = 'none';
 button.style.webkitUserSelect = 'none';
 button.style.msUserSelect = 'none';
 var holdTimeout;
 button.addEventListener('mousedown', () => {
  holdTimeout = setTimeout(() => {
   container.removeChild(riga);
   if(!loading)
   salvaAttivita();
  }, 1000);
 });
 button.addEventListener('mouseup', () => clearTimeout(holdTimeout));
 button.addEventListener('mouseleave', () => clearTimeout(holdTimeout));
 button.addEventListener('touchstart', (e) => {
  e.preventDefault();
  holdTimeout = setTimeout(() => {
   container.removeChild(riga);
   d--;
   compitinumber.value = +d;
   if(!loading)
   salvaAttivita();
  }, 1000);
 });
 button.addEventListener('touchend', () => clearTimeout(holdTimeout));
 button.addEventListener('touchcancel', () => clearTimeout(holdTimeout));
 button.addEventListener('click', () => {
  comeeliminarecontenuto.style.display = 'block';
  setTimeout(() => {
   comeeliminarecontenuto.style.display = 'none';
  }, 3000);
 });
 textarea = document.createElement('textarea');
 textarea.placeholder = 'Scrivi qualcosa...';
 textarea.classList.add('save');
 textarea.style.width = '88%';
 textarea.style.minHeight = '15vw';
 textarea.style.fontSize = '3.8vw';
 textarea.style.fontFamily = "inherit";
 textarea.style.marginTop = '2vw';
 textarea.style.padding = '2vw';
 textarea.style.border = '0.2vw solid #eee';
 textarea.style.borderRadius = '2vw';
 textarea.style.backgroundColor = '#f9f9f9';
 textarea.style.resize = 'none';
 textarea.style.overflow = 'hidden';
 textarea.style.boxSizing = 'border-box';
 textarea.style.transition = 'height 0.2s ease';
 textarea.value = noteVal;
 const adattaAltezza = () => {
  textarea.style.height = 'auto';
  let scrollHeightVw = (textarea.scrollHeight / window.innerWidth) * 100;
  textarea.style.height = Math.max(scrollHeightVw, 15) + 'vw';
 };
 const riduciAltezza = () => {
  textarea.style.height = '15vw';
 };
 textarea.addEventListener('input', () => {
  adattaAltezza();
  if(!loading)
  salvaAttivita();
 });
 textarea.addEventListener('focus', adattaAltezza);
 textarea.addEventListener('blur', riduciAltezza);
 var riga = document.createElement('div');
 riga.style.display = 'flex';
 riga.style.flexWrap = 'wrap';
 riga.style.alignItems = 'flex-start';
 riga.style.padding = '3vw';
 riga.style.marginBottom = '4vw';
 riga.style.backgroundColor = 'white';
 riga.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
 riga.style.borderRadius = '3vw';
 riga.style.boxShadow = '0 1vw 4vw rgba(0,0,0,0.05)';
 riga.style.border = '0.2vw solid #f0f0f0';
 riga.appendChild(date);
 riga.appendChild(input);
 riga.appendChild(check);
 riga.appendChild(textarea);
 riga.appendChild(button);
 container.prepend(riga);
 riduciAltezza();
 if(!loading)
 salvaAttivita();
}
function addList(valList = '', coloreList = 'white')
{
 var container,input,check,button;
 container = document.getElementById('container4');
 input = document.createElement('input');
 input.type = 'text';
 input.classList.add('save');
 input.style.width = '70%';
 input.style.height = '8vw';
 input.style.fontSize = '4vw';
 input.style.borderRadius = '2vw';
 input.style.fontFamily = 'inherit';
 input.style.padding = '2vw';
 input.style.border = '0.2vw solid #eee';
 input.style.backgroundColor = '#f9f9f9';
 input.style.boxSizing = 'border-box';
 input.style.marginBottom = '2vw';
 input.placeholder = 'Es. pane, latte, uova...';
 input.value = valList;
 input.addEventListener('input', salvaLista);
 check = document.createElement('button');
 check.textContent = '✓';
 check.classList.add('save', 'check');
 check.style.width = '6.9vw';
 check.style.height = '6.9vw';
 check.style.marginLeft = '2vw';
 check.style.fontSize = '3.5vw';
 check.style.borderRadius = '2vw';
 check.style.border = 'none';
 check.style.cursor = 'pointer';
 check.style.boxShadow = '0 0.5vw 1vw rgba(0,0,0,0.1)';
 check.style.backgroundColor = coloreList;
 check.addEventListener('click', () => {
  check.style.backgroundColor = (check.style.backgroundColor == 'white') ? 'cyan' : 'white';
  salvaLista();
 });
 button = document.createElement('button');
 button.textContent = '✕';
 button.style.width = '6vw';
 button.style.height = '6vw';
 button.style.marginLeft = '2vw';
 button.style.border = 'none';
 button.style.borderRadius = '50%';
 button.style.backgroundColor = '#ff4d4d';
 button.style.color = 'white';
 button.style.fontSize = '3.5vw';
 button.style.cursor = 'pointer';
 button.style.userSelect = 'none';
 button.style.webkitUserSelect = 'none';
 button.style.msUserSelect = 'none';
 var holdTimeout;
 button.addEventListener('mousedown', () => {
  holdTimeout = setTimeout(() => {
   container.removeChild(riga);
   l--;
   listanumber.value = +l;
   salvaLista();
  }, 1000);
 });
 button.addEventListener('mouseup', () => {
  clearTimeout(holdTimeout);
 });
 button.addEventListener('mouseleave', () => {
  clearTimeout(holdTimeout); 
 });
 button.addEventListener('touchstart', (e) => {
  e.preventDefault();
  holdTimeout = setTimeout(() => {
   container.removeChild(riga);
   l--;
   listanumber.value = +l;
   salvaLista();
  }, 1000);
 });
 button.addEventListener('touchend', () => {
  clearTimeout(holdTimeout);
 });
 button.addEventListener('touchcancel', () => {
  clearTimeout(holdTimeout);
 });
 button.addEventListener('click', () => {
  comeeliminarecontenuto.style.display = 'block';
  setTimeout(() => {
   comeeliminarecontenuto.style.display = 'none';
  }, 3000);
 });
 var riga = document.createElement('div');
 riga.appendChild(input);
 riga.appendChild(check);
 riga.appendChild(button);
 container.prepend(riga);
 input.focus();
 l++;
 listanumber.value = +l;
 salvaLista();
}
function addDaily(titolo = 'Titolo', attivita = [], id = null)
{
 var container = document.getElementById('containerG');
 var titleBtn = document.createElement('button');
 titleBtn.dataset.id = id || crypto.randomUUID();
 titleBtn.textContent = titolo || 'Titolo';
 titleBtn.classList.add('save');
 titleBtn.style.minWidth = '30vw';
 titleBtn.style.width = 'auto';
 titleBtn.style.whiteSpace = 'nowrap';
 titleBtn.style.height = '10vw';
 titleBtn.style.fontSize = '5vw';
 titleBtn.style.fontWeight = 'bold';
 titleBtn.style.marginTop = '5vw';
 titleBtn.style.backgroundColor = 'rgb(250,170,30)';
 titleBtn.style.borderRadius = '2vw';
 titleBtn.style.marginBottom = '0.5vw';
 titleBtn.style.marginRight = '50vw';
 titleBtn.addEventListener('input', salvaDaily);
 container.prepend(titleBtn);
 var pressTimer;
 var isLongPress = false;
 var clickCount = 0;
 var clickTimer;
 function startPressTimer(e)
 {
  e.preventDefault();
  isLongPress = false;
  pressTimer = setTimeout(() => {
   isLongPress = true;
   sfondoopaco.style.display = 'block';
   document.body.style.overflow = '';
   
var confirmDiv = document.createElement('div');
confirmDiv.id = 'confermaelimina_dynamic';
confirmDiv.style.position = 'fixed';
confirmDiv.style.width = '90vw';
confirmDiv.style.height = '40vw';
confirmDiv.style.top = '50%';
confirmDiv.style.left = '50%';
confirmDiv.style.transform = 'translate(-50%, -50%)';
confirmDiv.style.backgroundColor = '#d7d7d7';
confirmDiv.style.color = 'black';
confirmDiv.style.borderRadius = '3vw';
confirmDiv.style.zIndex = 10000;


var closeBtn = document.createElement('input');
closeBtn.type = 'button';
closeBtn.value = '❌';
closeBtn.style.position = 'absolute';
closeBtn.style.top = '1vw';
closeBtn.style.left = '50%';
closeBtn.style.transform = 'translateX(35vw)';
closeBtn.style.width = '6vw';
closeBtn.style.height = '4vw';
closeBtn.style.fontSize = '2.5vw';
closeBtn.style.backgroundColor = '#d7d7d7';
closeBtn.style.border = 'none';
closeBtn.onclick = () => {
  confirmDiv.remove();
  sfondoopaco.style.display = 'none';
};
confirmDiv.appendChild(closeBtn);


var p = document.createElement('p');
p.textContent = 'Vuoi eliminare questi appunti?';
p.style.position = 'absolute';
p.style.botton = '8vw';
p.style.width = '100%';
p.style.fontSize = '6vw';
p.style.fontWeight = 'bold';
p.style.textAlign = 'center';
confirmDiv.appendChild(p);


var cancelBtn = document.createElement('input');
cancelBtn.type = 'button';
cancelBtn.value = 'ANNULLA';
cancelBtn.style.position = 'absolute';
cancelBtn.style.bottom = '3vw';
cancelBtn.style.left = '9.5vw';
cancelBtn.style.width = '30vw';
cancelBtn.style.height = '12vw';
cancelBtn.style.fontSize = '4.5vw';
cancelBtn.style.fontWeight = 'bold';
cancelBtn.style.backgroundColor = '#90caf9';
cancelBtn.style.border = '0.2vw solid black';
cancelBtn.style.borderRadius = '5vw';
cancelBtn.style.zIndex = 10000;
cancelBtn.onclick = () => {
  confirmDiv.remove();
  sfondoopaco.style.display = 'none';
};
confirmDiv.appendChild(cancelBtn);


var confirmBtn = document.createElement('input');
confirmBtn.type = 'button';
confirmBtn.value = 'CONFERMA';
confirmBtn.style.position = 'absolute';
confirmBtn.style.bottom = '3vw';
confirmBtn.style.right = '9.5vw';
confirmBtn.style.width = '30vw';
confirmBtn.style.height = '12vw';
confirmBtn.style.fontSize = '4.5vw';
confirmBtn.style.fontWeight = 'bold';
confirmBtn.style.backgroundColor = 'rgb(0,220,0)';
confirmBtn.style.border = '0.2vw solid black';
confirmBtn.style.borderRadius = '5vw';
confirmBtn.style.zIndex = 10000;
confirmBtn.onclick = () => {
  var table = titleBtn.nextElementSibling;
  if (table && table.tagName == 'TABLE') table.remove();
  titleBtn.remove();
  salvaDaily();
  confirmDiv.remove();
  sfondoopaco.style.display = 'none';
};
confirmDiv.appendChild(confirmBtn);


document.body.appendChild(confirmDiv);
sfondoopaco.style.display = 'block';

  }, 700);
 }
 function clearPressTimer()
 {
  clearTimeout(pressTimer);
 }
 function handleSingleClick()
 {
  var table = titleBtn.nextElementSibling;
  if(!table || table.tagName !== 'TABLE')
  {
   createTable();
   var newTable = titleBtn.nextElementSibling;
   newTable.style.display = 'table';
  }
  else
  {
   table.style.display = (table.style.display == 'none' || table.style.display == '') ? 'table' : 'none';
  }
 }
 function handleDoubleClick()
 {
  var input = document.createElement('input');
  input.type = 'text';
  input.value = titleBtn.textContent;
  input.classList.add('save');
  input.style.minWidth = '30vw';
  input.style.height = '10vw';
  input.style.fontSize = '4vw';
  input.style.fontWeight = 'bold';
  input.style.borderRadius = '2vw';
  input.style.marginBottom = '1vw';
  input.style.marginRight = '40vw';
  input.style.backgroundColor = 'rgb(250,170,30)';
  input.style.textAlign = 'center';
  input.addEventListener('input', () => {
   if(input.value.length > 20)
   input.value = input.value.slice(0, 20);
  });
  input.addEventListener('blur', () => {
   titleBtn.textContent = input.value || 'Titolo';
   input.replaceWith(titleBtn);
   salvaDaily();
  });
  input.addEventListener('keydown', (e) => {
  if(e.key == 'Enter') input.blur();
  });
  titleBtn.replaceWith(input);
  input.focus();
 }
 function onClickHandler()
 {
  if(isLongPress)
  return;
  clickCount++;
  if(clickCount == 1)
  {
   clickTimer = setTimeout(() => {
    if(clickCount == 1)
    handleSingleClick();
    else if(clickCount == 2)
    handleDoubleClick();
    clickCount = 0;
   }, 300);
  }
 }
 titleBtn.addEventListener('mousedown', startPressTimer);
 titleBtn.addEventListener('mouseup', (e) => {
  clearPressTimer();
  onClickHandler();
 });
 titleBtn.addEventListener('mouseleave', clearPressTimer);
 titleBtn.addEventListener('touchstart', startPressTimer, { passive: false });
 titleBtn.addEventListener('touchend', (e) => {
  clearPressTimer();
  onClickHandler();
 });
 titleBtn.addEventListener('touchcancel', clearPressTimer);
 function createRow()
 {
  var row = document.createElement('tr');
  row.style.border = '0.1vw solid black';
  var cellTextarea = document.createElement('td');
  var textarea = document.createElement('textarea');
  textarea.classList.add('save');
  textarea.placeholder = 'Descrizione attività...';
  textarea.style.width = '60vw';
  textarea.style.minHeight = '6vw';
  textarea.style.fontSize = '4vw';
  textarea.style.borderRadius = '1.5vw';
  textarea.style.fontFamily = 'Varela Round, sans-serif';
  textarea.style.resize = 'none';
  textarea.addEventListener('input', salvaDaily);
  cellTextarea.appendChild(textarea);
  row.appendChild(cellTextarea);
  var cellMinus = document.createElement('td');
  var minusBtn = document.createElement('button');
  minusBtn.textContent = '-';
  minusBtn.style.width = '5vw';
  minusBtn.style.height = '5vw';
  minusBtn.style.fontSize = '3vw';
  minusBtn.style.backgroundColor = '#ef9a9a';
  minusBtn.style.border = '0.1vw solid black';
  minusBtn.style.borderRadius = '50%';
  minusBtn.style.userSelect = 'none';
  minusBtn.style.webkitUserSelect = 'none';
  minusBtn.style.msUserSelect = 'none';
  var holdTimeout;
  minusBtn.addEventListener('mousedown', () => {
   holdTimeout = setTimeout(() => {
    if(table.rows.length > 1)
    {
     row.remove();
     updatePlusButtons();
     salvaDaily();
    }
   }, 1000);
  });
  minusBtn.addEventListener('mouseup', () => {
  clearTimeout(holdTimeout);
  });
  minusBtn.addEventListener('mouseleave', () => {
   clearTimeout(holdTimeout); 
  });
  minusBtn.addEventListener('touchstart', (e) => {
   e.preventDefault();
   holdTimeout = setTimeout(() => {
    if(table.rows.length > 1)
    {
     row.remove();
     updatePlusButtons();
     salvaDaily();
    }
   }, 1000);
  });
  minusBtn.addEventListener('touchend', () => {
   clearTimeout(holdTimeout);
  });
  minusBtn.addEventListener('touchcancel', () => {
   clearTimeout(holdTimeout);
  });
  minusBtn.addEventListener('click', () => {
   comeeliminarecontenuto.style.display = 'block';
   setTimeout(() => {
    comeeliminarecontenuto.style.display = 'none';
   }, 3000);
  });
  cellMinus.appendChild(minusBtn);
  row.appendChild(cellMinus);
  var cellPlus = document.createElement('td');
  var plusBtn = document.createElement('button');
  plusBtn.textContent = '+';
  plusBtn.style.width = '5vw';
  plusBtn.style.height = '5vw';
  plusBtn.style.fontSize = '3vw';
  plusBtn.style.backgroundColor = '#a5d6a7';
  plusBtn.style.border = '0.1vw solid black';
  plusBtn.style.borderRadius = '50%';
  plusBtn.addEventListener('click', () => {
   var newRow = createRow();
   table.appendChild(newRow);
   updatePlusButtons();
   salvaDaily();
  });
  cellPlus.appendChild(plusBtn);
  row.appendChild(cellPlus);
  return row;
 }



 function updatePlusButtons()
 {
  var rows = table.rows;
  for (var i = 0; i < rows.length; i++)
  {
   var plusBtn = rows[i].cells[2]?.querySelector('button');
   if(plusBtn)
   plusBtn.style.display = (i == rows.length - 1) ? 'inline-block' : 'none';
  }
 }

  var table;
  function createTable() {
    if (titleBtn.nextElementSibling && titleBtn.nextElementSibling.tagName == 'TABLE') return;
    table = document.createElement('table');
    table.style.width = '80vw';
    table.appendChild(createRow());
    titleBtn.insertAdjacentElement('afterend', table);
    table.style.display = 'none';
    updatePlusButtons();
  }

  if (attivita.length > 0) {
    createTable();
    table.style.display = 'none';
    while (table.rows.length > 0) table.deleteRow(0);
    attivita.forEach(desc => {
      var row = createRow();
      row.cells[0].querySelector('textarea').value = desc;
      table.appendChild(row);
    });
    updatePlusButtons();
  }
}












function addNotes(titolo = 'Titolo', attivita = [], id = null) {
  var container = document.getElementById('container5');
  var titleBtn = document.createElement('button');
  titleBtn.dataset.id = id || crypto.randomUUID();
  titleBtn.textContent = titolo;
  titleBtn.classList.add('save');


  titleBtn.style.minWidth = '30vw';
  titleBtn.style.width = 'auto';
  titleBtn.style.whiteSpace = 'nowrap';
  titleBtn.style.height = '10vw';
  titleBtn.style.fontSize = '5vw';
  titleBtn.style.fontWeight = 'bold';
  titleBtn.style.marginTop = '10vw';
  titleBtn.style.marginBottom = '0.5vw';
  titleBtn.style.marginRight = '50vw';
  titleBtn.style.backgroundColor = 'rgb(250,170,30)';
  titleBtn.style.borderRadius = '2vw';

  container.prepend(titleBtn);

  var pressTimer = null;
  var isLongPress = false;
  var lastTap = 0;

  function clearTimers() {
    clearTimeout(pressTimer);
    pressTimer = null;
    isLongPress = false;
  }

  function startLongPress(e) {
    e.preventDefault();
    isLongPress = false;

    pressTimer = setTimeout(() => {
  isLongPress = true;
 

  sfondoopaco.style.display = 'block';
  document.body.style.overflow = 'hidden';

var overlay = document.createElement('div');
overlay.id = 'dynamic_overlay_container';
overlay.style.position = 'fixed';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100vw';
overlay.style.height = '100vh';
overlay.style.zIndex = '10000';
overlay.style.display = 'flex';
overlay.style.alignItems = 'center';
overlay.style.justifyContent = 'center';
overlay.style.backgroundColor = 'rgba(0,0,0,0.1)';

var confirmDiv = document.createElement('div');
confirmDiv.id = 'confermaeliminacontenuto';
confirmDiv.style.position = 'relative';
confirmDiv.style.width = '85vw';
confirmDiv.style.padding = '6vw';
confirmDiv.style.backgroundColor = '#ffffff';
confirmDiv.style.borderRadius = '6vw';
confirmDiv.style.boxShadow = '0 4vw 10vw rgba(0,0,0,0.3)';
confirmDiv.style.fontFamily = 'sans-serif';
confirmDiv.style.textAlign = 'center';
confirmDiv.style.boxSizing = 'border-box';


var closeBtn = document.createElement('input');
closeBtn.type = 'button';
closeBtn.value = '✕';
closeBtn.style.position = 'absolute';
closeBtn.style.top = '3vw';
closeBtn.style.right = '3vw';
closeBtn.style.width = '8vw';
closeBtn.style.height = '8vw';
closeBtn.style.backgroundColor = '#fff5f5';
closeBtn.style.border = 'none';
closeBtn.style.borderRadius = '50%';
closeBtn.style.fontSize = '4vw';
closeBtn.style.fontWeight = 'bold';
closeBtn.style.color = '#ff4d4d';
closeBtn.style.cursor = 'pointer';
closeBtn.onclick = () => {
    overlay.remove();
    document.body.style.overflow = '';
    if(typeof sfondoopaco !== 'undefined') sfondoopaco.style.display = 'none';
};


var p = document.createElement('p');
p.innerHTML = 'Cancellare definitivamente<br>questo contenuto?';
p.style.fontSize = '5.5vw';
p.style.lineHeight = '1.4';
p.style.fontWeight = '600';
p.style.margin = '4vw 0 8vw 0';
p.style.color = '#222';


var btnContainer = document.createElement('div');
btnContainer.style.display = 'flex';
btnContainer.style.justifyContent = 'space-between';
btnContainer.style.gap = '4vw';


var cancelBtn = document.createElement('input');
cancelBtn.type = 'button';
cancelBtn.value = 'ANNULLA';
cancelBtn.style.flex = '1';
cancelBtn.style.height = '12vw';
cancelBtn.style.fontSize = '4vw';
cancelBtn.style.fontWeight = 'bold';
cancelBtn.style.backgroundColor = '#f0f0f0';
cancelBtn.style.color = '#555';
cancelBtn.style.border = 'none';
cancelBtn.style.borderRadius = '3vw';
cancelBtn.onclick = () => {
    overlay.remove();
    document.body.style.overflow = '';
    if(typeof sfondoopaco !== 'undefined') sfondoopaco.style.display = 'none';
};


var confirmBtn = document.createElement('input');
confirmBtn.type = 'button';
confirmBtn.value = 'CONFERMA';
confirmBtn.style.flex = '1';
confirmBtn.style.height = '12vw';
confirmBtn.style.fontSize = '4vw';
confirmBtn.style.fontWeight = 'bold';
confirmBtn.style.backgroundColor = '#ff4d4d';
confirmBtn.style.color = 'white';
confirmBtn.style.border = 'none';
confirmBtn.style.borderRadius = '3vw';
confirmBtn.style.boxShadow = '0 1vw 3vw rgba(255, 77, 77, 0.3)';
confirmBtn.onclick = () => {

    var table = titleBtn.nextElementSibling;
    if (table && table.tagName == 'TABLE') table.remove();
    titleBtn.remove();
    if(typeof salvaNote === 'function') salvaNote();
    
    overlay.remove();
    document.body.style.overflow = '';
    if(typeof sfondoopaco !== 'undefined') sfondoopaco.style.display = 'none';
};


btnContainer.appendChild(cancelBtn);
btnContainer.appendChild(confirmBtn);
confirmDiv.appendChild(closeBtn);
confirmDiv.appendChild(p);
confirmDiv.appendChild(btnContainer);
overlay.appendChild(confirmDiv);


document.body.appendChild(overlay);


if(typeof sfondoopaco !== 'undefined') sfondoopaco.style.display = 'block';

  }, 700);
 }


  function handleClickOrTap() {
    if (isLongPress) return;
    var now = Date.now();
    var timeSince = now - lastTap;
    lastTap = now;

    if (timeSince < 400) {
      renameTitle();
    } else {
      toggvarable();
    }
  }

  function renameTitle() {
    var input = document.createElement('input');
    input.type = 'text';
    input.value = titleBtn.textContent;
    input.classList.add('save');

    input.style.minWidth = '30vw';
    input.style.height = '10vw';
    input.style.fontSize = '4vw';
    input.style.fontWeight = 'bold';
    input.style.borderRadius = '2vw';
    input.style.marginBottom = '1vw';
    input.style.marginRight = '40vw';
    input.style.backgroundColor = 'rgb(250,170,30)';
    input.style.textAlign = 'center';

    input.addEventListener('input', () => {
      if (input.value.length > 20) input.value = input.value.slice(0, 20);
    });

    input.addEventListener('blur', () => {
      titleBtn.textContent = input.value || 'Titolo';
      input.replaceWith(titleBtn);
      salvaNote();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key == 'Enter') input.blur();
    });

    titleBtn.replaceWith(input);
    input.focus();
  }

  function toggvarable() {
    var table = titleBtn.nextElementSibling;
    if (!table || table.tagName !== 'TABLE') {
      createTable();
      table = titleBtn.nextElementSibling;
    }
    table.style.display = (table.style.display == 'none' || table.style.display == '') ? 'table' : 'none';
  }

  titleBtn.addEventListener('mousedown', startLongPress);
  titleBtn.addEventListener('mouseup', clearTimers);
  titleBtn.addEventListener('mouseleave', clearTimers);
  titleBtn.addEventListener('click', handleClickOrTap);

  titleBtn.addEventListener('touchstart', startLongPress, { passive: false });
  titleBtn.addEventListener('touchend', (e) => {
    clearTimers();
    handleClickOrTap();
  }, { passive: false });
  titleBtn.addEventListener('touchcancel', clearTimers);


  var table;

  function createTable() {
    if (titleBtn.nextElementSibling && titleBtn.nextElementSibling.tagName == 'TABLE') return;

    table = document.createElement('table');
    table.style.width = '80vw';
    titleBtn.insertAdjacentElement('afterend', table);
    table.appendChild(createRow());
    table.style.display = 'none';
    updatePlusButtonsForTable(currentTable);
  }

function createRow(titolo = 'Capitolo') {
  var row = document.createElement('tr');
  row.style.border = '0.1vw solid black';

  var cell = document.createElement('td');
  cell.style.padding = '1vw';

  var wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.width = '65vw';
 
  var titleContainer = document.createElement('div');
    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center';

    var toggleBtn = document.createElement('button');
    toggleBtn.textContent = '▾';
    toggleBtn.style.fontSize = '4vw';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.border = 'none';
    toggleBtn.style.background = 'transparent';
    toggleBtn.style.marginRight = '0.5vw';

   toggleBtn.addEventListener('click', () => {
      if (titleDiv.style.display == 'none') {
        titleDiv.style.display = '';
        toggleBtn.textContent = '▾';
      } else {
        titleDiv.style.display = 'none';
        toggleBtn.textContent = '▸';
      }
    });

    var titleDiv = document.createElement('div');
    titleDiv.textContent = titolo;
    titleDiv.classList.add('chapter-title');
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.color = 'black';
    titleDiv.style.fontSize = '4vw';
    titleDiv.style.marginBottom = '0.5vw';
    titleDiv.style.userSelect = 'none';
    titleDiv.style.whiteSpace = 'nowrap';
titleDiv.style.overflow = 'hidden';
titleDiv.style.textOverflow = 'ellipsis';
titleDiv.style.maxWidth = '60%';
   
 
 

    titleDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      charMapBtn.style.display = 'none';
      var input = document.createElement('input');
      input.type = 'text';
      input.value = titleDiv.textContent;
      input.style.position = 'absolute';
      input.style.zIndex = '10000';
      input.style.fontSize = '4vw';
      input.style.fontWeight = 'bold';
      input.style.width = '100%';

    input.addEventListener('input', (e) => {
  if (input.value.length > 25) {
    input.value = input.value.slice(0, 25);
  }
});

document.addEventListener('click', (e) => {
  if(!titleContainer.contains(e.target)) {
    charMapBtn.style.display = 'block';
  }
});


      input.addEventListener('blur', () => {
        titleDiv.textContent = input.value || 'Capitolo';
        input.replaceWith(titleDiv);
        salvaNote();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key == 'Enter') input.blur();
      });

      titleDiv.replaceWith(input);
      input.focus();
    });

    titleContainer.appendChild(toggleBtn);
    titleContainer.appendChild(titleDiv);
    wrapper.appendChild(titleContainer);

var topRightBtn1 = document.createElement('button');
topRightBtn1.textContent = '⚙️';
topRightBtn1.style.position = 'absolute';
topRightBtn1.style.top = '0vw';
topRightBtn1.style.right = '8.5vw';
topRightBtn1.style.fontSize = '4vw';
topRightBtn1.style.border = 'none';
topRightBtn1.style.borderRadius = '1vw';
topRightBtn1.style.cursor = 'pointer';
topRightBtn1.style.zIndex = '10';
topRightBtn1.title = 'Azione_personalizzata';


topRightBtn1.addEventListener('click', () => {
  activeTextarea = textarea;
  resetParameters();
  showModeParameters(titleDiv.textContent);
});


wrapper.appendChild(topRightBtn1);
var topRightBtn2 = document.createElement('button');
topRightBtn2.textContent = 'ℹ️';
topRightBtn2.style.position = 'absolute';
topRightBtn2.style.top = '0vw';
topRightBtn2.style.right = '2vw';
topRightBtn2.style.fontSize = '4vw';
topRightBtn2.style.border = 'none';
topRightBtn2.style.borderRadius = '1vw';
topRightBtn2.style.cursor = 'pointer';
topRightBtn2.style.zIndex = '10';
topRightBtn2.title = 'caratteristiche';


topRightBtn2.addEventListener('click', () => {
  showTextParameters(textarea.value,titleDiv.textContent);
});


wrapper.appendChild(topRightBtn2);


  var textarea = document.createElement('textarea');
textarea.classList.add('save');
textarea.placeholder = 'Scrivi...';
textarea.style.width = '100%';
textarea.style.minHeight = '40vw';
textarea.style.fontSize = '4vw';
textarea.style.fontFamily = 'inherit';
textarea.style.borderRadius = '2vw';
textarea.style.resize = 'none';
textarea.style.overflowY = 'hidden';
textarea.rows = 1;


function autoResize() {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}


textarea.addEventListener('input', () => {
  autoResize();
  salvaNote();
});


textarea.addEventListener('blur', () => {
  textarea.style.height = '';
});


setTimeout(autoResize, 0);
textarea.addEventListener('focus', autoResize);

  wrapper.appendChild(textarea);
  row.appendChild(cell);

  var cellMinus = document.createElement('td');
    var minusBtn = document.createElement('button');


   minusBtn.textContent = '✕';
 minusBtn.style.width = '6vw';
 minusBtn.style.height = '6vw';
 minusBtn.style.marginTop = '6vw';
 minusBtn.style.marginLeft = '0vw';
 minusBtn.style.border = 'none';
 minusBtn.style.borderRadius = '50%';
 minusBtn.style.backgroundColor = '#ff4d4d';
 minusBtn.style.color = 'white';
 minusBtn.style.fontSize = '3.5vw';
 minusBtn.style.cursor = 'pointer';
 minusBtn.style.display = 'flex';
 minusBtn.style.alignItems = 'center';
 minusBtn.style.justifyContent = 'center';
 minusBtn.style.flexShrink = '0';
 minusBtn.style.userSelect = 'none';
 minusBtn.style.webkitUserSelect = 'none';
 minusBtn.style.msUserSelect = 'none';

    var holdTimeout;
    minusBtn.addEventListener('mousedown', () => {
     holdTimeout = setTimeout(() => {
      if(table.rows.length > 1)
      {
       row.remove();
       updatePlusButtons();
       salvaNote();
      }
     }, 1000);
    });
    minusBtn.addEventListener('mouseup', () => {
    clearTimeout(holdTimeout);
    });
    minusBtn.addEventListener('mouseleave', () => {
     clearTimeout(holdTimeout);
    });
    minusBtn.addEventListener('touchstart', (e) => {
     e.preventDefault();
     holdTimeout = setTimeout(() => {
      if(table.rows.length > 1)
      {
       row.remove();
       updatePlusButtons();
       salvaNote();
      }
     }, 1000);
    });
    minusBtn.addEventListener('touchend', () => {
     clearTimeout(holdTimeout);
    });
    minusBtn.addEventListener('touchcancel', () => {
  clearTimeout(holdTimeout);
 });
    minusBtn.addEventListener('click', () => {
    comeeliminarecontenuto.style.display = 'block';
    setTimeout(() => {
     comeeliminarecontenuto.style.display = 'none';
    }, 3000);
   });
   cellMinus.appendChild(minusBtn);


    var cellPlus = document.createElement('td');
    var plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
 plusBtn.style.width = '6vw';
 plusBtn.style.height = '6vw';
 plusBtn.style.marginTop = '6vw';
 plusBtn.style.marginLeft = '0.5vw';
 plusBtn.style.border = 'none';
 plusBtn.style.borderRadius = '50%';
 plusBtn.style.backgroundColor = '#44cc44';
 plusBtn.style.color = 'white';
 plusBtn.style.fontSize = '4vw';
 plusBtn.style.cursor = 'pointer';
 plusBtn.style.display = 'flex';
 plusBtn.style.alignItems = 'center';
 plusBtn.style.justifyContent = 'center';
 plusBtn.style.flexShrink = '0';
 plusBtn.style.userSelect = 'none';
 plusBtn.style.webkitUserSelect = 'none';
 plusBtn.style.msUserSelect = 'none';
    plusBtn.addEventListener('click', () => {
      var newRow = createRow();
      table.appendChild(newRow);
      updatePlusButtons();
      salvaNote();
    });
    cellPlus.appendChild(plusBtn);
   

  var charMapBtn = document.createElement('button');
  charMapBtn.textContent = 'Àα';
  charMapBtn.style.position = 'absolute';
  charMapBtn.style.top = '1vw';
  charMapBtn.style.left = '63vw';
  charMapBtn.style.width = '8vw';
  charMapBtn.style.height = '8vw';
  charMapBtn.style.fontSize = '4vw';
  charMapBtn.style.borderRadius = '50%';
  charMapBtn.style.border = 'none';
  charMapBtn.style.backgroundColor = '#a5d6a7';
  charMapBtn.style.color = '#a882a8';
  charMapBtn.style.padding = '0vw';
  charMapBtn.style.userSelect = 'none';
  charMapBtn.style.border = '0.05vw solid black';
  wrapper.appendChild(charMapBtn);

  var charMapDiv = document.createElement('div');
  charMapDiv.style.display = 'none';
  charMapDiv.style.position = 'relative';
  charMapDiv.style.width = '96.8%';
  charMapDiv.style.height = '50vw';
  charMapDiv.style.marginTop = '0.5vw';
  charMapDiv.style.backgroundColor = '#f0f0f0';
  charMapDiv.style.border = '0.1vw solid #ccc';
  charMapDiv.style.overflowY = 'auto';
  charMapDiv.style.padding = '1vw';
  charMapDiv.style.fontSize = '5vw';
  charMapDiv.style.borderRadius = '1vw';
  charMapDiv.style.zIndex = '10';
  charMapDiv.style.touchAction = 'pan-y';
  charMapDiv.style.webkitOverflowScrolling = 'touch';

  var filterContainer = document.createElement('div');
  filterContainer.style.display = 'flex';
  filterContainer.style.justifyContent = 'space-around';
  filterContainer.style.marginBottom = '1vw';

  var btnAll = document.createElement('button');
  btnAll.textContent = 'Tutti';
  var btnvarters = document.createElement('button');
  btnvarters.textContent = 'Caratteri';
  var btnScience = document.createElement('button');
  btnScience.textContent = 'Scientifici';

  [btnAll, btnvarters, btnScience].forEach(btn => {
    btn.style.flex = '1';
    btn.style.margin = '0 0.5vw';
    btn.style.padding = '1vw';
    btn.style.fontSize = '3.5vw';
    btn.style.border = '0.1vw solid black';
    btn.style.borderRadius = '1vw';
    btn.style.backgroundColor = '#eee';
  });

  filterContainer.appendChild(btnAll);
  filterContainer.appendChild(btnvarters);
  filterContainer.appendChild(btnScience);
  charMapDiv.appendChild(filterContainer);

  var charButtonContainer = document.createElement('div');
  charButtonContainer.style.display = 'flex';
  charButtonContainer.style.flexWrap = 'wrap';
  charMapDiv.appendChild(charButtonContainer);

  var allChars = {
    tutti: ['a', 'à', 'á', 'â', 'ä', 'ã', 'å', 'æ', 'A', 'À', 'Á', 'Â', 'Ä', 'Ã', 'Å', 'Æ', 'b', 'ß', 'c', 'ç', 'C', 'Ç', 'd', 'đ', 'D', 'Đ', 'e', 'è', 'é', 'ê', 'ë', 'œ', 'E', 'È', 'É', 'Ê', 'Ë', 'Œ', 'i', 'ì', 'í', 'î', 'ï', 'I', 'Ì', 'Í', 'Î', 'Ï', 'l', 'ł', 'L', 'Ł', 'n', 'ñ', 'N', 'Ñ', 'o', 'ò', 'ó', 'ô', 'ö', 'õ', 'ø', 'O', 'Ò', 'Ó', 'Ô', 'Ö', 'Õ', 'Ø', 'u', 'ù', 'ú', 'û', 'ü', 'U', 'Ù', 'Ú', 'Û', 'Ü', 'y', 'ý', 'ÿ', 'Y', 'Ý', 'Ÿ', 's', 'š', 'S', 'Š', 'z', 'ž', 'Z', 'Ž', 'ʼ', '’', '‘', '“', '”', '„', '«', '»', 'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω', '∞', '∑', '√', '≈', '≠', '≤', '≥', '÷', '×', '±', '∫', '∂', '∆', '∇', '∈', '∉', '∋', '∏', '∐', '∧', '∨', '⊂', '⊃', '⊆', '⊇', '⊕', '⊗', '⊥', '∠', '∴', '∵', '∝', '∗', '∪', '∩', '∅', '∃', '∀', 'ℵ', 'ℜ', 'ℑ', '♁', '♃', '♄', '⚛', '↔', '→', '←', '⇌', '⇒', '⇐', '⇑', '⇓', '↕', '⊄', '⊅', '⊇', '⊉', '⊊', '⊋', '⊓', '⊔', '⊥', '∝', 'ℏ', 'ħ', 'µ', '°', '‰', 'Ω', 'Ω', '∆', '∇', '∂', '∅', '∉', '∈', '∩', '∪', '⊆', '⊇', '⊂', '⊃', '⊄', '⊅', '⊏', '⊐', '⊑', '⊒', '∖', '∗', '∣', '∥', '∧', '∨', '¬', '⇒', '⇔', '∀', '∃', '∄', '∵', '∴', '∠', '∡', '∢', '⊥', '⊢', '⊣', '⊤', '⊥', '⋅', '⋆', '⊕', '⊗', '⊙', '⊖', '⊘', '⊚', '⊛', '⊝', '⊞', '⊟', '⊠', '⊡', '⋉', '⋊', '⋋', '⋌', '⋍', '⋎', '⋏', '⋐', '⋑', '⋒', '⋓', '⋔', '⋕', '⋖', '⋗', '⋘', '⋙', '⋚', '⋛', '⋜', '⋝', '⋞', '⋟', '⋠', '⋡', '⋢', '⋣', '⋤', '⋥', '⋦', '⋧', '⋨', '⋩', '⋪', '⋫', '⋬', '⋭', '⋮', '⋯', '⋰', '⋱'

],
    caratteri: ['a', 'à', 'á', 'â', 'ä', 'ã', 'å', 'æ', 'A', 'À', 'Á', 'Â', 'Ä', 'Ã', 'Å', 'Æ', 'b', 'ß', 'c', 'ç', 'C', 'Ç', 'd', 'đ', 'D', 'Đ', 'e', 'è', 'é', 'ê', 'ë', 'œ', 'E', 'È', 'É', 'Ê', 'Ë', 'Œ', 'i', 'ì', 'í', 'î', 'ï', 'I', 'Ì', 'Í', 'Î', 'Ï', 'l', 'ł', 'L', 'Ł', 'n', 'ñ', 'N', 'Ñ', 'o', 'ò', 'ó', 'ô', 'ö', 'õ', 'ø', 'O', 'Ò', 'Ó', 'Ô', 'Ö', 'Õ', 'Ø', 'u', 'ù', 'ú', 'û', 'ü', 'U', 'Ù', 'Ú', 'Û', 'Ü', 'y', 'ý', 'ÿ', 'Y', 'Ý', 'Ÿ', 's', 'š', 'S', 'Š', 'z', 'ž', 'Z', 'Ž', 'ʼ', '’', '‘', '“', '”', '„', '«', '»', 'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'
],
    scientifici: ['∞', '∑', '√', '≈', '≠', '≤', '≥', '÷', '×', '±', '∫', '∂', '∆', '∇', '∈', '∉', '∋', '∏', '∐', '∧', '∨', '⊂', '⊃', '⊆', '⊇', '⊕', '⊗', '⊥', '∠', '∴', '∵', '∝', '∗', '∪', '∩', '∅', '∃', '∀', 'ℵ', 'ℜ', 'ℑ', '♁', '♃', '♄', '⚛', '↔', '→', '←', '⇌', '⇒', '⇐', '⇑', '⇓', '↕', '⊄', '⊅', '⊇', '⊉', '⊊', '⊋', '⊓', '⊔', '⊥', '∝', 'ℏ', 'ħ', 'µ', '°', '‰', 'Ω', 'Ω', '∆', '∇', '∂', '∅', '∉', '∈', '∩', '∪', '⊆', '⊇', '⊂', '⊃', '⊄', '⊅', '⊏', '⊐', '⊑', '⊒', '∖', '∗', '∣', '∥', '∧', '∨', '¬', '⇒', '⇔', '∀', '∃', '∄', '∵', '∴', '∠', '∡', '∢', '⊥', '⊢', '⊣', '⊤', '⊥', '⋅', '⋆', '⊕', '⊗', '⊙', '⊖', '⊘', '⊚', '⊛', '⊝', '⊞', '⊟', '⊠', '⊡', '⋉', '⋊', '⋋', '⋌', '⋍', '⋎', '⋏', '⋐', '⋑', '⋒', '⋓', '⋔', '⋕', '⋖', '⋗', '⋘', '⋙', '⋚', '⋛', '⋜', '⋝', '⋞', '⋟', '⋠', '⋡', '⋢', '⋣', '⋤', '⋥', '⋦', '⋧', '⋨', '⋩', '⋪', '⋫', '⋬', '⋭', '⋮', '⋯', '⋰', '⋱'
]
  };

  function renderCharMap(tipo = 'tutti') {
    charButtonContainer.innerHTML = '';
    allChars[tipo].forEach(ch => {
  var charBtn = document.createElement('button');
  charBtn.textContent = ch;
  charBtn.style.margin = '0.3vw';
  charBtn.style.width = '7vw';
  charBtn.style.height = '7vw';
  charBtn.style.border = 'none';
  charBtn.style.backgroundColor = '#ddd';
  charBtn.style.borderRadius = '0.5vw';
  charBtn.style.userSelect = 'none';
  charBtn.style.fontSize = '5vw';
  charBtn.style.position = 'relative';

  var pressTimer = null;
  var longPress = false;


  function showCheckmark() {
    var vDiv = document.createElement('div');
    vDiv.textContent = '✔';
    vDiv.style.position = 'absolute';
    vDiv.style.top = '0';
    vDiv.style.left = '0';
    vDiv.style.width = '100%';
    vDiv.style.height = '100%';
    vDiv.style.backgroundColor = 'rgb(50,200,50)';
    vDiv.style.color = 'black';
    vDiv.style.display = 'flex';
    vDiv.style.justifyContent = 'center';
    vDiv.style.alignItems = 'center';
    vDiv.style.borderRadius = '0.5vw';
    vDiv.style.fontSize = '5vw';
    vDiv.style.zIndex = '1000';

    charBtn.appendChild(vDiv);
    setTimeout(() => {
      vDiv.remove();
    }, 1000);
  }

  function startPress() {
    longPress = false;
    pressTimer = setTimeout(() => {
      longPress = true;
      navigator.clipboard.writeText(ch).then(() => {
        showCheckmark();
      });
    }, 500);
  }

  function cancelPress() {
    clearTimeout(pressTimer);
  }


  charBtn.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});
  charBtn.addEventListener('mousedown', startPress);
  charBtn.addEventListener('mouseup', (e) => {
    if (!longPress) {
      insertChar();
    }
    cancelPress();
  });
  charBtn.addEventListener('mouseleave', cancelPress);


 charBtn.addEventListener('touchstart', () => {
  startPress();
});


  charBtn.addEventListener('touchend', (e) => {
    if (!longPress) {
      insertChar();
    }
    cancelPress();
  });

  charBtn.addEventListener('touchcancel', cancelPress);

  function insertChar() {
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    var text = textarea.value;
    textarea.value = text.slice(0, start) + ch + text.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + ch.length;
    textarea.focus();
    salvaNote();
  }

  charButtonContainer.appendChild(charBtn);
});
  }


  btnAll.addEventListener('click', () => {
  renderCharMap('tutti');
  btnAll.style.backgroundColor = '#ccc';
  btnvarters.style.backgroundColor = 'white';
  btnScience.style.backgroundColor = 'white';
});

btnvarters.addEventListener('click', () => {
  renderCharMap('caratteri');
  btnAll.style.backgroundColor = 'white';
  btnvarters.style.backgroundColor = '#ccc';
  btnScience.style.backgroundColor = 'white';
});

btnScience.addEventListener('click', () => {
  renderCharMap('scientifici');
  btnAll.style.backgroundColor = 'white';
  btnvarters.style.backgroundColor = 'white';
  btnScience.style.backgroundColor = '#ccc';
});

  wrapper.appendChild(charMapDiv);


  charMapBtn.addEventListener('click', () => {
  var shouldShow = (charMapDiv.style.display == 'none');
  charMapDiv.style.display = shouldShow ? 'block' : 'none';

  if (shouldShow) {
    renderCharMap('tutti');


    btnAll.style.backgroundColor = '#ccc';
    btnvarters.style.backgroundColor = 'white';
    btnScience.style.backgroundColor = 'white';
  }
});

  cell.appendChild(wrapper);
  row.appendChild(cell);
  row.appendChild(cellMinus);
  row.appendChild(cellPlus);


  
  return row;
}


function updatePlusButtonsForTable(targetTable) {
    if (!targetTable) return;
    var rows = targetTable.rows;
    for (var i = 0; i < rows.length; i++) {

        var plusBtn = rows[i].cells[2]?.querySelector('button');
        if (plusBtn) {

            plusBtn.style.display = (i == rows.length - 1) ? 'inline-block' : 'none';
        }
    }
}


  if (attivita.length > 0) {
    createTable(); 

    var currentTable = titleBtn.nextElementSibling; 
    currentTable.style.display = 'none';


    while (currentTable.rows.length > 0) {
      currentTable.deleteRow(0);
    }


    attivita.forEach(capitolo => {
      var row = createRow(capitolo.titolo);
      var textarea = row.querySelector('textarea.save');
      if (textarea) {
        textarea.value = capitolo.contenuto || '';
      }
      currentTable.appendChild(row);
    });


    updatePlusButtonsForTable(currentTable);
  }
}


function cleanAllNotes() {
  var container = document.getElementById('container5');


  if (container.children.length == 0) {
    divvuoto.style.display = 'block';
    setTimeout(() => { divvuoto.style.display = 'none'; }, 3000);
    return;
  }


  var overlay = document.createElement('div');
  overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; display: flex; align-items: center; justify-content: center; backgroundColor: rgba(0,0,0,0.4); z-index: 10000;";
  document.body.style.overflow = "hidden";
  sfondoopaco2.style.display = 'block';


  var confirmDiv = document.createElement('div');
  confirmDiv.id = 'confermapuliscipagina';
  confirmDiv.style.cssText = "position: relative; width: 85vw; padding: 6vw; background-color: #ffffff; color: #333; border-radius: 6vw; box-shadow: 0 4vw 10vw rgba(0,0,0,0.3); z-index: 10001; font-family: sans-serif; text-align: center; box-sizing: border-box;";


  var closeBtn = document.createElement('input');
  closeBtn.type = 'button';
  closeBtn.value = '✕';
  closeBtn.style.cssText = "position: absolute; top: 3vw; right: 3vw; width: 8vw; height: 8vw; display: flex; align-items: center; justify-content: center; background-color: #fff5f5; border: none; border-radius: 50%; font-size: 4vw; font-weight: bold; color: #ff4d4d; cursor: pointer; box-shadow: 0 0.5vw 1.5vw rgba(255, 77, 77, 0.15); -webkit-tap-highlight-color: transparent;";
  closeBtn.onclick = () => { overlay.remove(); document.body.style.overflow = ""; sfondoopaco2.style.display = 'none'; };


  var p = document.createElement('p');
  p.innerHTML = 'Vuoi cancellare i<br>contenuti di questa pagina?';
  p.style.cssText = "font-size: 5.5vw; line-height: 1.4; font-weight: 600; margin-top: 4vw; margin-bottom: 8vw; color: #222;";


  var btnContainer = document.createElement('div');
  btnContainer.style.cssText = "display: flex; justify-content: space-between; gap: 4vw;";


  var cancelBtn = document.createElement('input');
  cancelBtn.type = 'button';
  cancelBtn.value = 'ANNULLA';
  cancelBtn.style.cssText = "flex: 1; height: 12vw; font-size: 4vw; font-weight: bold; background-color: #f0f0f0; color: #555; border: none; border-radius: 3vw; cursor: pointer;";
  cancelBtn.onclick = () => { overlay.remove(); document.body.style.overflow = ""; sfondoopaco2.style.display = 'none'; };


  var confirmBtn = document.createElement('input');
  confirmBtn.type = 'button';
  confirmBtn.value = 'CONFERMA';
  confirmBtn.style.cssText = "flex: 1; height: 12vw; font-size: 4vw; font-weight: bold; background-color: #ff4d4d; color: white; border: none; border-radius: 3vw; cursor: pointer; box-shadow: 0 1vw 3vw rgba(255, 77, 77, 0.3);";
  confirmBtn.onclick = () => {
    container.innerHTML = '';
    if (typeof salvaNote === "function") salvaNote();
    overlay.remove();
    document.body.style.overflow = "";
    sfondoopaco2.style.display = 'none';
  };


  btnContainer.appendChild(cancelBtn);
  btnContainer.appendChild(confirmBtn);
  confirmDiv.appendChild(closeBtn);
  confirmDiv.appendChild(p);
  confirmDiv.appendChild(btnContainer);
  overlay.appendChild(confirmDiv);
  document.body.appendChild(overlay);
}





function addNewNoteFromRapidi() {
  var titolo = document.getElementById('insnewtitolo').value.trim() || 'Titolo';
  var contenuto = document.querySelector('#appuntirapidi textarea').value.trim();
  var appuntirapidi = document.getElementById('appuntirapidi');

  addNotes(titolo, [{ titolo: 'Capitolo', contenuto }]);

  document.getElementById('casellaaddappunti').style.display = 'none';

  document.getElementById('insnewtitolo').value = '';
  document.querySelector('#appuntirapidi textarea').value = '';
  salvaNote();
  casellasalva.style.display = 'none';
  casellaaddappunti.style.display = 'none';
  casellacapitoli.style.display = 'none';
  cartellanontrovata.style.display = 'none';
  sfondoopaco.style.display = 'none';
  appuntirapidi.style.display = 'none';
  appunti.style.display = 'block';
}


function aggiungiCapitoloACartella() {
  var titoloCartella = document.getElementById('insnewtitoloforcap').value.trim();
  var titoloCapitolo = document.getElementById('insnewcapitolo1').value.trim() || 'Capitolo';
  var contenutoAppunti = document.querySelector('#appuntirapidi textarea').value.trim();
  var appuntirapidi = document.getElementById('appuntirapidi');

  if (!titoloCartella) {
    document.getElementById('cartellanontrovata').style.display = 'block';
    return;
  }

  

  var container = document.getElementById('container5');
  var cartelle = container.querySelectorAll('button.save');


  var cartellaBtn = Array.from(cartelle).find(btn => btn.textContent == titoloCartella);

  if (!cartellaBtn) {
 sfondoopaco2.style.display = 'block';
  cartellanontrovata.style.display = 'block';

  pressTimer = setTimeout(() => {
    isLongPress = true;


   



cartellanontrovata.style.display = 'none';
 sfondoopaco2.style.display = 'none';
  }, 3000);
 
  return;
}


  var table = cartellaBtn.nextElementSibling;
  if (!table || table.tagName !== 'TABLE') {
    cartellaBtn.click();
    table = cartellaBtn.nextElementSibling;
  }


  function createRow(titolo = 'Capitolo') {
    var row = document.createElement('tr');
    row.style.border = '0.1vw solid black';

    var cell = document.createElement('td');
    cell.style.padding = '1vw';

    var container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-start';
    container.style.width = '65vw';

    var titleContainer = document.createElement('div');
    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center';

    var toggleBtn = document.createElement('button');
    toggleBtn.textContent = '▾';
    toggleBtn.style.fontSize = '4vw';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.border = 'none';
    toggleBtn.style.background = 'transparent';
    toggleBtn.style.marginRight = '0.5vw';

    var titleDiv = document.createElement('div');
    titleDiv.textContent = titolo;
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.color = 'black';
    titleDiv.style.fontSize = '4vw';
    titleDiv.style.marginBottom = '0.5vw';
    titleDiv.style.userSelect = 'none';

    titleDiv.addEventListener('click', () => {
      var input = document.createElement('input');
      input.type = 'text';
      input.value = titleDiv.textContent;
      input.style.fontSize = '4vw';
      input.style.fontWeight = 'bold';
      input.style.width = '100%';

      input.addEventListener('blur', () => {
        titleDiv.textContent = input.value || 'Capitolo';
        input.replaceWith(titleDiv);
        salvaNote();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key == 'Enter') input.blur();
      });

      titleDiv.replaceWith(input);
      input.focus();
    });

    titleContainer.appendChild(toggleBtn);
    titleContainer.appendChild(titleDiv);
    container.appendChild(titleContainer);

    var textarea = document.createElement('textarea');
    textarea.classList.add('save');
    textarea.placeholder = 'Scrivi...';
    textarea.style.width = '100%';
    textarea.style.minHeight = '50vw';
    textarea.style.fontSize = '3vw';
    textarea.style.resize = 'none';
    textarea.addEventListener('input', salvaNote);

    container.appendChild(textarea);

    toggleBtn.addEventListener('click', () => {
      if (titleDiv.style.display == 'none') {
        titleDiv.style.display = '';
        toggleBtn.textContent = '▾';
      } else {
        titleDiv.style.display = 'none';
        toggleBtn.textContent = '▸';
      }
    });

    cell.appendChild(container);
    row.appendChild(cell);

    var cellMinus = document.createElement('td');
    var minusBtn = document.createElement('button');
    minusBtn.textContent = '-';
    minusBtn.style.width = '5vw';
    minusBtn.style.height = '5vw';
    minusBtn.style.fontSize = '3vw';
    minusBtn.style.backgroundColor = '#ef9a9a';
    minusBtn.style.border = '0.1vw solid black';
    minusBtn.style.borderRadius = '50%';
    minusBtn.addEventListener('click', () => {
      if (table.rows.length > 1) {
        row.remove();
        updatePlusButtons();
        salvaNote();
      }
    });
    cellMinus.appendChild(minusBtn);
    row.appendChild(cellMinus);

    var cellPlus = document.createElement('td');
    var plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
    plusBtn.style.width = '5vw';
    plusBtn.style.height = '5vw';
    plusBtn.style.fontSize = '3vw';
    plusBtn.style.backgroundColor = '#a5d6a7';
    plusBtn.style.border = '0.1vw solid black';
    plusBtn.style.borderRadius = '50%';
    plusBtn.addEventListener('click', () => {
      var newRow = createRow();
      table.appendChild(newRow);
      updatePlusButtons();
      salvaNote();
    });
    cellPlus.appendChild(plusBtn);
    row.appendChild(cellPlus);

    return row;
  }

  function updatePlusButtons() {
    var rows = table.rows;
    for (var i = 0; i < rows.length; i++) {
      var plusBtn = rows[i].cells[2].querySelector('button');
      plusBtn.style.display = (i == rows.length - 1) ? 'inline-block' : 'none';
    }
  }

  var newRow = createRow(titoloCapitolo);
  table.appendChild(newRow);


  var textarea = newRow.cells[0].querySelector('textarea');
  textarea.value = contenutoAppunti;

  updatePlusButtons();
  salvaNote();

  document.getElementById('casellacapitoli').style.display = 'none';
  document.getElementById('insnewtitoloforcap').value = '';
  document.getElementById('insnewcapitolo1').value = '';
  document.querySelector('#appuntirapidi textarea').value = '';
  salvaNote();
  casellasalva.style.display = 'none';
  casellaaddappunti.style.display = 'none';
  casellacapitoli.style.display = 'none';
  cartellanontrovata.style.display = 'none';
  sfondoopaco.style.display = 'none';
  appuntirapidi.style.display = 'none';
  appunti.style.display = 'block';
}









var savedSelection;

function saveSelection() {
  var selection = window.getSelection();
  if (selection.rangeCount > 0) {
    savedSelection = selection.getRangeAt(0);
  }
}

function restoreSelection() {
  var selection = window.getSelection();
  if (savedSelection) {
    selection.removeAllRanges();
    selection.addRange(savedSelection);
  }
}




function salvaDocumenti() {
  var container = document.getElementById('documenti');
  var docs = [];

  container.querySelectorAll('button.save').forEach(btn => {
    var id = btn.dataset.id;
    var titolo = btn.querySelector('.title-text')?.textContent || 'Titolo';
    var data = btn.querySelector('span')?.textContent || '';
    var preferito = btn.querySelector('button')?.style.color == 'yellow';

    var editor = document.getElementById('editor-' + id);
    var contenuto = editor ? editor.querySelector('.editable-area')?.innerHTML || '' : '';

    docs.push({
      id,
      titolo,
      data,
      contenuto,
      preferito
    });
  });

  localStorage.setItem('documenti', JSON.stringify(docs));
}

function caricaDocumenti() {
  var datiSalvati = localStorage.getItem('documenti');
  if (!datiSalvati) return;

  try {
    var docs = JSON.parse(datiSalvati);
    docs.forEach(doc => {
      showTitleForDocument(doc.titolo, doc.id);


      var btn = document.querySelector(`button[data-id="${doc.id}"]`);
      if (!btn) return;


      var starBtn = btn.querySelector('button');
      if (starBtn && doc.preferito) {
        starBtn.style.color = 'yellow';
      }


      var dateSpan = btn.querySelector('span');
      if (dateSpan) {
        dateSpan.textContent = doc.data || new Date().toLocaleDateString();
      }


      var editor = document.getElementById('editor-' + doc.id);
      if (editor) {
        var editable = editor.querySelector('.editable-area');
        if (editable) {
          editable.innerHTML = doc.contenuto || '';
        }
      }
    });
  } catch (e) {
    console.error('Errore durante il caricamento dei documenti:', e);
  }
}



























function cancHomeWorks()
{
 container.innerHTML = '';
 localStorage.removeItem('campiSalvati');
 d=0;
 compitinumber.value = +d;
}
function cancPromemoria()
{
 var container2 = document.getElementById('container2');
 container2.innerHTML = '';
 localStorage.removeItem('promemoriaSalvati');
 pr=0;
 promemorianumber.value = +pr;
}
function cancStudioLavoro()
{
 var container3 = document.getElementById('container3');
 container3.innerHTML = ''; 
 if(containerP.style.display == 'block')
 containerP.style.display = 'none';
 localStorage.removeItem('attivitaSalvate');
} 
function cancList()
{
 var container4 = document.getElementById('container4');
 container4.innerHTML = '';
 localStorage.removeItem('listaSalvata');
 l=0;
 listanumber.value = +l;
}
function cancDaily()
{
 var containerG = document.getElementById('containerG');
 containerG.innerHTML = '';
 localStorage.removeItem('dailyData');
}
function cancNotes() {
  var container = document.getElementById('container5');
  container.innerHTML = '';
  localStorage.removeItem('noteData');
}
document.addEventListener('DOMContentLoaded', () => {
var passwordKey = localStorage.getItem("passwordKey");
  var oggi = new Date();

 var attivitaJSON = localStorage.getItem('attivitaSalvate');
 if (attivitaJSON) {
  var attivita = JSON.parse(attivitaJSON);
  attivita.sort((a, b) => new Date(a.data) - new Date(b.data));
  attivita.reverse().forEach(a => addStudioLavoro(a.data, a.titolo, a.stato, a.note));
 }
 var compitiJSON = localStorage.getItem('campiSalvati');
var dati = compitiJSON ? JSON.parse(compitiJSON) : [];

oggi.setHours(0,0,0,0);

dati.sort((a, b) => new Date(a.data) - new Date(b.data));

dati.reverse().forEach(valore => {
  var riga = addHomeWorks(valore.materia, valore.data, valore.testo, valore.colore);

  var dataCompito = new Date(valore.data);
  dataCompito.setHours(0,0,0,0);




});
 var promemoriaJSON = localStorage.getItem('promemoriaSalvati');
 var promemoria = promemoriaJSON ? JSON.parse(promemoriaJSON) : [];
 promemoria.sort((a, b) => new Date(a.data + 'T' + a.ora) - new Date(b.data + 'T' + b.ora));
 promemoria.reverse().forEach(p => addPromemoria(p.data, p.ora, p.colore, p.testo));
 var listaJSON = localStorage.getItem('listaSalvata');
 var lista = listaJSON ? JSON.parse(listaJSON) : [];
 lista.forEach(el => addList(el.valore, el.colore));
 caricaPianoSettimanale();
 caricaDaily();
 caricaNote();
 loading=false;
});
var timer = null;
var startTime = 0;
var elapsedTime = 0;
function formatTime(ms)
{
 var totalSeconds = Math.floor(ms / 1000);
 var hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
 var minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
 var seconds = String(totalSeconds % 60).padStart(2, '0');
 return `${hours}:${minutes}:${seconds}`;
}
function updateDisplay()
{
 var now = Date.now();
 var diff = now - startTime + elapsedTime;
 document.getElementById('cronometrohome').value = formatTime(diff);
}
function crono(n)
{
 var start,stop;
 start = document.getElementById('start');
 stop = document.getElementById('stop');
 if(n=='avvia')
 {
  abilitaBottone(stop, 'linear-gradient(to bottom, rgb(102,255,102), rgb(0,204,0))');
  if(start.value == 'AVVIA' || start.value == 'CONTINUA')
  {
   start.value = 'CONTINUA';
   disabilitaBottone(start);
   stop.style.background = 'linear-gradient(to bottom, rgb(255,150,150), rgb(220,50,50))';
   stop.style.color = 'black';
   if(start.value == 'CONTINUA') 
   stop.value = 'FERMA';
   startTime = Date.now();
   if(!timer)
   {
    timer = setInterval(updateDisplay, 1000);
   }
  }
 }
 else if(n=='ferma')
 {
  abilitaBottone(start, 'linear-gradient(to bottom, rgb(102,255,102), rgb(0,204,0))');
  if(stop.value == 'FERMA' && start.value != 'AVVIA')
  {
   stop.style.background = 'linear-gradient(to bottom, rgb(255,150,150), rgb(220,50,50))';
   stop.style.color = 'black';
   stop.value = 'RIPRISTINA';
   start.style.background = 'linear-gradient(to bottom, rgb(160,200,255), rgb(90,120,240))';
   start.style.color = 'black';
   clearInterval(timer);
   timer = null;
   elapsedTime += Date.now() - startTime;
  }
  else
  {
   start.style.background = 'linear-gradient(to bottom, rgb(102,255,102), rgb(0,204,0))';
   start.value = 'AVVIA';
   stop.value = 'FERMA';
   disabilitaBottone(stop);
   clearInterval(timer);
   timer = null;
   startTime = 0;
   elapsedTime = 0;
   document.getElementById('cronometrohome').value = '00:00:00';
  }
 }
}

function abilitaBottone(btn, bgColor) {
    btn.disabled = false;
    btn.style.background = bgColor;
    btn.style.color = 'black';
    btn.style.border = '0.05vw solid #555';
    btn.style.boxShadow = '0 0.2vw 0.4vw rgba(0,0,0,0.3)';
    btn.style.cursor = 'pointer';
}

function disabilitaBottone(btn) {
    btn.disabled = true;
    btn.style.background = 'linear-gradient(to bottom, #e0e0e0, #cfcfcf)';
    btn.style.color = '#888';
    btn.style.border = '0.05vw solid #bbb';
    btn.style.boxShadow = 'inset 0 0.2vw 0.4vw rgba(255,255,255,0.8)';
    btn.style.cursor = 'not-allowed';
}


function start(str)
{
 wins.style.display = 'block';
 if(atris=='X' || atris=='O')
 return;
 itris++;
 atris=str;
 insinizioXoO.style.display = 'none';
 trisgame.style.display = 'block';
 if(atris=='X')
 chitocca.textContent = 'O';
 else
 chitocca.textContent = 'X';
}
function setSimbol(b)
{
 if(b.value != '' || itris==null)
 return;
 if(atris=='X')
 atris='O';
 else if(atris=='O')
 atris='X';
 if(itris!=0 && b.value == '')
 {
  b.value = atris;
 }
 else
 alert("Set who starts");
 if((A1.value == 'X' && B1.value == 'X' && C1.value == 'X') || (A1.value == 'X' && A2.value == 'X' && A3.value == 'X') || (A2.value == 'X' && B2.value == 'X' && C2.value == 'X') || (A3.value == 'X' && B3.value == 'X' && C3.value == 'X') || (B1.value == 'X' && B2.value == 'X' && B3.value == 'X') || (C1.value == 'X' && C2.value == 'X' && C3.value == 'X') || (A1.value == 'X' && B2.value == 'X' && C3.value == 'X') || (C1.value == 'X' && B2.value == 'X' && A3.value == 'X'))
 {
  var nome1;
  nome1=document.getElementById("nome1").value;
  if(nome1=='')
  nome1="GIOCATORE 'X'";
  sfondoopaco3.style.display = 'block';
  risdiv.textContent = nome1;
  windiv.style.display = 'block';
  itris=null;
  x++;
  pt1.value = +x;
 }
 else if((A1.value == 'O' && B1.value == 'O' && C1.value == 'O') || (A1.value == 'O' && A2.value == 'O' && A3.value == 'O') || (A2.value == 'O' && B2.value == 'O' && C2.value == 'O') || (A3.value == 'O' && B3.value == 'O' && C3.value == 'O') || (B1.value == 'O' && B2.value == 'O' && B3.value == 'O') || (C1.value == 'O' && C2.value == 'O' && C3.value == 'O') || (A1.value == 'O' && B2.value == 'O' && C3.value == 'O') || (C1.value == 'O' && B2.value == 'O' && A3.value == 'O'))
 {
  var nome2;
  nome2=document.getElementById("nome2").value;
  if(nome2=='')
  nome2="GIOCATORE 'O'";
  sfondoopaco3.style.display = 'block';
  risdiv.textContent = nome2;
  windiv.style.display = 'block';
  itris=null;
  o++;
  pt2.value = +o;
 }
 else if(A1.value != '' && B1.value != '' && C1.value != '' && A2.value != '' && B2.value != '' && C2.value != '' && A3.value != '' && B3.value != '' &&  C3.value != '')
 {
  sfondoopaco3.style.display = 'block';
  risdiv.textContent = 'PAREGGIO';
  wins.style.display = 'none';
  windiv.style.display = 'block';
  itris=null;
 }
}
function getNumberByRandom()
{
 return(Math.floor(Math.random() * 101));
}
function rdmStart()
{
 if(atris=='X' || atris=='O')
 return;
 if(getNumberByRandom()<50)
 atris='X';
 else
 atris='O';
 itris++;
 insinizioXoO.style.display = 'none';
 trisgame.style.display = 'block';
 if(atris=='X')
 chitocca.textContent = 'O';
 else
 chitocca.textContent = 'X';
}
function cancTris()
{
 A1.value = '';
 B1.value = '';
 C1.value = '';
 A2.value = '';
 B2.value = '';
 C2.value = '';
 A3.value = '';
 B3.value = '';
 C3.value = '';
 windiv.style.display = 'none';
 sfondoopaco3.style.display = 'none';
 atris=null;
 itris=0;
 trisgame.style.display = 'none';
 insinizioXoO.style.display = 'block';
}
function Names(n1,n2)
{
 nome1.value = n1;
 nome2.value = n2;
}
function showHowToCanc()
{
 comecancellare.style.display = 'block'; 
  setTimeout(() => {
    comecancellare.style.display = 'none';
  }, 3000);
}
function putNamesInButtons()
{
 if(nome1imp.value != "")
 gioc1imp.value = nome1imp.value;
 if(nome2imp.value != "")
 gioc2imp.value = nome2imp.value;
}
function cancByConfirm()
{
 if(compiti.style.display == 'block')
 cancHomeWorks();
 else if(promemoria.style.display == 'block')
 cancPromemoria();
 else if(containerSL.style.display == 'block')
 cancStudioLavoro();
 else if(lista.style.display == 'block')
 cancList();
 else if(dailyplan.style.display == 'block')
 cancDaily();
 else if(appunti.style.display == 'block')
 cancNotes();
 sfondoopaco2.style.display = 'none';
}
function startHanged()
{
 insinizioimpiccato.style.display = 'none';
 inserimentoparola.style.display = 'block';
}
function getButtonsAtHangedClick(player)
{
 if(player=='0')
 player = rdmStartHanged();
 currentPlayer = player;
}
function rdmStartHanged()
{
 return(Math.floor(Math.random() * 2) + 1);
}
function resetTableColor()
{
 document.querySelectorAll('#tabellaimpiccato input[type="button"]')
  .forEach(btn => btn.style.backgroundColor = '#ccffcc');
 document.querySelectorAll('#tabellaimpiccato2 input[type="button"')
  .forEach(btn => btn.style.backgroundColor = '#ccffcc');
}
var parolaSegreta = '';
var vartereIndovinate = [];
function generateButtonsForHanged()
{
 var i_Id=0, parola = insparola.value.trim().toUpperCase();
 if(insparola.value == '')
 {
  setTimeout(() => {
   insparola.style.borderColor = 'black';
   insparola.type = 'password';
   insparola.value = '';
   insparola.style.color = 'black';
   insparola.readOnly = false;
  }, 1500);
  insparola.style.borderColor = 'red';
  insparola.style.color = 'red';
  insparola.type = 'text';
  insparola.value = 'Minimo 3 caratteri';
  insparola.readOnly = true;
  return;
 }
 if(insparola.value.length > 10)
 {
  setTimeout(() => {
   insparola.style.borderColor = 'black';
   insparola.value = '';
   insparola.style.color = 'black';
   insparola.readOnly = false;
   insparola.type = 'text';
  }, 1500);
  insparola.style.borderColor = 'red';
  insparola.style.color = 'red';
  insparola.type = 'text';
  insparola.value = 'Max. 10 caratteri';
  insparola.readOnly = true;
  insparola.type = 'text';
  return;
 }
 var length = document.getElementById('insparola').value.length,box;
 inserimentoparola.style.display = 'none';
 inserimentocaselle.style.display = 'block';
 inserimentodatastiera.style.display = 'block';
 for(i_Id=0;i_Id<length;i_Id++)
 {
  box = document.createElement('button');
  if(parola[i_Id] == ' ')
  {
   box.style.width = '7vw';
   box.style.height = '7vw';
   box.style.borderRadius = '2vw';
   box.style.marginLeft = '0.2vw';
   box.style.marginRight = '0.2vw';
   box.style.backgroundColor = 'transparent';
   box.style.border = 'none';
   box.textContent = '';
   vartereIndovinate[i] = ' ';
  }
  else
  {
   box.id = i_Id;
   box.textContent = '-';
   box.style.width = '7vw';
   box.style.height = '7vw';
   box.style.borderRadius = '2vw';
   box.style.fontSize = '5vw';
   box.style.marginLeft = '0.2vw';
   box.style.marginRight = '0.2vw';
   box.style.backgroundColor = '#ddffff';
   box.dataset.varter = parola[i_Id];
   box.addEventListener('click', () => {
    showKeyboardForHanged();
   });
  }
  inserimentocaselle.appendChild(box);
 }
 parolaSegreta = insparola.value.trim().toUpperCase();
 vartereIndovinate = parolaSegreta.split('').map(c => c == ' ' ? ' ' : '_');
}
function readvarter(varter)
{
 var i,buttons = inserimentocaselle.getElementsByTagName('button');
 for(i=0;i<buttons.length;i++)
 {
  if(buttons[i].dataset.varter == varter)
  {
   buttons[i].style.fontWeight = 'bold';
   buttons[i].textContent = varter;
   vartereIndovinate[i] = varter;
  }
 }
 if(!insparola.value.trim().toUpperCase().includes(varter))
 {
  if(mistake<5)
  {
   mistake++;
   mistakes.textContent = +mistake;
  }
  else
  {
   sfondoopaco3.style.display = 'block';
   divimpiccato.style.display = 'block';
   loosesimpiccato.style.display = 'block';
   parolanonindovinata.textContent = '"'+insparola.value+'"';
  }
 }
 if(vartereIndovinate.join('') == parolaSegreta)
 {
  sfondoopaco3.style.display = 'block';
  divimpiccato.style.display = 'block';
  winsimpiccato.style.display = 'block';
  if(currentPlayer=='1')
  {
   points1++;
   pt1imp.value = +points1;
  }
  else
  {
   points2++;
   pt2imp.value = +points2;
  }
 }
}
function checkvarter(btn)
{
 btn.style.backgroundColor = '#ffbbbb';
}
function cancHanged()
{
 divimpiccato.style.display = 'none';
 sfondoopaco3.style.display = 'none';
 winsimpiccato.style.display = 'none';
 loosesimpiccato.style.display = 'none';
 inserimentocaselle.style.display = 'none';
 inserimentodatastiera.style.display = 'none';
 insinizioimpiccato.style.display = 'block';
 inserimentoparola.style.display = 'none';
 insparola.value = '';
 mistakes.textContent = '';
 mistake=0;
 resetTableColor();
 inserimentocaselle.innerHTML = '';
}
function startMastermind()
{
 var show_color,create,btnColor,col_Id=0,index,divMaster,riga,i_for,button,inviaBtn,btns,userColors,divGuessed;
 if(endGuessed==4)
 {
  sfondoopaco3.style.display = 'block';
  divmaster.style.display = 'block';
  winsmaster.style.display = 'block';
 }
 else if(rowCount==10)
 {
  sfondoopaco3.style.display = 'block';
  divmaster.style.display = 'block';
  loosesmaster.style.display = 'block';
  show_color = document.getElementById('combinazionenonindovinata');
  for(create=0;create<4;create++)
  {
   btnColor = document.createElement('button');
   btnColor.style.width = '8vw';
   btnColor.style.height = '8vw';
   btnColor.style.borderRadius = '50%';
   btnColor.style.border = 'solid white 0.05vw';
   btnColor.style.margin = '0.5vw';
   show_color.appendChild(btnColor);
   btnColor.style.backgroundColor = colorCode[col_Id];
   col_Id++;
  }
 }
 if(rowCount==0)
 {
  for(i_array=0;i_array<d_array;i_array++)
  {
   index=Math.floor(Math.random() * colors.length);
   colorCode.push(colors[index]);
  }
 }
 startmastermind.style.display = 'none';
 divMaster = document.getElementById('colorimastermind');
 riga = document.createElement('div');
 riga.id = 'riga' + rowCount;
 riga.style.display = 'flex';
 riga.style.flexWrap = 'nowrap';
 riga.style.alignItems = 'center';
 riga.style.justifyContent = 'center';
 riga.style.marginBottom = '1vw';
 divMaster.prepend(riga);
 for(i_for=0;i_for<4;i_for++)
 {
  button = document.createElement('button');
  id_div++;
  button.id = 'btn' + id_div;
  button.classList.add("color-btn");
  button.style.width = '12vw';
  button.style.height = '12vw';
  button.style.borderRadius = '50%';
  button.style.margin = '0.5vw';
  button.style.border = "0.1vw solid black";
  button.style.background = "#ddd";
  button.style.boxShadow = `
  inset 0 0 1vw rgba(255,255,255,0.5),
  inset 0 -0.5vw 1vw rgba(0,0,0,0.2),
  0 0.5vw 1vw rgba(0,0,0,0.3)
  `;
  button.addEventListener("click", function(e) {
   selectedButton = e.target;
   openPavarte(e.target);
  });
  riga.appendChild(button);
 }
 disableAllButtons();
 enableButtonsInRow(riga);
 inviaBtn = document.createElement('button');
 inviaBtn.textContent = 'INVIA';
 inviaBtn.id = 'invia' + rowCount;
 inviaBtn.style.width = '18vw';
 inviaBtn.style.height = '12vw';
 inviaBtn.style.border = 'solid black 0.1vw';
 inviaBtn.style.borderRadius = '2vw';
 inviaBtn.style.backgroundColor = '#bbddff';
 inviaBtn.style.marginLeft = '1vw';
 inviaBtn.style.fontSize = '5vw';
 inviaBtn.style.fontWeight = 'bold';
 inviaBtn.disabled = true;
 inviaBtn.style.opacity = "0.4";
 inviaBtn.addEventListener("click", function() {
  btns = riga.querySelectorAll(".color-btn");
  userColors = [
   btns[0].dataset.realcolor,
   btns[1].dataset.realcolor,
   btns[2].dataset.realcolor,
   btns[3].dataset.realcolor
  ];
  divGuessed = document.createElement("div");
  divGuessed.textContent = getColorByUser(...userColors);
  divGuessed.style.border = "none";
  divGuessed.style.color = '#ff5555';
  divGuessed.style.fontSize = '10vw';
  divGuessed.style.fontWeight = 'bold';
  divGuessed.style.backgroundColor = "transparent";
  divGuessed.style.width = '18vw';
  divGuessed.style.height = '12vw';
  divGuessed.style.marginLeft = '1vw';
  divGuessed.style.display = "flex";
  divGuessed.style.alignItems = "center";
  divGuessed.style.justifyContent = "center";
  this.replaceWith(divGuessed);
  rowCount++;
  startMastermind();
 });
 riga.appendChild(inviaBtn);
}
function openPavarte(button)
{
 var pavarte = document.getElementById("pavarte"),c,row;
 pavarte.innerHTML = ""; 
 disableInvia();
 colors.forEach(col => {
  c = document.createElement("div");
  c.style.width = "10vw";
  c.style.height = "10vw";
  c.style.borderRadius = "50%";
  c.style.backgroundColor = col;
  c.style.display = "inline-block";
  c.style.margin = "1vw";
  c.style.border = 'solid black 0.1vw';
  c.addEventListener("click", function(){
   selectedButton.style.background = `
    radial-gradient(circle at 30% 30%,
    rgba(255,255,255,0.9) 0%,
    ${col} 40%,
    ${col} 100%)
   `;
   selectedButton.dataset.realcolor = col;
   pavarte.style.display = "none";
   row = selectedButton.parentElement;
   checkRowCompvare(row);
  });
  pavarte.appendChild(c);
 });
 pavarte.style.display = "block";
 function closePavarteOnOutsideClick(event)
 {
  var row;
  if(!pavarte.contains(event.target) && event.target !== button)
  {
   pavarte.style.display = "none";
   row = button.parentElement;
   checkRowCompvare(row);
   document.removeEventListener("click", closePavarteOnOutsideClick);
  }
 }
}
function getColorByUser(color1,color2,color3,color4)
{
 var guessed=0,checkColor=[color1,color2,color3,color4];
 for(i_array=0;i_array<d_array;i_array++)
 {
  if(checkColor[i_array]==colorCode[i_array])
  guessed++;
 }
 endGuessed=guessed;
 return(guessed);
}
function disableAllButtons()
{
 document.querySelectorAll(".color-btn").forEach(btn => {
  btn.disabled = true;
 });
}
function enableButtonsInRow(row)
{
 row.querySelectorAll(".color-btn").forEach(btn => {
  btn.disabled = false;
 });
}
function disableInvia()
{
 var topRow,inviaBtn
 topRow = document.getElementById("colorimastermind").firstElementChild;
 inviaBtn = topRow?.querySelector("button[id^='invia']");
 if(inviaBtn)
 {
  inviaBtn.disabled = true;
  inviaBtn.style.opacity = "0.4";
 }
}
function enableInvia()
{
 var topRow,inviaBtn;
 topRow = document.getElementById("colorimastermind").firstElementChild;
 inviaBtn = topRow?.querySelector("button[id^='invia']");
 if(inviaBtn)
 {
  inviaBtn.disabled = false;
  inviaBtn.style.opacity = "1";
 }
}
function checkRowCompvare(row)
{
 var buttons,allFilled,inviaBtn;
 buttons = row.querySelectorAll(".color-btn");
 allFilled = Array.from(buttons).every(btn => btn.dataset.realcolor);
 inviaBtn = row.querySelector("button[id^='invia']");
 if(inviaBtn)
 {
  inviaBtn.disabled = !allFilled;
  inviaBtn.style.opacity = allFilled ? "1" : "0.4";
 }
}
function cancMastermind()
{
 divmaster.style.display = 'none';
 sfondoopaco3.style.display = 'none';
 winsmaster.style.display = 'none';
 loosesmaster.style.display = 'none';
 pavarte.style.display = 'none';
 colorimastermind.innerHTML = '';
 startmastermind.style.display = 'block';
 Id_Col=0;
 rowCount=0;
 endGuessed=0;
 selectedButton=null;
 id_div=0;
 rowCount=0;
 endGuessed=null;
 colorCode=[];
 combinazionenonindovinata.innerHTML = '';
}
var timerDiv;
var timerInterval;
function startMemory()
{
 var memory = document.getElementById('cartememory');
 var i_mem, card, id_Card = 0,matchedCount=0,i,j,flippedCards,busy,front,back,watermark;
 var symbols=["🍎","🍌","⭐","🎵","⚽","🐸","🎲","❤️"],values=[];
 startmemory.style.display = 'none';
 nomememory.style.display = 'none';
 times.style.display = 'none';
    timerDiv = document.createElement('div');
    timerDiv.id = 'memoryTimer';
    timerDiv.style.position = 'absolute';
    timerDiv.style.top = '25vw';
    timerDiv.style.left = '10vw';
    timerDiv.style.fontSize = '5vw';
    timerDiv.style.fontWeight = 'bold';
    timerDiv.style.color = 'black';
    timerDiv.style.zIndex = '100';
    timerDiv.textContent = '0:00';
    memory.parentElement.appendChild(timerDiv);


var memoryStartTime = Date.now(); 

timerInterval = setInterval(function () {

    var now = Date.now();
    var diff = now - memoryStartTime; 


    var minutes = Math.floor(diff / 60000);
    var seconds = Math.floor((diff % 60000) / 1000);
    var milliseconds = diff % 1000;


    timerDiv.textContent =
        minutes + ":" +
        (seconds < 10 ? "0" + seconds : seconds) + ":" +
        (milliseconds < 100 ? "0" : "") + (milliseconds < 10 ? "0" : "") + milliseconds;

}, 10);
 for(i=0;i<symbols.length;i++)
 {
  values.push(symbols[i], symbols[i]);
 }
 for(i=values.length - 1;i>0;i--)
 {
  j = Math.floor(Math.random() * (i + 1));
  [values[i], values[j]] = [values[j], values[i]];
 }
 flippedCards = [];
 busy = false;
 for(i_mem=0;i_mem<16;i_mem++)
 {
  card = document.createElement('div');
  card.id = 'card' + id_Card;
  card.dataset.value = values[i_mem];
  card.style.width = '15vw';
  card.style.height = '18vw';
  card.style.border = 'solid black 0.1vw';
  card.style.margin = '2vw';
  card.style.borderRadius = '2vw';
  card.style.backgroundColor = '#cccccc';
  card.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
  card.style.position = "relative";
  card.style.transformStyle = "preserve-3d";
  card.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
  card.style.display = "inline-block";
  id_Card++;
  front = document.createElement('div');
  back = document.createElement('div');
  front.textContent = values[i_mem];
  front.style.position = "absolute";
  front.style.width = "100%";
  front.style.height = "100%";
  front.style.display = "flex";
  front.style.justifyContent = "center";
  front.style.alignItems = "center";
  front.style.fontSize = "8vw";
  front.style.backfaceVisibility = "hidden";
  front.style.border = "none";
  front.style.borderRadius = "2vw";
  front.style.background = "white";
  front.style.transform = "rotateY(180deg)";
  front.style.textShadow = "1px 1px 2px rgba(0,0,0,0.3)";
  back.textContent = "";
  back.style.position = "absolute";
  back.style.width = "100%";
  back.style.height = "100%";
  back.style.backfaceVisibility = "hidden";
  back.style.border = "none";
  back.style.borderRadius = "2vw";
  back.style.background = `
   repeating-linear-gradient(
    45deg,           
    #cccccc,         
    #cccccc 1px,     
    #e0e0e0 1px,     
    #e6e6e6 10px     
   )
  `;
  watermark = document.createElement('div');
  watermark.style.position = "absolute";
  watermark.style.top = "50%";
  watermark.style.left = "50%";
  watermark.style.transform = "translate(-50%, -50%)";
  watermark.style.textAlign = "center";
  watermark.style.pointerEvents = "none";
  watermark.style.opacity = "0.1";
  watermark.style.color = "#333333";
  watermark.style.userSelect = "none";
  watermark.innerHTML = `<div style="font-size: 5vw; font-weight: bold">Daily</div>
                         <div style="font-size: 4vw; font-weight: bold; font-style: italic; margin-left: 3vw">Life</div>`;
  back.appendChild(watermark);
  card.appendChild(front);
  card.appendChild(back);
  card.addEventListener('click', function () {
   if(busy)
   return;
   if(flippedCards.includes(this) || this.classList.contains('matched'))
   return;
   this.style.transform = "rotateY(180deg)";
   flippedCards.push(this);
   if(flippedCards.length == 2)
   {
    if(flippedCards[0].dataset.value == flippedCards[1].dataset.value)
    {
     flippedCards[0].classList.add('matched');
     flippedCards[1].classList.add('matched');
     flippedCards[0].children[0].style.backgroundColor = "#90ee90";
     flippedCards[1].children[0].style.backgroundColor = "#90ee90";
     flippedCards = [];
     matchedCount++;
     if(matchedCount == symbols.length)
     {
      sfondoopaco3.style.display = 'block';
      divmemory.style.display = 'block';
      winsmemory.style.display = 'block';
      clearInterval(timerInterval);
      timememory.textContent = timerDiv.textContent;
      writeTimes(timememory.textContent);
     }
    }
    else
    {
     busy = true;
     setTimeout(() => {
      flippedCards[0].style.transform = "rotateY(0deg)";
      flippedCards[1].style.transform = "rotateY(0deg)";
      flippedCards = [];
      busy = false;
     }, 600);
    }
   }
  });
  memory.appendChild(card);
 }
}
var timesList = [];
var namesList = [];

function timeToMs(t) {
    var [m, s, ms] = t.split(":").map(Number);
    return m*60000 + s*1000 + ms;
}

function msToTime(ms) {
    var minutes = Math.floor(ms / 60000);
    ms -= minutes*60000;
    var seconds = Math.floor(ms / 1000);
    ms -= seconds*1000;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}:${ms < 100 ? "0" : ""}${ms < 10 ? "0" : ""}${ms}`;
}

function writeTimes(n) {
    var timesDiv = document.getElementById('times');

    var nMs = timeToMs(n);

    if (nomememory.value == '')
        nomememory.value = 'Anonimo';


    if (timesList.length < 5) {
        namesList.push(nomememory.value);
        timesList.push(n);
    } else {
        var maxTimeMs = Math.max(...timesList.map(timeToMs));
        var index = timesList.map(timeToMs).indexOf(maxTimeMs);

        if (nMs < maxTimeMs) {
            namesList[index] = nomememory.value;
            timesList[index] = n;
        }
    }


    var paired = timesList.map((t, i) => ({ name: namesList[i], time: t }));
    paired.sort((a, b) => timeToMs(a.time) - timeToMs(b.time));


    timesList = paired.map(p => p.time);
    namesList = paired.map(p => p.name);


    timesDiv.innerHTML = "<p style='font-size:5vw; margin:2vw 0; text-align:center;'>I MIGLIORI TEMPI</p>";

    paired.forEach(p => {
    var row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.margin = "1vw auto";
    row.style.width = "50vw";
    row.style.gap = "2vw";


    var nameCol = document.createElement("div");
    nameCol.textContent = p.name;
    nameCol.style.width = "25vw";
    nameCol.style.whiteSpace = "nowrap";
    nameCol.style.overflowX = "auto";
    nameCol.style.fontSize = "4vw";
    nameCol.style.textAlign = "left";


    var timeCol = document.createElement("div");
    timeCol.textContent = p.time;
    timeCol.style.width = "25vw";
    timeCol.style.textAlign = "right";
    timeCol.style.fontWeight = "bold";
    timeCol.style.fontSize = "4vw";

    row.appendChild(nameCol);
    row.appendChild(timeCol);
    timesDiv.appendChild(row);
});
salvaDatiSincronizzati(false);
}
function printTimes() {
    var timesDiv = document.getElementById('times');
    timesDiv.innerHTML = "<p style='font-size:5vw; margin:2vw 0; text-align:center;'>I MIGLIORI TEMPI</p>";

    var paired = timesList.map((t, i) => ({ name: namesList[i], time: t }));

    paired.forEach(p => {
        var row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.margin = "1vw auto";
        row.style.width = "50vw";
        row.style.gap = "2vw";

        var nameCol = document.createElement("div");
        nameCol.textContent = p.name;
        nameCol.style.width = "25vw";
        nameCol.style.whiteSpace = "nowrap";
        nameCol.style.overflowX = "auto";
        nameCol.style.fontSize = "4vw";
        nameCol.style.textAlign = "left";

        var timeCol = document.createElement("div");
        timeCol.textContent = p.time;
        timeCol.style.width = "25vw";
        timeCol.style.textAlign = "right";
        timeCol.style.fontWeight = "bold";
        timeCol.style.fontSize = "4vw";

        row.appendChild(nameCol);
        row.appendChild(timeCol);
        timesDiv.appendChild(row);
    });
}
function cancMemory()
{
 divmemory.style.display = 'none';
 sfondoopaco3.style.display = 'none';
 winsmemory.style.display = 'none';
 startmemory.style.display = 'block';
 nomememory.style.display = 'block';
 cartememory.innerHTML = '';
 times.style.display = 'block';
 clearInterval(timerInterval);
 if(timerDiv)
   timerDiv.innerHTML = '';
 id_Card=0;
 matchedCount=0;
}

document.addEventListener('click', () => {
 if (audioCtx && audioCtx.state === 'suspended')
   {
    audioCtx.resume();
   }
 if(document.getElementById('overlayAccount').style.display == 'block')
 return;
 if(interactionSoundEffects==true)
 playClick();
 if(mobileVibration==true)
 navigator.vibrate(50);
});





let codiceRecuperoAttivo = null;

emailjs.init("HfWz8AC3QT5NV4ZXr");

async function passwordDimenticata() {
    const emailUtente = document.getElementById('emailInput').value.trim();
    if (!emailUtente || !emailUtente.includes('@')) {
        mostraNotifica("Inserire prima la email", "#ff4444");
        return;
    }

    if (typeof mostraLoader === "function") mostraLoader(true);
    codiceRecuperoAttivo = Math.floor(100000 + Math.random() * 900000);

    try {

        await emailjs.send('service_bwvozbg', 'template_wgw5a1d', {
            email_utente: emailUtente,
            codice: codiceRecuperoAttivo
        });
        
        if (typeof mostraLoader == "function") mostraLoader(false);
        mostraNotifica("Codice inviato a " + emailUtente);
        mostraInterfacciaVerifica(emailUtente);
        
    } catch (error) {
        if (typeof mostraLoader === "function") mostraLoader(false);
        mostraNotifica("Errore nell'invio email", "#ff4444");
    }
}

function mostraInterfacciaVerifica(email) {
    const overlay = document.createElement('div');
    overlay.id = "overlayRecupero";
    overlay.style = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); z-index: 100000; display: flex; align-items: center; justify-content: center;`;

    overlay.innerHTML = `
        <div style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.2); padding: 30px; border-radius: 40px; width: 76vw; text-align: center; color: white; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
            <div style="font-size: 50px; margin-bottom: 20px;">🔐</div>
            <h2 style="font-size: 24px; margin-bottom: 10px;">Verifica Identità</h2>
            <p style="font-size: 14px; opacity: 0.8; margin-bottom: 25px;">Inserisci il codice di 6 cifre inviato a<br><b>${email}</b></p>
            <input type="number" id="inputCodiceOTP" placeholder="· · · · · ·" style="width: 100%; padding: 15px; font-size: 32px; text-align: center; letter-spacing: 5px; border: none; border-radius: 20px; margin-bottom: 20px; outline: none; background: rgba(255,255,255,0.9); color: #333; font-weight: bold;">
            <button onclick="verificaCodiceOTP();" style="width: 100%; padding: 18px; background: white; color: #000; border: none; border-radius: 20px; font-weight: bold; font-size: 16px; cursor: pointer;">VERIFICA CODICE</button>
            <p onclick="document.getElementById('overlayRecupero').remove()" style="margin-top: 20px; opacity: 0.6; cursor: pointer; font-size: 14px;">Annulla operazione</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function verificaCodiceOTP() {
    const input = document.getElementById('inputCodiceOTP');
    const codiceInserito = input ? input.value : "";

    if (parseInt(codiceInserito) === codiceRecuperoAttivo) {
        const box = document.querySelector('#overlayRecupero > div');
        box.innerHTML = `
            <div style="font-size: 50px; margin-bottom: 20px;">🆕</div>
            <h2 style="font-size: 24px; margin-bottom: 10px;">Nuova Password</h2>
            <p style="font-size: 14px; opacity: 0.8; margin-bottom: 25px;">Inserisci la tua nuova chiave di accesso</p>
            <input type="password" id="nuovaPassInput" placeholder="Password" style="width: 100%; padding: 15px; font-size: 18px; text-align: center; border: none; border-radius: 20px; margin-bottom: 20px; outline: none; background: rgba(255,255,255,0.9); color: #333;">
            <button onclick="salvaNuovaPassword()" style="width: 100%; padding: 18px; background: #4CAF50; color: white; border: none; border-radius: 20px; font-weight: bold; font-size: 16px; cursor: pointer;">AGGIORNA PASSWORD</button>
        `;
    } else {
        mostraNotifica("Codice errato!", "#ff4444");
    }
}

function salvaNuovaPassword() {
    const nuovaPass = document.getElementById('nuovaPassInput').value;
    if (nuovaPass.length < 6) {
        mostraNotifica("Password troppo corta!", "#ff4444");
        return;
    }
    document.getElementById('overlayRecupero').remove();
    mostraNotifica("Password aggiornata correttamente!", "#4CAF50");
}

function mostraNotifica(testo, colore) {
    const vecchia = document.querySelector('.toast-daily');
    if (vecchia) vecchia.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-daily';
    toast.style = `position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.85); color: white; padding: 12px 25px; border-radius: 50px; font-size: 14px; z-index: 200000; text-align: center; font-family: sans-serif; backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 20px rgba(0,0,0,0.3); white-space: nowrap;`;
    toast.innerText = testo;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 0.6s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 600);
    }, 3000);
}

function gestisciStatoConnessione() {
    var pannelloAccount = document.getElementById('pannelloAccount');
    var statusSalvataggio = document.getElementById('statusSalvataggio');
    

    if (!navigator.onLine) {

        if (pannelloAccount && (pannelloAccount.style.display == 'block' || pannelloAccount.style.display == 'flex')) {
            mostraNotifica("Sei offline");
        }
        

        if (statusSalvataggio) {
            statusSalvataggio.innerText = "Offline";
        }
    } else {

        if (statusSalvataggio && typeof aggiornaTestoTempo === "function") {
            aggiornaTestoTempo();
        }
    }
}


window.addEventListener('offline', gestisciStatoConnessione);


window.addEventListener('online', gestisciStatoConnessione);


document.addEventListener('DOMContentLoaded', gestisciStatoConnessione);




const pannelloAccount = document.getElementById('pannelloAccount');

const observer = new MutationObserver(() => {

    if (getComputedStyle(pannelloAccount).display === 'block') {

        gestisciStatoConnessione();

    }

});

observer.observe(pannelloAccount, {
    attributes: true,
    attributeFilter: ['style', 'class']
});



function showWeightedAvarage()
{
 if(mediapesatadiv.style.display == 'none' || mediapesatadiv.style.display == '')
 {
  altrodiv.style.display = 'none';
  mediapesatadiv.style.display = 'block';
 }
 else
 {
  altrodiv.style.display = 'block';
  mediapesatadiv.style.display = 'none';
 }
}
var c_media=0,d_media=0;
function calculateAvarage(a,b)
{
 if(!/^[0-9,.]+$/.test(a))
 {
  setTimeout(() => {
   insvoto.style.color = 'black';
   insvoto.value = '';
   insvoto.readOnly = false;
  },2000);
  insvoto.style.color = 'red';
  insvoto.value = 'Invalido';
  insvoto.readOnly = true;
 }
 else if(a.indexOf(',')!=-1)
 a=a.replace(/,/,'.');
 if(b.value != '' && !/^[0-9,]+$/.test(b))
 {
  setTimeout(() => {
   inspercentuale.style.color = 'black';
   inspercentuale.value = '';
   inspercentuale.readOnly = false;
  },2000);
  inspercentuale.style.color = 'red';
  inspercentuale.value = 'Invalido';
  inspercentuale.readOnly = true;
 }
 else if(b.indexOf(',')!=-1)
 b=b.replace(/,/,'.');
 a=parseFloat(a);
 b=parseFloat(b);
 if(isNaN(b))
 b=100;
 if((a>0 && a<=10) && (b>0 && b<=100))
 {
  if(b!=100)
  operazione.value += a+ ' - (' + b + '%) + ';
  else
  operazione.value += a+ ' + ';
  autoResize();
  operazione.scrollTop = operazione.scrollHeight;
  c_media=(a*b)+c_media;
  d_media=d_media+b;
  risultato5.textContent = +(c_media/d_media).toFixed(2);
  insvoto.value = '';
  inspercentuale.value = '';
 }
 else if(a<=0 || a>10)
 {
  setTimeout(() => {
   insvoto.style.color = 'black';
   insvoto.value = '';
   insvoto.readOnly = false;
  },2000);
  insvoto.style.color = 'red';
  insvoto.value = 'Invalido';
  insvoto.readOnly = true;
 }
 else if(b<=0 || b>100)
 {
  setTimeout(() => {
   inspercentuale.style.color = 'black';
   inspercentuale.value = '';
   inspercentuale.readOnly = false;
  },2000);
  inspercentuale.style.color = 'red';
  inspercentuale.value = 'Invalido';
  inspercentuale.readOnly = true;
 }
}
var operazione = document.getElementById('operazione');

function autoResize() {
  operazione.style.height = 'auto';
  operazione.style.height = operazione.scrollHeight + 'px';

  var maxHeight = vwToPx(50);

  if (operazione.scrollHeight >= maxHeight) {
    operazione.style.height = maxHeight + 'px';
    operazione.style.overflowY = 'auto';
    operazione.scrollTop = operazione.scrollHeight;
  } else {
    operazione.style.overflowY = 'hidden';
  }
}

function vwToPx(vw) {
  return window.innerWidth * (vw / 100);
}

function showCalcBMI()
{
 if(bmidiv.style.display == 'none' || bmidiv.style.display == '')
 {
  altrodiv.style.display = 'none';
  bmidiv.style.display = 'block';
 }
 else
 {
  altrodiv.style.display = 'block';
  bmidiv.style.display = 'none';
 }
}
function calcBMI(m,h)
{
 if(m.indexOf(',')!=-1)
 m = m.replace(/,/g, '.');
 if(h.indexOf(',')!=-1)
 h = h.replace(/,/g, '.');
 if(/^[0-9.]+$/.test(m) && /^[0-9.]+$/.test(h))
 {
  m=parseFloat(m);
  h=parseFloat(h);
  if(m<=0 && h<=0)
  {
   setTimeout(() => {
    insmassa.style.color = 'black';
    insaltezza.style.color = 'black';
    insmassa.value = '';
    insaltezza.value = '';
    insmassa.readOnly = false;
    insaltezza.readOnly = false;
   },2000);
   insmassa.style.color = 'red';
   insaltezza.style.color = 'red';
   insmassa.value = 'Invalido';
   insaltezza.value = 'Invalido';
   insmassa.readOnly = true;
   insaltezza.readOnly = true;
  }
  else if(m<=0)
  {
   setTimeout(() => {
    insmassa.style.color = 'black';
    insmassa.value = '';
    insmassa.readOnly = false;
   },2000);
   insmassa.style.color = 'red';
   insmassa.value = 'Invalido';
   insmassa.readOnly = true;
  }
  else if(h<=0)
  {
   setTimeout(() => {
    insaltezza.style.color = 'black';
    insaltezza.value = '';
    insaltezza.readOnly = false;
   },2000);
   insaltezza.style.color = 'red';
   insaltezza.value = 'Invalido';
   insaltezza.readOnly = true;
  }
  else
  risultato6.textContent = (m/(h*h)).toFixed(4);
 }
 else
 {
  setTimeout(() => {
   insmassa.style.color = 'black';
   insaltezza.style.color = 'black';
   insmassa.value = '';
   insaltezza.value = '';
   insmassa.readOnly = false;
   insaltezza.readOnly = false;
  },2000);
  insmassa.style.color = 'red';
  insaltezza.style.color = 'red';
  insmassa.value = 'Invalido';
  insaltezza.value = 'Invalido';
  insmassa.readOnly = true;
  insaltezza.readOnly = true;
 }
}

var parameters_request=false;
function showPasswordAdvises()
{
 if(migliorapassword.style.display == 'none' || migliorapassword.style.display == '')
 {
  sicurezzapasswordDiv.style.display= 'none';
  migliorapassword.style.display = 'block';
 }
 else
 {
  sicurezzapasswordDiv.style.display= 'block';
  migliorapassword.style.display = 'none';
 }
}
function showPasswordContents()
{
 if(contenutigenerici.style.display == 'none' || contenutigenerici.style.display == '')
 contenutigenerici.style.display = 'block';
 else
 contenutigenerici.style.display = 'none';
}
function changeTypePassword()
{
 if(inspassword.type == 'password')
 {
  barravedi.style.display = 'block';
  inspassword.type = 'text';
 }
 else
 {
  barravedi.style.display = 'none';
  inspassword.type = 'password';
 }
}
function checkPasswordParameters(code)
{
 var i,U_case=0,L_case=0,numbersPassword=0,e,chars=0;
 var specialCharacters=[
  '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
  '-', '_', '=', '+', '[', ']', '{', '}', ';', ':',
  "'", '"', ',', '<', '>', '.', '?', '/', '|', '\\',
  '`', '~'
 ];
 for(i=0;i<code.length;i++)
 {
  if(code[i]>='A' && code[i]<='Z')
  U_case++;
  else if(code[i]>='a' && code[i]<='z')
  L_case++;
  else if(code[i]>='0' && code[i]<='9')
  numbersPassword++;
  else
  {
   for(e=0;e<specialCharacters.length;e++)
   {
    if(code[i]==specialCharacters[e])
    chars++;
   }
  }
 }
 var result=0;
 if(U_case>0)
 result+=26;
 if(L_case>0)
 result+=26;
 if(numbersPassword>0)
 result+=10;
 if(chars>0)
 result+=32;
 if(parameters_request==false)
 return(calculatePasswordEntrophy(result));
 return[U_case,numbersPassword,chars];
}
function calculatePasswordEntrophy(result)
{
 var entrophy,passwordLength=inspassword.value.length;
 entrophy=passwordLength*Math.log2(result);
 return(entrophy);
}
function verifyPasswordSicurity()
{
 parameters_request=false;
 risultatoS.innerHTML = '';
 if(inspassword.value == '')
 return;
 var resultColors=['#ff3333','#ffa500','#ffff00','#00ff00'];
 var results=[25,50,75];
 var sicurity=checkPasswordParameters(inspassword.value);
 var i=2,setColor=resultColors[0];
 var percentage=(sicurity/60)*100;
 if(percentage>results[i])
 setColor=resultColors[i+1];
 else
 {
  for(i=0;i<resultColors.length-1;i++)
  {
   if(percentage>=results[i])
   setColor=resultColors[i+1];
  }
 }
 var sicurityBtn = document.createElement('div');
 sicurityBtn.style.position = 'relative';
 sicurityBtn.style.right = '18vw';
 sicurityBtn.style.width = '40vw';
 sicurityBtn.style.height = '15vw';
 sicurityBtn.style.border = '0.5vw solid black';
 sicurityBtn.style.borderRadius = '2vw';
 sicurityBtn.style.backgroundColor = setColor;
 sicurityBtn.style.fontSize = '10vw';
 sicurityBtn.style.fontWeight = 'bold';
 sicurityBtn.style.display = 'flex';
 sicurityBtn.style.alignItems = 'center';
 sicurityBtn.style.justifyContent = 'center';
 sicurityBtn.textContent = Math.round(sicurity) + ' bit';
 risultatoS.appendChild(sicurityBtn);
 var better=document.createElement('button');
 better.style.position = 'absolute';
 better.style.top = '25vw';
 better.style.right = '37vw';
 better.style.width = '38vw';
 better.style.height = '16vw';
 better.style.border = '0.5vw solid black';
 better.style.borderRadius = '2vw';
 better.style.color = 'white';
 better.style.backgroundColor = '#4285f4';
 better.style.fontSize = '4.5vw';
 better.style.fontWeight = 'bold';
 better.textContent = 'COME MIGLIORARLA';
 var contents=document.createElement('button');
 contents.style.position = 'absolute';
 contents.style.top = '25vw';
 contents.style.left = '5vw';
 contents.style.width = '38vw';
 contents.style.height = '16vw';
 contents.style.border = '0.5vw solid black';
 contents.style.borderRadius = '2vw';
 contents.style.color = 'white';
 contents.style.backgroundColor = '#374151';
 contents.style.fontSize = '4.5vw';
 contents.style.fontWeight = 'bold';
 contents.textContent = 'CONTENUTI GENERICI';
 risultatoS.appendChild(better);
 risultatoS.appendChild(contents);
 better.addEventListener("click", function() {
  showPasswordAdvises();
  createAdviseElements(sicurity);
 });
 contents.addEventListener("click", function() {
  showPasswordContents();
  createGeneralContents();
 });
 var cracking=document.createElement('div');
 cracking.style.position = 'absolute';
 cracking.style.top = '48vw';
 cracking.style.right = '8vw';
 cracking.style.width = '60vw';
 cracking.style.color = 'black';
 cracking.style.backgroundColor = 'transparent';
 cracking.style.fontSize = '4vw';
 cracking.style.fontWeight = 'bold';
 var fullText = estimatedTimeCrack();
 var parts = fullText.split('<br>');
 var title = document.createElement('div');
 title.textContent = parts[0];
 title.style.textAlign = 'left';
 var details = document.createElement('div');
 details.innerHTML = parts.slice(1).join('<br>');
 details.style.textAlign = 'left';
 cracking.innerHTML = '';
 cracking.appendChild(title);
 cracking.appendChild(details);
 cracking.style.margin = '0 auto';
 sicurezzapasswordDiv.style.height = '155vw';
 risultatoS.appendChild(cracking);
}
function createAdviseElements(bits)
{
 parameters_request=true;
 var [U_case,numbersPassword,chars]=checkPasswordParameters(inspassword.value);
 risultatoC_P.innerHTML = '';
 if(U_case>0 && numbersPassword>0 && chars>0)
 {
  if(bits>70)
  {
   risultatoC_P.style.color = 'blue';
   risultatoC_P.style.fontWeight = 'bold';
   risultatoC_P.innerHTML = 'Miglioramenti non necessari';
   return;
  }
  else
  {
   risultatoC_P.style.color = 'black';
   risultatoC_P.style.fontWeight = 'normal';
   risultatoC_P.innerHTML  += 'Aumenta il numero di caratteri<br><br>';
   risultatoC_P.innerHTML  += 'Aumenta la quantità di numeri e di caratteri speciali (es. &, @...)';
  }
 }
 else
 {
  risultatoC_P.style.color = 'black';
  risultatoC_P.style.fontWeight = 'normal';
  if(inspassword.value.length<8)
  risultatoC_P.innerHTML  += 'Troppo corta - Min. 8 caratteri<br><br>';
  if(U_case==0)
  risultatoC_P.innerHTML  += 'Maiuscole assenti - Min. 1 maiuscola<br><br>';
  if(numbersPassword==0)
  risultatoC_P.innerHTML  += 'Numeri assenti - Min. 1 numero<br><br>';
  if(chars==0)
  risultatoC_P.innerHTML  += 'Caratteri speciali assenti - Min. 1 carattere speciale (es. $,@...)';
 }
}
function createGeneralContents()
{
 parameters_request=true;
 var [U_case,numbersPassword,chars]=checkPasswordParameters(inspassword.value);
 risultatoCG_P.innerHTML = '';
 risultatoCG_P.innerHTML += 'Le password più sicure generalmente sono di almeno 12 caratteri<br>';
 if(inspassword.value.length>=12)
 risultatoCG_P.innerHTML += 'La tua password è ottima rispetto al numero di caratteri<br><br>';
 else if(inspassword.value.length<12)
 risultatoCG_P.innerHTML += 'La tua password ha una lunghezza accettabile, comunque, per maggiore sicurezza, cerca di portarla ad almeno 12 caratteri<br><br>';
 else
 risultatoCG_P.innerHTML += 'La tua password è troppo corta<br><br>';
 risultatoCG_P.innerHTML += 'Le password più sicure generalmente possiedono almeno 1/2 caratteri maiuscoli<br>';
 if(U_case==0)
 risultatoCG_P.innerHTML += 'La tua password non è sicura poichè non contiene caratteri maiuscoli<br><br>';
 else if(U_case==1)
 risultatoCG_P.innerHTML += 'La tua password è accettabile poichè contiene 1 carattere maiuscolo<br><br>';
 else
 risultatoCG_P.innerHTML += 'La tua password è ottima poichè contiene almeno 2 caratteri maiuscoli<br><br>';
 risultatoCG_P.innerHTML += 'Le password più sicure generalmente possiedono almeno 1/2 caratteri numerici<br>';
 if(numbersPassword==0)
 risultatoCG_P.innerHTML += 'La tua password non è sicura poichè non contiene caratteri numerici<br><br>';
 else if(numbersPassword==1)
 risultatoCG_P.innerHTML += 'La tua password è accettabile poichè contiene 1 carattere numerico<br><br>';
 else
 risultatoCG_P.innerHTML += 'La tua password è ottima poichè contiene almeno 2 caratteri numerici<br><br>';
 risultatoCG_P.innerHTML += 'Le password più sicure generalmente possiedono almeno 1/2 caratteri speciali<br>';
 if(chars==0)
 risultatoCG_P.innerHTML += 'La tua password non è sicura poichè non contiene caratteri speciali<br><br>';
 else if(chars==1)
 risultatoCG_P.innerHTML += 'La tua password è accettabile poichè contiene 1 carattere speciale<br><br>';
 else
 risultatoCG_P.innerHTML += 'La tua password è ottima poichè contiene almeno 2 caratteri speciali<br><br>';
 risultatoCG_P.innerHTML += '<br><br>';
}
function transformNumberInTime(a)
{
 var years=Math.floor(a/31536000);
   a=a%31536000;
   var days=Math.floor(a/86400);
   a=a%86400;
   var hours=Math.floor(a/3600);
   a=a%3600;
   var minutes=Math.floor(a/60);
   var seconds=a%60;
 return[years,days,hours,minutes,seconds];
}
function writeTimeTransformation(time)
{
 var i;
 var timeParameters=transformNumberInTime(time);
 var plural=[' anni',' giorni',' ore',' minuti',' secondi'];
 var singolar=[' anno',' giorno',' ora',' minuto',' secondo'];
 var [years,days,hours,minutes,seconds]=timeParameters;
 var answer='';
 if(years>1e12)
 answer='Praticamente inviolabile';
 else if(years>1e9)
 answer='Oltre un miliardo di anni';
 else if(years>1e6)
 answer='Oltre un milione di anni';
 else if(years>1e3)
 answer='Oltre un migliaio di anni';
 else
 {
  for(i=0;i<timeParameters.length;i++)
  {
   if(timeParameters[i] && timeParameters[i]!=0)
   {
    if(timeParameters[i]>1)
    answer+=timeParameters[i]+plural[i]+ '<br>';
    else
    answer+=timeParameters[i]+singolar[i]+ '<br>';
   }
  }
 }
 return(answer);
}
function estimatedTimeCrack()
{
 parameters_request=false;
 var entrophy=checkPasswordParameters(inspassword.value);
 var attempts=1e9;
 var estimatedTime=Math.floor(Math.pow(2,entrophy)/(2*attempts));
 if(estimatedTime==0)
 return('Stima violazione password:<br>Meno di un secondo');
 return('Stima violazione password:<br>' +writeTimeTransformation(estimatedTime));
}

function showDistanceButtons()
{
 if(daoggi.style.display == 'none' || daoggi.style.display == '')
 {
  doubleDate=true;
  duedate.style.display = 'none';
  daoggi.style.display = 'block';
  datadue.style.display = 'none';
 }
 else
 {
  doubleDate=false;
  daoggi.style.display = 'none';
  duedate.style.display = 'block';
  datadue.style.display = 'block';
 }
}


function onlyNumbers(input)
{
 input.addEventListener("keypress", function(e) {
  if(e.charCode<48 || e.charCode>57)
  e.preventDefault();
 });
 input.addEventListener("input", function() {
  this.value = this.value.replace(/[^0-9]/g, '');
 });
}
function autoNext(current, next, maxLength) {
 current.addEventListener("input", function() {
  if(this.value.length >= maxLength)
  next.focus();
 });
}
var days_months=[31,28,31,30,31,30,31,31,30,31,30,31];
function calculateDistance(g,m)
{
 var i,days=g;
 for(i=0;i<m-1;i++)
 days+=days_months[i];
 return(days);
}
function checkLeapYear(y)
{
 var year;
 if(((y%4)==0 && (y%100)!=0) || ((y%400)==0))
 year=366;
 else
 year=365;
 return(year);
}
function effectuateCalculation()
{
 var day1=parseInt(insgiornouno.value);
 var month1=parseInt(insmeseuno.value);
 var year1=parseInt(insannouno.value);
 if(daoggi.style.display == 'block')
 {
  if(!day1 || !month1 || !year1)
  {
   risultatoDist.style.color = 'red';
   risultatoDist.textContent = 'Parametri non validi';
   return;
  }
  if(month1<=0 || month1>12)
  {
   risultatoDist.style.color = 'red';
   risultatoDist.textContent = 'Parametri non validi';
   return;
  }
  if(day1<=0 || day1>days_months[month1-1])
  {
   risultatoDist.style.color = 'red';
   risultatoDist.textContent = 'Parametri non validi';
   return;
  }
 }
 if(duedate.style.display == 'block')
 {
 var day2=parseInt(insgiornodue.value);
 var month2=parseInt(insmesedue.value);
 var year2=parseInt(insannodue.value);
  if(!day2 || !month2 || !year2)
  {
   risultatoDist.style.color = 'red';
   risultatoDist.textContent = 'Parametri non validi';
   return;
  }
  if(month2<=0 || month2>12)
  {
   risultatoDist.style.color = 'red';
   risultatoDist.textContent = 'Parametri non validi';
   return;
  }
  if(day2<=0 || day2>days_months[month2-1])
  {
   risultatoDist.style.color = 'red';
   risultatoDist.textContent = 'Parametri non validi';
   return;
  }
  var userDate1=calculateDistance(day1,month1);
  var userDate2=calculateDistance(day2,month2);
  var result;
  if(year1!=year2)
  {
   if(year1>year2)
   result = (checkLeapYear(year2)-userDate2)+userDate1+calculateDifferentYear(year1,year2);
   else
   result = (checkLeapYear(year1)-userDate1)+userDate2+calculateDifferentYear(year2,year1);
  }
  else
  {
   if(userDate1>userDate2)
   result=userDate1-userDate2;
   else
   result=userDate2-userDate1;
  }
 }
 else
 {
  var today = new Date();
  var day = today.getDate();
  var monthDay = today.getMonth() + 1;
  var realTimeYear = today.getFullYear();
  var userDate1 = calculateDistance(day1,month1);
  var userDate2 = calculateDistance(day,monthDay);
  var result=0;
  if(year1<realTimeYear)
  {
   result += checkLeapYear(year1)-userDate1;
   var i;
   for(i=year1+1;i<realTimeYear;i++)
   result += checkLeapYear(i);
   result += userDate2;
  }
  else if(year1>realTimeYear)
  {
   result += checkLeapYear(realTimeYear)-userDate2;
   var i;
   for(i=realTimeYear+1;i<year1;i++)
   result += checkLeapYear(i);
   result += userDate1;
  }
  else
  {
   if(userDate1>userDate2)
   result = userDate1-userDate2;
   else
   result = userDate2-userDate1;
  }
 }
 if(result>1e4)
 result=result.toExponential(0);
 risultatoDist.textContent = result+ ' giorn';
 if(result==1)
 risultatoDist.textContent += 'o';
 else
 risultatoDist.textContent += 'i';
}
function calculateDifferentYear(year1,year2)
{
 var i,days=0;
 for(i=year1-1;i>=year2+1;i--)
 days+=checkLeapYear(i);
 return(days);
}

var firstButton=null;

var tzFirst = "Europe/Rome";
var tzSecond = "Europe/Athens";


function getActualTime(timeZone) {
  var now = new Date();
  var parts = new Intl.DateTimeFormat("it-IT", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(now);

  var hours = parts.find(p => p.type == "hour").value;
  var minutes = parts.find(p => p.type == "minute").value;
  var seconds = parts.find(p => p.type == "second").value;

  return `${hours}:${minutes}:${seconds}`;
}


function getOffsetMinutes(timeZone) {
  var now = new Date();


  var formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour12: false,
  });

  var parts = formatter.formatToParts(now);
  var tzPart = parts.find(p => p.type == "timeZoneName");
  if (!tzPart) return 0;

  var match = tzPart.value.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!match) return 0;

  var sign = match[1] == "+" ? 1 : -1;
  var hours = parseInt(match[2], 10);
  var minutes = match[3] ? parseInt(match[3], 10) : 0;

  return sign * (hours * 60 + minutes);
}


function getHoursDifference(tz1, tz2) {
  var offset1 = getOffsetMinutes(tz1);
  var offset2 = getOffsetMinutes(tz2);

  var diffMinutes = offset2 - offset1;
  var diffHours = diffMinutes / 60;
 if(diffHours==1)
 return Math.abs(diffHours) + " ora";
  return Math.abs(diffHours) + " ore";
}


function updateTimesUI() {
  document.getElementById("risultatoOrario_Attuale").textContent = getActualTime(tzFirst);
  document.getElementById("risultatoOrario_Paese").textContent = getActualTime(tzSecond);

  document.getElementById("risultatoPaese").textContent = getHoursDifference(tzFirst, tzSecond);
}


setInterval(updateTimesUI, 1000);
updateTimesUI();


function chooseCity(btn) {
  var cityName = btn.childNodes[0].nodeValue?.trim() || btn.innerText;

  cityName = cityName
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  var cityNameBtn =
    (cityName.length > 8 ? cityName.substring(0, 8) + "..." : cityName).toUpperCase();

  var timezone = btn.dataset.tz;

  
  if (firstButton == true) {
    tzFirst = timezone;

    document.getElementById("primacitta").innerHTML = cityNameBtn;
    document.getElementById("primo_orario").textContent = "Orario " + cityName;
  } else {
    tzSecond = timezone;

    document.getElementById("secondacitta").innerHTML = cityNameBtn;
    document.getElementById("secondo_orario").textContent = "Orario " + cityName;
  }

  cittadiv.style.display = 'none';
}

function getOffsetMinutes(timeZone) {
  var now = new Date();

  var tzDate = new Date(now.toLocaleString("en-US", { timeZone }));
  var localDate = new Date(now.toLocaleString("en-US"));

  return (tzDate - localDate) / (1000 * 60);
}


function showJetLag() {
 if(fusoorariodiv.style.display == 'none' || fusoorariodiv.style.display == '') {
  altrodiv.style.display = 'none';
  fusoorariodiv.style.display = 'block';
 } else {
  altrodiv.style.display = 'block'; 
  fusoorariodiv.style.display = 'none';
 }
}


function openCityDiv() {
 if(cittadiv.style.display == 'none' || cittadiv.style.display == '')
  cittadiv.style.display = 'block';
 else
  cittadiv.style.display = 'none';
}










/*
Base:
Percentuale di N --> 15%(80)
N da percentuale --> 30/(20%)
Percentuale tra 2 N --> "In una classe di 25 persone, 5 portano gli occhiali. Che percentuale sono?" %? 100(5/25)
Variazioni:
Aumento --> 200 + 10%(200) per 10% di 200 senno 200 + 10% per 200 + 0.1
diminuizione --> uguale ad aumento
Variazione percentuale --> |100[(x-y)/y]|
*/

//Finanza
/**
 * --- CALCOLO 1: SCONTO ---
 * SCOPO: Determinare il risparmio effettivo e il prezzo finale.
 * INPUT: (1) Prezzo originale, (2) Percentuale di sconto.
 * FORMULA: Risparmio = (Prezzo * Percentuale) / 100.
 * ESEMPIO: 100€ con sconto 20% -> Risparmio 20€, Finale 80€.
 */

/**
 * --- CALCOLO 2: VARIAZIONE PERCENTUALE ---
 * SCOPO: Analizzare la crescita o il calo tra due valori nel tempo.
 * INPUT: (1) Valore Iniziale, (2) Valore Finale.
 * FORMULA: % = ((Finale - Iniziale) / Iniziale) * 100.
 * ESEMPIO: Da 50€ a 75€ -> Variazione del +50%.
 */

/**
 * --- CALCOLO 3: INCIDENZA PERCENTUALE ---
 * SCOPO: Capire quanto pesa una parte rispetto al totale (quota).
 * INPUT: (1) Valore Parziale, (2) Valore Totale.
 * FORMULA: % = (Parte / Totale) * 100.
 * ESEMPIO: 20€ di spesa su 100€ totali -> Incidenza del 20%.
 */


//Analisi
// errore percentuale (differenza assoluta rispetto al valore vero) '|N-n|/N%'  
// errore percentuale con segno (indica sovra/sottostima) '(n-N)/N%'    
// variazione percentuale tra valore iniziale e finale '(F-I)/I%' 



//Vedere se inserire le parti commentati che seguono




var characterCounter=0;
var values1='',values2=''; //Variabile che dovrà prendere il valore del valore inserito dall'utente inizialmente
var modeArray=['base','variations','finance','analysis','utility'];
var percentageMode='base';
var suggested=false;
var selectedButton; //Variabile per capire quale bottone è stato selezionato

function writeOnPercentage(val)
{
 if((suggested==false && values1.length >= 12) || values2.length >= 12)
 return;
 backspacepercentuale.disabled = false;
 if(val==',')
 {
  val='.';
  if(percentualitext.value.indexOf('.')!=-1 || percentualitext.value.length < 1 || percentualitext.value == 'N = ')
  return;
  percentualitext.value += val;
  if(suggested==true)
  {
   values2+=val;
   suggerimenti.innerHTML = '';
   if(values1.length > 6)
   suggerimenti.style.fontSize = '3.5vw';
   if(percentageMode=='base')
   {
    var calculationShape=[values2+ '%(' +values1+ ')',values2+ '/(' +values1+ '%)',values1+ '/(' +values2+ '%)'];
    suggerimenti.textContent = calculationShape[selectedButton];
   }
   else if(percentageMode=='variations')
   {
    var calculationShape=['+','-','x','÷'];
    suggerimenti.textContent = values1 + calculationShape[selectedButton]+ '(' +values2+ '%)';
   }
   else if(percentageMode=='finance')
   {
    var calculationShape=[values1+ 'x(' +values2+ '%)/100','(' +values1+ '/' +values2+ '-1)%','(' +values1+ '/' +values2+ ')%'];
    suggerimenti.textContent = calculationShape[selectedButton];
   }
   else if(percentageMode=='analysis')
   {
    var calculationShape=['|' +values1+ '-' +values2+ '|/' +values1+ '%','(' +values2+ '-' +values1+ ')/' +values1+ '%','(' +values2+ '-' +values1+ ')/' +values1+ '%'];
    suggerimenti.textContent = calculationShape[selectedButton];
   }
  }
  else
  values1+=val;
  spacepercentuale.disabled = true;
 }
 else if(val=='0')
 {
  if(percentualitext.value == '0')
  return;
  percentualitext.value += val;
  if(suggested==true)
  {
   values2+=val;
   suggerimenti.innerHTML = '';
   if(values1.length > 6)
   suggerimenti.style.fontSize = '3.5vw';
   if(percentageMode=='base')
   {
    var calculationShape=[values2+ '%(' +values1+ ')',values2+ '/(' +values1+ '%)',values1+ '/(' +values2+ '%)'];
    suggerimenti.textContent = calculationShape[selectedButton];
   }
   else if(percentageMode=='variations')
   {
    var calculationShape=['+','-','x','÷'];
    suggerimenti.textContent = values1 + calculationShape[selectedButton]+ '(' +values2+ '%)';
   }
   else if(percentageMode=='finance')
   {
    var calculationShape=[values1+ 'x(' +values2+ '%)/100','(' +values1+ '/' +values2+ '-1)%','(' +values1+ '/' +values2+ ')%'];
    suggerimenti.textContent = calculationShape[selectedButton];
   }
   else if(percentageMode=='analysis')
   {
    var calculationShape=['|' +values1+ '-' +values2+ '|/' +values1+ '%','(' +values2+ '-' +values1+ ')/' +values1+ '%','(' +values2+ '-' +values1+ ')/' +values1+ '%'];
    suggerimenti.textContent = calculationShape[selectedButton];
   }
  }
  else
  values1+=val;
  spacepercentuale.disabled = false;
 }
 else
 {
  if(percentualitext.value == '0')
  percentualitext.value = '';
  percentualitext.value += val;
  if(suggested==true)
  {
   values2+=val;
   suggerimenti.innerHTML = '';
   if(values1.length > 6)
   suggerimenti.style.fontSize = '3.5vw';
   if(percentageMode=='base')
   {
    var calculationShape=[values2+ '%(' +values1+ ')',values2+ '/(' +values1+ '%)',values1+ '/(' +values2+ '%)'];
    suggerimenti.textContent = calculationShape[selectedButton];
   }
   else if(percentageMode=='variations')
   {
    var calculationShape=['+','-','x','÷'];
    suggerimenti.textContent = values1 + calculationShape[selectedButton]+ '(' +values2+ '%)';
   }
   else if(percentageMode=='finance')
   {
    var calculationShape=[values1+ 'x(' +values2+ '%)/100','(' +values1+ '/' +values2+ '-1)%','(' +values1+ '/' +values2+ ')%'];
    suggerimenti.textContent = calculationShape[selectedButton];
   }
   else if(percentageMode=='analysis')
   {
    var calculationShape=['|' +values1+ '-' +values2+ '|/' +values1+ '%','(' +values2+ '-' +values1+ ')/' +values1+ '%','(' +values2+ '-' +values1+ ')/' +values1+ '%'];
    suggerimenti.textContent = calculationShape[selectedButton];
   }
  }
  else
  values1+=val;
  spacepercentuale.disabled = false;
 }
 if(percentualitext.value != '')
 {
  metodo.disabled = true;
  predefinitoBtn.disabled = true;
 }
}

function preceedPercentageValues()
{
 if(spacepercentuale.value == '=')
 {
  disableAllExceptCanc();
  var result;
  if(percentageMode=='base')
  {
   if(selectedButton==0)
   result = (values1*values2)/100;
   else if(selectedButton==1)
   result = (values1*100)/values2;
   else if(selectedButton==2)
   result = (values2*100)/values1;
  }
  else if(percentageMode=='variations')
  {
   if(selectedButton==0)
   result = Number(values1+((values1*values2)/100));
   else if(selectedButton==1)
   result = Number(values1-((values1*values2)/100));
   else if(selectedButton==2)
   result = values1*(values2/100);
   else if(selectedButton==3)
   result = values1*(values2/100);
  }
  else if(percentageMode=='finance')
  {
   if(selectedButton==0)
   result = (values1*values2)/100;
   else if(selectedButton==1)
   result = (values1/values2-1)*100;
   else if (selectedButton == 2) 
   result = (values1/values2)*100;
  }
  else if(percentageMode=='analysis')
  {
   if(values2==0)
   {
    result = 0; 
    return;
   }
   if(selectedButton==0)
   result = (Math.abs(values2-values1)/values2)*100;
   else if(selectedButton==1)
   result = ((values1-values2)/values2)*100;
   else if(selectedButton==2)
   result = ((values1-values2)/values2)*100;
  }
  calcoloselezionato.style.display = 'none';
  percentualitext.style.width = '72vw';
  percentualitext.style.fontWeight = 'bold';
  percentualitext.value = 'Risultato: ' +result.toFixed(3);
 }
 spacepercentuale.disabled = true;
 if(suggested==false)
 {
  suggested=true;
  showSuggestions(percentualitext.value);
  disableAllExceptCanc();
  percentualitext.value = 'Scegli calcolo...';
 }
}
function disableAllExceptCanc()
{
 var buttons = document.querySelectorAll('#percentualidiv input[type="button"]');
 buttons.forEach(btn => {
  if(btn.value == 'C' || btn.value == '❌')
  btn.disabled = false;
  else
  btn.disabled = true;
 });
}
function enableAllButtons()
{
 var buttons = document.querySelectorAll('#percentualidiv input[type="button"]');
 buttons.forEach(btn => {
  btn.disabled = false;
 });
}
function showSuggestions(n)
{
 suggerimenti.innerHTML = '';
 var suggestionData;
 if(percentageMode=='base')
 {
  n=selectFirstNumbers(n,3);
  suggestionData=['N%(' +n+ ')','N/(' +n+ '%)',n+ '/(N%)'];
 }
 else if(percentageMode=='variations')
 {
  n=selectFirstNumbers(n,5);
  suggestionData=['+(N%)','-(N%)','x(N%)','÷(N%)'];
 }
 else if(percentageMode=='finance')
 {
  n=(n/100).toFixed(3);
  suggestionData=[n+ 'xN%','(' +n+ '/N-1)%','(' +n+ '/N)%'];
 }
 else if(percentageMode=='analysis')
 {
  n=selectFirstNumbers(n,3);
  suggestionData=['|N-' +n+ '|/N%','(' +n+ '-N)/N%','(' +n+ '-I)/I%'];
 }
 createSuggestions(suggestionData.length,suggestionData);
}

function selectFirstNumbers(num,val) //Il primo valore è il numero il secondo è il valore di cifre
{
 if(num.length <= val)
 return(num);
 num = num.toString();
 num = num.substr(0,val);
 return(num+ '...');
}

function createSuggestions(n,arr)
{
 var i;
 for(i=0;i<n;i++)
 {
  var sugg = document.createElement('button');
  sugg.id = 'base' +i;
  sugg.dataset.index = i;
  sugg.style.width = 'auto';
  sugg.style.height = '10vw';
  sugg.style.fontSize = '3.2vw';
  sugg.style.fontWeight = 'bold';
  sugg.style.backgroundColor = '#d6eeff';
  sugg.style.margin = '1vw';
  sugg.style.border = 'none';
  sugg.style.borderRadius = '2vw';
  sugg.textContent = arr[i];
  sugg.onclick = function()
  {
   spacepercentuale.textContent = '=';
   selectedButton=parseInt(this.dataset.index);
   setCalculationByMode();
   calcoloselezionato.value = arr[selectedButton];
  };
  suggerimenti.appendChild(sugg);
 }
}


function percentageBackSpace()
{
 if(suggested==false)
 {
  percentualitext.value = percentualitext.value.slice(0,-1);
  values1 = percentualitext.value;
  if(percentualitext.value == '-' || percentualitext.value == '-0')
  {
   values1='';
   percentualitext.value = '';
  }
  if(percentualitext.value == '' || percentualitext.value.substr(percentualitext.value.length-1,1)=='.')
  spacepercentuale.disabled = true;
  else if(percentualitext.value.indexOf('.')==-1)
  spacepercentuale.disabled = false;
 }
 else if(values2.length > 0)
 {
  percentualitext.value = percentualitext.value.slice(0,-1);
  if(percentualitext.value == 'N = ' || percentualitext.value.substr(percentualitext.value.length-1,1)=='.')
  spacepercentuale.disabled = true;
  if(percentualitext.value.indexOf('.')==-1)
  spacepercentuale.disabled = false;
  values2 = values2.slice(0,-1);
  if(values2=='-' || values2=='-0')
  {
   values2='';
   percentualitext.value = 'N = ';
  }
  if(values2.length == 0)
  spacepercentuale.disabled = true;
  suggerimenti.innerHTML = '';
  if(values1.length > 6)
  suggerimenti.style.fontSize = '3.5vw';
  if(percentageMode=='base')
  {
   var calculationShape=[values2+ '%(' +values1+ ')',values2+ '/(' +values1+ '%)',values1+ '/(' +values2+ '%)'];
   suggerimenti.textContent = calculationShape[selectedButton];
  }
  else if(percentageMode=='variations')
  {
   var calculationShape=['+','-','x','÷'];
   suggerimenti.textContent = values1 + calculationShape[selectedButton]+ '(' +values2+ '%)';
  }
 }
 if(values1 == '' || values2 == '')
 {
  metodo.disabled = false;
  predefinitoBtn.disabled = false;
 }
}

function setCalculationByMode() //Agisce dopo aver cliccato il bottone del calcolo
{
 enableAllButtons();
 spacepercentuale.disabled = true;
 spacepercentuale.value = '=';
 backspacepercentuale.disabled = true;
 if(percentageMode=='base' || percentageMode=='variations' || percentageMode=='finance' || percentageMode=='analysis')
 {
  if(percentageMode=='analysis' && selectedButton==2)
  percentualitext.value = 'I = ';
  else
  percentualitext.value = 'N = ';
  suggerimenti.textContent = 'Calcolo già selezionato';
 }
}

function percentageOppositeNumber()
{
 if(suggested==false && values1!='0' && values1!='')
 {
  if(percentualitext.value.indexOf('-')!=-1)
  {
   var minus = percentualitext.value.indexOf('-');
   values1 = percentualitext.value.substr(minus+1,percentualitext.value.length - minus);
   percentualitext.value = values1;
  }
  else
  {
   values1 = '-' +values1;
   percentualitext.value = values1;  
  } 
 }
 else if(suggested==true && values2!='0' && values2!='')
 {
  if(percentualitext.value.indexOf('-')!=-1)
  {
   var minus = percentualitext.value.indexOf('-');
   values2 = percentualitext.value.substr(minus+1,percentualitext.value.length - minus);
   if(percentageMode=='base' || percentageMode=='variations' || percentageMode=='finance' || percentageMode=='analysis')
   {
    if(percentageMode=='analysis' && selectedButton==2)
    percentualitext.value = 'I = ' +values2;
    else
    percentualitext.value = 'N = ' +values2;
   }
  }
  else
  {
   values2 = '-' +values2;
   if(percentageMode=='base' || percentageMode=='variations' || percentageMode=='finance' || percentageMode=='analysis')
   {
    if(percentageMode=='analysis' && selectedButton==2)
    percentualitext.value = 'I = ' +values2;
    else
    percentualitext.value = 'N = ' +values2;
   }
  }
  if(percentageMode=='base')
  {
    var calculationShape=[values2+ '%(' +values1+ ')',values2+ '/(' +values1+ '%)',values1+ '/(' +values2+ '%)'];
    suggerimenti.textContent = calculationShape[selectedButton];
  }
  else if(percentageMode=='variations')
  {
   var calculationShape=['+','-','x','÷'];
   suggerimenti.textContent = values1 + calculationShape[selectedButton]+ '(' +values2+ '%)';
  }
  else if(percentageMode=='finance')
  {
   var calculationShape=[values1+ 'x(' +values2+ '%)/100','(' +values1+ '/' +values2+ '-1)/%','(' +values1+ '/' +values2+ ')%'];
    suggerimenti.textContent = calculationShape[selectedButton];
  }
  else if(percentageMode=='analysis')
  {
   var calculationShape=['|' +values1+ '-' +values2+ '|/' +values1+ '%','(' +values2+ '-' +values1+ ')/' +values1+ '%','(' +values2+ '-' +values1+ ')/' +values1+ '%'];
   suggerimenti.textContent = calculationShape[selectedButton];
  }
 }
}

function cancPercentageText()
{
 percentualitext.value = '';
 percentualitext.style.fontWeight = 'normal';
 calcoloselezionato.value = '';
 enableAllButtons();
 spacepercentuale.value = '▶';
 spacepercentuale.disabled = true;
 metodo.disabled = false;
 suggerimenti.textContent = 'Suggerimenti non disponibili';
 suggested=false;
 values1='';
 values2='';
 percentualitext.style.width = '45vw';
 calcoloselezionato.value = '';
 percentualitext.style.display = 'inline-block';
 calcoloselezionato.style.display = 'inline-block';
}

function showPercentageModes()
{
 if(metodipercentualediv.style.display == 'none' || metodipercentualediv.style.display == '')
 metodipercentualediv.style.display = 'block';
 else
 metodipercentualediv.style.display = 'none';
}
function explainModesMenu(par)
{
 if(par=='1')
 {
  if(explainbase.style.display == 'none' || explainbase.style.display == '')
  {
   explainbase.style.display = 'block';
   menumetodobase.value = '▲';
  }
  else
  {
   explainbase.style.display = 'none';
   menumetodobase.value = '▼';
  }
 }
 else if(par=='2')
 {
  if(explainvariazioni.style.display == 'none' || explainvariazioni.style.display == '')
  {
   explainvariazioni.style.display = 'block';
   menumetodovariazioni.value = '▲';
  }
  else
  {
   explainvariazioni.style.display = 'none';
   menumetodovariazioni.value = '▼';
  }
 }
}

function showTextParameters(testo,capitolo)
{
 var car=testo.length;
 var spazi=0,numeri=0,words,varters=0,uppers=0,lowers=0,specials=0;
 if(caratteristichetestodiv.style.display == 'none' || caratteristichetestodiv.style.display == '')
 {
  caratteristichetestodiv.style.display = 'block';
  appunti.style.display = 'none';
  if(capitolo.length>15)
  {
   var cap_index,nextCapitolo='';
   for(cap_index=0;cap_index<15;cap_index++)
   nextCapitolo += capitolo[cap_index];
   titolodivappunti.textContent = nextCapitolo+ '...';
  }
  else
  titolodivappunti.textContent = capitolo;
  for(var i=0;i<car;i++)
  {
   if(testo[i]==' ')
   spazi++;
   else if(testo[i]>='A' && testo[i]<='Z')
   {
    varters++;
    uppers++;
   }
   else if(testo[i]>='a' && testo[i]<='z')
   {
    varters++;
    lowers++;
   }
   else if(testo[i]>='0' && testo[i]<='9')
   numeri++;
   else
   specials++;
  }
  words = testo.trim().split(/\s+/).length;
 }
 caratteri.textContent = car;
 spazi_bianchi.textContent = spazi;
 parole.textContent = words;
 cifre.textContent = numeri;
 vartere.textContent = varters;
 maiuscole.textContent = uppers;
 minuscole.textContent = lowers;
 speciali.textContent = specials;
}
function closeTextParameters()
{
 caratteristichetestodiv.style.display = 'none';
 appunti.style.display = 'block';
}

function showModeParameters(capitolo)
{
 if(modalitatestodiv.style.display == 'none' || modalitatestodiv.style.display == '')
 {
  appunti.style.display = 'none';
  modalitatestodiv.style.display = 'block';
  if(capitolo.length>15)
  {
   var cap_index,nextCapitolo='';
   for(cap_index=0;cap_index<15;cap_index++)
   nextCapitolo += capitolo[cap_index];
   titolodivappunti.textContent = nextCapitolo+ '...';
  }
  else
  titolodivappunti.textContent = capitolo;
 }
 else
 {
  appunti.style.display = 'block';
  modalitatestodiv.style.display = 'none';
  activeTextarea = null;
 }
}
var cb1 = document.getElementById('upper');
var cb2 = document.getElementById('lower');
cb1.addEventListener('change', () => {
 if(cb1.checked)
 cb2.checked = false;
});
cb2.addEventListener('change', () => {
 if(cb2.checked)
 cb1.checked = false;
});
function calcModeParameters()
{
 var testo=activeTextarea.value
 if(upper.checked == true)
 testo=testo.toUpperCase();
 if(lower.checked == true)
 testo=testo.toLowerCase();
 if(starterstoupper.checked == true)
 testo = testo.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
 if(removespaces.checked == true)
 {
  var testoNuovo='',i;
  for(i=0;i<testo.length;i++)
  {
   if(testo[i]==' ' && testo[i+1]==' ' && i<testo.length)
   testoNuovo += testo[i].replace(/ /g,'');
   else
   testoNuovo += testo[i];
  }
  testo=testoNuovo;
 }
 if(removebefore.checked == true)
 testo = testo.replace(/\s+([.,:;!?])/g, '$1');
 if(addafter.checked == true)
 testo = testo.replace(/([.,:;!?])(?=\S)/g, '$1 ');
 if(conversione.checked == true)
 {
  testo = testo.replace(/-->/g, '→');
  testo = testo.replace(/<--/g, '←');
  testo = testo.replace(/\.{3}/g, '…');
  testo = testo.replace(/!=/g, '≠');
  testo = testo.replace(/--/g, '—');
  testo = testo.replace(/-->/g, '→').replace(/<--/g, '←').replace(/<->/g, '↔'); 
  
  var frazioni = {
    '1/2':'½','1/3':'⅓','2/3':'⅔','1/4':'¼','3/4':'¾',
    '1/5':'⅕','2/5':'⅖','3/5':'⅗','4/5':'⅘',
    '1/6':'⅙','5/6':'⅚',
    '1/8':'⅛','3/8':'⅜','5/8':'⅝','7/8':'⅞'
  };
  for (var f in frazioni) {
    testo = testo.replace(new RegExp(`\\b${f}\\b`, 'g'), frazioni[f]);
  }


  var apici = {
  '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴',
  '5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
  '-':'⁻','+':'⁺'
};

  testo = testo.replace(/\^\(([-+\d]+)\)/g, (m, g) =>
  g.split('').map(c => apici[c]).join('')
);


testo = testo.replace(/\^([-+]?\d+)/g, (m, e) =>
  e.split('').map(c => apici[c]).join('')
);


  var pedici = {
    '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄',
    '5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'
  };

  testo = testo.replace(/([A-Z][a-z]?)(\d+)/g, (m, el, num) =>
    el + num.split('').map(c => pedici[c] || c).join('')
  );


  testo = testo.replace(/\|(\S)/g, (m, c) => `§§${c.charCodeAt(0)}§§`);
  testo = testo.replace(/§§(\d+)§§/g, (m, c) => String.fromCharCode(c));
} 
 activeTextarea.value = testo;
 modalitatestodiv.style.display = 'none';
 appunti.style.display = 'block';
 salvaNote();
}
function resetParameters()
{
 upper.checked = false;
 lower.checked = false;
 starterstoupper.checked = false;
 removespaces.checked = false;
 removebefore.checked = false;
 addafter.checked = false;
 conversione.checked = false;
}

var style = document.createElement('style');
style.textContent = `
#risdiv::-webkit-scrollbar{
 height: 1vw;
}
#risdiv::-webkit-scrollbar-track{
 background: rgba(0,0,0,0.1);
}
#risdiv::-webkit-scrollbar-thumb{
 background-color: #009400;
 border-radius: 2vw;
 border: 0.1vw solid #000;
}
`;
document.head.appendChild(style);




  var cleanBtn = document.getElementById('clean');
  var pressTimer;
  cleanBtn.addEventListener('mousedown', () => {
    pressTimer = setTimeout(() => {
      cancTris();
    }, 1000);
  });
  cleanBtn.addEventListener('mouseup', () => {
    clearTimeout(pressTimer);
  });
  cleanBtn.addEventListener('mouseleave', () => {
    clearTimeout(pressTimer);
  });
  cleanBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    pressTimer = setTimeout(() => {
      cancTris();
    }, 1000);
  });

  cleanBtn.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
  });

  cleanBtn.addEventListener('touchcancel', () => {
    clearTimeout(pressTimer);
  });
cancTris();

var cleanBtn2 = document.getElementById('cleanhanged');
  var pressTimer2;
  cleanBtn2.addEventListener('mousedown', () => {
    pressTimer2 = setTimeout(() => {
      cancHanged();
    }, 1000);
  });
  cleanBtn2.addEventListener('mouseup', () => {
    clearTimeout(pressTimer2);
  });
  cleanBtn2.addEventListener('mouseleave', () => {
    clearTimeout(pressTimer2);
  });
  cleanBtn2.addEventListener('touchstart', (e) => {
    e.preventDefault();
    pressTimer2 = setTimeout(() => {
      cancHanged();
    }, 1000);
  });

  cleanBtn2.addEventListener('touchend', () => {
    clearTimeout(pressTimer2);
  });

  cleanBtn2.addEventListener('touchcancel', () => {
    clearTimeout(pressTimer2);
  });
cancHanged();
var cleanBtn3 = document.getElementById('cleanhangedfromcaselle');
  var pressTimer3;
  cleanBtn3.addEventListener('mousedown', () => {
    pressTimer3 = setTimeout(() => {
      cancHanged();
    }, 1000);
  });
  cleanBtn3.addEventListener('mouseup', () => {
    clearTimeout(pressTimer3);
  });
  cleanBtn3.addEventListener('mouseleave', () => {
    clearTimeout(pressTimer3);
  });
  cleanBtn3.addEventListener('touchstart', (e) => {
    e.preventDefault();
    pressTimer3 = setTimeout(() => {
      cancHanged();
    }, 1000);
  });

  cleanBtn3.addEventListener('touchend', () => {
    clearTimeout(pressTimer3);
  });

  cleanBtn3.addEventListener('touchcancel', () => {
    clearTimeout(pressTimer3);
  });
cancHanged();

function showPannelloLegale()
{
 if(pannelloLegale.style.display == 'none' || pannelloLegale.style.display == '')
 {
  pannelloImpostazioni.style.display = 'none';
  pannelloLegale.style.display = 'flex';
 }
 else
 {
  pannelloImpostazioni.style.display = 'block';
  pannelloLegale.style.display = 'none';
 }
}

function showConfirmForDelete()
{
 if(confermaDeleteMemory.style.display == 'none' || confermaDeleteMemory.style.display == '')
 {
  pannelloImpostazioni.style.display = 'none';
  confermaDeleteMemory.style.display = 'block';
  sfondoopaco2.style.display = 'block';
 }
 else
 {
  pannelloImpostazioni.style.display = 'block';
  confermaDeleteMemory.style.display = 'none';
  sfondoopaco2.style.display = 'none';
 }
}
function deleteMemory()
{
 localStorage.removeItem('timesList');
 localStorage.removeItem('namesList');
 location.reload();
}

function showSettings()
{
 if(pannelloImpostazioni.style.display == 'none' || pannelloImpostazioni.style.display == '')
 {
  pannelloImpostazioni.style.display = 'block';
  overlayImpostazioni.style.display = 'block';
 }
 else
 {
  pannelloImpostazioni.style.display = 'none';
  overlayImpostazioni.style.display = 'none';
 }
}

let sharedAudioCtx = null;

const playClick = () => {

  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }


  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }

  const oscillator = sharedAudioCtx.createOscillator();
  const gainNode = sharedAudioCtx.createGain();

  oscillator.type = 'sine'; 
  
  oscillator.frequency.setValueAtTime(1400, sharedAudioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1600, sharedAudioCtx.currentTime + 0.03);

  gainNode.gain.setValueAtTime(0.03, sharedAudioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, sharedAudioCtx.currentTime + 0.03);

  oscillator.connect(gainNode);
  gainNode.connect(sharedAudioCtx.destination);

  oscillator.start();
  oscillator.stop(sharedAudioCtx.currentTime + 0.03);
};


var audioCtx = null;
var timerMusica = null; 

const playSoundtrack = () => {

    if (timerMusica !== null) return; 


    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.15, audioCtx.currentTime); 
    masterGain.connect(audioCtx.destination);


    const bpm = 110;
    const noteLength = 60 / bpm / 2;
    const scale = [130.81, 146.83, 164.81, 196.00, 220.00]; 


    const playBass = (time, freq) => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq / 2, time);
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(0.2, time + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, time + noteLength * 2);
        osc.connect(g).connect(masterGain);
        osc.start(time);
        osc.stop(time + noteLength * 2);
    };


    const playSynth = (time, freq) => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 2, time);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2000, time);
        filter.frequency.exponentialRampToValueAtTime(500, time + noteLength);
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(0.1, time + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, time + noteLength);
        osc.connect(filter).connect(g).connect(masterGain);
        osc.start(time);
        osc.stop(time + noteLength);
    };


    let step = 0;
    const sequence = () => {

        if (!audioCtx) return;

        const now = audioCtx.currentTime;
        const lookAhead = 0.1;

        if (step % 4 === 0) playBass(now + lookAhead, scale[0]);

        const randomNote = scale[Math.floor(Math.random() * scale.length)];
        if (step % 2 === 0 || Math.random() > 0.5) {
            playSynth(now + lookAhead, randomNote);
        }

        step++;

        timerMusica = setTimeout(sequence, noteLength * 1000);
    };

    sequence();
};

const stopSoundtrack = () => {

    if (timerMusica) {
        clearTimeout(timerMusica);
        timerMusica = null; 
    }


    if (audioCtx) {
        audioCtx.close().then(() => {
            audioCtx = null;
        });
    }
};













function apriPannello() {
    document.getElementById('overlayAccount').style.display = 'none';
    document.getElementById('pannelloAccount').style.display = 'none';
}


function chiudiPannello() {
 if (!firebase.auth().currentUser) {
  return;
 }
 if (document.getElementById('pannelloAccount')) {
  document.getElementById('pannelloAccount').style.display = 'none';
 }
 if (document.getElementById('overlayAccount')) {
  document.getElementById('overlayAccount').style.display = 'none';
 }
 if (document.getElementById('loaderGlobale')) {
  document.getElementById('loaderGlobale').style.display = 'none';
 }
}




function showPeriodicTable()
{
 if(tavolaperiodicadiv.style.display == 'none' || tavolaperiodicadiv.style.display == '')
 tavolaperiodicadiv.style.display = 'block';
 else
 tavolaperiodicadiv.style.display = 'none';
}
var content;
var atomicMasses = {
  H: 1.008000,
  He: 4.002602,
  Li: 6.940000,
  Be: 9.012183,
  B: 10.810000,
  C: 12.011000,
  N: 14.007000,
  O: 15.999000,
  F: 18.998403,
  Ne: 20.179700,
  Na: 22.989769,
  Mg: 24.305000,
  Al: 26.981538,
  Si: 28.085000,
  P: 30.973762,
  S: 32.060000,
  Cl: 35.450000,
  Ar: 39.949000,
  K: 39.098300,
  Ca: 40.078000,
  Sc: 44.955907,
  Ti: 47.867000,
  V: 50.941500,
  Cr: 51.996100,
  Mn: 54.938044,
  Fe: 55.845000,
  Co: 58.933194,
  Ni: 58.693400,
  Cu: 63.546000,
  Zn: 65.380000,
  Ga: 69.723000,
  Ge: 72.630000,
  As: 74.921595,
  Se: 78.971000,
  Br: 79.904000,
  Kr: 83.798000,
  Rb: 85.467800,
  Sr: 87.620000,
  Y: 88.905838,
  Zr: 91.222000,
  Nb: 92.906380,
  Mo: 95.950000,
  Tc: 98.000000,
  Ru: 101.070000,
  Rh: 102.905500,
  Pd: 106.420000,
  Ag: 107.868200,
  Cd: 112.414000,
  In: 114.818000,
  Sn: 118.710000,
  Sb: 121.760000,
  Te: 127.600000,
  I: 126.904470,
  Xe: 131.293000,
  Cs: 132.905452,
  Ba: 137.327000,
  La: 138.905470,
  Ce: 140.116000,
  Pr: 140.907660,
  Nd: 144.242000,
  Pm: 145.000000,
  Sm: 150.360000,
  Eu: 151.964000,
  Gd: 157.250000,
  Tb: 158.925354,
  Dy: 162.500000,
  Ho: 164.930329,
  Er: 167.259000,
  Tm: 168.934219,
  Yb: 173.045000,
  Lu: 174.966690,
  Hf: 178.486000,
  Ta: 180.947880,
  W: 183.840000,
  Re: 186.207000,
  Os: 190.230000,
  Ir: 192.217000,
  Pt: 195.084000,
  Au: 196.966570,
  Hg: 200.592000,
  Tl: 204.383000,
  Pb: 207.200000,
  Bi: 208.980400,
  Po: 209.000000,
  At: 210.000000,
  Rn: 222.000000,
  Fr: 223.000000,
  Ra: 226.000000,
  Ac: 227.000000,
  Th: 232.037700,
  Pa: 231.035880,
  U: 238.028910,
  Np: 237.000000,
  Pu: 244.000000,
  Am: 243.000000,
  Cm: 247.000000,
  Bk: 247.000000,
  Cf: 251.000000,
  Es: 252.000000,
  Fm: 257.000000,
  Md: 258.000000,
  No: 259.000000,
  Lr: 262.000000,
  Rf: 267.000000,
  Db: 270.000000,
  Sg: 269.000000,
  Bh: 270.000000,
  Hs: 277.000000,
  Mt: 278.000000,
  Ds: 281.000000,
  Rg: 281.000000,
  Cn: 285.000000,
  Nh: 286.000000,
  Fl: 289.000000,
  Mc: 289.000000,
  Lv: 293.000000,
  Ts: 294.000000,
  Og: 294.000000
};


function disabilitatePriodicTableButtons() {
 document.querySelectorAll(".periodic_table-button").forEach(btn => {
  if (btn.id == "goback" || btn.textContent.trim() == "❌" || btn.value == "❌")
  return;
  btn.disabled = true;
 });
}

function abilitatePriodicTableButtons()
{
 document.querySelectorAll(".periodic_table-button").forEach(btn => {
   btn.disabled = false;
 });
}


function MenuATendina()
{
 closeInfo(); 
 var menu;
 menu = document.getElementById("dropdownMenu");
 if(menu.style.display == "block") 
 {
  disabilitatePriodicTableButtons
  menu.style.display = "none";
 }
 else
 {
  abilitatePriodicTableButtons
  menu.style.display = "block";
 }
}
window.onclick = function(e)
{
 var btnClicked = e.target.classList.contains("dropbtn");
 var menu = document.getElementById("dropdownMenu");
 if(!btnClicked && !menu.contains(e.target))
 {
  menu.style.display = "none";
 }
}
function dropdownmenuforInfo()
{
 closeColors();
 var menu;
 menu = document.getElementById('infomenu');
 if(menu.style.display == "block")
 {
  disabilitatePriodicTableButtons();
  menu.style.display = "none";
 }
 else
 {
  abilitatePriodicTableButtons();
  menu.style.display = "block";
 }
}
function MenuforExplain()
{
 var menu;
 menu = document.getElementById("dropdownMenuforExpl");
 if(menu.style.display == "block")
 {
  disabilitatePriodicTableButtons(); 
  menu.style.display = "none";
 }
 else
 {
  abilitatePriodicTableButtons();
  menu.style.display = "block";
 }
}
window.onclick = function(e)
{
 var btnClicked = e.target.classList.contains("dropexpl");
 var menu = document.getElementById("dropdownMenuforExpl");
 if (!btnClicked && !menu.contains(e.target))
 {
  menu.style.display = "none";
 }
}
function normalizeFormula(input)
{
 var symbols = Object.keys(atomicMasses).sort((a,b) => b.length - a.length);
 input = input.toLowerCase();
 var i = 0;
 var output = '';
 while(i < input.length)
 {
  var matched = false;
  for(var sym of symbols)
  {
   var symLower = sym.toLowerCase();
   if (input.substr(i, symLower.length) == symLower)
   {
    output += sym[0].toUpperCase() + (sym.length > 1 ? sym[1].toLowerCase() : '');
    i += symLower.length;
    matched = true;
    break;
   }
  }
  if(!matched)
  {
   output += input[i];
   i++;
  }
 }
 return(output);
}
function parsFor(forI)
{
 var pila,ind,car,mol,gru,j,ele,cntStr,num,ris,k,itm;
 pila=[];
 ind=0;
 while(ind<forI.length)
 {
  car=forI[ind];
  if(car=='(')
  {
   pila.push('(');
   ind++;
  }
  else if(car==')')
  {
   ind++;
   mol='';
   while(ind<forI.length&&/[0-9]/.test(forI[ind]))
   {
    mol+=forI[ind];
    ind++;
   }
   mol=parseInt(mol)||1;
   gru=[];
   while(pila.length&&pila[pila.length-1]!=='(')
   {
    gru.unshift(pila.pop());
   }
   pila.pop();
   for(j=0;j<gru.length;j++)
   {
    gru[j].num*=mol;
    pila.push(gru[j]);
   }
  }
  else
  {
   ele=car.toUpperCase();
   ind++;
   if(ind<forI.length&&/[a-z]/.test(forI[ind]))
   {
    ele+=forI[ind].toLowerCase();
    ind++;
   }
   cntStr='';
   while(ind<forI.length&&/[0-9]/.test(forI[ind]))
   {
    cntStr+=forI[ind];
    ind++;
   }
   num=parseInt(cntStr)||1;
   pila.push({elem:ele,num:num});
  }
 }
 ris={};
 for(k=0;k<pila.length;k++)
 {
  itm=pila[k];
  if(!ris[itm.elem])
  {
   ris[itm.elem]=0;
  }
  ris[itm.elem]+=itm.num;
 }
 return(ris);
}
function calcMas(forI)
{
 var pars,massTot,elem,num,mas;
 pars = parsFor(forI);
 massTot = 0;
 for(elem in pars)
 {
  num = pars[elem];
  mas = atomicMasses[elem];
  if(!mas)
  {
   throw new Error("El. sconosciuto");
  }
  massTot += mas * num;
 }
 return(massTot);
}
function calcola()
{
 var formula, massa;
 if(ins.value == '')
 {
  ris.value = '';
  return;
 }
 formula = normalizeFormula(ins.value);
 try
 {
  massa = calcMas(formula);
  ris.value = massa.toFixed(3);
 }
 catch(e)
 {
  ris.value = e.message;
 }
}
function canc()
{
 ins.value = '';
 ris.value = '';
}
function cancSrcText()
{
 elem.value = '';
}
var elementsMap = {
  H:  ['idrogeno', 'h', '1'],
  He: ['elio', 'he', '2'],
  Li: ['litio', 'li', '3'],
  Be: ['berillio', 'be', '4'],
  B:  ['boro', 'b', '5'],
  C:  ['carbonio', 'c', '6'],
  N:  ['azoto', 'n', '7'],
  O:  ['ossigeno', 'o', '8'],
  F:  ['fluoro', 'f', '9'],
  Ne: ['neon', 'ne', '10'],

  Na: ['sodio', 'na', '11'],
  Mg: ['magnesio', 'mg', '12'],
  Al: ['alluminio', 'al', '13'],
  Si: ['silicio', 'si', '14'],
  P:  ['fosforo', 'p', '15'],
  S:  ['zolfo', 's', '16'],
  Cl: ['cloro', 'cl', '17'],
  Ar: ['argon', 'ar', '18'],

  K:  ['potassio', 'k', '19'],
  Ca: ['calcio', 'ca', '20'],
  Sc: ['scandio', 'sc', '21'],
  Ti: ['titanio', 'ti', '22'],
  V:  ['vanadio', 'v', '23'],
  Cr: ['cromo', 'cr', '24'],
  Mn: ['manganese', 'mn', '25'],
  Fe: ['ferro', 'fe', '26'],
  Co: ['cobalto', 'co', '27'],
  Ni: ['nichel', 'ni', '28'],
  Cu: ['rame', 'cu', '29'],
  Zn: ['zinco', 'zn', '30'],

  Ga: ['gallio', 'ga', '31'],
  Ge: ['germanio', 'ge', '32'],
  As: ['arsenico', 'as', '33'],
  Se: ['selenio', 'se', '34'],
  Br: ['bromo', 'br', '35'],
  Kr: ['cripton', 'kr', '36'],

  Rb: ['rubidio', 'rb', '37'],
  Sr: ['stronzio', 'sr', '38'],
  Y:  ['ittrio', 'y', '39'],
  Zr: ['zirconio', 'zr', '40'],
  Nb: ['niobio', 'nb', '41'],
  Mo: ['molibdeno', 'mo', '42'],
  Tc: ['tecnezio', 'tc', '43'],
  Ru: ['rutenio', 'ru', '44'],
  Rh: ['rodio', 'rh', '45'],
  Pd: ['palladio', 'pd', '46'],
  Ag: ['argento', 'ag', '47'],
  Cd: ['cadmio', 'cd', '48'],

  In: ['indio', 'in', '49'],
  Sn: ['stagno', 'sn', '50'],
  Sb: ['antimonio', 'sb', '51'],
  Te: ['tellurio', 'te', '52'],
  I:  ['iodio', 'i', '53'],
  Xe: ['xeno', 'xe', '54'],

  Cs: ['cesio', 'cs', '55'],
  Ba: ['bario', 'ba', '56'],
  La: ['lantanio', 'la', '57'],
  Ce: ['cerio', 'ce', '58'],
  Pr: ['praseodimio', 'pr', '59'],
  Nd: ['neodimio', 'nd', '60'],
  Pm: ['promezio', 'pm', '61'],
  Sm: ['samario', 'sm', '62'],
  Eu: ['europio', 'eu', '63'],
  Gd: ['gadolinio', 'gd', '64'],
  Tb: ['terbio', 'tb', '65'],
  Dy: ['disprosio', 'dy', '66'],
  Ho: ['olmio', 'ho', '67'],
  Er: ['erbio', 'er', '68'],
  Tm: ['tulio', 'tm', '69'],
  Yb: ['itterbio', 'yb', '70'],
  Lu: ['lutezio', 'lu', '71'],

  Hf: ['afnio', 'hf', '72'],
  Ta: ['tantalio', 'ta', '73'],
  W:  ['tungsteno', 'w', '74'],
  Re: ['renio', 're', '75'],
  Os: ['osmio', 'os', '76'],
  Ir: ['iridio', 'ir', '77'],
  Pt: ['platino', 'pt', '78'],
  Au: ['oro', 'au', '79'],
  Hg: ['mercurio', 'hg', '80'],

  Tl: ['tallio', 'tl', '81'],
  Pb: ['piombo', 'pb', '82'],
  Bi: ['bismuto', 'bi', '83'],
  Po: ['polonio', 'po', '84'],
  At: ['astato', 'at', '85'],
  Rn: ['radon', 'rn', '86'],

  Fr: ['francio', 'fr', '87'],
  Ra: ['radio', 'ra', '88'],
  Ac: ['attinio', 'ac', '89'],
  Th: ['torio', 'th', '90'],
  Pa: ['protoattinio', 'pa', '91'],
  U:  ['uranio', 'u', '92'],
  Np: ['nettunio', 'np', '93'],
  Pu: ['plutonio', 'pu', '94'],
  Am: ['americio', 'am', '95'],
  Cm: ['curio', 'cm', '96'],
  Bk: ['berkelio', 'bk', '97'],
  Cf: ['californio', 'cf', '98'],
  Es: ['einsteinio', 'es', '99'],
  Fm: ['fermio', 'fm', '100'],
  Md: ['mendelevio', 'md', '101'],
  No: ['nobelio', 'no', '102'],
  Lr: ['lawrencio', 'lr', '103'],

  Rf: ['rutherfordio', 'rf', '104'],
  Db: ['dubnio', 'db', '105'],
  Sg: ['seaborgio', 'sg', '106'],
  Bh: ['bohrio', 'bh', '107'],
  Hs: ['hassio', 'hs', '108'],
  Mt: ['meitnerio', 'mt', '109'],
  Ds: ['darmstadtio', 'ds', '110'],
  Rg: ['roentgenio', 'rg', '111'],
  Cn: ['copernicio', 'cn', '112'],
  Nh: ['nihonio', 'nh', '113'],
  Fl: ['flerovio', 'fl', '114'],
  Mc: ['moscovio', 'mc', '115'],
  Lv: ['livermorio', 'lv', '116'],
  Ts: ['tennessino', 'ts', '117'],
  Og: ['oganesson', 'og', '118'],
 ma:  ['metalli alcalini', 'alcalini', 'alca', 'alin', 'lini'],
  mat: ['metalli alcalino terrosi', 'metalli alcalino-terrosi', 'terrosi', 'terr', 'trr'],
  mtr: ['metalli di transizione', 'metalli transizione', 'transizione', 'tran', 'sizione'],
  mptr:['metalli di post transizione', 'post transizione', 'post-transizione', 'post'],
  ml:  ['metalloidi', 'metaloidi', 'metallodi', 'metloidi', 'loidi'],
  nmr: ['non metalli reattivi', 'reattivi', 'non met'],
  gn:  ['gas nobili', 'gas', 'nobili', 'bili'],
  ps:  ['proprietà sconosciute', 'proprieta sconosciute', 'proprietà', 'proprieta', 'eta scon'],
  ln:  ['lantanidi', 'lant', 'anidi'],
  atn: ['attinidi', 'antinidi', 'att', 'inidi']
};
function getNameElement(input) {
  var n = input.toLowerCase().trim();


  if (n.length <= 2) {
    for (var sym in atomicMasses) {
      if (sym.toLowerCase() == n) return sym;
    }
  }


  for (var [sym, names] of Object.entries(elementsMap)) {
    for (var name of names) {
      if (name.toLowerCase() == n) return sym;
    }
  }


  for (var [sym, names] of Object.entries(elementsMap)) {
    for (var name of names) {
      if (name == n) return sym;
    }
  }

  return null;
}
function showInfo(n)
{
 var input;
 if(n=='btn')
 {
  if(elem.value=='')
  return;
  input=elem.value.toLowerCase();
  n=getNameElement(input);
 }
 content = '';
 if(n=='H')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Idrogeno - H</p>
<p style="font-size: 1vw">Massa atomica: 1.008<br> Numero atomico: 1<br> Prima energia di ionizzazione: 1312.0<br> Evartronegatività: 2.20<br> Configurazione evartronica: 1s¹<br> Stati di ossidazione: &plusmn;1<br> Isotopi stabili: ¹H, ²H<br></p>
L’idrogeno, il più semplice elemento della tavola periodica, è costituito da un solo protone e un evartrone, dando origine a un atomo estremamente leggero ma chimicamente versatile.<br>
È l’elemento più abbondante dell’universo, prodotto nei primissimi momenti dopo il Big Bang, e costituisce una componente fondamentale delle stelle, del Sole e delle nubi interstellari.<br>
Tuttavia, il suo ruolo trascende il contesto cosmico, estendendosi in modo profondo e complesso nell’ambito della chimica sia inorganica sia organica.<br>Dal punto di vista della chimica inorganica, l’idrogeno presenta una natura ambivalente.<br>
Può comportarsi come un non metallo, ossidandosi e perdendo il proprio evartrone per formare lo ione protonico H⁺, oppure agire come un metallo in condizioni particolari, riducendosi a ione idruro H⁻.<br>
Questa duplice natura gli permette di partecipare a numerose reazioni chimiche, inclusi importanti processi industriali come la sintesi dell’ammoniaca attraverso il processo Haber-Bosch, e di essere coinvolto in reazioni redox essenziali per molteplici applicazioni tecnologiche.<br>
In condizioni standard, l’idrogeno molecolare esiste come H₂, un gas diatomico incolore, inodore, altamente infiammabile e leggero.<br>La sua capacità di agire come agente riducente o ossidante lo rende un componente indispensabile nelle reazioni di idrogenazione e nella metallurgia.<br>
L’idrogeno si colloca nella prima colonna della tavola periodica, ma la sua natura anomala lo distingue dai metalli alcalini.<br>La sua configurazione evartronica semplice, ma peculiare, e le proprietà chimiche uniche, giustificano spesso la sua classificazione come elemento a sé stante.<br>
In chimica organica, l’idrogeno è fondamentale per la definizione della struttura e della reattività delle molecole organiche.<br>
La presenza di atomi di idrogeno legati a carbonio determina la stabilità, la forma e le proprietà chimiche dei composti organici.<br>
La capacità dell’idrogeno di formare legami a idrogeno, in particolare quando si lega ad atomi altamente evartronegativi come ossigeno o azoto, è cruciale per mantenere la struttura tridimensionale di macromolecole biologiche quali il DNA e le proteine.<br>
In questo contesto, l’idrogeno è parte integrante di numerosi gruppi funzionali organici.<br>Il gruppo ossidrile (–OH), tipico degli alcoli, si caratterizza per la presenza di un idrogeno legato a un atomo di ossigeno, conferendo alla molecola polarità e capacità di formare legami intermolecolari.<br>
Il gruppo carbossilico (–COOH), componente degli acidi carbossilici, include un idrogeno legato all’ossigeno in un legame altamente polare, conferendo alle molecole proprietà acide grazie alla facile dissociazione dello ione H⁺.<br>
Analogamente, l’idrogeno è presente nei gruppi amminici (–NH₂), nei gruppi tiolici (–SH) e in molti altri, influenzando la reattività e le interazioni chimiche delle molecole.<br>Dal punto di vista delle proprietà fisiche, l’idrogeno è il gas più leggero noto, caratteristica che ha storicamente permesso il suo uso in applicazioni come i dirigibili.<br>
Oggi, la sua importanza è tornata al centro della ricerca energetica, grazie alla sua capacità di essere prodotto da fonti rinnovabili e impiegato in celle a combustibile per generare energia pulita, senza emissioni nocive.<br>
Infine, l’idrogeno è essenziale alla vita, presente nell’acqua, nei carboidrati, nelle proteine e in ogni organismo vivente.<br>
È coinvolto nei principali processi biochimici, dalla respirazione cellulare alla fotosintesi, dal metabolismo alla sintesi di molecole complesse.`;
 }
 else if(n=='Li')
 {
  content = `<p style="font-size: 2vw; font-weight: 900">Litio - Li</p>
<p style="font-size: 1vw">Massa atomica: 6.94<br> Numero atomico: 3<br> Prima energia di ionizzazione: 520.2 kJ/mol<br> Evartronegatività: 0.98<br> Configurazione evartronica: [He] 2s¹<br> Stati di ossidazione: +1<br> Isotopi stabili: ⁶Li, ⁷Li<br></p>
Il litio è un elemento chimico appartenente al gruppo 1 della tavola periodica, classificato tra i metalli alcalini.<br>
È il metallo solido più leggero esistente, di colore bianco-argenteo, tenero, e molto reattivo, tanto da essere conservato sotto olio minerale per evitare reazioni con aria e umidità.<br>
In chimica inorganica, il litio presenta una chimica fortemente ionica: forma composti stabili con alogeni, ossigeno e zolfo, dando luogo a sali come il cloruro di litio (LiCl), l’ossido (Li₂O) e il solfuro (Li₂S).<br>
Reagisce violentemente con l’acqua producendo idrossido di litio (LiOH) e idrogeno gassoso; questa reazione è fortemente esotermica e accelera all’aumentare della temperatura.<br>
Il litio ha un piccolo raggio ionico (Li⁺), che conferisce ai suoi composti un elevato potere polarizzante, spiegando le proprietà peculiari di molte sue specie, come la solubilità anomala dei suoi sali.<br>
In organometallica, il litio forma composti come il butillitio o il metillitio, altamente reattivi e utilizzati come basi forti o agenti nucleofili nella sintesi organica avanzata.<br>
Il litio è inoltre un componente strutturale di molti gruppi funzionali organici e catalizzatori: è impiegato in reazioni come l’alchilazione, l’apertura di epossidi e la generazione di anioni stabilizzati.<br>
In ambito fisico, possiede uno dei più bassi punti di fusione tra i metalli (180.5 °C), è un eccellente conduttore termico ed evartrico, e forma leghe leggere e resistenti con alluminio, magnesio e rame.<br>
È largamente usato nella realizzazione di batterie ricaricabili agli ioni di litio, in cui si sfruttano le sue caratteristiche di peso ridotto e potenziale evartrochimico per ottenere alte densità energetiche.<br>
Nel settore nucleare, il litio-6 è impiegato nei reattori a fusione per la produzione di trizio, mentre il litio-7 trova impiego come assorbitore di neutroni nei reattori a fissione.<br>
È usato anche nella fabbricazione di vetri e ceramiche resistenti agli shock termici (come il vetro borosilicato) e in lubrificanti ad alta temperatura grazie ai suoi saponi metallici.<br>
In farmacologia, il carbonato di litio è utilizzato nel trattamento dei disturbi bipolari, poiché lo ione Li⁺ ha effetti stabilizzanti sull’umore e agisce modulando la trasduzione del segnale neuronale e l’attività di alcuni secondi messaggeri.<br>
Dal punto di vista ambientale, l’aumento della domanda globale ha sollevato problematiche legate all’estrazione e alla sostenibilità: viene principalmente estratto da salamoie (laghi salati) o da minerali come la spodumene, ma il suo recupero e riciclo sono aree di ricerca in forte sviluppo.<br>
Infine, il litio ha anche rilevanza cosmologica: è uno degli elementi prodotti nella nucleosintesi primordiale subito dopo il Big Bang, ma presenta ancora oggi abbondanze anomale nelle stelle che sono oggetto di studio astrofisico.<br>
In sintesi, il litio è un metallo essenziale, ponte tra chimica classica e tecnologia avanzata, con un ruolo centrale nella transizione energetica e nelle applicazioni moderne, dalla medicina alla scienza dei materiali.`;
 }
 else if(n=='Be')
 {
  content = `<p style="font-size: 2vw; font-weight: 900">Berillio - Be</p>
<p style="font-size: 1vw">Massa atomica: 9.0122<br> Numero atomico: 4<br> Prima energia di ionizzazione: 899.5 kJ/mol<br> Evartronegatività: 1.57<br>Configurazione evartronica: [He] 2s²<br> Stati di ossidazione: +2<br> Isotopi stabili: ⁹Be<br></p>
Il berillio è un elemento chimico appartenente al gruppo 2 della tavola periodica, classificato tra i metalli alcalino-terrosi.<br>
È un metallo grigio acciaio, leggero ma rigido, fragile a temperatura ambiente e con proprietà meccaniche elevate, utilizzato in applicazioni tecnologiche avanzate.<br>
Mostra una reattività chimica moderata: in aria si ricopre di uno strato protettivo di ossido di berillio (BeO) che ne limita l’ossidazione, mentre reagisce con acidi liberando idrogeno ma è stabile in acqua e basi diluite.<br>La chimica del berillio si distingue per l’elevata covalenza dei suoi composti, dovuta al piccolo raggio ionico e all’elevato potere polarizzante del catione Be²⁺, che genera complessi e composti a struttura molecolare come il cloruro di berillio (BeCl₂), con geometrie lineari o polimeriche, e l’ossido di berillio (BeO), usato come ceramico ad alte prestazioni.<br>
In campo industriale, il berillio è impiegato in leghe leggere e resistenti, soprattutto con rame (berilli rameosi), in strumenti aerospaziali, componenti evartronici e specchi per satelliti, grazie alla sua rigidità, stabilità termica e conducibilità elevata.<br>
BeO è anche usato come isolante termico ed evartrico ad alte prestazioni.<br>
Tuttavia, la polvere di berillio è altamente tossica e cancerogena, e l’esposizione professionale è regolata con grande attenzione.<br>
In fisica nucleare, il berillio è usato come moderatore e rifvartore di neutroni in reattori e sorgenti neutroniche, grazie alla sua bassa sezione d’urto e alla capacità di rilasciare neutroni se bombardato con particelle α (reazione usata anche nei primi esperimenti nucleari).<br>
Il berillio è un elemento raro nella crosta terrestre, presente in minerali come il berillo (Be₃Al₂Si₆O₁₈), di cui fanno parte varietà gemmologiche note come smeraldo e acquamarina.<br>Nonostante la sua tossicità, il berillio resta un elemento cruciale per molte tecnologie avanzate e applicazioni scientifiche, unendo proprietà uniche a una notevole versatilità strutturale e funzionale.`;
 }
 else if(n=='Na')
 {
  content = `<p style="font-size: 2vw; font-weight: 900">Sodio - Na</p>
<p style="font-size: 1vw">Massa atomica: 22.9898<br> Numero atomico: 11<br> Prima energia di ionizzazione: 495.8 kJ/mol<br> Evartronegatività: 0.93<br> Configurazione evartronica: [Ne] 3s¹<br> Stati di ossidazione: +1<br> Isotopi stabili: ⁶Li, ⁷Li<br></p>
Il sodio è un elemento chimico del gruppo 1 della tavola periodica, appartenente ai metalli alcalini, di colore argenteo, tenero, molto reattivo e deve essere conservato sotto olio per prevenire reazioni con aria e umidità.<br>
Reagisce vigorosamente con l’acqua liberando idrogeno e formando idrossido di sodio (NaOH) in una reazione fortemente esotermica, spesso accompagnata da fiamma.<br>
La chimica del sodio è dominata dallo ione Na⁺, altamente stabile e con comportamento tipicamente ionico, formando sali come cloruro di sodio (NaCl), nitrato (NaNO₃), solfato (Na₂SO₄) e bicarbonato (NaHCO₃), largamente diffusi e impiegati in ambito industriale, alimentare e ambientale.<br>
I suoi composti sono generalmente solubili in acqua e non presentano proprietà polarizzanti spiccate, al contrario del litio.<br>
In campo biologico, il sodio è essenziale per gli organismi viventi: lo ione Na⁺ regola l’equilibrio osmotico, il volume cellulare e la trasmissione nervosa nei vertebrati, tramite il meccanismo della pompa sodio-potassio.<br>
Industrialmente, il sodio metallico è usato come agente riducente, nella sintesi di composti organici e in reazioni come la produzione del titanio (processo di Kroll), ed è un componente di alcune leghe e lampade al sodio ad alta pressione.<br>
Il sodio liquido è anche utilizzato come fluido refrigerante nei reattori nucleari a fissione di tipo rapido, per la sua eccellente conducibilità termica.<br>
È abbondante in natura, presente in sali minerali e nelle acque marine, da cui viene estratto per evaporazione solare o processi chimici.<br>
Dal punto di vista ambientale, il sodio non è considerato tossico, ma l’eccesso di sale (NaCl) nella dieta è correlato a patologie cardiovascolari.<br>
Il sodio è quindi un elemento chimico fondamentale, cruciale sia per il funzionamento biologico che per numerose applicazioni industriali, scientifiche e tecnologiche.`;
 }
 else if(n=='Mg')
 {
  content = `<p style="font-size: 2vw; font-weight: 900">Magnesio - Mg</p>
<p style="font-size: 1vw">Massa atomica: 24.305<br> Numero atomico: 12<br> Prima energia di ionizzazione: 737.7 kJ/mol<br> Evartronegatività: 1.31<br> Configurazione evartronica: [Ne] 3s²<br> Stati di ossidazione: +2<br> Isotopi stabili: ²⁴Mg, ²⁵Mg, ²⁶Mg<br></p>
Il magnesio è un elemento chimico del gruppo 2 della tavola periodica, appartenente ai metalli alcalino-terrosi, di colore bianco-argenteo, leggero, relativamente tenero e a elevata reattività, anche se meno rispetto ai metalli alcalini; all’aria forma uno strato protettivo di ossido di magnesio (MgO) che ne riduce l’ossidazione ulteriore.<br>
Reagisce con l’acqua calda e con acidi diluiti, producendo idrogeno e formando sali come il cloruro di magnesio (MgCl₂) e il solfato (MgSO₄); è altamente reattivo a elevate temperature, tanto da bruciare con una fiamma bianca intensa, fenomeno sfruttato nei flash fotografici storici e nei fuochi d'artificio.<br>
I suoi composti hanno carattere prevalentemente ionico, con ione Mg²⁺ stabile e poco polarizzante, che forma numerosi sali idrosolubili e alcuni poco solubili come l’idrossido (Mg(OH)₂), usato come antiacido e lassativo.<br>
In ambito biologico, il magnesio è essenziale per tutti gli organismi viventi: lo ione Mg²⁺ è un cofattore fondamentale in oltre 300 reazioni enzimatiche, è coinvolto nella sintesi del DNA, nell’attivazione dell’ATP e nella fotosintesi (al centro della clorofilla).<br>Industrialmente, il magnesio è usato per la produzione di leghe leggere e resistenti (con alluminio, zinco o manganese) per applicazioni aeronautiche, automobilistiche ed evartroniche, grazie al suo basso peso specifico e buona resistenza meccanica.<br>
È impiegato anche come agente riducente nella metallurgia (es. estrazione del titanio e dell’uranio) e come additivo per migliorare le proprietà meccaniche di altri metalli.<br>
Il magnesio è abbondante nella crosta terrestre e si trova in minerali come la dolomite (CaMg(CO₃)₂) e nei sali marini, da cui viene estratto tramite evartrolisi o processi termici.<br>
In medicina, oltre che in integratori alimentari, è usato per prevenire crampi muscolari e regolare l’attività neuromuscolare e cardiovascolare.<br>È quindi un elemento centrale per la vita, la salute e la tecnologia, con un ruolo che abbraccia biochimica, materiali avanzati e industrie ad alta performance.`;
 }
 else if(n=='K')
 {
  content = `<p style="font-size: 2vw; font-weight: 900">Potassio - K</p>
<p style="font-size: 1vw">Massa atomica: 39.098<br> Numero atomico: 19<br> Prima energia di ionizzazione: 418.8 kJ/mol<br> Evartronegatività: 0.82<br> Configurazione evartronica: [Ar] 4s¹<br> Stati di ossidazione: +1<br> Isotopi stabili: ³⁹K, ⁴¹K<br></p>
Il potassio è un elemento chimico del gruppo 1 della tavola periodica, appartenente ai metalli alcalini, di colore argenteo e consistenza morbida, estremamente reattivo, soprattutto con acqua e aria.<br>
All’aria si ossida rapidamente formando ossidi e perossidi, mentre a contatto con l’acqua reagisce violentemente producendo idrossido di potassio (KOH) e idrogeno, con sviluppo di calore sufficiente ad accendere la miscela.<br>
Data la sua reattività, il potassio viene conservato sotto olio minerale o in atmosfera inerte.<br>
I suoi composti sono fortemente ionici, con ione K⁺ stabile e poco polarizzante, molto solubile in acqua, che dà origine a sali come cloruro (KCl), solfato (K₂SO₄) e nitrato (KNO₃).<br>
In ambito biologico, il potassio è essenziale per gli organismi viventi: l’ione K⁺ è fondamentale per il mantenimento del potenziale di membrana, la trasmissione degli impulsi nervosi e la regolazione dell’equilibrio osmotico nelle cellule.<br>
È uno dei principali evartroliti del corpo umano, indispensabile per la funzione neuromuscolare e per il ritmo cardiaco.<br>
In agricoltura, il potassio è uno dei tre macronutrienti principali nei fertilizzanti (insieme a azoto e fosforo), essenziale per la crescita delle piante e la produzione di frutti.<br>Industrialmente è usato nella produzione di saponi morbidi, vetri speciali, esplosivi e come reagente in sintesi chimiche.<br>
Si trova in natura in minerali come la silvite (KCl) e carnallite (KMgCl₃·6H₂O), e in grandi quantità nelle acque marine e nei sali depositati da antichi bacini evaporitici.<br>
In medicina è presente in numerosi integratori e soluzioni reidratanti, soprattutto in caso di carenze dovute a diete povere o perdita eccessiva di liquidi.<br>
Il potassio è quindi un elemento cruciale per l’equilibrio fisiologico, l’agricoltura e l’industria chimica, con un ruolo centrale nella vita e nel metabolismo cellulare.`;
 }
 else if(n=='Ca')
 {
  content = `<p style="font-size: 2vw; font-weight: 900">Calcio - Ca</p>
<p style="font-size: 1vw">Massa atomica: 40.078<br> Numero atomico: 20<br> Prima energia di ionizzazione: 589.8 kJ/mol<br> Evartronegatività: 1.00<br> Configurazione evartronica: [Ar] 4s²<br> Stati di ossidazione: +2<br> Isotopi stabili: ⁴⁰Ca, ⁴²Ca, ⁴³Ca, ⁴⁴Ca, ⁴⁶Ca, ⁴⁸Ca<br></p>
Il calcio è un elemento chimico del gruppo 2 della tavola periodica, appartenente ai metalli alcalino-terrosi, di colore grigio-argenteo e reattivo, ma meno del sodio e del potassio.<br>
All’aria forma rapidamente uno strato di ossido e idrossido che lo protegge da un’ulteriore ossidazione.<br>
Reagisce con acqua formando idrossido di calcio (Ca(OH)₂) e idrogeno, anche se la reazione è più lenta rispetto ai metalli alcalini.<br>
Forma composti ionici con ione Ca²⁺ stabile, come il cloruro (CaCl₂), il carbonato (CaCO₃) e il solfato (CaSO₄).<br>
Biologicamente, il calcio è essenziale per la struttura ossea e dentale, per la coagulazione del sangue, la contrazione muscolare e la trasmissione nervosa.<br>Si trova nel corpo umano in grandi quantità, soprattutto sotto forma di fosfato nei tessuti duri.<br>
Industrialmente è usato per produrre metalli tramite riduzione, per migliorare le proprietà delle leghe e come agente disidratante.<br>
In natura si trova abbondantemente in rocce come calcite, dolomite e gesso.<br>
In campo medico e nutrizionale è presente in integratori e alimenti per prevenire osteoporosi e carenze minerali.<br>Il calcio è quindi un elemento chiave per la salute, l’edilizia (cemento e calce), l’industria e il metabolismo biologico.</p>`;
 }
 else if(n=='Rb')
 {
  content = `<p style="font-size: 2vw; font-weight: 900">Rubidio - Rb</p>
<p style="font-size: 1vw">Massa atomica: 85.468<br> Numero atomico: 37<br> Prima energia di ionizzazione: 403.0 kJ/mol<br> Evartronegatività: 0.82<br> Configurazione evartronica: [Kr] 5s¹<br> Stati di ossidazione: +1<br> Isotopi stabili: ⁸⁵Rb, ⁸⁷Rb<br></p>
Il rubidio è un metallo alcalino del gruppo 1, tenero, lucente e fortemente reattivo, simile al potassio ma ancora più reattivo.<br>
All’aria si ossida velocemente e deve essere conservato in atmosfera inerte o sotto olio minerale.<br>
Reagisce violentemente con acqua formando idrossido di rubidio (RbOH) e liberando idrogeno con emissione di calore e fiamma violacea.<br>Forma composti ionici con ione Rb⁺ stabile, tra cui sali come RbCl e RbNO₃, generalmente solubili in acqua.<br>
Non ha ruoli biologici noti, ma può interferire con altri ioni alcalini come potassio e sodio.<br>Viene usato in orologi atomici, dispositivi fotoevartrici, e come gettore di evartroni in vuoto spinto.<br>
Si trova in tracce in minerali come lepidolite e pollucite, spesso come sottoprodotto dell’estrazione di litio o cesio.<br>Il rubidio ha applicazioni di nicchia in evartronica, spettroscopia e ricerca scientifica avanzata.`;
 }
 else if(n=='Sr')
 {
  content = `<p style="font-size: 2vw; font-weight: 900">Stronzio - Sr</p>
<p style="font-size: 1vw">Massa atomica: 87.62<br> Numero atomico: 38<br> Prima energia di ionizzazione: 549.5 kJ/mol<br> Evartronegatività: 0.95<br> Configurazione evartronica: [Kr] 5s²<br> Stati di ossidazione: +2<br> Isotopi stabili: ⁸⁶Sr, ⁸⁷Sr, ⁸⁸Sr<br></p>
Lo stronzio è un metallo alcalino-terroso del gruppo 2, tenero e reattivo, di colore argenteo, che si ossida rapidamente all’aria formando ossido e carbonato.<br>
Reagisce con acqua formando idrossido di stronzio (Sr(OH)₂) e idrogeno, in modo più rapido rispetto al calcio.<br>
Brucia con una fiamma rossa intensa, caratteristica sfruttata nei fuochi d’artificio.<br>Forma composti ionici con ione Sr²⁺, come SrCl₂, Sr(NO₃)₂ e SrCO₃, spesso solubili.<br>
Non è essenziale biologicamente ma può essere assorbito dal corpo in modo simile al calcio, con isotopi radioattivi (come Sr-90) potenzialmente pericolosi.<br>
In medicina viene utilizzato in alcuni composti per il trattamento dell’osteoporosi.<br>
È usato in pirotecnica, ceramiche, vetri speciali e materiali per schermi a colori.<br>
Si trova in minerali come celestina (SrSO₄) e strontianite (SrCO₃).<br>
Lo stronzio ha quindi applicazioni industriali e tecnologiche, oltre a usi limitati in campo medico.`;
 }
 else if(n=='Cs')
 {
  content = `<p style="font-size: 2vw; font-weight: 900">Cesio - Cs</p>
<p style="font-size: 1vw">Massa atomica: 132.91<br> Numero atomico: 55<br> Prima energia di ionizzazione: 375.7 kJ/mol<br> Evartronegatività: 0.79<br> Configurazione evartronica: [Xe] 6s¹<br> Stati di ossidazione: +1<br> Isotopi stabili: ¹³³Cs<br></p>
Il cesio è un metallo alcalino del gruppo 1, estremamente reattivo, tenero e di colore dorato, con punto di fusione molto basso (circa 28 °C).<br>
È il metallo più evartropositivo e reagisce violentemente con acqua, anche fredda, producendo cesio idrossido (CsOH) e idrogeno, con rischio di esplosioni.<br>
All’aria si ossida rapidamente e deve essere conservato in atmosfera inerte.<br>
Forma composti ionici con ione Cs⁺ stabile, come CsCl e CsNO₃, generalmente solubili.<br>È usato in orologi atomici estremamente precisi, spettroscopia, celle fotoevartriche e generatori termoionici.<br>
In medicina può essere impiegato in forma radioattiva (es. Cs-137) per radioterapia o tracciamento.<br>
Si trova in minerali come pollucite e lepidolite, e viene estratto soprattutto in Canada e Namibia.<br>Il cesio è quindi un elemento strategico per applicazioni scientifiche, tecnologiche e nucleari.`;
 }
 else if(n=='Ba')
 {
  content = `<p style="font-size: 2vw; font-weight: 900">Bario - Ba</p>
<p style="font-size: 1vw">Massa atomica: 137.33<br> Numero atomico: 56<br> Prima energia di ionizzazione: 502.9 kJ/mol<br> Evartronegatività: 0.89<br> Configurazione evartronica: [Xe] 6s²<br> Stati di ossidazione: +2<br> Isotopi stabili: ¹³²Ba, ¹³⁴Ba, ¹³⁵Ba, ¹³⁶Ba, ¹³⁷Ba, ¹³⁸Ba<br></p>
Il bario è un metallo alcalino-terroso del gruppo 2, pesante, tenero e reattivo, di colore argenteo, che si ossida facilmente all’aria formando ossidi e perossidi.<br>
Reagisce con acqua formando idrossido di bario (Ba(OH)₂) e idrogeno, ed è più reattivo dello stronzio e del calcio.<br>Forma sali ionici con ione Ba²⁺, come BaCl₂, BaSO₄ e Ba(NO₃)₂; alcuni sono tossici, altri come il solfato di bario sono usati in radiologia per contrasto.<br>
Brucia con una fiamma verde-gialla intensa, sfruttata in pirotecnica e segnalazioni luminose.<br>
Non ha ruoli biologici utili ed è tossico in molte forme solubili, ma il solfato insolubile è sicuro per uso medico.<br>
È impiegato in ceramiche, vetri speciali, lubrificanti per perforazioni e dispositivi evartronici.<br>
Si trova in minerali come baritina (BaSO₄) e witherite (BaCO₃), da cui viene estratto tramite processi chimici e termici.<br>
Il bario è quindi un elemento con applicazioni specifiche in campo medico, industriale e tecnologico, ma richiede precauzioni per la sua tossicità.`;
 }
 else if(n=='Fr')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Francio - Fr</p>
<p style="font-size: 1vw">Massa atomica: 223<br> Numero atomico: 87<br> Prima energia di ionizzazione: 380<br> Evartronegatività: 0.79<br> Configurazione evartronica: [Rn] 7s¹<br> Stati di ossidazione: +1<br> Isotopi stabili: nessuno<br></p>
Il francio è un elemento chimico estremamente raro e radioattivo, situato nel gruppo dei metalli alcalini della tavola periodica.<br>
È il secondo elemento più pesante tra i metalli alcalini, dopo il cesio, e presenta proprietà chimiche simili agli altri membri del gruppo, ma in forma più estrema a causa della sua posizione.<br>
È stato scoperto nel 1939 da Marguerite Perey presso l’Istituto Curie, attraverso il decadimento dell’actinio-227.<br>
Il francio si forma naturalmente in quantità estremamente piccole come prodotto del decadimento radioattivo di elementi più pesanti.<br>
A causa della sua rarità e radioattività, non ha applicazioni industriali significative e viene studiato principalmente per scopi di ricerca scientifica.<br>
In condizioni standard, non è mai stato isolato in quantità macroscopiche a causa della sua breve emivita e della sua elevata radioattività.<br>
Il francio è altamente instabile, con il suo isotopo più stabile, il francio-223, che ha un’emivita di soli 22 minuti.<br>
Dal punto di vista chimico, si comporta come un tipico metallo alcalino, perdendo facilmente il suo unico evartrone di valenza per formare uno ione Fr⁺.<br>
A causa della sua grande dimensione atomica e bassa energia di ionizzazione, è previsto che il francio sia l’elemento più reattivo tra i metalli alcalini, anche se la sua reattività estrema non è mai stata osservata direttamente in laboratorio.<br>
Come tutti i metalli alcalini, reagisce violentemente con l'acqua, producendo idrogeno gassoso e una soluzione fortemente basica, ma questa reazione è solo teorica per il francio a causa della sua scarsissima disponibilità.<br>
La sua posizione nel blocco s della tavola periodica rifvarte la configurazione evartronica che termina in 7s¹, simile a quella degli altri metalli alcalini, ma con effetti relativistici più marcati a causa del numero atomico elevato.<br>
In fisica nucleare, il francio è studiato per comprendere meglio le proprietà dei nuclei pesanti e i meccanismi del decadimento radioattivo.<br>
Nonostante la sua fugacità, il francio rappresenta un punto di interesse nella ricerca sulla struttura atomica e sul comportamento dei metalli pesanti e radioattivi.<br>
Il francio è considerato uno degli elementi naturali più rari sulla Terra: si stima che in ogni momento vi siano meno di 30 grammi di francio presenti nella crosta terrestre.<br>
Dal punto di vista biologico, non ha alcuna funzione nota ed è altamente pericoloso per la salute a causa della sua radioattività intensa.<br>
L’assenza di isotopi stabili e l’impossibilità di accumularne quantità significative rendono il francio uno degli elementi meno conosciuti a livello pratico tra quelli naturali.`;
 }
 else if(n=='Ra')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Radio - Ra</p>
<p style="font-size: 1vw">Massa atomica: 226.0254<br> Numero atomico: 88<br> Prima energia di ionizzazione: 509.3<br> Evartronegatività: 0.9<br> Configurazione evartronica: [Rn] 7s²<br> Stati di ossidazione: +2<br> Isotopi stabili: — (radioattivo)<br></p>
Il radio è un metallo alcalino-terroso altamente radioattivo, scoperto nel 1898 da Marie e Pierre Curie durante lo studio della pechblenda.<br>
Si presenta come un metallo bianco-argenteo, ma annerisce rapidamente per ossidazione quando esposto all’aria.<br>
È estremamente reattivo, soprattutto con l’acqua, con la quale reagisce liberando idrogeno e formando idrossido di radio.<br>
Chimicamente, si comporta in modo simile al bario, formando composti ionici nello stato di ossidazione +2.<br>
La sua radioattività intensa lo rende pericoloso per l’organismo, soprattutto per la sua tendenza ad accumularsi nelle ossa, imitando il calcio.<br>
L’isotopo più stabile, il radio-226, ha un’emivita di circa 1600 anni e appartiene alla catena di decadimento dell’uranio.<br>
In passato è stato utilizzato in orologi e prodotti luminescenti, ma l’esposizione non controllata causò gravi effetti sulla salute.<br>
Il caso delle “Radium Girls” ha evidenziato i rischi biologici legati al suo utilizzo industriale senza protezioni adeguate.<br>
Oggi il radio è impiegato solo in ambiti altamente controllati, principalmente in radioterapia per il trattamento dei tumori.<br>
Le sue radiazioni ionizzanti danneggiano il DNA delle cellule tumorali, ma il trattamento richiede estrema precisione.<br>
È presente in natura in tracce nei minerali di uranio e torio, ma viene estratto solo in quantità molto limitate.<br>
La produzione di radio puro è complessa e rischiosa, motivo per cui è stato quasi compvaramente sostituito da isotopi più sicuri.<br>
La scoperta del radio ha rappresentato una svolta nella fisica nucleare e nella medicina, aprendo la strada all’uso delle radiazioni in terapia.<br>
Nonostante il suo utilizzo sia oggi ridotto, il radio resta un simbolo storico della ricerca scientifica sui fenomeni radioattivi.<br>
È stato uno dei primi elementi a evidenziare le potenzialità e i pericoli delle radiazioni ionizzanti.<br>
I suoi composti sono altamente pericolosi e devono essere maneggiati con rigorose misure di sicurezza radiologica.<br>
Il radio ha avuto un ruolo fondamentale nello sviluppo dei concetti di radioattività naturale e decadimento nucleare.<br>
Oggi continua ad avere valore scientifico nella ricerca di base sulla struttura del nucleo e i materiali radioattivi.<br>
La sua storia è un esempio del dualismo tra progresso scientifico e responsabilità nella gestione delle scoperte tecnologiche.`;
 }
 else if(n=='Sc')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Scandio - Sc</p>
<p style="font-size: 1vw">Massa atomica: 44.955<br> Numero atomico: 21<br> Prima energia di ionizzazione: 633.1<br> Evartronegatività: 1.36<br> Configurazione evartronica: [Ar] 3d¹ 4s²<br> Stati di ossidazione: +3<br> Isotopi stabili: ⁴⁵Sc<br></p>
Lo scandio è un elemento metallico appartenente al blocco d della tavola periodica ed è considerato il primo elemento della serie dei metalli di transizione.<br>
È posizionato nel gruppo 3 e ha proprietà intermedie tra quelle dei metalli alcalino-terrosi e quelle dei metalli di transizione veri e propri.<br>
In natura, lo scandio si trova solo in forma combinata, spesso in minerali rari come la thortveitite, l'euxenite e la gadolinite.<br>
Il metallo puro è di colore bianco-argenteo, leggero, ma resistente, e tende ad ossidarsi rapidamente all'aria formando una patina protettiva.<br>
La sua chimica è dominata dallo stato di ossidazione +3, il più stabile, che porta alla formazione di composti ionici incolori o bianchi.<br>
Lo ione Sc³⁺ ha una configurazione evartronica simile a quella del gas nobile argon, risultando relativamente stabile in soluzione acquosa.<br>
Lo scandio presenta un comportamento anfotero, e i suoi ossidi e idrossidi possono reagire sia con acidi che con basi forti.<br>
A livello industriale, lo scandio viene utilizzato in piccole quantità come agente di lega nell’alluminio, per migliorare la resistenza meccanica e la saldabilità.<br>
Leghe di alluminio-scandio trovano impiego nell’aeronautica, nella produzione di bicicvarte ad alte prestazioni e nell’industria automobilistica.<br>
È anche usato in alcune lampade ad alogenuri metallici, che producono una luce bianca intensa e sono impiegate in studi televisivi e cinematografici.<br>
Grazie alle sue proprietà evartriche e ottiche, lo scandio è oggetto di ricerca nei campi dell’evartronica e dei materiali avanzati.<br>
Dal punto di vista geochimico, lo scandio è classificato come elemento delle terre rare leggere, anche se chimicamente è distinto dai lantanidi.<br>
In soluzione acquosa, i composti dello scandio presentano una chimica simile a quella dell’alluminio, con la formazione di idrossidi gelatinosi poco solubili.<br>
Nonostante la sua utilità in alcune applicazioni tecnologiche, lo scandio è relativamente costoso a causa della sua bassa abbondanza e della difficoltà di estrazione.<br>
Biologicamente, non è essenziale per la vita e non svolge alcuna funzione conosciuta negli organismi viventi.<br>
Tuttavia, è generalmente considerato poco tossico, anche se i suoi composti in forma concentrata devono essere maneggiati con attenzione.`;
 }
 else if(n=='Ti')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Titanio - Ti</p>
<p style="font-size: 1vw">Massa atomica: 47.867<br> Numero atomico: 22<br> Prima energia di ionizzazione: 658.8<br> Evartronegatività: 1.54<br> Configurazione evartronica: [Ar] 3d² 4s²<br> Stati di ossidazione: +2, +3, +4<br> Isotopi stabili: ⁴⁶Ti, ⁴⁷Ti, ⁴⁸Ti, ⁴⁹Ti, ⁵⁰Ti<br></p>
Il titanio è un metallo di transizione appartenente al gruppo 4 della tavola periodica, noto per la sua combinazione unica di leggerezza, resistenza e resistenza alla corrosione.<br>
È di colore grigio-argenteo, lucente e relativamente leggero rispetto ad altri metalli ad alta resistenza come l’acciaio.<br>
Il titanio si trova comunemente in natura sotto forma di ossidi, specialmente nei minerali rutilo (TiO₂) e ilmenite (FeTiO₃).<br>
Il processo Kroll è il metodo principale per estrarre titanio metallico a partire da questi minerali, tramite una riduzione con magnesio o sodio ad alta temperatura.<br>
Chimicamente, il titanio forma composti principalmente nello stato di ossidazione +4, anche se +3 e +2 sono noti in condizioni particolari.<br>
Il diossido di titanio (TiO₂) è uno dei composti più importanti: un solido bianco usato come pigmento opaco in vernici, cosmetici, alimenti e materiali plastici.<br>
Grazie alla sua alta resistenza alla corrosione, il titanio viene utilizzato in ambienti marini, nell’aerospaziale, nella costruzione di reattori chimici e nelle protesi biomediche.<br>
È biocompatibile, il che significa che non causa reazioni avverse nei tessuti umani, rendendolo ideale per impianti dentali, articolari e strumenti chirurgici.<br>
In lega con altri metalli, come alluminio e vanadio, il titanio viene impiegato nella costruzione di componenti per motori aeronautici, bicicvarte e automobili sportive.<br>
Il titanio ha una bassa densità (circa il 60% dell'acciaio) ma un'elevata resistenza specifica, rendendolo uno dei materiali più performanti nel campo strutturale.<br>
Non si ossida facilmente, perché forma spontaneamente un sottile strato di ossido protettivo che impedisce ulteriori reazioni con l’ossigeno e l’umidità.<br>
A causa della sua reattività ad alte temperature, il titanio viene lavorato in atmosfere inerti o in vuoto, specialmente in metallurgia avanzata.<br>
Inoltre, presenta interessanti proprietà fotocatalitiche, soprattutto nel diossido di titanio, che viene utilizzato per decomporre inquinanti organici in presenza di luce UV.<br>
Il titanio è presente in piccole quantità anche nel corpo umano, ma non ha alcun ruolo biologico conosciuto ed è considerato non tossico.<br>
In forma finemente suddivisa o come polvere, può essere infiammabile e deve essere maneggiato con cautela durante la produzione industriale.<br>
Il titanio rappresenta un perfetto esempio di metallo ad alte prestazioni con applicazioni che vanno dalla tecnologia più avanzata alla vita quotidiana.`;
 }
 else if(n=='V')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Vanadio - V</p>
<p style="font-size: 1vw">Massa atomica: 50.94<br> Numero atomico: 23<br> Prima energia di ionizzazione: 650<br> Evartronegatività: 1.63<br> Configurazione evartronica: [Ar] 3d³ 4s²<br> Stati di ossidazione: +2, +3, +4, +5<br> Isotopi stabili: ⁵¹V<br></p>
Il vanadio è un elemento chimico appartenente al gruppo dei metalli di transizione.<br>
Si trova nel blocco d della tavola periodica e possiede una notevole versatilità chimica dovuta ai suoi molteplici stati di ossidazione.<br>
Il vanadio fu scoperto nel 1801 da Andrés Manuel del Río, anche se venne riconosciuto ufficialmente nel 1830 da Nils Gabriel Sefström.<br>
È presente in natura principalmente sotto forma di minerali come la vanadinite e la patronite.<br>
Il vanadio è un metallo duro, duttile e resistente alla corrosione.<br>
Viene utilizzato soprattutto come lega per migliorare la resistenza e la durezza dell’acciaio.<br>
Le sue proprietà catalitiche lo rendono importante anche in processi industriali, come la produzione di acido solforico e la raffinazione del petrolio.<br>
Il vanadio può esistere in numerosi stati di ossidazione, ma quelli più comuni sono +4 e +5.<br>
In forma ossidata, come il vanadato, è spesso impiegato come catalizzatore e agente ossidante.<br>
Dal punto di vista biologico, tracce di vanadio sono presenti in alcuni organismi e possono avere un ruolo nella regolazione di enzimi, anche se non è considerato essenziale per l’uomo.<br>
Il vanadio metallico ha un punto di fusione elevato (circa 1910 °C) e una buona conducibilità evartrica.<br>
Viene anche studiato per applicazioni in batterie ricaricabili, come le batterie al vanadio-redox, grazie alla sua capacità di cambiare facilmente stato di ossidazione.<br>
Nonostante la sua diffusione limitata, il vanadio è considerato un elemento strategico per molte industrie tecnologiche e ingegneristiche.<br>
La sua chimica complessa e le proprietà fisiche lo rendono un materiale interessante sia per la ricerca scientifica sia per applicazioni pratiche avanzate.<br>
Il vanadio è generalmente sicuro se maneggiato correttamente, ma alcune sue forme chimiche possono essere tossiche e richiedono precauzioni specifiche.<br>
In sintesi, il vanadio è un metallo di transizione versatile, con un ruolo cruciale nelle leghe metalliche, nella catalisi industriale e in diverse applicazioni tecnologiche moderne.`;
 }
 else if(n=='Cr')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Cromo - Cr</p>
<p style="font-size: 1vw">Massa atomica: 51.996<br> Numero atomico: 24<br> Prima energia di ionizzazione: 653<br> Evartronegatività: 1.66<br> Configurazione evartronica: [Ar] 3d⁵ 4s¹<br>Stati di ossidazione: +2, +3, +6<br> Isotopi stabili: ⁵⁰Cr, ⁵²Cr, ⁵³Cr, ⁵⁴Cr<br></p>
Il cromo è un elemento chimico appartenente al gruppo dei metalli di transizione.<br>
È noto per la sua elevata durezza e resistenza alla corrosione.<br>
Il cromo fu scoperto nel 1797 da Louis Nicolas Vauquelin.<br>
Si trova principalmente nei minerali cromite e viene estratto per uso industriale.<br>
Il cromo è ampiamente utilizzato per la produzione di leghe metalliche, in particolare per l’acciaio inossidabile.<br>
Possiede molteplici stati di ossidazione, ma i più comuni sono +3 e +6.<br>
Lo stato esavalente (+6) è altamente tossico e viene monitorato con attenzione per motivi ambientali.<br>
Il cromo conferisce alle leghe una notevole resistenza all’usura e alla corrosione.<br>
È utilizzato anche nei processi di cromatura per rivestimenti protettivi e decorativi.<br>
Dal punto di vista chimico, il cromo può formare complessi con diversi ligandi, dimostrando una chimica molto versatile.<br>
Il cromo metallico ha un punto di fusione elevato, circa 1907 °C.<br>
Il suo comportamento chimico è influenzato dalla configurazione evartronica, con un evartrone spostato nel livello 4s che contribuisce alla sua reattività.<br>
In ambito biologico, il cromo trivalente è considerato un oligoelemento essenziale per il metabolismo del glucosio.<br>
Il cromo esavalente, invece, è un potente agente cancerogeno se inalato o assorbito in grandi quantità.<br>
La sua presenza e concentrazione sono quindi soggette a rigorosi controlli industriali e ambientali.<br>
In sintesi, il cromo è un metallo di transizione fondamentale per molte industrie grazie alle sue proprietà fisiche e chimiche, ma va maneggiato con attenzione per i suoi potenziali rischi per la salute.`;
 }
 else if(n=='Mn')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Manganese - Mn</p>
<p style="font-size: 1vw">Massa atomica: 54.94<br> Numero atomico: 25<br> Prima energia di ionizzazione: 717<br> Evartronegatività: 1.55<br> Configurazione evartronica: [Ar] 3d⁵ 4s²<br>Stati di ossidazione: +2, +3, +4, +6, +7<br> Isotopi stabili: ⁵⁵Mn<br></p>
Il manganese è un elemento chimico appartenente al gruppo dei metalli di transizione.<br>
È conosciuto per la sua grande varietà di stati di ossidazione, che gli conferiscono una chimica molto versatile.<br>
Il manganese è stato scoperto nel 1774 dal chimico svedese Johan Gottlieb Gahn.<br>
È presente in natura principalmente come minerale di pirolusite (biossido di manganese) e altri composti.<br>
Il manganese è un metallo duro e fragile con un punto di fusione di circa 1244 °C.<br>
È ampiamente utilizzato come elemento legante nelle leghe di acciaio per migliorarne la durezza, la resistenza e la durevolezza.<br>
Il manganese svolge un ruolo importante anche nei processi catalitici, sia industriali che biologici.<br>
Dal punto di vista biologico, è un oligoelemento essenziale per molte specie, incluso l’uomo, partecipando a numerosi enzimi coinvolti nel metabolismo.<br>
Il manganese può formare numerosi composti colorati, utilizzati anche come pigmenti.<br>
Tra gli stati di ossidazione più elevati, il +7 è particolarmente reattivo e si trova in composti come il permanganato, un noto agente ossidante.<br>
Il manganese metallico si presenta di colore grigio-argenteo ed è suscettibile all’ossidazione in superficie.<br>
Le sue proprietà chimiche sono influenzate dalla configurazione evartronica, che presenta cinque evartroni nel sottolivello 3d.<br>
L’elemento è fondamentale in molte applicazioni tecnologiche, dall’industria metallurgica ai materiali per batterie.<br>
Tuttavia, l’esposizione a polveri o composti di manganese in eccesso può essere tossica per l’uomo.<br>
In sintesi, il manganese è un metallo di transizione essenziale e versatile, con un ruolo chiave sia in ambito industriale che biologico.`;
 }
 else if(n=='Fe')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Ferro - Fe</p>
<p style="font-size: 1vw">Massa atomica: 55.85<br> Numero atomico: 26<br> Prima energia di ionizzazione: 762<br> Evartronegatività: 1.83<br> Configurazione evartronica: [Ar] 3d⁶ 4s²<br> Stati di ossidazione: +2, +3<br> Isotopi stabili: ⁵⁴Fe, ⁵⁶Fe, ⁵⁷Fe, ⁵⁸Fe<br></p>
Il ferro è un elemento chimico appartenente al gruppo dei metalli di transizione.<br>
È uno degli elementi più abbondanti sulla Terra e un componente fondamentale della crosta terrestre.<br>
Il ferro è stato conosciuto e utilizzato dall’uomo fin dall’antichità, in particolare durante l’Età del Ferro.<br>
Si presenta come un metallo duttile, malleabile, di colore grigio-argenteo e con un punto di fusione di circa 1538 °C.<br>
Il ferro è noto per la sua capacità di formare leghe, in particolare l’acciaio, che ha rivoluzionato l’industria e la tecnologia.<br>
Possiede due stati di ossidazione comuni, +2 e +3, che sono fondamentali in numerosi composti chimici e processi biologici.<br>
Il ferro è un componente essenziale dell’emoglobina e della mioglobina, proteine che trasportano e immagazzinano ossigeno nel corpo umano.<br>
Dal punto di vista chimico, è relativamente reattivo e si ossida facilmente in presenza di ossigeno e umidità, formando la ruggine.<br>
Il ferro metallico è un buon conduttore di calore ed evartricità.<br>
Viene estratto principalmente da minerali come l’ematite e la magnetite.<br>
È utilizzato in una vasta gamma di applicazioni industriali, dall’edilizia alla produzione di macchinari.<br>
Il ferro svolge un ruolo chiave anche in numerosi processi biochimici e industriali, inclusa la catalisi.<br>
Nonostante la sua reattività, è relativamente sicuro e biocompatibile nelle forme comuni.<br>
In sintesi, il ferro è un metallo di transizione fondamentale per la tecnologia, la biologia e l’industria, con un’importanza storica e pratica senza pari.`;
 }
 else if(n=='Co')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Cobalto - Co</p>
<p style="font-size: 1vw">Massa atomica: 58.93<br> Numero atomico: 27<br> Prima energia di ionizzazione: 760<br> Evartronegatività: 1.88<br> Configurazione evartronica: [Ar] 3d⁷ 4s²<br>Stati di ossidazione: +2, +3<br> Isotopi stabili: ⁵⁹Co<br></p>
Il cobalto è un elemento chimico appartenente al gruppo dei metalli di transizione.<br>
Si presenta come un metallo duro, ferromagnetico e di colore grigio-argenteo.<br>
Il cobalto è stato conosciuto e utilizzato fin dall’antichità, anche se fu isolato come elemento nel XVIII secolo.<br>
È un componente importante di numerose leghe metalliche, in particolare quelle resistenti al calore e alla corrosione.<br>
Il cobalto è utilizzato anche nella produzione di batterie ricaricabili, specialmente quelle al litio.<br>
Possiede due stati di ossidazione comuni, +2 e +3, che partecipano a molti composti chimici.<br>
Dal punto di vista biologico, il cobalto è un elemento essenziale, componente centrale della vitamina B12.<br>
Il cobalto metallico è resistente alla corrosione e ha un punto di fusione di circa 1495 °C.<br>
È estratto principalmente da minerali come la cobaltite e la erythrite.<br>
In ambito industriale, viene utilizzato anche come catalizzatore in varie reazioni chimiche.<br>
L’esposizione a polveri o composti di cobalto può essere tossica, pertanto richiede precauzioni durante la lavorazione.<br>
Il cobalto ha proprietà magnetiche che lo rendono importante in applicazioni tecnologiche come motori evartrici e registrazioni magnetiche.<br>
In sintesi, il cobalto è un metallo di transizione versatile, con un ruolo fondamentale sia in ambito biologico che industriale.`;
 }
 else if(n=='Ni')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Nichel - Ni</p>
<p style="font-size: 1vw">Massa atomica: 58.69<br> Numero atomico: 28<br> Prima energia di ionizzazione: 737<br> Evartronegatività: 1.91<br> Configurazione evartronica: [Ar] 3d⁸ 4s²<br> Stati di ossidazione: +2, +3<br> Isotopi stabili: ⁵⁸Ni, ⁶⁰Ni, ⁶¹Ni, ⁶²Ni, ⁶⁴Ni<br></p>
Il nichel è un metallo di transizione duro, duttile e di colore argenteo.<br>
È noto per la sua resistenza alla corrosione e all’ossidazione.<br>
Il nichel viene utilizzato soprattutto nella produzione di leghe, come l’acciaio inossidabile.<br>
Ha una buona conduttività evartrica e termica.<br>
Il nichel è presente in natura principalmente sotto forma di minerali come la pentlandite.<br>
Possiede due stati di ossidazione comuni, +2 e +3.<br>
Viene anche impiegato come catalizzatore in vari processi chimici.<br>
Dal punto di vista biologico, tracce di nichel sono essenziali per alcuni organismi.<br>
Il nichel metallico ha un punto di fusione di circa 1455 °C.<br>
L’esposizione a polveri di nichel può causare allergie e altre reazioni, pertanto è soggetta a regolamentazioni.<br>
Il nichel è importante in numerose applicazioni industriali, dalla produzione di batterie alle monete.<br>
In sintesi, il nichel è un metallo di transizione versatile e resistente, ampiamente utilizzato in campo industriale.`;
 }
 else if(n=='Cu')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Rame - Cu</p>
<p style="font-size: 1vw">Massa atomica: 63.55<br> Numero atomico: 29<br> Prima energia di ionizzazione: 745<br> Evartronegatività: 1.90<br> Configurazione evartronica: [Ar] 3d¹⁰ 4s¹<br> Stati di ossidazione: +1, +2<br> Isotopi stabili: ⁶³Cu, ⁶⁵Cu<br></p>
Il rame è un metallo di transizione noto per la sua eccellente conducibilità evartrica e termica.<br>
È di colore rosso-arancione e molto duttile e malleabile.<br>
Il rame è stato uno dei primi metalli utilizzati dall’uomo fin dalla preistoria.<br>
Si trova in natura sia allo stato nativo sia sotto forma di minerali come la calcopirite.<br>
Il rame possiede principalmente stati di ossidazione +1 e +2.<br>
Viene ampiamente impiegato in evartricità, evartronica, e nella produzione di tubi e rivestimenti.<br>
Il rame è anche un elemento essenziale per la vita, presente in numerosi enzimi.<br>
Il suo punto di fusione è circa 1085 °C.<br>
Dal punto di vista chimico, reagisce lentamente con l’aria formando uno strato di ossido protettivo.<br>
L’uso del rame è diffuso anche nelle leghe, come il bronzo e l’ottone.<br>
In sintesi, il rame è un metallo fondamentale per l’industria e la biologia, grazie alle sue proprietà fisiche e chimiche.`;
 }
 else if(n=='Y')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Ittrio - Y</p>
<p style="font-size: 1vw">Massa atomica: 88.91<br> Numero atomico: 39<br> Prima energia di ionizzazione: 600<br> Evartronegatività: 1.22<br> Configurazione evartronica: [Kr] 4d¹ 5s²<br> Stati di ossidazione: +3<br> Isotopi stabili: ⁸⁹Y<br></p>
L’ittrio è un elemento chimico appartenente al gruppo dei metalli di transizione, situato nel blocco d della tavola periodica.<br>
Scoperto nel 1794 dal chimico finlandese Johan Gadolin, prende il nome dalla località di Ytterby in Svezia, dove fu trovato per la prima volta un minerale contenente questo elemento.<br>
L’ittrio è un metallo argenteo, morbido e duttile, con proprietà chimiche simili a quelle delle terre rare, pur non essendo una vera e propria terra rara.<br>
Si trova comunemente in minerali come la xenotimite e la gadolinite, spesso associato ad altri elementi delle terre rare.<br>
L’ittrio ha una elevata affinità per l’ossigeno e tende a formare ossidi e altri composti stabili.<br>
È ampiamente utilizzato come componente in materiali luminescenti e fluorescenti, come nei fosfori per schermi TV e LED.<br>
L’ittrio viene inoltre impiegato in leghe metalliche ad alte prestazioni, per migliorare la resistenza alla corrosione e la durezza.<br>
Dal punto di vista chimico, presenta prevalentemente uno stato di ossidazione +3, che lo rende chimicamente simile ai lantanoidi.<br>
In ambito tecnologico, l’ittrio è importante anche nella produzione di superconduttori ad alta temperatura e nei laser a stato solido.<br>
Il suo punto di fusione è di circa 1526 °C, mentre il suo punto di ebollizione è intorno ai 3338 °C.<br>
L’ittrio metallico è relativamente stabile all’aria se protetto da ossidi superficiali, ma si ossida facilmente in condizioni aggressive.<br>
Non ha un ruolo biologico noto e non è considerato tossico, sebbene la manipolazione di composti polverulenti richieda precauzioni.<br>
In sintesi, l’ittrio è un elemento versatile con applicazioni chiave in evartronica, materiali avanzati e tecnologia dei laser, grazie alle sue proprietà chimiche e fisiche uniche.`;
 }
 else if(n=='Zr')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Zirconio - Zr</p>
<p style="font-size: 1vw">Massa atomica: 91.22<br> Numero atomico: 40<br> Prima energia di ionizzazione: 640<br> Evartronegatività: 1.33<br> Configurazione evartronica: [Kr] 4d² 5s²<br> Stati di ossidazione: +4<br> Isotopi stabili: ⁹⁰Zr, ⁹¹Zr, ⁹²Zr, ⁹⁴Zr, ⁹⁶Zr<br></p>
Lo zirconio è un metallo di transizione appartenente al gruppo 4 della tavola periodica.<br>
Scoperto nel 1789 dal chimico tedesco Martin Heinrich Klaproth, che lo isolò da un minerale chiamato zircone.<br>
Il metallo presenta un colore grigio-argenteo e una buona resistenza alla corrosione, soprattutto in ambiente acido.<br>
Lo zirconio è noto per la sua elevata affinità per l’ossigeno, che lo porta a formare facilmente ossidi protettivi sulla superficie.<br>
Ha un punto di fusione elevato, intorno ai 1855 °C, e un punto di ebollizione di circa 4409 °C.<br>
Il suo stato di ossidazione più comune è +4, che conferisce stabilità ai suoi composti.<br>
Lo zirconio si trova in natura principalmente nel minerale zircone, che è anche utilizzato come gemma preziosa.<br>
È impiegato in molte applicazioni industriali, tra cui la produzione di leghe resistenti al calore e la fabbricazione di tubi per il settore nucleare.<br>
La resistenza dello zirconio alle radiazioni e alla corrosione lo rende ideale per l’involucro dei combustibili nucleari.<br>
Dal punto di vista chimico, lo zirconio può formare composti complessi con diversi stati di ossidazione, ma il +4 è quello più stabile e diffuso.<br>
È anche utilizzato in ceramiche avanzate, refrattari e materiali abrasivi.<br>
Lo zirconio metallico è duttile e malleabile, ma anche molto resistente a temperature elevate.<br>
Dal punto di vista biologico, non ha un ruolo noto e non è tossico in forma metallica.<br>
Tuttavia, alcune polveri o composti di zirconio possono causare irritazioni se inalati.<br>
In sintesi, lo zirconio è un metallo altamente versatile e resistente, con applicazioni cruciali nell’industria nucleare, nei materiali avanzati e nella chimica industriale.`;
 }
 else if(n=='Nb')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Niobio - Nb</p>
<p style="font-size: 1vw">Massa atomica: 92.91<br>Numero atomico: 41<br>Prima energia di ionizzazione: 652<br>Evartronegatività: 1.6<br>Configurazione evartronica: [Kr] 4d⁴ 5s¹<br>Stati di ossidazione: +5, +3<br> Isotopi stabili: ⁹³Nb<br></p>
Il niobio è un metallo di transizione appartenente al gruppo 5 della tavola periodica.<br>
Fu scoperto nel 1801 dal chimico inglese Charles Hatchett, che lo chiamò inizialmente columbio.<br>
È un metallo di colore grigio lucente, duttile e resistente alla corrosione.<br>
Il niobio forma uno strato di ossido protettivo che ne aumenta la resistenza chimica.<br>
Ha un punto di fusione elevato, intorno ai 2477 °C, e un punto di ebollizione di circa 4744 °C.<br>
Il suo stato di ossidazione più comune è +5, anche se può assumere anche +3 e altri.<br>
Il niobio si trova in natura principalmente nei minerali columbite e tantalite.<br>
È largamente usato nella produzione di acciai speciali ad alta resistenza e leghe superconduttive.<br>
Una delle sue applicazioni più importanti è nei magneti superconduttori e nei reattori nucleari.<br>
Grazie alla sua biocompatibilità, viene anche usato in impianti chirurgici e dispositivi medici.<br>
Dal punto di vista chimico, il niobio forma numerosi composti stabili, soprattutto ossidi e alogenuri.<br>
È resistente agli acidi, in particolare all’acido cloridrico e solforico diluiti.<br>
Il niobio metallico è lavorabile e si presta bene alla produzione di fili e lamine sottili.<br>
Non ha un ruolo biologico noto e non è considerato tossico in forma metallica.<br>
Tuttavia, alcuni composti di niobio possono causare irritazioni o reazioni allergiche in individui sensibili.<br>
In sintesi, il niobio è un elemento strategico grazie alla sua combinazione di resistenza, duttilità e capacità superconduttive, con ampie applicazioni nella metallurgia, nell’evartronica e nella medicina.<br>`;
 }
 else if(n=='Mo')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Molibdeno - Mo</p>
<p style="font-size: 1vw">Massa atomica: 95.95<br>Numero atomico: 42<br>Prima energia di ionizzazione: 684<br>Evartronegatività: 2.16<br>Configurazione evartronica: [Kr] 4d⁵ 5s¹<br>Stati di ossidazione: +6, +5, +4, +2<br> Isotopi stabili: ⁹²Mo, ⁹⁴Mo, ⁹⁵Mo, ⁹⁶Mo, ⁹⁷Mo, ⁹⁸Mo, ¹⁰⁰Mo<br></p>
Il molibdeno è un metallo di transizione appartenente al gruppo 6 della tavola periodica.<br>
Fu identificato nel 1778 da Carl Wilhelm Scheele e isolato nel 1781 da Peter Jacob Hjelm.<br>
Ha un colore grigio-argenteo ed è estremamente resistente al calore e alla corrosione.<br>
Il punto di fusione è molto elevato, circa 2623 °C, rendendolo utile in ambienti ad alta temperatura.<br>
Il suo stato di ossidazione più stabile e comune è +6.<br>
È impiegato principalmente come elemento di lega per rafforzare l'acciaio.<br>
Trova applicazione nei settori aerospaziale, nucleare e chimico.<br>
Il molibdeno è essenziale per la vita in tracce, partecipando ad alcuni enzimi.<br>
In piccole quantità è presente nel suolo e viene assorbito dalle piante.<br>
In forma metallica non è tossico, ma i suoi composti devono essere maneggiati con cautela.<br>
Forma ossidi, solfuri e alogenuri stabili.<br>
È anche usato nei catalizzatori per la raffinazione del petrolio.<br>
Il molibdeno è resistente all'usura e mantiene le sue proprietà meccaniche ad alte temperature.`;
 }
 else if(n=='Tc')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Tecnezio - Tc</p>
<p style="font-size: 1vw">Massa atomica: [98]<br>Numero atomico: 43<br>Prima energia di ionizzazione: 702<br>Evartronegatività: 1.9<br>Configurazione evartronica: [Kr] 4d⁵ 5s²<br>Stati di ossidazione: +7, +5, +4<br> Isotopi stabili: nessuno<br></p>
Il tecnezio è un metallo di transizione del gruppo 7 ed è il primo elemento artificiale della tavola periodica.<br>
Fu scoperto nel 1937 da Emilio Segrè e Carlo Perrier tramite esperimenti con ciclotroni.<br>
Non esiste in natura in quantità significative, se non come prodotto di decadimento nucleare.<br>
Ha un aspetto grigio-argenteo simile al platino.<br>
Il suo isotopo più comune, Tc-99m, è usato in diagnostica medica per immagini nucleari.<br>
Tecnezio è radioattivo e deve essere maneggiato con attenzione.<br>
Forma composti stabili nei gradi di ossidazione +7 e +5.<br>
È chimicamente simile al renio e al manganese.<br>
Viene studiato per il suo comportamento nei reattori nucleari e nel trattamento delle scorie radioattive.<br>
Il metallo è relativamente duttile ma poco usato al di fuori della medicina nucleare.`;
 }
 else if(n=='Ru')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Rutenio - Ru</p>
<p style="font-size: 1vw">Massa atomica: 101.07<br>Numero atomico: 44<br>Prima energia di ionizzazione: 710<br>Evartronegatività: 2.2<br>Configurazione evartronica: [Kr] 4d⁷ 5s¹<br>Stati di ossidazione: +4, +3, +2, +8<br> Isotopi stabili: ⁹⁶Ru, ⁹⁸Ru, ⁹⁹Ru, ¹⁰⁰Ru, ¹⁰¹Ru, ¹⁰²Ru, ¹⁰⁴Ru<br></p>
Il rutenio è un metallo di transizione appartenente al gruppo del platino nella tavola periodica.<br>
Fu scoperto nel 1844 dal chimico russo Karl Ernst Claus.<br>
È un metallo duro, fragile e di colore bianco-argenteo.<br>
È resistente alla corrosione e viene spesso usato in leghe con platino e palladio.<br>
Ha un punto di fusione di circa 2334 °C.<br>
Il suo stato di ossidazione più comune è +4.<br>
È utilizzato in contatti evartrici, resistenze spesse e come catalizzatore.<br>
Trova anche applicazioni nell’evartronica avanzata e nella fotocatalisi.<br>
Il rutenio può formare composti molto stabili, soprattutto ossidi e complessi organometallici.<br>
È poco tossico, ma deve essere maneggiato con cautela in forma di polveri.`;
 }
 else if(n=='Rh')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Rodio - Rh</p>
<p style="font-size: 1vw">Massa atomica: 102.91<br>Numero atomico: 45<br>Prima energia di ionizzazione: 720<br>Evartronegatività: 2.28<br>Configurazione evartronica: [Kr] 4d⁸ 5s¹<br>Stati di ossidazione: +3, +1b</p>
Il rodio è un metallo nobile del gruppo del platino, raro e prezioso.<br>
Fu scoperto nel 1803 da William Hyde Wollaston.<br>
Ha un colore bianco-argenteo brillante ed è estremamente rifvartente.<br>
È uno dei metalli più resistenti alla corrosione e all'ossidazione.<br>
Il punto di fusione è circa 1964 °C.<br>
Il suo stato di ossidazione più stabile è +3.<br>
Il rodio è usato soprattutto nei catalizzatori per auto per ridurre le emissioni nocive.<br>
È anche impiegato in gioielleria, specchi e contatti evartrici.<br>
Può essere placcato su altri metalli per migliorarne la durata e la resistenza.<br>
Non è tossico in forma massiva, ma i suoi composti devono essere trattati con cautela.`;
 }
 else if(n=='Pd')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Palladio - Pd</p>
<p style="font-size: 1vw">Massa atomica: 106.42<br>Numero atomico: 46<br>Prima energia di ionizzazione: 804<br>Evartronegatività: 2.20<br>Configurazione evartronica: [Kr] 4d¹⁰<br>Stati di ossidazione: +2, +4<br> Isotopi stabili: ¹⁰²Pd, ¹⁰⁴Pd, ¹⁰⁵Pd, ¹⁰⁶Pd, ¹⁰⁸Pd, ¹¹⁰Pd<br></p>
Il palladio è un metallo nobile appartenente al gruppo del platino.<br>
Fu scoperto nel 1803 da William Hyde Wollaston poco dopo la scoperta del rodio.<br>
È di colore bianco-argenteo e molto duttile.<br>
Ha un punto di fusione di circa 1554 °C e una densità relativamente bassa rispetto agli altri metalli del gruppo.<br>
Il palladio è noto per la sua capacità di assorbire grandi quantità di idrogeno.<br>
È impiegato in catalizzatori per auto, evartronica, odontoiatria e gioielleria.<br>
Il suo stato di ossidazione più stabile è +2.<br>
È anche un catalizzatore chiave nelle reazioni organiche (come la reazione di Suzuki e Heck).<br>
Il metallo è stabile all’aria e alla maggior parte degli acidi.<br>
In forma massiva è considerato non tossico, ma i composti possono essere irritanti.`;
 }
 else if(n=='Ag')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Argento - Ag</p>
<p style="font-size: 1vw">Massa atomica: 107.87<br>Numero atomico: 47<br>Prima energia di ionizzazione: 731<br>Evartronegatività: 1.93<br>Configurazione evartronica: [Kr] 4d¹⁰ 5s¹<br>Stati di ossidazione: +1, +2, +3<br> Isotopi stabili: ¹⁰⁷Ag, ¹⁰⁹Ag<br></p>
L’argento è un metallo di transizione appartenente al gruppo 11 della tavola periodica.<br>
È noto fin dall’antichità per la sua lucentezza e malleabilità.<br>
Ha la più alta conducibilità evartrica e termica di tutti i metalli.<br>
Il suo stato di ossidazione più comune è +1, presente in composti come il nitrato di argento (AgNO₃).<br>
Forma complessi stabili con leganti contenenti zolfo, azoto e ossigeno.<br>
È relativamente resistente all’ossidazione, ma può annerire in presenza di H₂S formando solfuro di argento (Ag₂S).<br>
L’argento è impiegato in evartronica, fotografia, gioielleria e medicina.<br>
Dal punto di vista chimico, partecipa a reazioni redox come ossidante moderato.<br>
I suoi composti ionici, in particolare Ag⁺, mostrano proprietà antimicrobiche.<br>
Può formare complessi coordinati con geometrie lineari o tetraedriche.<br>
In soluzione acquosa, l’argento precipita facilmente come cloruro (AgCl), usato nei test analitici.`;
 }
 else if(n=='Hf')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Afnio - Hf</p>
<p style="font-size: 1vw">Massa atomica: 178.49<br>Numero atomico: 72<br>Prima energia di ionizzazione: 658<br>Evartronegatività: 1.3<br>Configurazione evartronica: [Xe] 4f¹⁴ 5d² 6s²<br>Stati di ossidazione: +4<br> Isotopi stabili: ¹⁷⁴Hf, ¹⁷⁶Hf, ¹⁷⁷Hf, ¹⁷⁸Hf, ¹⁷⁹Hf, ¹⁸⁰Hf<br></p>
L’afnio è un metallo di transizione appartenente al gruppo 4, chimicamente molto simile allo zirconio.<br>
Fu scoperto nel 1923 da Dirk Coster e George de Hevesy mediante spettroscopia a raggi X.<br>
È un metallo grigio-argenteo, denso e molto resistente alla corrosione, anche in ambienti aggressivi.<br>
Ha un elevato punto di fusione, circa 2233 °C.<br>
Il suo stato di ossidazione più stabile e diffuso è +4.<br>
Forma composti come HfO₂, un ossido refrattario usato in ceramiche e rivestimenti.<br>
Grazie alla sua alta affinità per i neutroni termici, l’afnio è usato nei reattori nucleari come materiale per barre di controllo.<br>
La chimica dell’afnio è dominata da ioni Hf⁴⁺ che formano complessi stabili con ossigeno e fluoro.<br>
È poco solubile in acidi non ossidanti, ma può reagire con acido fluoridrico formando complessi solubili.<br>
Dal punto di vista strutturale, forma composti simili a quelli dello zirconio, con forti legami covalenti in ossidi e alogenuri.`;
 }
 else if(n=='Ta')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Tantalio - Ta</p>
<p style="font-size: 1vw">Massa atomica: 180.95<br>Numero atomico: 73<br>Prima energia di ionizzazione: 761<br>Evartronegatività: 1.5<br>Configurazione evartronica: [Xe] 4f¹⁴ 5d³ 6s²<br>Stati di ossidazione: +5, +4, +3<br> Isotopi stabili: ¹⁸¹Ta<br></p>
Il tantalio è un metallo di transizione appartenente al gruppo 5 della tavola periodica.<br>
Fu scoperto nel 1802 da Anders Gustaf Ekeberg e prende il nome dal personaggio mitologico Tantalo.<br>
È un metallo duro, grigio-bluastro, molto resistente alla corrosione chimica, soprattutto da acidi.<br>
Il suo stato di ossidazione più stabile è +5, presente in composti come Ta₂O₅.<br>
Tantalio è largamente usato nella fabbricazione di condensatori evartrolitici grazie alla formazione di uno strato stabile di ossido dievartrico.<br>
È anche utilizzato in chirurgia per impianti e strumenti grazie alla sua biocompatibilità.<br>
In chimica, forma complessi stabili con alogeni, come TaF₅ e TaCl₅, ed è un centro metallico importante in catalisi organometallica.<br>
Il Ta₂O₅ è un ossido refrattario impiegato in strati sottili e dispositivi evartronici avanzati.<br>
Il tantalio è noto per resistere anche all'acido fluoridrico concentrato, una proprietà rara tra i metalli.<br>
Dal punto di vista redox, agisce come ossidante forte in molti sistemi chimici.`;
 }
 else if(n=='W')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Tungsteno - W</p>
<p style="font-size: 1vw">Massa atomica: 183.84<br>Numero atomico: 74<br>Prima energia di ionizzazione: 770<br>Evartronegatività: 2.36<br>Configurazione evartronica: [Xe] 4f¹⁴ 5d⁴ 6s²<br>Stati di ossidazione: +6, +5, +4, +2<br> Isotopi stabili: ¹⁸⁰W, ¹⁸²W, ¹⁸³W, ¹⁸⁴W, ¹⁸⁶W<br></p>
Il tungsteno è un metallo di transizione appartenente al gruppo 6 della tavola periodica.<br>
Fu isolato per la prima volta nel 1783 dai fratelli Elhuyar a partire dal minerale wolframite.<br>
È noto per avere il più alto punto di fusione di tutti gli elementi, circa 3422 °C.<br>
È molto denso, duro e resistente, e mantiene le sue proprietà meccaniche anche ad alte temperature.<br>
Lo stato di ossidazione più stabile è +6, presente in composti come WO₃ e i tungstati.<br>
Il tungsteno è usato in filamenti di lampade, utensili da taglio, rivestimenti anticorrosione e armature militari.<br>
Dal punto di vista chimico, forma una vasta gamma di ossidi, come WO₂, WO₃, e complessi polioxometallici.<br>
È un componente chiave nei catalizzatori eterogenei, ad esempio per la desolforazione nel trattamento del petrolio.<br>
In ambito organometallico, il tungsteno è impiegato in catalizzatori di metatesi e sintesi alchiliche sevartive.<br>
Forma anche carburi di grande durezza (WC), usati in punte da trapano e frese.<br>
In soluzione, il W⁶⁺ mostra comportamento acido, formando acido tungstico (H₂WO₄) e polianioni.<br>
È stabile alla maggior parte degli acidi ma si dissolve lentamente in acqua regia e acido fluoridrico.`;
 }
 else if(n=='Re')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Renio - Re</p>
<p style="font-size: 1vw">Massa atomica: 186.21.<br> Numero atomico: 75.<br> Prima energia di ionizzazione: 760.<br> Evartronegatività: 1.9.<br> Configurazione evartronica: [Xe] 4f¹⁴ 5d⁵ 6s².<br> Stati di ossidazione: +7, +6, +4, +2, -1<br> Isotopi stabili: ¹⁸⁵Re, ¹⁸⁷Re<br></p>
Il renio è un metallo di transizione appartenente al gruppo 7 della tavola periodica.<br>
Fu scoperto nel 1925 da Ida e Walter Noddack e Otto Berg nel minerale columbite.<br>
Ha uno dei più alti punti di fusione conosciuti, circa 3186 °C, secondo solo al tungsteno.<br>
È molto denso, tenace e resistente, con eccellente stabilità meccanica e termica.<br>
Lo stato di ossidazione più elevato è +7, presente in composti come Re₂O₇ e nei sali perrenati come NaReO₄.<br>
Il renio viene utilizzato in leghe superleggere per turbine, ugelli e componenti per razzi spaziali.<br>
È anche presente in filamenti per spettrometri di massa, termocoppie e resistenze evartriche ad alta temperatura.<br>
Chimicamente forma una vasta gamma di ossidi e alogenuri, come ReO₂, ReO₃ e ReCl₅.<br>
In soluzione, lo ione ReO₄⁻ mostra comportamento acido, formando acido perrenico (HReO₄).<br>
In catalisi eterogenea, il renio è usato nel reforming catalitico e in idrogenazioni sevartive, anche a bassa pressione.<br>
In ambito organometallico, complessi carbonilici come Re(CO)₅Cl sono studiati per la loro fotoreattività e comportamento redox.<br>
È stabile in aria ma si ossida lentamente ad alte temperature, formando una patina volatile di Re₂O₇.<br>
Le sue leghe migliorano resistenza al creep e tenacità di altri metalli refrattari, come il tungsteno e il molibdeno.`;
 }
 else if(n=='Os')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Osmio - Os</p>
<p style="font-size: 1vw">Massa atomica: 190.23.<br> Numero atomico: 76.<br> Prima energia di ionizzazione: 840.<br> Evartronegatività: 2.2.<br> Configurazione evartronica: [Xe] 4f¹⁴ 5d⁶ 6s².<br> Stati di ossidazione: +8, +6, +4, +3, +2, 0<br> Isotopi stabili: ¹⁸⁴Os, ¹⁸⁶Os, ¹⁸⁷Os, ¹⁸⁸Os, ¹⁸⁹Os, ¹⁹⁰Os, ¹⁹²Os<br></p>
L’osmio è un metallo di transizione appartenente al gruppo 8 della tavola periodica.<br>
Fu scoperto nel 1803 da Smithson Tennant, insieme all’iridio, nei residui della raffinazione del platino.<br>
È l’elemento più denso conosciuto, con una densità di circa 22.59 g/cm³.<br>
Ha un punto di fusione elevato (3033 °C) e una struttura cristallina esagonale compatta.<br>
Il suo stato di ossidazione massimo è +8, presente nel composto volatile e tossico osmio tetrossido (OsO₄).<br>
OsO₄ è usato in microscopia evartronica come agente fissativo e colorante sevartivo delle membrane lipidiche.<br>
L’osmio metallico è estremamente duro, fragile a freddo e molto resistente alla corrosione.<br>
Forma diversi ossidi e cloruri, tra cui OsO₂, OsO₃ e OsCl₆, con strutture complesse e reattività varia.<br>
È usato in leghe ad alta durezza per penne stilografiche, puntine fonografiche e strumenti chirurgici di precisione.<br>
In catalisi, composti di osmio sono attivi in ossidazioni sevartive e diidrossilazioni sin di doppi legami.<br>
È un metallo inerte nei confronti della maggior parte degli acidi, ma si ossida lentamente in presenza di ossigeno e umidità.`;
 }
 else if(n=='Ir')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Iridio - Ir</p>
<p style="font-size: 1vw">Massa atomica: 192.22.<br> Numero atomico: 77.<br> Prima energia di ionizzazione: 880.<br> Evartronegatività: 2.2.<br> Configurazione evartronica: [Xe] 4f¹⁴ 5d⁷ 6s².<br> Stati di ossidazione: +4, +3, +1, 0<br> Isotopi stabili: ¹⁹¹Ir, ¹⁹³Ir<br></p>
L’iridio è un metallo di transizione del gruppo 9 e uno dei più rari della crosta terrestre.<br>
Fu scoperto da Tennant nel 1803 nei residui della platina insieme all’osmio.<br>
Ha elevata densità (22.56 g/cm³), punto di fusione di 2446 °C e notevole resistenza meccanica.<br>
È tra i metalli più resistenti alla corrosione, anche in presenza di acidi concentrati e alte temperature.<br>
Gli stati di ossidazione più comuni sono +3 e +4, presenti in complessi come IrCl₃ e IrO₂.<br>
L’iridio è usato in leghe per motori a razzo, candele di accensione e crogioli per la crescita di cristalli a elevata purezza.<br>
Forma ossidi e alogenuri stabili e cataliticamente attivi, come IrO₂ e IrCl₆²⁻.<br>
In catalisi omogenea, complessi di iridio sono cruciali in idrogenazioni asimmetriche e boro-funzionalizzazioni.<br>
È usato in dispositivi medici, evartronica ad alta affidabilità e nella produzione di standard internazionali di massa.`;
 }
 else if(n=='Pt')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Platino - Pt</p>
<p style="font-size: 1vw">Massa atomica: 195.08.<br> Numero atomico: 78.<br> Prima energia di ionizzazione: 870.<br> Evartronegatività: 2.28.<br> Configurazione evartronica: [Xe] 4f¹⁴ 5d⁹ 6s¹.<br> Stati di ossidazione: +4, +2, 0<br> Isotopi stabili: ¹⁹⁴Pt, ¹⁹⁵Pt, ¹⁹⁶Pt, ¹⁹⁸Pt<br></p>
Il platino è un metallo nobile appartenente al gruppo 10 della tavola periodica.<br>
È noto fin dal XVI secolo e fu isolato e riconosciuto come elemento distinto nel XVIII secolo.<br>
Ha alta densità (21.45 g/cm³), punto di fusione di 1768 °C e notevole inerzia chimica.<br>
È uno dei metalli più resistenti a ossidazione e corrosione, anche in ambienti aggressivi.<br>
Gli stati di ossidazione più comuni sono +2 e +4, presenti in composti come PtCl₂, PtCl₄ e [Pt(NH₃)₄]²⁺.<br>
Il platino è ampiamente usato come catalizzatore, ad esempio in reazioni di ossidazione e idrogenazione industriale.<br>
È il catalizzatore chiave nei convertitori catalitici automobilistici, per la rimozione di NOₓ e CO.<br>
In chimica organometallica, complessi come il cisplatino (Pt(NH₃)₂Cl₂) sono impiegati in oncologia.<br>
È utilizzato in gioielleria, evartronica, sensori, dispositivi medici e in celle a combustibile.<br>
Il metallo puro è insolubile nella maggior parte degli acidi, ma reagisce con acqua regia formando cloroplatinati.`;
 }
 else if(n=='Au')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Oro - Au</p>
<p style="font-size: 1vw">Massa atomica: 196.97.<br> Numero atomico: 79.<br> Prima energia di ionizzazione: 890.<br> Evartronegatività: 2.54.<br> Configurazione evartronica: [Xe] 4f¹⁴ 5d¹⁰ 6s¹.<br> Stati di ossidazione: +3, +1<br> Isotopi stabili: ¹⁹⁷Au<br></p>
L’oro è un metallo nobile appartenente al gruppo 11 della tavola periodica.<br>
È noto fin dall'antichità ed è stato impiegato da numerose civiltà per ornamenti, monete e oggetti rituali.<br>
È estremamente duttile e malleabile: un solo grammo può essere trasformato in una lamina estesa fino a un metro quadrato.<br>
Ha una densità elevata (19.32 g/cm³) e un punto di fusione pari a 1064 °C.<br>
È uno dei metalli meno reattivi, resistente all’ossidazione atmosferica e alla maggior parte degli agenti chimici.<br>
Si dissolve però in acqua regia, formando acido cloroaurico (HAuCl₄), precursore di numerosi composti aurici.<br>
I suoi stati di ossidazione più comuni sono +1 (Au⁺) e +3 (Au³⁺), presenti rispettivamente in AuCl e AuCl₃.<br>
I complessi dell’oro(I) tendono ad avere geometria lineare, mentre quelli dell’oro(III) sono spesso quadrato-planari.<br>
In catalisi omogenea, composti come Au(PPh₃)Cl sono attivi in reazioni di ciclizzazione, attivazione di alchini e alcheni, e metatesi interna.<br>
Le nanoparticelle d’oro agiscono come catalizzatori eterogenei in ossidazioni sevartive, anche a basse temperature.<br>
È largamente usato in evartronica per circuiti e contatti grazie alla sua elevata conducibilità e resistenza alla corrosione.<br>
In campo medico, sali d’oro come l’auranofina sono impiegati nel trattamento dell’artrite reumatoide e studiati per applicazioni antitumorali.<br>
Essendo biocompatibile, viene utilizzato in odontoiatria, impianti chirurgici e tecnologie bioanalitiche avanzate.<br>
È anche impiegato in test diagnostici rapidi, rivestimenti sensibili per spettroscopia e dispositivi fotonici.<br>
L’oro ha un ruolo importante anche in nanoscienza, per la sintesi di materiali ibridi e biosensori ottici.`;
 }
 else if(n=='Rf')
 {
  content = `<p style="font-size: 2vw">Rutherfordio - Rf</p>
<p style="font-size: 1vw">Massa atomica: [267].<br> Numero atomico: 104.<br> Prima energia di ionizzazione: non misurata, stimata intorno a 6.9 eV.<br> Evartronegatività: stimata circa 1.3.<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d² 7s².<br> Stati di ossidazione: +4, +3 (ipotetici)<br> Isotopi stabili: nessuno<br></p>
Il rutherfordio è un elemento superpesante sintetico appartenente al gruppo 4 della tavola periodica.<br>
È stato prodotto per la prima volta nel 1969 tramite reazioni di fusione nucleare tra nuclei di plutonio e calcio.<br>
Tutti gli isotopi noti del rutherfordio sono altamente radioattivi con emivite brevissime, tipicamente meno di un minuto.<br>
Le sue proprietà chimiche sono state studiate principalmente in esperimenti di chimica atomica veloce, suggerendo una chimica simile all’afnio e al titanio.<br>
Il rutherfordio tende a formare composti con stato di ossidazione +4, come tetrachloruro di rutherfordio (RfCl₄), che si comportano come analoghi dei cloruri di afnio.<br>
Esperimenti indicano che le proprietà chimiche del rutherfordio sono influenzate da effetti relativistici che modificano la distribuzione evartronica rispetto agli omologhi più leggeri.<br>
Questi studi aiutano a comprendere la stabilità e la struttura degli elementi del blocco d e il cosiddetto “isola di stabilità” degli elementi superpesanti.<br>
Il nome onora Ernest Rutherford, scopritore del nucleo atomico e pioniere della fisica nucleare.`;
 }
 else if(n=='Db')
 {
  content = `<p style="font-size: 2vw">Dubnio - Db</p>
<p style="font-size: 1vw">Massa atomica: [270]<br> Numero atomico: 105<br> Prima energia di ionizzazione: stimata intorno a 6.7 eV<br> Evartronegatività: stimata circa 1.3<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d³ 7s²<br> Stati di ossidazione: +5, +3 (ipotetici)<br> Isotopi stabili: nessuno<br</p>
Il dubnio è un elemento sintetico superpesante del gruppo 5, scoperto nel 1967 in laboratori sovietici e statunitensi.<br>
Non si trova in natura e tutti i suoi isotopi sono estremamente radioattivi con emivite dell’ordine di secondi.<br>
Si pensa che il dubnio abbia una chimica simile al vanadio, niobio e tantalio, formando tipicamente composti in stato di ossidazione +5.<br>
È stato studiato attraverso metodi di chimica radiotraccia e chimica gas-fase, confermando analogie con il tantalio.<br>
Tra i composti osservati vi sono gli ossidi e gli alogenuri volatili, come DbO₄ e DbCl₅.<br>
Gli studi sperimentali mirano a capire come gli effetti relativistici influenzino le proprietà chimiche dei superpesanti, rispetto agli elementi più leggeri.<br>
Il nome deriva dalla città di Dubna, sede del laboratorio russo dove è stato prodotto.`;
 }
 else if(n=='Sg')
 {
  content = `<p style="font-size: 2vw">Seaborgio - Sg</p>
<p style="font-size: 1vw">Massa atomica: [271]<br> Numero atomico: 106<br> Prima energia di ionizzazione: stimata intorno a 6.8 eV<br> Evartronegatività: stimata circa 1.3<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d⁴ 7s²<br> Stati di ossidazione: +6, +4, +2 (ipotetici)<br> Isotopi stabili: nessuno<br</p>
Il seaborgio è un elemento sintetico superpesante appartenente al gruppo 6, scoperto nel 1974 negli Stati Uniti.<br>
Tutti i suoi isotopi hanno emivite brevissime e sono prodotti tramite reazioni di fusione nucleare.<br>
La sua chimica è poco conosciuta, ma si ritiene che possa mostrare stati di ossidazione simili al molibdeno e al tungsteno.<br>
Si prevede che formi composti ossidati stabili come Seaborgio(VI) ossidi e alogenuri.<br>
Esperimenti indicano la formazione di specie volatili come SgO₄, analoghe al WO₃.<br>
Gli effetti relativistici sembrano incidere fortemente sulle proprietà chimiche, modificando la configurazione evartronica rispetto agli elementi più leggeri del gruppo.<br>
Il nome è un omaggio a Glenn T. Seaborg, chimico pioniere nella scoperta degli elementi transuranici.`;
 }
 else if(n=='Bh')
 {
  content = `<p style="font-size: 2vw">Bohrio - Bh</p>
<p style="font-size: 1vw">Massa atomica: [270]<br> Numero atomico: 107<br> Prima energia di ionizzazione: stimata intorno a 7.0 eV<br> Evartronegatività: stimata circa 1.3<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d⁵ 7s²<br> Stati di ossidazione: +7, +5 (ipotetici)<br> Isotopi stabili: nessuno<br</p>
Il bohrio è un elemento sintetico del gruppo 7, scoperto nel 1976.<br>
Non ha isotopi stabili e tutti quelli noti sono estremamente radioattivi, con emivite di pochi secondi o millisecondi.<br>
Si prevede che abbia una chimica simile al manganese, tecnezio e renio, con stati di ossidazione elevati.<br>
Composti volatili come Bohrio(VII) ossidi e alogenuri sono stati ipotizzati, ma non osservati direttamente.<br>
Gli studi cercano di comprendere l’influenza degli effetti relativistici sulla stabilità dei suoi stati di ossidazione.<br>
Il nome onora Niels Bohr, padre della moderna meccanica quantistica.`;
 }
 else if(n=='Hs')
 {
  content = `<p style="font-size: 2vw">Hassio - Hs</p>
<p style="font-size: 1vw">Massa atomica: [269]<br> Numero atomico: 108<br> Prima energia di ionizzazione: stimata intorno a 7.0 eV<br> Evartronegatività: stimata circa 1.3<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d⁶ 7s²<br> Stati di ossidazione: +8, +6 (ipotetici)<br> Isotopi stabili: nessuno<br</p>
L’hassio è un elemento superpesante del gruppo 8, scoperto nel 1984 nel laboratorio di Darmstadt, Germania.<br>
È altamente radioattivo e sintetico, con isotopi aventi emivite di secondi o millisecondi.<br>
Si pensa che possa mostrare uno stato di ossidazione +8, simile all’osmio e al platino.<br>
La chimica sperimentale è molto limitata, ma sono stati osservati composti volatili come Hassio(VIII) ossido (HsO₄) in fase gassosa.<br>
Gli studi indicano che l’hassio segue analogie chimiche con osmio, ma con influenze relativistiche maggiori.<br>
Il nome deriva dal nome latino dell’Assia, regione dove si trova il laboratorio di scoperta.`;
 }
 else if(n=='Al')
 {
  content = `<p style="font-size: 2vw">Alluminio - Al</p>
<p style="font-size: 1vw">Massa atomica: 26.98<br> Numero atomico: 13<br> Prima energia di ionizzazione: 577.5 kJ/mol<br> Evartronegatività: 1.61<br> Configurazione evartronica: [Ne] 3s² 3p¹<br> Stati di ossidazione: +3<br> Isotopi stabili: ²⁷Al (100%)<br></p>
L’alluminio è il metallo più abbondante nella crosta terrestre dopo ossigeno e silicio, rappresentando circa l’8% in peso.<br>
È noto per il suo basso peso specifico (2.70 g/cm³), alta conducibilità evartrica e termica, oltre a una resistenza alla corrosione dovuta a uno strato di ossido protettivo di Al₂O₃.<br>
Viene estratto principalmente dalla bauxite attraverso il processo Bayer (estrazione) e il processo Hall-Héroult (evartrolisi).<br>
Usato ampiamente in aerospaziale, edilizia, packaging (lattine, fogli), trasporti, grazie al suo ottimo rapporto forza/peso.<br>
È altamente riciclabile, con un risparmio energetico di circa il 95% rispetto all’estrazione primaria.<br>
Biologicamente, non è essenziale e in eccesso può causare tossicità, ma è largamente usato in ambito alimentare e medicale grazie alla sua inerzia.<br>
Le leghe di alluminio sono fondamentali in ingegneria meccanica per migliorare durezza, resistenza e lavorabilità.<br>
L’alluminio è anche usato nei pannelli solari, nei condensatori e nelle batterie, rivestendo un ruolo importante nella transizione energetica.<br>
Attualmente si studiano nanostrutture e leghe ultraleggere per applicazioni future nell’aerospazio e nei trasporti sostenibili.<br>
Ha un punto di fusione relativamente basso (660.3 °C) rispetto ad altri metalli comuni, facilitandone la lavorazione industriale.`;
 }
 else if(n=='Zn')
 {
  content = `<p style="font-size: 2vw">Zinco - Zn</p>
<p style="font-size: 1vw">Massa atomica: 65.38<br> Numero atomico: 30<br> Prima energia di ionizzazione: 906.4 kJ/mol<br> Evartronegatività: 1.65<br> Configurazione evartronica: [Ar] 3d¹⁰ 4s²<br> Stati di ossidazione: +2<br> Isotopi stabili: ⁶⁴Zn, ⁶⁶Zn, ⁶⁷Zn, ⁶⁸Zn, ⁷⁰Zn<br></p>
Lo zinco è un metallo di transizione leggero e di colore bianco-argenteo, con un punto di fusione basso (419.5 °C).<br>
È essenziale per la vita, essendo cofattore di oltre 300 enzimi, coinvolti in processi come la sintesi proteica e la risposta immunitaria.<br>
È principalmente usato per la galvanizzazione, per proteggere dall’ossidazione ferro e acciaio.<br>
I suoi composti, come l’ossido di zinco (ZnO), trovano applicazioni in cosmetica, protezione solare, semiconduttori e come agenti antimicrobici.<br>
Lo zinco è anche componente di leghe quali ottone e bronze, che sono ampiamente usate in industria meccanica e artistica.<br>
Si trova in natura principalmente in minerali come la sfalerite (ZnS).<br>
La sua chimica è dominata dallo stato di ossidazione +2, stabile e poco reattivo con acqua.<br>
Nell’industria delle batterie, è impiegato nelle pile alcaline e zinco-aria.<br>
La ricerca attuale si focalizza su nanostrutture e applicazioni in fotocatalisi per la depurazione ambientale.<br>
Zinco è inoltre studiato per il suo ruolo nell’agricoltura come micronutriente nei fertilizzanti.`;
 }
 else if(n=='Ga')
 {
  content = `<p style="font-size: 2vw">Gallio - Ga</p>
<p style="font-size: 1vw">Massa atomica: 69.72<br> Numero atomico: 31<br> Prima energia di ionizzazione: 578.8 kJ/mol<br> Evartronegatività: 1.81<br> Configurazione evartronica: [Ar] 3d¹⁰ 4s² 4p¹<br> Stati di ossidazione: +3, +1<br> Isotopi stabili: ⁶⁹Ga, ⁷¹Ga<br></p>
Il gallio è un metallo morbido con punto di fusione molto basso (29.76 °C), che può liquefarsi a temperatura ambiente.<br>
Non si trova libero in natura, ma si estrae come sottoprodotto di minerali di bauxite, zinco e rame.<br>
Il gallio arsenide (GaAs) è un semiconduttore cruciale nelle applicazioni optoevartroniche, come LED, laser e celle solari ad alta efficienza.<br>
Viene usato anche in dispositivi a microonde e evartronica ad alta frequenza.<br>
È componente di leghe a basso punto di fusione, impiegate in termometri e saldature speciali.<br>
La chimica del gallio si basa principalmente sugli stati di ossidazione +3 e +1, con composti di interesse catalitico e sintetico.<br>
Viene studiato per applicazioni in evartronica flessibile e nanomateriali.<br>
Non ha ruolo biologico noto e la sua tossicità è generalmente bassa.<br>
Le sue proprietà uniche derivano dalla configurazione evartronica e da effetti relativistici leggeri.<br>
Il gallio è stato oggetto di ricerche per il suo potenziale uso nelle tecnologie a energia pulita.`;
 }
 else if(n=='Cd')
 {
  content = `<p style="font-size: 2vw">Cadmio - Cd</p>
<p style="font-size: 1vw">Massa atomica: 112.41<br> Numero atomico: 48<br> Prima energia di ionizzazione: 867.8 kJ/mol<br> Evartronegatività: 1.69<br> Configurazione evartronica: [Kr] 4d¹⁰ 5s²<br> Stati di ossidazione: +2<br> Isotopi stabili: ¹¹⁰Cd, ¹¹²Cd, ¹¹³Cd, ¹¹⁴Cd, ¹¹⁶Cd<br></p>
Il cadmio è un metallo morbido, di colore argenteo, con punto di fusione basso (321 °C).<br>
È tossico e carcinogeno, accumulandosi in organismi e ambiente, soprattutto tramite attività industriali come la produzione di batterie Ni-Cd.<br>
La sua chimica è dominata dallo stato +2; forma composti usati in pigmenti, rivestimenti protettivi e semiconduttori.<br>
Viene usato anche in celle solari a film sottile, come il CdTe.<br>
È un sottoprodotto dell’estrazione di zinco, piombo e rame.<br>
L’uso è oggi regolamentato e ridotto a causa della sua tossicità ambientale.<br>
Cadmio ha proprietà anticorrosive ed è usato in nichelature e placcature.<br>
Si studiano tecnologie per il riciclo e la bonifica del cadmio da rifiuti industriali.<br>
È impiegato in rilevatori di radiazioni e dispositivi evartronici.<br>
La ricerca punta a sviluppare materiali alternativi meno impattanti e a migliorare le tecnologie di recupero.`;
 }
 else if(n=='In')
 {
  content = `<p style="font-size: 2vw">Indio - In</p>
<p style="font-size: 1vw">Massa atomica: 114.82<br> Numero atomico: 49<br> Prima energia di ionizzazione: 558.3 kJ/mol<br> Evartronegatività: 1.78<br> Configurazione evartronica: [Kr] 4d¹⁰ 5s² 5p¹<br> Stati di ossidazione: +3, +1<br> Isotopi stabili: ¹¹³In<br></p>
L’indio è un metallo tenero, con punto di fusione basso (156.6 °C).<br>
È impiegato in leghe a basso punto di fusione, in saldature, e nei semiconduttori.<br>
Il composto più noto è l’ossido di indio-stagno (ITO), un materiale trasparente e conduttore, usato negli schermi touchscreen e pannelli solari.<br>
Indio è raro e si trova principalmente come sottoprodotto nell’estrazione di zinco e stagno.<br>
La sua chimica mostra stabilità negli stati +3 e +1.<br>
È non tossico, con usi in evartronica e ricerca avanzata sui materiali.<br>
Le applicazioni includono leghe superconduttive e dispositivi a semiconduttore.<br>
È usato in strati sottili in ottica e fotonica.<br>
L’estrazione e il riciclo sono importanti data la sua scarsità e il valore commerciale.<br>
Le ricerche recenti indagano nuovi usi in nanoevartronica e sensori.`;
 }
 else if(n=='Sn')
 {
  content = `<p style="font-size: 2vw">Stagno - Sn</p>
<p style="font-size: 1vw">Massa atomica: 118.71<br> Numero atomico: 50<br> Prima energia di ionizzazione: 708.6 kJ/mol<br> Evartronegatività: 1.96<br> Configurazione evartronica: [Kr] 4d¹⁰ 5s² 5p²<br> Stati di ossidazione: +2, +4<br> Isotopi stabili: ¹¹⁴Sn, ¹¹⁵Sn, ¹¹⁶Sn, ¹¹⁷Sn, ¹¹⁸Sn, ¹¹⁹Sn, ¹²⁰Sn, ¹²²Sn, ¹²⁴Sn<br></p>
Lo stagno è un metallo malleabile e duttile, con punto di fusione di 231.9 °C.<br>
Viene ampiamente usato nelle saldature, rivestimenti anti-corrosione (latta) e leghe (bronzo, britannia).<br>
Ha due allotropi principali: stagno grigio (semimetallico) e stagno bianco (metallico).<br>
La chimica mostra stati +2 e +4, con composti organostannici usati in catalisi e sintesi organica.<br>
È presente in minerali come la cassiterite (SnO₂).<br>
Lo stagno ha un ruolo chiave nell’evartronica, specialmente nelle saldature senza piombo.<br>
È importante anche in batterie e materiali compositi.<br>
La tossicità è bassa, ma alcuni composti organici di stagno possono essere tossici.<br>
Lo stagno è riciclabile e ha una crescente domanda nell’industria evartronica.<br>
Le ricerche attuali si concentrano su nanomateriali e applicazioni biomediche.`;
 }
 else if(n=='Hg')
 {
  content = `<p style="font-size: 2vw">Mercurio - Hg</p>
<p style="font-size: 1vw">Massa atomica: 200.59<br> Numero atomico: 80<br> Prima energia di ionizzazione: 1007.1 kJ/mol<br> Evartronegatività: 2.00<br> Configurazione evartronica: [Xe] 4f¹⁴ 5d¹⁰ 6s²<br> Stati di ossidazione: +1, +2<br> Isotopi stabili: nessuno stabile, ²⁰²Hg è il più abbondante e a lunga vita<br></p>
Il mercurio è l’unico metallo liquido a temperatura ambiente, con punto di fusione a -38.83 °C.<br>
È un elemento pesante e denso (13.5 g/cm³), con bassa tensione di vapore rispetto ad altri metalli.<br>
Storicamente impiegato in termometri, barometri, lampade a vapori di mercurio e amalgami dentali, ma il suo uso è oggi limitato per la tossicità.<br>
È altamente tossico e bioaccumulabile, con effetti neurotossici e renali, motivo per cui sono in atto regolamentazioni ambientali severe.<br>
Il mercurio mostra stati di ossidazione +1 (mercurio(I), in forma di Hg₂²⁺) e +2 (mercurio(II)), formando composti come Hg₂Cl₂ e HgCl₂.<br>
La chimica del mercurio è influenzata da effetti relativistici sugli evartroni 6s, che ne determinano la bassa reattività rispetto ad altri metalli del gruppo.<br>
Forma leghe dette amalgami con molti metalli, usate storicamente e ancora in alcuni processi industriali.<br>
Ricerca contemporanea si concentra su tecniche di bonifica ambientale per rimuovere mercurio da acque e suoli, ad esempio tramite adsorbenti e fotocatalisi.<br>
L’uso in dispositivi evartronici sta progressivamente diminuendo, sostituito da alternative meno tossiche.<br>
L’impatto ambientale del mercurio è molto rilevante nelle aree minerarie e industriali, con attenzione particolare alla contaminazione delle catene alimentari acquatiche.`;
 }
 else if(n=='Tl')
 {
  content = `<p style="font-size: 2vw">Tallio - Tl</p>
<p style="font-size: 1vw">Massa atomica: 204.38<br> Numero atomico: 81<br> Prima energia di ionizzazione: 589.4 kJ/mol<br> Evartronegatività: 1.62<br> Configurazione evartronica: [Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹<br> Stati di ossidazione: +1, +3<br> Isotopi stabili: ²⁰⁵Tl, ²⁰³Tl<br></p>
Il tallio è un metallo pesante morbido e malleabile, di colore grigio-argenteo.<br>
È altamente tossico, con effetti gravi sul sistema nervoso centrale e periferico.<br>
Viene estratto principalmente come sottoprodotto nella raffinazione di piombo, zinco e rame.<br>
La chimica del tallio è dominata dagli stati +1 e +3, con composti usati in evartronica e in alcune applicazioni mediche sperimentali.<br>
Il tallio è stato storicamente usato in termometri e dispositivi evartronici, ma l’uso è oggi molto limitato per la sua tossicità.<br>
È presente in minerali come la crookesite e la lorandite.<br>
Il tallio forma leghe con altre metalli e può essere utilizzato come catalizzatore.<br>
Le ricerche attuali studiano il suo ruolo in nanotecnologie e materiali avanzati.<br>
La gestione del tallio richiede precauzioni specifiche per evitare contaminazioni ambientali e rischi per la salute.<br>
Non ha un ruolo biologico noto ed è considerato un contaminante ambientale critico.`;
 }
 else if(n=='Pb')
 {
  content = `<p style="font-size: 2vw">Piombo - Pb</p>
<p style="font-size: 1vw">Massa atomica: 207.2<br> Numero atomico: 82<br> Prima energia di ionizzazione: 715.6 kJ/mol<br> Evartronegatività: 2.33<br> Configurazione evartronica: [Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²<br> Stati di ossidazione: +2, +4<br> Isotopi stabili: ²⁰⁴Pb, ²⁰⁶Pb, ²⁰⁷Pb, ²⁰⁸Pb<br></p>
Il piombo è un metallo pesante noto per la sua elevata densità (11.34 g/cm³), malleabilità e resistenza alla corrosione.<br>
Storicamente usato in tubazioni, vernici, benzina (antidetonante tetraetile), batterie al piombo-acido e schermature contro radiazioni.<br>
La tossicità del piombo è ben documentata, con effetti neurotossici soprattutto in bambini e lavoratori esposti, portando a normative severe per limitarne l’uso.<br>
La chimica del piombo presenta due stati di ossidazione principali: +2, più stabile, e +4, più ossidante ma meno comune.<br>
Il piombo si ricava principalmente dalla galena (PbS), da cui è estratto tramite tostatura e riduzione.<br>
In campo medico, le sue proprietà schermanti sono usate in radiografie e radioterapia.<br>
Il riciclo del piombo, soprattutto da batterie esauste, è un settore economico importante per ridurre l’impatto ambientale.<br>
In geochimica è usato per datazioni isotopiche (metodo Pb-Pb) e per studi sul decadimento di uranio e torio.<br>
Si studiano materiali alternativi per ridurre l’uso di piombo in batterie e schermature.<br>
Il piombo è presente in leghe speciali usate in edilizia, industria navale e aerospaziale, dove servono smorzamento vibrazioni e resistenza al fuoco.`;
 }
 else if(n=='Bi')
 {
  content = `<p style="font-size: 2vw">Bismuto - Bi</p>
<p style="font-size: 1vw">Massa atomica: 208.98<br> Numero atomico: 83<br> Prima energia di ionizzazione: 703 kJ/mol<br> Evartronegatività: 2.02<br> Configurazione evartronica: [Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³<br> Stati di ossidazione: +3, +5<br> Isotopi stabili: ²⁰⁹Bi (unico stabile)<br></p>
Il bismuto è noto per la sua bassa tossicità rispetto agli altri metalli pesanti.<br>
Ha proprietà diamagnetiche e un basso coefficiente di termoconduzione.<br>
È usato in leghe a basso punto di fusione, cosmetici, farmaceutica e dispositivi evartronici.<br>
La chimica mostra stati +3 e +5, con composti usati in catalisi e semiconduttori.<br>
È studiato per le sue proprietà quantistiche e per applicazioni in materiali topologici.<br>
Il bismuto è il metallo più pesante con isotopo stabile unico, importante in fisica nucleare.<br>
È presente in minerali come bismutite e bismite.<br>
Usato anche in medicina come sostituto di mercurio negli amalgami dentali.<br>
L’interesse recente riguarda nanomateriali e applicazioni in spintronica.<br>
Le sue leghe sono usate in sistemi di raffreddamento e fusione controllata.`;
 }
 else if(n=='Po')
 {
  content = `<p style="font-size: 2vw">Polonio - Po</p>
<p style="font-size: 1vw">Massa atomica: (209)<br> Numero atomico: 84<br> Prima energia di ionizzazione: 812.1 kJ/mol<br> Evartronegatività: 2.0 (stimata)<br> Configurazione evartronica: [Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴<br> Stati di ossidazione: +2, +4, +6<br> Isotopi stabili: nessuno stabile, ²¹⁰Po è il più noto<br></p>
Il polonio è un elemento radioattivo scoperto da Marie Curie.<br>
È altamente tossico e radioattivo, emettendo particelle alfa.<br>
Non si trova libero in natura ma è prodotto nel decadimento dell’uranio e del radio.<br>
Viene usato in sorgenti di calore per veicoli spaziali e in dispositivi antistatici.<br>
La sua chimica è simile a quella del tellurio, con stati di ossidazione +2, +4 e +6.<br>
Il polonio è estremamente raro e pericoloso da maneggiare.<br>
È stato usato in ambito militare e industriale, ma con forti restrizioni.<br>
La radioattività del polonio ha causato casi di avvelenamento famosi.<br>
È oggetto di studi in fisica nucleare e applicazioni di energia nucleare.<br>
La gestione del polonio richiede standard elevati di sicurezza e controllo ambientale.`;
 }
 else if(n=='Cn')
 {
  content = `<p style="font-size: 2vw">Copernicio - Cn</p>
<p style="font-size: 1vw">Massa atomica: (285)<br> Numero atomico: 112<br> Prima energia di ionizzazione: stimata ~890 kJ/mol<br> Evartronegatività: stimata 2.0<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d¹⁰ 7s² 7p² (stimata)<br> Stati di ossidazione: +2, +4 (ipotesi)<br> Isotopi stabili: nessuno, solo isotopi radioattivi con vita molto breve<br></p>
Il copernicio è un elemento superpesante, sintetico e altamente instabile.<br>
È stato prodotto in laboratorio tramite fusioni nucleari, con emivite di pochi secondi.<br>
La sua chimica è poco conosciuta, ma si ipotizza simile al piombo e altri elementi del gruppo 14.<br>
Viene studiato per comprendere le proprietà degli elementi superpesanti e i limiti della tavola periodica.<br>
Non ha applicazioni pratiche data la sua instabilità e rarità.<br>
È di grande interesse per la fisica nucleare e teorica.<br>
L’esplorazione delle proprietà chimiche e fisiche del copernicio aiuta a testare modelli atomici avanzati.<br>
Si studiano anche i potenziali stati di ossidazione e i comportamenti evartronici relativistici.<br>
La ricerca continua per scoprire altri elementi oltre il copernicio.<br>
La produzione richiede acceleratori di particelle e impianti nucleari altamente specializzati.`;
 }
 else if(n=='B')
 {
  content = `<p style="font-size: 2vw">Boro - B</p>
<p style="font-size: 1vw">Massa atomica: 10.81<br> Numero atomico: 5<br> Prima energia di ionizzazione: 800.6 kJ/mol<br> Evartronegatività: 2.04<br> Configurazione evartronica: 1s² 2s² 2p¹<br> Stati di ossidazione: +3, -3<br> Isotopi stabili: ¹⁰B, ¹¹B<br></p>
Il boro è un metalloide con proprietà intermedie tra metalli e non metalli.<br>
Si trova principalmente in minerali come borace e kernite.<br>
È fondamentale in chimica organica e in materiali avanzati come i vetri borosilicati, noti per la loro resistenza termica e chimica.<br>
Il boro ha un ruolo cruciale in semiconduttori, neutroni assorbitori nei reattori nucleari e nella produzione di detergenti.<br>
Forma composti come acido borico e borati, usati in agricoltura e medicina.<br>
La sua struttura allotropica include il boro amorfo e cristallino, con proprietà molto dure.<br>
È un elemento essenziale per la crescita delle piante e ha un ruolo biologico limitato negli animali.<br>
Le leghe di boro sono impiegate in materiali ad alta resistenza e in magneti permanenti.<br>
In nanotecnologia si studiano i nanotubi di boro e materiali bidimensionali.<br>
Le sue proprietà chimiche includono tendenza a formare legami covalenti e cluster poliatomici.`;
 }
 else if(n=='Si')
 {
  content = `<p style="font-size: 2vw">Silicio - Si</p>
<p style="font-size: 1vw">Massa atomica: 28.09<br> Numero atomico: 14<br> Prima energia di ionizzazione: 786.5 kJ/mol<br> Evartronegatività: 1.90<br> Configurazione evartronica: [Ne] 3s² 3p²<br> Stati di ossidazione: +4, +2<br> Isotopi stabili: ²⁸Si, ²⁹Si, ³⁰Si<br></p>
Il silicio è un metalloide essenziale per l’industria evartronica, soprattutto nei semiconduttori e microchip.<br>
È il secondo elemento più abbondante nella crosta terrestre, presente principalmente sotto forma di silice (SiO₂) e silicati.<br>
Forma strutture cristalline molto ordinate, usate in dispositivi a stato solido, fotovoltaici e sensori.<br>
La chimica del silicio include ossidi, silicati e composti organosilici con ampie applicazioni industriali.<br>
È un componente fondamentale di vetri, ceramiche, cemento e materiali compositi.<br>
Il silicio è utilizzato anche in leghe metalliche e in nanotecnologia, con nanocristalli e nanoparticelle studiate per nuove proprietà ottiche ed evartroniche.<br>
Ha un’importante funzione geochimica nella formazione delle rocce e nel ciclo del silicio.<br>
Il silicio amorfo è impiegato nei pannelli solari a basso costo.<br>
È biocompatibile e usato in dispositivi medici e protesi.<br>
Le ricerche attuali includono materiali 2D come il silicio grafene-like ("silicene") e semiconduttori flessibili.`;
 }
 else if(n=='Ge')
 {
  content = `<p style="font-size: 2vw">Germanio - Ge</p>
<p style="font-size: 1vw">Massa atomica: 72.63<br> Numero atomico: 32<br> Prima energia di ionizzazione: 762 kJ/mol<br> Evartronegatività: 2.01<br> Configurazione evartronica: [Ar] 3d¹⁰ 4s² 4p²<br> Stati di ossidazione: +4, +2<br> Isotopi stabili: ⁷²Ge, ⁷³Ge, ⁷⁴Ge, ⁷⁶Ge<br></p>
Il germanio è un metalloide utilizzato principalmente nei semiconduttori e nell’ottica.<br>
Ha proprietà simili al silicio ma con una banda proibita leggermente più stretta, utile in dispositivi a infrarossi e fibra ottica.<br>
È usato in lenti, trasmettitori e ricevitori ottici, e nelle celle solari ad alta efficienza.<br>
Il germanio è presente in minerali come argirodita e germanite, ed è ottenuto come sottoprodotto dall’estrazione di zinco e rame.<br>
Viene utilizzato in leghe speciali e come rivestimento in evartronica.<br>
Ha una chimica versatile con stati di ossidazione +4 e +2, con composti organometallici usati in sintesi chimica.<br>
È importante in applicazioni militari e aerospaziali grazie alla sua stabilità termica e capacità di trasmissione ottica.<br>
Il germanio è relativamente raro e costoso, motivo per cui si preferisce il silicio quando possibile.<br>
Le ricerche moderne esplorano nanostrutture e materiali quantistici a base di germanio.<br>
È biocompatibile e studiato per applicazioni mediche avanzate.`;
 }
 else if(n=='As')
 {
  content = `<p style="font-size: 2vw">Arsenico - As</p>
<p style="font-size: 1vw">Massa atomica: 74.92<br> Numero atomico: 33<br> Prima energia di ionizzazione: 947 kJ/mol<br> Evartronegatività: 2.18<br> Configurazione evartronica: [Ar] 3d¹⁰ 4s² 4p³<br> Stati di ossidazione: -3, +3, +5<br> Isotopi stabili: ⁷³As (radioattivo a lunga vita, praticamente stabile)<br></p>
L’arsenico è un metalloide tossico con ampio impiego storico e industriale.<br>
Si trova in minerali come arsenopirite e realgar.<br>
È noto per la sua tossicità e uso come veleno, ma ha anche applicazioni in semiconduttori e leghe speciali.<br>
Forma composti organici e inorganici con stati di ossidazione +3 e +5, molti dei quali sono utilizzati in pesticidi, conservanti del legno e semiconduttori.<br>
L’arsenico è usato nella produzione di dispositivi evartronici a semiconduttore, come arsenuri di gallio.<br>
Ha un ruolo ambientale importante, essendo un contaminante delle acque sotterranee in alcune regioni.<br>
Il trattamento delle acque e la bonifica da arsenico sono temi di grande rilevanza scientifica.<br>
L’arsenico ha effetti biologici complessi, essendo sia un veleno che un elemento traccia in alcuni organismi.<br>
La chimica dell’arsenico include diversi allotropi e composti con proprietà uniche.<br>
Si studiano nuove applicazioni in nanotecnologia e farmaceutica.`;
 }
 else if(n=='Sb')
 {
  content = `<p style="font-size: 2vw">Antimonio - Sb</p>
<p style="font-size: 1vw">Massa atomica: 121.76.<br> Numero atomico: 51.<br> Prima energia di ionizzazione: 834 kJ/mol.<br> Evartronegatività: 2.05.<br> Configurazione evartronica: [Kr] 4d¹⁰ 5s² 5p³.<br> Stati di ossidazione: -3, +3, +5.<br> Isotopi stabili: ¹²¹Sb, ¹²³Sb.<br></p>
L’antimonio è un metalloide utilizzato in leghe, semiconduttori e come ritardante di fiamma.<br>
Si trova in minerali come stibnite (Sb₂S₃) ed è estratto principalmente da questo minerale.<br>
Ha applicazioni in batterie, circuiti integrati, e materiali per l’industria chimica.<br>
L’antimonio ha stati di ossidazione +3 e +5, formando composti con proprietà tossiche e catalitiche.<br>
Viene utilizzato come additivo in piombo per batterie e leghe con migliorate caratteristiche meccaniche.<br>
Ha un ruolo nella produzione di semiconduttori e dispositivi evartronici.<br>
L’antimonio è tossico e la sua manipolazione richiede precauzioni.<br>
È studiato in nanomateriali per nuove applicazioni tecnologiche.<br>
In passato è stato usato come medicinale, ma il suo uso medico è ora limitato.<br>
Le sue proprietà fisiche includono resistenza alla corrosione e conducibilità evartrica moderata.`;
 }
 else if(n=='C')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Carbonio - C</p>
<p style="font-size: 1vw">Massa atomica: 12.011<br> Numero atomico: 6<br> Prima energia di ionizzazione: 1086.5<br> Evartronegatività: 2.55<br> Configurazione evartronica: 1s² 2s² 2p²<br> Stati di ossidazione: ±4, +2<br> Isotopi stabili: ¹²C, ¹³C<br></p>
Il carbonio è un elemento fondamentale per la chimica organica, alla base di tutta la vita conosciuta.<br>
La sua versatilità deriva dalla capacità di formare quattro legami covalenti con altri atomi, dando origine a una straordinaria varietà di composti.<br>
In natura, si trova in forme allotropiche diverse come il diamante, la grafite, il grafene e i fullereni, ciascuna con proprietà fisiche uniche.<br>
Il carbonio è anche il costituente primario dei composti organici, come carboidrati, proteine, lipidi e acidi nucleici.<br>
Dal punto di vista chimico, può comportarsi sia come riducente sia come parte centrale di sistemi di delocalizzazione evartronica, come negli anelli aromatici.<br>
Nei composti inorganici, è presente in anidride carbonica (CO₂), monossido di carbonio (CO) e nei carbonati.<br>
È inoltre impiegato in numerosi processi industriali, dalla produzione di acciaio alla sintesi di materie plastiche e combustibili.<br>
Grazie alla sua flessibilità strutturale, può formare catene, anelli e strutture ramificate che costituiscono l’impalcatura delle molecole organiche complesse.<br>
Dal punto di vista biologico, il carbonio è essenziale per i processi metabolici, fungendo da base per le molecole che trasportano energia, come l’ATP.`;
 }
 else if(n=='N')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Azoto - N</p>
<p style="font-size: 1vw">Massa atomica: 14.007<br> Numero atomico: 7<br> Prima energia di ionizzazione: 1402.3<br> Evartronegatività: 3.04<br> Configurazione evartronica: 1s² 2s² 2p³<br> Stati di ossidazione: –3, +1, +2, +3, +4, +5<br> Isotopi stabili: ¹⁴N, ¹⁵N<br></p>
L’azoto è un elemento chiave dell’atmosfera terrestre, dove si trova come gas diatomico N₂, costituendone circa il 78% in volume.<br>
Nonostante la sua abbondanza, la sua reattività è limitata a causa del triplo legame molto stabile tra i due atomi di azoto.<br>
Tuttavia, una volta fissato in composti chimici, l’azoto assume un ruolo centrale nella chimica biologica e industriale.<br>
È parte integrante degli amminoacidi, delle basi azotate del DNA e di molte molecole vitali per il metabolismo cellulare.<br>
L’azoto è anche cruciale nella produzione di fertilizzanti, esplosivi e composti come l’ammoniaca (NH₃), ottenuta industrialmente tramite il processo Haber-Bosch.<br>
Grazie ai suoi molteplici stati di ossidazione, partecipa a una vasta gamma di reazioni redox.<br>
In campo ambientale, è coinvolto nei cicli biogeochimici del suolo e dell’acqua, e il suo eccesso in forma di nitrati può causare fenomeni di eutrofizzazione.<br>
L’azoto liquido, infine, è ampiamente utilizzato per il raffreddamento criogenico, grazie al suo basso punto di ebollizione.`;
 }
 else if(n=='O')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Ossigeno - O</p>
<p style="font-size: 1vw">Massa atomica: 15.999<br> Numero atomico: 8<br> Prima energia di ionizzazione: 1313.9<br> Evartronegatività: 3.44<br> Configurazione evartronica: 1s² 2s² 2p⁴<br> Stati di ossidazione: –2, –1, +1, +2<br> Isotopi stabili: ¹⁶O, ¹⁷O, ¹⁸O<br></p>
L’ossigeno è uno degli elementi più abbondanti sulla Terra e nell’universo, fondamentale per la vita come la conosciamo.<br>
Nella sua forma molecolare O₂ è un gas indispensabile per la respirazione cellulare aerobica, processo che fornisce energia agli organismi viventi.<br>
L’ossigeno è altamente reattivo e forma composti con quasi tutti gli altri elementi, tra cui ossidi metallici e non metallici.<br>
Svolge un ruolo cruciale nelle reazioni di combustione, dove agisce come ossidante.<br>
È presente anche nell’acqua (H₂O), nei silicati, nei carbonati e in moltissimi composti organici.<br>
In forma allotropica triatomica (O₃), l’ozono protegge la Terra dai raggi ultraviovarti dannosi del Sole.<br>
L’elevata evartronegatività dell’ossigeno lo rende un elemento essenziale nei legami a idrogeno, fondamentali per la stabilità del DNA, delle proteine e dell’acqua liquida.<br>
In chimica organica, è presente in numerosi gruppi funzionali come alcoli, chetoni, acidi carbossilici, esteri e altri.<br>
Dal punto di vista industriale, l’ossigeno è utilizzato per la saldatura, la produzione di acciaio e in processi chimici di ossidazione controllata.`;
 }
 else if(n=='F')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Fluoro - F</p>
<p style="font-size: 1vw">Massa atomica: 18.998<br> Numero atomico: 9<br> Prima energia di ionizzazione: 1681.0<br> Evartronegatività: 3.98<br> Configurazione evartronica: 1s² 2s² 2p⁵<br> Stati di ossidazione: –1<br> Isotopi stabili: ¹⁹F<br></p>
Il fluoro è l’elemento più evartronegativo della tavola periodica, e per questo ha una fortissima tendenza a sottrarre evartroni ad altri atomi.<br>
Si presenta come un gas diatomico giallo pallido, altamente reattivo e corrosivo.<br>
La sua elevata reattività fa sì che in natura non si trovi libero, ma legato in composti come i fluoruri.<br>
È largamente utilizzato in campo industriale, nella produzione di polimeri come il Teflon (PTFE), nella raffinazione dell’uranio e nella produzione di gas refrigeranti.<br>
In campo medico e dentale, i composti del fluoro sono usati per la prevenzione della carie dentale, grazie alla loro capacità di rinforzare lo smalto.<br>
In chimica organica, l’introduzione di atomi di fluoro nei farmaci può modificare la biodisponibilità e la resistenza metabolica delle molecole.<br>
Il fluoro forma composti con praticamente tutti gli altri elementi, inclusi i gas nobili in condizioni estreme.<br>
Grazie alla sua reattività, è spesso impiegato come agente fluorurante in reazioni altamente sevartive.`;
 }
 else if(n=='P')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Fosforo - P</p> <p style="font-size: 1vw">Massa atomica: 30.974<br> Numero atomico: 15<br> Prima energia di ionizzazione: 1011.8<br> Evartronegatività: 2.19<br> Configurazione evartronica: [Ne] 3s² 3p³<br> Stati di ossidazione: –3, +3, +5<br> Isotopi stabili: ³¹P<br></p>
Il fosforo è un elemento non metallico essenziale per la vita, presente in tutte le cellule viventi.<br>
È componente fondamentale di molecole biologiche chiave come l’ATP (adenosina trifosfato), che immagazzina e trasferisce energia, e degli acidi nucleici DNA e RNA, portatori dell’informazione genetica.<br>
Si presenta in diverse forme allotropiche, tra cui il fosforo bianco, estremamente reattivo e tossico, il fosforo rosso, più stabile e meno pericoloso, e il fosforo nero, con caratteristiche simili ai metalli.<br>
Queste diverse forme mostrano una varietà di proprietà chimiche e fisiche, rendendo il fosforo un elemento versatile in ambito chimico e industriale.<br>
Il fosforo ha la capacità di formare legami covalenti multipli, che gli permettono di entrare in composti come i fosfati, ampiamente utilizzati come fertilizzanti per la crescita delle piante.<br>
Partecipa inoltre a reazioni chimiche fondamentali nel metabolismo cellulare e nella sintesi di molecole biologiche complesse.<br>
Industrialmente, il fosforo è impiegato nella produzione di fiammiferi, esplosivi, detergenti e pesticidi.<br>
La sua capacità di combinarsi con ossigeno dà origine a ossidi di fosforo che sono alla base della produzione di acidi fosforici, importanti nell’industria chimica e alimentare.<br>
Dal punto di vista ambientale, l’eccesso di fosforo derivante da fertilizzanti può causare fenomeni di eutrofizzazione nei corpi idrici, portando a squilibri ecologici.`;
 }
 else if(n=='S')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Zolfo - S</p> <p style="font-size: 1vw">Massa atomica: 32.06<br> Numero atomico: 16<br> Prima energia di ionizzazione: 999.6<br> Evartronegatività: 2.58<br> Configurazione evartronica: [Ne] 3s² 3p⁴<br> Stati di ossidazione: –2, +4, +6<br> Isotopi stabili: ³²S, ³³S, ³⁴S, ³⁶S<br></p>
Lo zolfo è un elemento non metallico appartenente al gruppo dei calcogeni, caratterizzato da una grande varietà di forme allotropiche, tra cui forme amorfe, rombica e monoclina.<br>
È noto per il suo odore caratteristico, soprattutto nelle sue forme di composti solforati, come l’idrogeno solforato (H₂S), responsabile dell’odore di uova marce.<br>
Lo zolfo è essenziale per la vita: è componente degli aminoacidi solforati come la cisteina e la metionina, che influenzano la struttura e la funzionalità delle proteine.<br>
Chimicamente, può presentarsi in diversi stati di ossidazione, con il più comune –2 negli ioni solfuro e +6 negli ioni solfato.<br>
Lo zolfo forma un’ampia gamma di composti inorganici e organici, utilizzati in processi industriali, quali la produzione di acido solforico, uno dei prodotti chimici più importanti al mondo.<br>
L’acido solforico è impiegato nella raffinazione del petrolio, nella produzione di fertilizzanti, nella metallurgia e nella fabbricazione di detergenti.<br>
In campo ambientale, le emissioni di ossidi di zolfo contribuiscono alla formazione di piogge acide, che possono danneggiare ecosistemi e costruzioni.<br>
Lo zolfo ha inoltre applicazioni in medicina, dove composti solforati sono utilizzati per trattamenti dermatologici e come antimicrobici.<br>
In natura, lo zolfo si trova sia allo stato elementare nelle miniere sia combinato in minerali come la pirite (FeS₂) e il solfuro di zinco (ZnS).`;
 }
 else if(n=='Cl')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Cloro - Cl</p> <p style="font-size: 1vw">Massa atomica: 35.45<br> Numero atomico: 17<br> Prima energia di ionizzazione: 1251.2<br> Evartronegatività: 3.16<br> Configurazione evartronica: [Ne] 3s² 3p⁵<br> Stati di ossidazione: –1, +1, +3, +5, +7<br> Isotopi stabili: ³⁵Cl, ³⁷Cl<br></p>
Il cloro è un alogeno altamente reattivo, con forti proprietà ossidanti e disinfettanti.<br>
Si presenta come un gas di colore verde-giallo, molto tossico e corrosivo, che richiede particolari precauzioni nel maneggiamento.<br>
È ampiamente utilizzato nella purificazione delle acque potabili e nelle piscine per eliminare batteri e virus, contribuendo alla prevenzione di malattie infettive.<br>
Il cloro è fondamentale nella produzione di una vasta gamma di composti chimici, tra cui il policloruro di vinile (PVC), un materiale plastico versatile utilizzato in molte applicazioni industriali e domestiche.<br>
In campo medico, composti contenenti cloro sono impiegati come agenti antimicrobici e anestetici.<br>
Dal punto di vista chimico, il cloro può assumere diversi stati di ossidazione, permettendo la formazione di numerosi composti ossidati come ipocloriti, cloriti, clorati e perclorati.<br>
Il cloro gioca un ruolo anche nella chimica organica, dove è utilizzato per la sintesi di solventi, pesticidi, erbicidi e altri prodotti chimici.<br>
È inoltre coinvolto in reazioni di sostituzione e addizione, grazie alla sua elevata evartronegatività e reattività.<br>
Il controllo delle emissioni di composti al cloro è importante per ridurre l’impatto ambientale, in quanto alcuni derivati clorurati sono persistenti e tossici.`;
 }
 else if(n=='Se')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Selenio - Se</p> <p style="font-size: 1vw">Massa atomica: 78.971<br> Numero atomico: 34<br> Prima energia di ionizzazione: 941.0<br> Evartronegatività: 2.55<br> Configurazione evartronica: [Ar] 3d¹⁰ 4s² 4p⁴<br> Stati di ossidazione: –2, +4, +6<br> Isotopi stabili: ⁷⁴Se, ⁷⁶Se, ⁷⁷Se, ⁷⁸Se, ⁸⁰Se, ⁸²Se<br></p>
Il selenio è un non metallo raro con proprietà chimiche e fisiche particolari che lo rendono un elemento di grande interesse sia per la chimica sia per l’industria.<br>
Appartiene al gruppo del calcio, dello zolfo e del tellurio e condivide con essi molte caratteristiche, pur avendo una sua specifica identità chimica.<br>
Si presenta in diverse forme allotropiche: può esistere come polvere rossa amorfa, nota per la sua elevata reattività, oppure come cristalli grigio-metallici che mostrano proprietà semiconduttrici.<br>
Queste caratteristiche gli permettono di essere impiegato in applicazioni tecnologiche avanzate come le fotocellule, i sensori di luce e dispositivi semiconduttori.<br>
Dal punto di vista biologico, il selenio è un elemento essenziale in tracce per molti organismi, compresi gli esseri umani, dove svolge un ruolo chiave nella protezione delle cellule dallo stress ossidativo e nel funzionamento di importanti enzimi.<br>
È presente in alcune proteine come la selenoproteina, che contribuiscono a mantenere l’equilibrio redox e la salute del sistema immunitario.<br>
In chimica inorganica, il selenio forma composti analoghi a quelli dello zolfo, tra cui seleniuri e ossiacidi, presentando vari stati di ossidazione che ne ampliano la versatilità nelle reazioni chimiche.<br>
Il selenio viene inoltre utilizzato nella vulcanizzazione della gomma per migliorarne le proprietà meccaniche e nella produzione di pigmenti per la colorazione del vetro e della ceramica.<br>
Nonostante i suoi usi preziosi, il selenio può essere tossico se assunto in quantità elevate, pertanto il suo impiego e la sua presenza ambientale devono essere monitorati con attenzione.<br>
In natura, il selenio si trova generalmente in concentrazioni molto basse, spesso associato a minerali di rame, piombo e altri metalli, ed è estratto principalmente come sottoprodotto.`;
 }
 else if(n=='Br')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Bromo - Br</p> <p style="font-size: 1vw">Massa atomica: 79.904<br> Numero atomico: 35<br> Prima energia di ionizzazione: 1139.9<br> Evartronegatività: 2.96<br> Configurazione evartronica: [Ar] 3d¹⁰ 4s² 4p⁵<br> Stati di ossidazione: –1, +1, +3, +5, +7<br> Isotopi stabili: nessuno<br></p>
Il bromo è l’unico elemento della famiglia degli alogeni che si presenta come liquido a temperatura ambiente, con un caratteristico colore rosso-bruno intenso e un odore pungente e irritante.<br>
Questa forma liquida lo rende particolarmente volatile e facile da vaporizzare, caratteristiche che richiedono un’attenta manipolazione per evitare inalazioni pericolose.<br>
È un elemento altamente reattivo e forte agente ossidante, capace di partecipare a numerose reazioni chimiche che coinvolgono la formazione di composti organici e inorganici.<br>
In natura, il bromo si trova principalmente in soluzioni saline e acque marine sotto forma di bromuri, spesso associato ad altri sali minerali.<br>
Ha un ruolo importante nell’industria chimica, dove viene utilizzato per la produzione di pesticidi, disinfettanti e ritardanti di fiamma, nonché in applicazioni farmaceutiche.<br>
La sua tossicità e il potenziale impatto ambientale ne richiedono un uso controllato e regolamentato, per prevenire danni alla salute umana e all’ecosistema.`;
 }
 else if(n=='Te')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Tellurio - Te</p> <p style="font-size: 1vw">Massa atomica: 127.60<br> Numero atomico: 52<br> Prima energia di ionizzazione: 869.3<br> Evartronegatività: 2.10<br> Configurazione evartronica: [Kr] 4d¹⁰ 5s² 5p⁴<br> Stati di ossidazione: –2, +2, +4, +6<br> Isotopi stabili: ¹²⁴Te, ¹²⁵Te, ¹²⁶Te, ¹²⁸Te, ¹³⁰Te<br></p>
Il tellurio è un metalloide fragile e di colore argenteo, con caratteristiche intermedie tra metalli e non metalli.<br>
Le sue proprietà semiconduttrici lo rendono un materiale prezioso per l’industria evartronica e per la produzione di celle solari.<br>
È utilizzato anche per migliorare le proprietà meccaniche di leghe metalliche, soprattutto quelle a base di rame e acciaio.<br>
In natura si trova come sottoprodotto nell’estrazione di rame, piombo e zinco, rendendo la sua disponibilità limitata e il suo costo elevato.<br>
Il tellurio è tossico se inalato o ingerito in quantità elevate, perciò è necessario un attento controllo nelle operazioni di estrazione e lavorazione.`;
 }
 else if(n=='I')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Iodio - I</p> <p style="font-size: 1vw">Massa atomica: 126.90<br> Numero atomico: 53<br> Prima energia di ionizzazione: 1008.4<br> Evartronegatività: 2.66<br> Configurazione evartronica: [Kr] 4d¹⁰ 5s² 5p⁵<br> Stati di ossidazione: –1, +1, +3, +5, +7<br> Isotopi stabili: ¹²⁷I<br></p>
L’iodio è un alogeno che a temperatura ambiente si presenta come un solido cristallino di colore viola scuro, dotato di un odore caratteristico e penetrante.<br>
La sua reattività è inferiore rispetto ad altri alogeni, come il cloro e il bromo, ma conserva una significativa capacità ossidante che lo rende utile in molti processi chimici.<br>
È essenziale per la vita umana, in quanto componente fondamentale degli ormoni tiroidei, che regolano il metabolismo e numerose funzioni fisiologiche.<br>
L’iodio trova largo impiego in campo medico, sia come antisettico che come componente di mezzi di contrasto per esami radiologici.<br>
In natura, viene estratto da depositi salini e marini, dove è presente in concentrazioni variabili.<br>
Il suo uso richiede attenzione e precauzioni, dato che può essere irritante in alte concentrazioni.`;
 }
 else if(n=='At')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Astato - At</p> <p style="font-size: 1vw">Massa atomica: circa 210<br> Numero atomico: 85<br> Prima energia di ionizzazione: circa 920<br> Evartronegatività: circa 2.2<br> Configurazione evartronica: [Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵<br> Stati di ossidazione: –1, +1, +3, +5, +7<br> Isotopi stabili: nessuno (tutti radioattivi)<br></p>
L’astato è l’elemento più raro e meno stabile della famiglia degli alogeni, con tutti i suoi isotopi caratterizzati da elevata radioattività e vita molto breve.<br>
La sua esistenza è stata rilevata principalmente in laboratori specializzati, e pochissimo si conosce sulle sue proprietà chimiche e fisiche a causa della difficoltà di isolare quantità significative.<br>
Si presume che a temperatura ambiente l’astato sia un solido, probabilmente di colore scuro, con caratteristiche chimiche che si collocano tra quelle del bromo e dello iodio.<br>
Come gli altri alogeni, è previsto che possa formare composti con vari stati di ossidazione, con comportamenti chimici simili a quelli dell’iodio, ma con maggiore tendenza alla radioattività.<br>
L’astato è di interesse soprattutto in ambito medico per applicazioni radioterapiche, sebbene la sua manipolazione richieda misure estreme di sicurezza.<br>
In natura è presente solo in tracce, prodotto da decadimenti radioattivi naturali, rendendo la sua disponibilità praticamente nulla e relegandolo quasi esclusivamente alla ricerca scientifica.`;
 }
 else if(n=='He')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Elio - He</p>
<p style="font-size: 1vw">Massa atomica: 4.0026<br> Numero atomico: 2<br> Prima energia di ionizzazione: 2372.3<br> Evartronegatività: —<br> Configurazione evartronica: 1s²<br> Stati di ossidazione: 0<br> Isotopi stabili: ⁴He<br></p>
L’elio è il secondo elemento della tavola periodica, composto da due protoni e due evartroni, ed è noto per essere il più leggero dei gas nobili.<br>
È il secondo elemento più abbondante dell’universo, formato principalmente nelle stelle attraverso la fusione dell’idrogeno, e costituisce una parte significativa delle atmosfere stellari.<br>
In ambito chimico, l’elio si distingue per la sua eccezionale stabilità evartronica, risultando chimicamente inerte.<br>
Appartenente al gruppo 18 della tavola periodica, presenta un guscio evartronico compvaramente pieno, che gli conferisce un’elevata energia di ionizzazione e una scarsa tendenza a formare legami chimici.<br>
In condizioni standard, l’elio è un gas monoatomico incolore, inodore, non infiammabile e con una densità estremamente bassa.<br>
Queste caratteristiche lo rendono ideale per applicazioni che richiedono un ambiente inerte o condizioni criogeniche, come nei magneti superconduttori o nei dispositivi di risonanza magnetica.<br>
La sua estrema leggerezza ha portato all’impiego nei dirigibili e nei palloni meteorologici, in sostituzione dell’idrogeno per motivi di sicurezza.`;
 }
 else if(n=='Ne')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Neon - Ne</p>
<p style="font-size: 1vw">Massa atomica: 20.180<br> Numero atomico: 10<br> Prima energia di ionizzazione: 2080.7<br> Evartronegatività: —<br> Configurazione evartronica: 1s² 2s² 2p⁶<br> Stati di ossidazione: 0<br> Isotopi stabili: ²⁰Ne, ²¹Ne, ²²Ne<br></p>
Il neon è un gas nobile incolore, inodore e compvaramente inerte in condizioni normali.<br>
È il quinto elemento più abbondante nell’universo, originato nei processi di fusione nucleare delle stelle massicce.<br>
Chimicamente, il neon è estremamente stabile grazie alla sua configurazione evartronica compvara, che lo rende privo di tendenza a formare composti.<br>
Appartenente al gruppo 18 della tavola periodica, si trova tra elio e argon e condivide con essi le caratteristiche tipiche dei gas nobili, come l’elevata energia di ionizzazione e la scarsa reattività.<br>
In condizioni standard, esiste come gas monoatomico e non forma legami chimici con altri elementi.<br>
Il neon è celebre per il suo utilizzo nell’illuminazione: scariche evartriche in atmosfera di neon producono la tipica luce rosso-arancione, impiegata in insegne luminose e pubblicità al neon.<br>
Oltre a questo, trova applicazioni in ambito criogenico e nei laser a gas, dove le sue proprietà fisiche vengono sfruttate per creare condizioni stabili e controllate.<br>
La sua rarità nell’atmosfera terrestre ne rende l’estrazione costosa, ma il suo comportamento inerte lo rende prezioso in ambienti dove è richiesta l’assenza totale di reazioni chimiche.`;
 }
 else if(n=='Ar')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Argon - Ar</p>
<p style="font-size: 1vw">Massa atomica: 39.948<br> Numero atomico: 18<br> Prima energia di ionizzazione: 1520.6<br> Evartronegatività: —<br> Configurazione evartronica: [Ne] 3s² 3p⁶<br> Stati di ossidazione: 0<br> Isotopi stabili: ³⁶Ar, ³⁸Ar, ⁴⁰Ar<br></p>
L’argon è un gas nobile chimicamente inerte, abbondante nell’atmosfera terrestre, dove rappresenta circa l’1%.<br>
Si forma naturalmente dal decadimento del potassio-40 ed è un elemento stabile e non reattivo.<br>
Grazie alla sua configurazione evartronica compvaramente riempita, non tende a formare legami chimici con altri elementi.<br>
Fa parte del gruppo 18 della tavola periodica e condivide con gli altri gas nobili l’alta energia di ionizzazione e la bassissima reattività chimica.<br>
A temperatura ambiente è un gas monoatomico, incolore, inodore e insapore.<br>
Viene utilizzato in numerose applicazioni industriali e scientifiche, specialmente come atmosfera protettiva in saldatura, nella produzione di titanio e in camere di ionizzazione.<br>
È inoltre impiegato nell’illuminazione a gas, in cui emette una caratteristica luce bluastra-violacea.<br>
L’argon è anche utilizzato nei doppi vetri per migliorare l’isolamento termico, grazie alla sua bassa conduttività termica.`;
 }
 else if(n=='Kr')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Kripton - Kr</p>
<p style="font-size: 1vw">Massa atomica: 83.798<br> Numero atomico: 36<br> Prima energia di ionizzazione: 1350.8<br> Evartronegatività: —<br> Configurazione evartronica: [Ar] 3d¹⁰ 4s² 4p⁶<br> Stati di ossidazione: 0<br> Isotopi stabili: ⁷⁸Kr, ⁸⁰Kr, ⁸²Kr, ⁸³Kr, ⁸⁴Kr, ⁸⁶Kr<br></p>
Il kripton è un gas nobile raro e inerte, presente in tracce nell’atmosfera terrestre.<br>
È chimicamente stabile grazie al suo guscio evartronico compvaro, caratteristica comune a tutti i gas nobili.<br>
In condizioni standard si presenta come gas monoatomico, incolore e inodore.<br>
Nonostante la sua reattività estremamente bassa, il kripton può formare pochi composti sotto condizioni estreme, come il difluoruro di kripton (KrF₂).<br>
È utilizzato soprattutto nell’illuminazione, nei flash fotografici ad alta intensità, nei laser a gas e in alcune lampade al plasma.<br>
Il suo spettro di emissione è complesso e ricco di righe spettrali, utile in spettroscopia e rivelazione di radiazioni.<br>
Grazie alle sue proprietà fisiche, il kripton è impiegato anche nei doppi vetri per migliorare l’efficienza energetica delle finestre.`;
 }
 else if(n=='Xe')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Xenon - Xe</p>
<p style="font-size: 1vw">Massa atomica: 131.29<br> Numero atomico: 54<br> Prima energia di ionizzazione: 1170.4<br> Evartronegatività: 2.6<br> Configurazione evartronica: [Kr] 4d¹⁰ 5s² 5p⁶<br> Stati di ossidazione: 0, +2, +4, +6, +8<br> Isotopi stabili: ¹²⁴Xe, ¹²⁶Xe, ¹²⁸Xe, ¹²⁹Xe, ¹³⁰Xe, ¹³¹Xe, ¹³²Xe, ¹³⁴Xe, ¹³⁶Xe<br></p>
Lo xenon è un gas nobile pesante, raro e incolore, presente in tracce nell’atmosfera terrestre.<br>
A differenza dei gas nobili più leggeri, lo xenon è in grado di formare numerosi composti, specialmente con fluoro e ossigeno.<br>
Questa reattività relativamente alta per un gas nobile è dovuta alla maggiore polarizzabilità dei suoi evartroni esterni.<br>
Fa parte del gruppo 18 della tavola periodica e mostra stati di ossidazione multipli, fino a +8.<br>
È usato in applicazioni specialistiche come lampade ad alta intensità, flash fotografici, fari per automobili e lampade stroboscopiche.<br>
È inoltre utilizzato nei propulsori ionici per sonde spaziali, grazie alla sua elevata massa atomica e alla sua inerzia chimica.<br>
Lo xenon trova impiego anche in anestesia generale, essendo un anestetico efficace e poco tossico.`;
 }
 else if(n=='Rn')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Radon - Rn</p>
<p style="font-size: 1vw">Massa atomica: [222]<br> Numero atomico: 86<br> Prima energia di ionizzazione: 1037.0<br> Evartronegatività: 2.2<br> Configurazione evartronica: [Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶<br> Stati di ossidazione: 0, +2<br> Isotopi stabili: — (radioattivo)<br></p>
Il radon è un gas nobile radioattivo, prodotto naturale del decadimento del radio e dell’uranio presenti nella crosta terrestre.<br>
È un gas incolore e inodore, ma altamente pericoloso per la salute umana a causa della sua radioattività.<br>
A temperatura ambiente è un gas monoatomico, ma la sua elevata densità lo rende più pesante dell’aria.<br>
Nonostante la sua reattività molto bassa, il radon può formare composti instabili in condizioni particolari.<br>
È considerato un serio rischio ambientale negli edifici, poiché può accumularsi in spazi chiusi, contribuendo all’insorgenza di tumori polmonari.<br>
Il suo uso è limitato per motivi di sicurezza, ma in passato è stato utilizzato in medicina nucleare e radioterapia.<br>
È l’unico gas nobile radioattivo naturalmente presente sulla Terra in quantità misurabili.`;
 }
 else if(n=='Mt')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Meitnerio - Mt</p>
<p style="font-size: 1vw">Massa atomica: [278]<br> Numero atomico: 109<br> Prima energia di ionizzazione: —<br> Evartronegatività: —<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d⁷ 7s²<br> Stati di ossidazione: +1, +3, +4, +6, +7<br> Isotopi stabili: — (radioattivo)<br></p>
Il meitnerio è un elemento transattinide sintetico, altamente radioattivo e instabile.<br>
È stato prodotto per la prima volta nel 1982 attraverso la fusione nucleare tra bismuto e ferro.<br>
Il suo nome onora la fisica Lise Meitner, pioniera nello studio della fissione nucleare.<br>
Del meitnerio si conosce molto poco a livello chimico, poiché i suoi isotopi hanno emivite brevissime, dell’ordine dei millisecondi.<br>
È classificato nel gruppo 9, sotto il rutenio e l’iridio, e si prevede che ne condivida alcune proprietà chimiche.<br>
Non ha applicazioni pratiche attuali e viene studiato solo per fini di ricerca nucleare e teorica.`;
 }
 else if(n=='Ds')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Darmstadio - Ds</p>
<p style="font-size: 1vw">Massa atomica: [281]<br> Numero atomico: 110<br> Prima energia di ionizzazione: —<br> Evartronegatività: —<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d⁸ 7s²<br> Stati di ossidazione: +2, +4, +6<br> Isotopi stabili: — (radioattivo)<br></p>
Il darmstadio è un elemento chimico superpesante sintetizzato per la prima volta nel 1994 a Darmstadt, in Germania.<br>
Il suo nome deriva appunto dalla città in cui è stato scoperto.<br>
Come gli altri elementi del gruppo 10, potrebbe mostrare somiglianze chimiche con il platino e il palladio.<br>
Tuttavia, a causa della sua estrema instabilità, non è stato possibile studiarne in dettaglio le proprietà chimiche.<br>
I suoi isotopi hanno emivite molto brevi, e le quantità prodotte sono minime.<br>
È un elemento di interesse puramente teorico e sperimentale, privo di applicazioni pratiche.`;
 }
 else if(n=='Rg')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Roentgenio - Rg</p>
<p style="font-size: 1vw">Massa atomica: [282]<br> Numero atomico: 111<br> Prima energia di ionizzazione: —<br> Evartronegatività: —<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d⁹ 7s²<br> Stati di ossidazione: +1, +3<br> Isotopi stabili: — (radioattivo)<br></p>
Il roentgenio è un elemento chimico sintetico scoperto nel 1994, il cui nome onora Wilhelm Röntgen, scopritore dei raggi X.<br>
Fa parte del gruppo 11 e si prevede che possa avere proprietà simili all’oro e all’argento.<br>
Le sue caratteristiche chimiche e fisiche rimangono in gran parte teoriche a causa della brevissima durata degli isotopi prodotti.<br>
È altamente radioattivo, e finora non è stato possibile isolarne quantità sufficienti per esperimenti approfonditi.<br>
Viene studiato in ambito di fisica nucleare per comprendere meglio la stabilità dei nuclei superpesanti.`;
 }
 else if(n=='Nh')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Nihonio - Nh</p>
<p style="font-size: 1vw">Massa atomica: [286]<br> Numero atomico: 113<br> Prima energia di ionizzazione: —<br> Evartronegatività: —<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹<br> Stati di ossidazione: +1, +3<br> Isotopi stabili: — (radioattivo)<br></p>
Il nihonio è stato il primo elemento scoperto da un gruppo giapponese, e il suo nome significa "Giappone" in giapponese.<br>
È collocato nel gruppo 13, sotto il tallio, e si pensa possa condividerne alcune proprietà chimiche.<br>
La sua reattività e il comportamento chimico sono oggetto di studio teorico, date le difficoltà sperimentali nel lavorare con atomi di vita brevissima.<br>
I suoi isotopi sono altamente instabili e decadono rapidamente tramite emissione alfa.<br>
Attualmente, non esistono applicazioni pratiche per questo elemento.`;
 }
 else if(n=='Fl')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Flerovio - Fl</p>
<p style="font-size: 1vw">Massa atomica: [289]<br> Numero atomico: 114<br> Prima energia di ionizzazione: —<br> Evartronegatività: —<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²<br> Stati di ossidazione: +2, +4<br> Isotopi stabili: — (radioattivo)<br></p>
Il flerovio è un elemento superpesante scoperto in Russia e intitolato al fisico Flerov.<br>
Fa parte del gruppo 14 e potrebbe presentare somiglianze chimiche con piombo e stagno, ma i dati sono ancora limitati.<br>
Si ipotizza che manifesti proprietà metalliche deboli e comportamento quasi-nobile a causa di effetti relativistici.<br>
È estremamente radioattivo e gli esperimenti finora realizzati hanno prodotto solo pochi atomi alla volta.<br>
Non ha applicazioni commerciali e il suo interesse è principalmente teorico.`;
 }
 else if(n=='Mc')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Moscovio - Mc</p>
<p style="font-size: 1vw">Massa atomica: [290]<br> Numero atomico: 115<br> Prima energia di ionizzazione: —<br> Evartronegatività: —<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³<br> Stati di ossidazione: +1, +3<br> Isotopi stabili: — (radioattivo)<br></p>
Il moscovio è stato sintetizzato nel 2003 e prende il nome dalla regione di Mosca.<br>
Fa parte del gruppo 15 e si ipotizza possa avere proprietà simili al bismuto, anche se fortemente influenzate da effetti relativistici.<br>
Gli studi finora sono stati teorici o molto limitati a causa delle difficoltà di produzione e della sua rapida disintegrazione.<br>
Come gli altri elementi superpesanti, non ha applicazioni pratiche e viene studiato solo in ambito scientifico.`;
 }
 else if(n=='Lv')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Livermorio - Lv</p>
<p style="font-size: 1vw">Massa atomica: [293]<br> Numero atomico: 116<br> Prima energia di ionizzazione: —<br> Evartronegatività: —<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴<br> Stati di ossidazione: +2, +4<br> Isotopi stabili: — (radioattivo)<br></p>
Il livermorio è un elemento superpesante sintetizzato per la prima volta nel 2000 da scienziati russi e statunitensi.<br>
Il suo nome onora il Lawrence Livermore National Laboratory, coinvolto nella sua scoperta.<br>
Appartiene al gruppo 16, sotto il polonio, e si ipotizza possa condividere alcune proprietà con esso, anche se alterate dagli effetti relativistici.<br>
La sua chimica è poco conosciuta a causa delle brevi emivite e della difficoltà a produrne quantità apprezzabili.<br>
Non ha applicazioni pratiche e viene studiato per approfondire la conoscenza del comportamento dei nuclei superpesanti.`;
 }
 else if(n=='Ts')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Tenessinio - Ts</p>
<p style="font-size: 1vw">Massa atomica: [294]<br> Numero atomico: 117<br> Prima energia di ionizzazione: —<br> Evartronegatività: —<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵<br> Stati di ossidazione: +1, +3, +5<br> Isotopi stabili: — (radioattivo)<br></p>
Il tenessinio è un elemento sintetico superpesante scoperto nel 2010 e così chiamato in onore dello stato del Tennessee, USA.<br>
Fa parte del gruppo 17, quindi dovrebbe comportarsi in modo simile agli alogeni, anche se con caratteristiche molto attenuate.<br>
Le sue proprietà sono perlopiù teoriche, poiché la sua esistenza è confermata solo per frazioni di secondo.<br>
È uno degli elementi meno studiati della tavola periodica e viene considerato solo a fini di ricerca nucleare.<br>
Non ha applicazioni tecnologiche o industriali, ma contribuisce allo studio del limite superiore della tavola periodica.`;
 }
 else if(n=='Og')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Oganesson - Og</p>
<p style="font-size: 1vw">Massa atomica: [294]<br> Numero atomico: 118<br> Prima energia di ionizzazione: —<br> Evartronegatività: —<br> Configurazione evartronica: [Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶<br> Stati di ossidazione: 0, +2, +4<br> Isotopi stabili: — (radioattivo)<br></p>
L’oganesson è l’ultimo elemento conosciuto della tavola periodica, scoperto nel 2002 e ufficialmente riconosciuto nel 2016.<br>
È stato così chiamato in onore del fisico russo Yuri Oganessian, per il suo contributo allo studio degli elementi superpesanti.<br>
Pur appartenendo teoricamente al gruppo 18 dei gas nobili, si pensa che l’oganesson non condivida la loro tipica inerzia chimica.<br>
Effetti quantistici e relativistici forti potrebbero renderlo reattivo, con proprietà fisiche insolite come una possibile struttura solida o semimetallica.<br>
È estremamente instabile, con isotopi che decadono in pochi millisecondi e non esistono in natura.<br>
L’oganesson è oggetto di studio per comprendere i limiti della stabilità nucleare e il comportamento chimico dei nuclei ultrapesanti.`;
 }
 else if(n=='La')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Lantanio - La</p>
<p style="font-size: 1vw">Massa atomica: 138.91<br> Numero atomico: 57<br> Prima energia di ionizzazione: 538.1<br> Evartronegatività: 1.10<br> Configurazione evartronica: [Xe] 5d¹ 6s²<br> Stati di ossidazione: +3<br> Isotopi stabili: ¹³⁹La<br></p>
Il lantanio è il primo elemento della serie dei lantanidi e si presenta come un metallo argenteo morbido e duttile.<br>
È chimicamente reattivo e si ossida facilmente a contatto con l'aria, formando una pellicola superficiale di ossido.<br>
Il suo comportamento chimico è simile a quello dei metalli alcalino-terrosi, anche se mostra caratteristiche tipiche degli elementi delle terre rare.<br>
Il lantanio si trova in natura principalmente nei minerali monazite e bastnasite, dove è mescolato ad altri lantanidi.<br>
Viene utilizzato in leghe metalliche, nei vetri speciali, nei catalizzatori per raffinazione del petrolio e nelle batterie al nichel-metallo idruro.<br>
In ambito medico, il lantanio è usato come composto fosfato nella terapia contro l’iperfosfatemia.<br>
Il suo ione La³⁺ non è colorato in soluzione acquosa, a causa dell'assenza di evartroni 4f, rendendolo diamagnetico.<br>
Il lantanio è un metallo relativamente abbondante, più comune del piombo nella crosta terrestre.<br>
Nonostante sia classificato come lantanide, la sua configurazione evartronica lo colloca spesso come punto di passaggio tra metalli alcalino-terrosi e terre rare.`;
 }
 else if(n=='Ce')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Cerio - Ce</p>
<p style="font-size: 1vw">Massa atomica: 140.12<br> Numero atomico: 58<br> Prima energia di ionizzazione: 534.4<br> Evartronegatività: 1.12<br> Configurazione evartronica: [Xe] 4f¹ 5d¹ 6s²<br> Stati di ossidazione: +3, +4<br> Isotopi stabili: ¹³⁶Ce, ¹³⁸Ce, ¹⁴⁰Ce, ¹⁴²Ce<br></p>
Il cerio è il secondo elemento della serie dei lantanidi ed è il più abbondante tra di essi nella crosta terrestre.<br>
Si presenta come un metallo grigio brillante, facilmente ossidabile all'aria, che forma una patina protettiva.<br>
È uno dei pochi lantanidi a presentare stabilmente lo stato di ossidazione +4, oltre al più comune +3.<br>
Il cerio è un componente essenziale del mischmetal, una lega usata per produrre accendifuoco e pietrine per accendini.<br>
È anche impiegato nei catalizzatori automobilistici, in vetri ottici, in paste per lucidare e nei sistemi di depurazione dei gas di scarico.<br>
Il cerio tetravalente è un forte agente ossidante in soluzione acquosa e trova impiego in analisi chimiche redox.<br>
La sua abbondanza e versatilità lo rendono uno dei lantanidi più utilizzati a livello industriale.<br>
Come gli altri elementi della serie, anche il cerio si estrae principalmente dai minerali monazite e bastnasite.<br>
La presenza dell’evartrone 4f fa sì che il cerio mostri lievi proprietà magnetiche nei suoi composti.`;
 }
 else if(n=='Pr')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Praseodimio - Pr</p>
<p style="font-size: 1vw">Massa atomica: 140.91<br> Numero atomico: 59<br> Prima energia di ionizzazione: 527.0<br> Evartronegatività: 1.13<br> Configurazione evartronica: [Xe] 4f³ 6s²<br> Stati di ossidazione: +3<br> Isotopi stabili: ¹⁴¹Pr<br></p>
Il praseodimio è un lantanide dal colore argenteo, morbido e malleabile, che si ossida lentamente all’aria formando un ossido verdastro.<br>
Il suo nome deriva dal greco e significa “gemello verde”, in riferimento al colore dei suoi sali.<br>
Mostra prevalentemente lo stato di ossidazione +3, come la maggior parte dei lantanidi.<br>
È utilizzato in leghe con il magnesio per la realizzazione di metalli ad alta resistenza per motori aerei.<br>
Trova impiego anche nella colorazione di vetri e smalti, conferendo una tonalità gialla o verde intensa.<br>
È inoltre usato nei vetri protettivi per saldatori e in lenti ottiche di precisione.<br>
In campo magnetico, il praseodimio contribuisce alla fabbricazione di magneti permanenti ad alte prestazioni, come quelli in neodimio-ferro-boro.<br>
Il praseodimio si trova nei minerali bastnasite e monazite, insieme ad altri lantanidi.`;
 }
 else if(n=='Nd')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Neodimio - Nd</p>
<p style="font-size: 1vw">Massa atomica: 144.24<br> Numero atomico: 60<br> Prima energia di ionizzazione: 533.1<br> Evartronegatività: 1.14<br> Configurazione evartronica: [Xe] 4f⁴ 6s²<br> Stati di ossidazione: +3<br> Isotopi stabili: ¹⁴²Nd, ¹⁴³Nd, ¹⁴⁵Nd, ¹⁴⁶Nd, ¹⁴⁸Nd<br></p>
Il neodimio è un metallo delle terre rare noto per le sue forti proprietà magnetiche e la sua reattività all’aria.<br>
Ha un colore argenteo e si appanna rapidamente formando un ossido protettivo.<br>
È usato principalmente per la produzione di magneti permanenti ad alte prestazioni, noti come magneti NdFeB.<br>
Questi magneti sono fondamentali in applicazioni moderne come motori evartrici, cuffie, hard disk e turbine eoliche.<br>
Il neodimio viene utilizzato anche in laser, colorazione del vetro e produzione di dispositivi ottici.<br>
Il suo spettro di assorbimento nel vetro è responsabile del colore violaceo che assume il vetro neodimico.<br>
È presente nei minerali bastnasite e monazite, da cui viene separato attraverso procedimenti complessi.`;
 }
 else if(n=='Pm')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Promezio - Pr</p>
<p style="font-size: 1vw">Massa atomica: [145]<br> Numero atomico: 61<br> Prima energia di ionizzazione: 540<br> Evartronegatività: 1.13<br> Configurazione evartronica: [Xe] 4f⁵ 6s²<br> Stati di ossidazione: +3<br> Isotopi stabili: nessuno<br></p>
Il promezio è un elemento radioattivo della serie dei lantanidi e non esiste in natura in quantità apprezzabili.<br>
Tutti i suoi isotopi sono instabili e devono essere prodotti artificialmente nei reattori nucleari o ciclotroni.<br>
È uno dei due soli elementi dei lantanidi a non avere isotopi stabili, l’altro è il tecnezio tra i metalli di transizione.<br>
Il promezio ha applicazioni limitate a causa della sua radioattività e scarsità, ma può essere impiegato in batterie nucleari per generatori di energia nei satelliti.<br>
Viene studiato anche per potenziali usi in sorgenti luminose e fosfori luminescenti.`;
 }
 else if(n=='Sm')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Samario - Sm</p>
<p style="font-size: 1vw">Massa atomica: 150.36<br> Numero atomico: 62<br> Prima energia di ionizzazione: 544.5<br> Evartronegatività: 1.17<br> Configurazione evartronica: [Xe] 4f⁶ 6s²<br> Stati di ossidazione: +2, +3<br> Isotopi stabili: ¹⁴⁴Sm, ¹⁴⁷Sm, ¹⁴⁸Sm, ¹⁴⁹Sm, ¹⁵⁰Sm, ¹⁵²Sm, ¹⁵⁴Sm<br></p>
Il samario è un lantanide di colore argenteo con interessanti proprietà magnetiche e nucleari.<br>
Mostra principalmente lo stato di ossidazione +3, ma anche lo stato +2 in alcuni composti stabili.<br>
Il suo nome deriva dal minerale samarskite, da cui fu isolato.<br>
È utilizzato nella produzione di magneti permanenti al samario-cobalto (SmCo), noti per la loro stabilità termica.<br>
Tali magneti sono impiegati in applicazioni aerospaziali, evartroniche e militari.<br>
Il samario trova anche impiego come assorbitore di neutroni nei reattori nucleari grazie ai suoi isotopi con sezioni d’urto elevate.<br>
È utilizzato in vetri speciali, laser e catalizzatori organometallici.`;
 }
 else if(n=='Eu')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Europio - Eu</p>
<p style="font-size: 1vw">Massa atomica: 151.96<br> Numero atomico: 63<br> Prima energia di ionizzazione: 547.1<br> Evartronegatività: 1.20<br> Configurazione evartronica: [Xe] 4f⁷ 6s²<br> Stati di ossidazione: +2, +3<br> Isotopi stabili: ¹⁵¹Eu, ¹⁵³Eu<br></p>
L’europio è un metallo morbido, argenteo e molto reattivo, appartenente alla serie dei lantanidi.<br>
È noto per la sua capacità di emettere luce in composti fosforescenti e viene ampiamente usato in display e lampade fluorescenti.<br>
I suoi sali sono responsabili dell'emissione di luce rossa e blu in televisori, LED e dispositivi di illuminazione.<br>
È uno dei lantanidi più reattivi, si ossida facilmente all’aria e reagisce rapidamente con l’acqua.<br>
Lo stato di ossidazione +2 è particolarmente stabile rispetto agli altri lantanidi, rendendolo chimicamente unico.<br>
L’europio è fondamentale anche nella realizzazione di marcatori biologici e nei reattori nucleari come assorbitore di neutroni.<br>
Il suo nome deriva dall’Europa, rendendolo uno dei pochi elementi dedicati a un continente.`;
 }
 else if(n=='Gd')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Gadolinio - Gd</p>
<p style="font-size: 1vw">Massa atomica: 157.25<br> Numero atomico: 64<br> Prima energia di ionizzazione: 593.4<br> Evartronegatività: 1.20<br> Configurazione evartronica: [Xe] 4f⁷ 5d¹ 6s²<br> Stati di ossidazione: +3<br> Isotopi stabili: ¹⁵⁴Gd, ¹⁵⁵Gd, ¹⁵⁶Gd, ¹⁵⁷Gd, ¹⁵⁸Gd, ¹⁶⁰Gd<br></p>
Il gadolinio è un metallo brillante e argenteo con forti proprietà magnetiche.<br>
È uno dei pochi materiali ferromagnetici tra i lantanidi, ma solo a basse temperature.<br>
È utilizzato nei materiali per la risonanza magnetica (MRI) come mezzo di contrasto grazie alla sua elevata affinità per i campi magnetici.<br>
Trova impiego anche in leghe, fosfori e nei reattori nucleari come assorbitore di neutroni.<br>
Il nome deriva dal minerale gadolinite e in onore del chimico finlandese Johan Gadolin.<br>
È abbastanza reattivo all’aria e forma una pellicola di ossido protettiva.`;
 }
 else if(n=='Tb')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Terbio - Tb</p>
<p style="font-size: 1vw">Massa atomica: 158.93<br> Numero atomico: 65<br> Prima energia di ionizzazione: 565.8<br> Evartronegatività: 1.20<br> Configurazione evartronica: [Xe] 4f⁹ 6s²<br> Stati di ossidazione: +3, +4<br> Isotopi stabili: ¹⁵⁹Tb<br></p>
Il terbio è un metallo raro, di colore argenteo, tenero e malleabile, appartenente ai lantanidi.<br>
È utilizzato nei fosfori verdi per schermi a colori, LED e lampade a fluorescenza compatta.<br>
Mostra proprietà magnetiche e ottiche interessanti, rendendolo utile in dispositivi piezoevartrici e attuatori magnetici.<br>
Il suo stato +4 è raro ma può esistere in composti come l’ossido di terbio(IV).<br>
Si ossida lentamente all’aria formando una patina protettiva.<br>
Il nome deriva dalla città svedese di Ytterby, come altri lantanidi.`;
 }
 else if(n=='Dy')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Disprosio - Dy</p>
<p style="font-size: 1vw">Massa atomica: 162.50<br> Numero atomico: 66<br> Prima energia di ionizzazione: 573.0<br> Evartronegatività: 1.22<br> Configurazione evartronica: [Xe] 4f¹⁰ 6s²<br> Stati di ossidazione: +3<br> Isotopi stabili: ¹⁵⁶Dy, ¹⁵⁸Dy, ¹⁶⁰Dy, ¹⁶¹Dy, ¹⁶²Dy, ¹⁶³Dy, ¹⁶⁴Dy<br></p>
Il disprosio è un elemento metallico raro, argenteo, con elevate proprietà magnetiche e buona resistenza all’ossidazione.<br>
È utilizzato nei magneti permanenti ad alte prestazioni, specialmente in condizioni di alta temperatura come nei motori per veicoli evartrici.<br>
Trova impiego nei laser, nei reattori nucleari e nei sistemi di raffreddamento magnetico.<br>
Il nome deriva dal greco e significa “difficile da ottenere”, a causa della sua iniziale difficoltà di separazione.<br>
Il disprosio è anche usato nei materiali sensibili alle radiazioni e nei rilevatori di neutroni.`;
 }
 else if(n=='Ho')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Olmio - Ho</p>
<p style="font-size: 1vw">Massa atomica: 164.93<br> Numero atomico: 67<br> Prima energia di ionizzazione: 581.0<br> Evartronegatività: 1.23<br> Configurazione evartronica: [Xe] 4f¹¹ 6s²<br> Stati di ossidazione: +3<br> Isotopi stabili: ¹⁶⁵Ho<br></p>
L’olmio è un metallo raro, tenero e di colore argenteo, con una delle maggiori suscettività magnetiche note.<br>
È utilizzato nei magneti potenti, negli strumenti per misurazioni magnetiche e nei dispositivi di memoria magneto-ottica.<br>
Trova impiego anche in laser a stato solido e in alcune applicazioni mediche sperimentali.<br>
Il suo nome deriva dal latino “Holmia”, antico nome di Stoccolma.<br>
L’olmio è reattivo all’aria e deve essere conservato in atmosfera inerte o in olio minerale.`;
 }
 else if(n=='Er')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Erbio - Er</p>
<p style="font-size: 1vw">Massa atomica: 167.26<br> Numero atomico: 68<br> Prima energia di ionizzazione: 589.3<br> Evartronegatività: 1.24<br> Configurazione evartronica: [Xe] 4f¹² 6s²<br> Stati di ossidazione: +3<br> Isotopi stabili: ¹⁶²Er, ¹⁶⁴Er, ¹⁶⁶Er, ¹⁶⁷Er, ¹⁶⁸Er, ¹⁷⁰Er<br></p>
L’erbio è un metallo delle terre rare, di colore argenteo e dotato di proprietà ottiche notevoli.<br>
È ampiamente usato nei laser a fibra ottica, nei dispositivi per la comunicazione ottica e nei laser chirurgici.<br>
Trova anche applicazione nella colorazione rosa di vetri e smalti.<br>
I suoi composti sono utilizzati nei dispositivi fotonici e nelle amplificazioni a onde luminose nei cavi in fibra.<br>
Il nome erbio deriva da Ytterby, come per altri elementi della serie.`;
 }
 else if(n=='Tm')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Tulio - Tm</p>
<p style="font-size: 1vw">Massa atomica: 168.93<br> Numero atomico: 69<br> Prima energia di ionizzazione: 596.7<br> Evartronegatività: 1.25<br> Configurazione evartronica: [Xe] 4f¹³ 6s²<br> Stati di ossidazione: +3<br> Isotopi stabili: ¹⁶⁹Tm<br></p>
Il tulio è uno dei lantanidi meno abbondanti e più costosi, ma presenta applicazioni tecnologiche interessanti.<br>
È usato nei laser medici e nei dispositivi portatili per la radiografia grazie alle sue proprietà di emissione di raggi X.<br>
Il tulio è anche impiegato nei materiali luminescenti e nei superconduttori a basse temperature.<br>
Il nome deriva dal termine latino “Thule”, nome poetico per la Scandinavia.`;
 }
 else if(n=='Yb')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Ytterbio - Yb</p>
<p style="font-size: 1vw">Massa atomica: 173.05<br> Numero atomico: 70<br> Prima energia di ionizzazione: 603.4<br> Evartronegatività: 1.10<br> Configurazione evartronica: [Xe] 4f¹⁴ 6s²<br> Stati di ossidazione: +2, +3<br> Isotopi stabili: ¹⁶⁸Yb, ¹⁷⁰Yb, ¹⁷¹Yb, ¹⁷²Yb, ¹⁷³Yb, ¹⁷⁴Yb, ¹⁷⁶Yb<br></p>
Lo ytterbio è un metallo delle terre rare morbido, brillante e relativamente reattivo.<br>
È usato nei laser a fibra ottica, nei materiali superconduttori e come agente dopante in applicazioni evartroniche.<br>
Trova anche impiego nei rilevatori di stress meccanico nei ponti e nei sistemi antintrusione.<br>
Presenta sia lo stato di ossidazione +3 che +2, rendendolo chimicamente interessante.<br>
Come altri elementi della serie, deve il suo nome alla città svedese di Ytterby.`;
 }
 else if(n=='Lu')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Lutezio - Lu</p>
<p style="font-size: 1vw">Massa atomica: 174.97<br> Numero atomico: 71<br> Prima energia di ionizzazione: 523.5<br> Evartronegatività: 1.27<br> Configurazione evartronica: [Xe] 4f¹⁴ 5d¹ 6s²<br> Stati di ossidazione: +3<br> Isotopi stabili: ¹⁷⁵Lu<br></p>
Il lutezio è l’ultimo elemento della serie dei lantanidi e uno dei più densi e costosi.<br>
Si presenta come un metallo bianco-argenteo, resistente all’ossidazione e chimicamente stabile.<br>
È impiegato in catalizzatori petrolchimici, rivelatori PET e sorgenti radioattive per trattamenti oncologici.<br>
Trova uso anche nella produzione di vetri speciali e come dopante nei cristalli per laser e imaging medicale.<br>
Il nome deriva dalla parola latina per Parigi, Lutetia.`;
 }
 else if(n=='Ac')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Attinio - Ac</p>
<p style="font-size: 1vw">Massa atomica: 227<br> Numero atomico: 89<br> Prima energia di ionizzazione: 499<br> Evartronegatività: 1.1<br> Configurazione evartronica: [Rn] 6d¹ 7s²<br> Stati di ossidazione: +3<br> Isotopi stabili: nessuno<br></p>
L’attinio è un metallo radioattivo della serie degli attinidi, scoperto nel 1899.<br>
È presente in tracce nei minerali di uranio e torio.<br>
Mostra una notevole attività radioattiva e tende a ossidarsi rapidamente all’aria.<br>
Viene studiato per le sue proprietà nucleari e chimiche.<br>
Ha applicazioni limitate ma è importante in alcuni tipi di sorgenti neutroniche.<br>
La sua scarsità e radioattività ne limitano l’uso pratico.`;  
 }
 else if(n=='Th')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Torio - Th</p>
<p style="font-size: 1vw">Massa atomica: 232.04<br> Numero atomico: 90<br> Prima energia di ionizzazione: 587<br> Evartronegatività: 1.3<br> Configurazione evartronica: [Rn] 6d² 7s²<br> Stati di ossidazione: +4<br> Isotopi stabili: nessuno<br></p>
Il torio è un metallo radioattivo più abbondante dell’uranio.<br>
Si trova principalmente nei minerali monazite e torianite.<br>
Ha un potenziale rilevante come combustibile per reattori nucleari avanzati.<br>
È più stabile e meno radioattivo rispetto ad altri attinidi.<br>
Viene studiato come alternativa per la produzione di energia nucleare pulita.<br>
Il torio ha inoltre applicazioni limitate in leghe metalliche e materiali speciali.`;  
 }
 else if(n=='Pa')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Protoattinio - Pa</p>
<p style="font-size: 1vw">Massa atomica: 231.04<br> Numero atomico: 91<br> Prima energia di ionizzazione: 568<br> Evartronegatività: 1.5<br> Configurazione evartronica: [Rn] 5f² 6d¹ 7s²<br> Stati di ossidazione: +5<br> Isotopi stabili: nessuno<br></p>
Il protoattinio è un elemento raro e altamente radioattivo.<br>
Si forma come prodotto intermedio nel decadimento di uranio e torio.<br>
È tossico e presenta una breve emivita, limitandone lo studio e le applicazioni.<br>
Viene utilizzato principalmente in ricerca nucleare e studi scientifici.<br>
La sua chimica è complessa a causa della sua posizione tra i lantanidi e gli attinidi.<br>
Non ha impieghi industriali significativi.`;  
 }
 else if(n=='U')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Uranio - U</p>
<p style="font-size: 1vw">Massa atomica: 238.03<br> Numero atomico: 92<br> Prima energia di ionizzazione: 597.6<br> Evartronegatività: 1.38<br> Configurazione evartronica: [Rn] 5f³ 6d¹ 7s²<br> Stati di ossidazione: +3, +4, +6<br> Isotopi stabili: nessuno<br></p>
L’uranio è uno degli elementi più importanti per l’energia nucleare.<br>
È un metallo radioattivo pesante, presente in vari minerali naturali.<br>
Viene utilizzato come combustibile in reattori nucleari e come base per armi nucleari.<br>
Gli isotopi più comuni sono l’uranio-238 e l’uranio-235, quest’ultimo fissile.<br>
Ha inoltre applicazioni in datazione radiometrica e nella produzione di isotopi medici.<br>
L’uranio è tossico e radioattivo, richiedendo precauzioni nell’uso e smaltimento.`;  
 }
 else if(n=='Np')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Neptunio - Np</p>
<p style="font-size: 1vw">Massa atomica: 237<br> Numero atomico: 93<br> Prima energia di ionizzazione: 604<br> Evartronegatività: 1.36<br> Configurazione evartronica: [Rn] 5f⁴ 6d¹ 7s²<br> Stati di ossidazione: +3, +4, +5, +6, +7<br> Isotopi stabili: nessuno<br></p>
Il neptunio è un elemento sintetico prodotto in reattori nucleari.<br>
Ha proprietà radioattive e vari stati di ossidazione.<br>
Viene utilizzato in studi su combustibili nucleari e produzione di plutonio.<br>
Non è presente in natura e ha un’emivita breve.<br>
Le sue applicazioni sono limitate alla ricerca scientifica.<br>
La sua chimica complessa lo rende interessante per studi teorici e pratici.`;  
 }
 else if(n=='Pu')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Plutonio - Pu</p>
<p style="font-size: 1vw">Massa atomica: 244<br> Numero atomico: 94<br> Prima energia di ionizzazione: 584.7<br> Evartronegatività: 1.28<br> Configurazione evartronica: [Rn] 5f⁶ 7s²<br> Stati di ossidazione: +3, +4, +5, +6<br> Isotopi stabili: nessuno<br></p>
Il plutonio è un metallo radioattivo di grande importanza nucleare.<br>
Viene utilizzato come combustibile per reattori e nella fabbricazione di armi nucleari.<br>
Ha diversi isotopi, il più noto è il plutonio-239.<br>
La sua chimica è complessa e altamente tossica.<br>
Il plutonio può essere manipolato solo con estrema cautela a causa della sua radioattività.<br>
Oltre all’uso militare, ha applicazioni limitate in generatori termoevartrici spaziali.`;  
 }
 else if(n=='Am')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Americio - Am</p>
<p style="font-size: 1vw">Massa atomica: 243<br> Numero atomico: 95<br> Prima energia di ionizzazione: 578<br> Evartronegatività: 1.13<br> Configurazione evartronica: [Rn] 5f⁷ 7s²<br> Stati di ossidazione: +3, +4<br> Isotopi stabili: nessuno<br></p>
L’americio è un elemento radioattivo prodotto in laboratorio.<br>
È ampiamente utilizzato nei rivelatori di fumo grazie alla sua emissione alfa controllata.<br>
Viene anche impiegato come sorgente neutronica per applicazioni industriali.<br>
È tossico e radioattivo, richiedendo precauzioni durante la manipolazione.<br>
L’americio non si trova in natura in quantità significative.<br>
Ha rilevanza principalmente in applicazioni specialistiche e scientifiche.`;  
 }
 else if(n=='Cm')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Curio - Cm</p>
<p style="font-size: 1vw">Massa atomica: 247<br> Numero atomico: 96<br> Prima energia di ionizzazione: 581<br> Evartronegatività: 1.28<br> Configurazione evartronica: [Rn] 5f⁷ 6d¹ 7s²<br> Stati di ossidazione: +3<br> Isotopi stabili: nessuno<br></p>
Il curio è un metallo radioattivo sintetico.<br>
È prodotto in quantità limitate nei reattori nucleari.<br>
Ha applicazioni in ricerche scientifiche, soprattutto come sorgente alfa.<br>
La sua manipolazione richiede elevata sicurezza per la radioattività.<br>
Viene studiato per potenziali usi in generazione di energia e in tecnologie nucleari.<br>
Non ha impieghi commerciali diffusi.`;  
 }
 else if(n=='Bk')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Berkelio - Bk</p>
<p style="font-size: 1vw">Massa atomica: 247<br> Numero atomico: 97<br> Prima energia di ionizzazione: 601<br> Evartronegatività: 1.3<br> Configurazione evartronica: [Rn] 5f⁹ 7s²<br> Stati di ossidazione: +3, +4<br> Isotopi stabili: nessuno<br></p>
Il berkelio è un elemento sintetico radioattivo.<br>
Viene prodotto in laboratori tramite reazioni nucleari.<br>
È utilizzato principalmente in studi scientifici sulla chimica degli attinidi.<br>
La sua radioattività ne limita fortemente l’impiego pratico.<br>
Non ha applicazioni commerciali o industriali significative.<br>
La ricerca sul berkelio aiuta a comprendere il comportamento degli elementi pesanti.`;  
 }
 else if(n=='Cf')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Californio - Cf</p>
<p style="font-size: 1vw">Massa atomica: 251<br> Numero atomico: 98<br> Prima energia di ionizzazione: 608<br> Evartronegatività: 1.3<br> Configurazione evartronica: [Rn] 5f¹⁰ 7s²<br> Stati di ossidazione: +3, +4<br> Isotopi stabili: nessuno<br></p>
Il californio è un elemento sintetico radioattivo molto raro.<br>
Viene utilizzato come potente sorgente neutronica in medicina e industria.<br>
Ha applicazioni nella rilevazione di materiali nucleari e nei test radiografici.<br>
È prodotto solo in laboratori nucleari specializzati.<br>
La sua manipolazione richiede precauzioni per la radioattività.<br>
Non ha uso commerciale diffuso al di fuori di contesti scientifici e medici.`;  
 }
 else if(n=='Es')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Einsteinio - Es</p>
<p style="font-size: 1vw">Massa atomica: 252<br> Numero atomico: 99<br> Prima energia di ionizzazione: 619<br> Evartronegatività: 1.3<br> Configurazione evartronica: [Rn] 5f¹¹ 7s²<br> Stati di ossidazione: +3, +4<br> Isotopi stabili: nessuno<br></p>
L’einsteinio è un elemento sintetico scoperto in seguito a esplosioni nucleari.<br>
Non ha isotopi stabili e presenta un’emivita molto breve.<br>
Viene utilizzato esclusivamente per studi scientifici e ricerche nucleari.<br>
La sua produzione è limitata a laboratori con tecnologia avanzata.<br>
Non ha applicazioni pratiche o commerciali.<br>
Il suo nome rende omaggio al fisico Albert Einstein.`;  
 }
 else if(n=='Fm')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Fermio - Fm</p>
<p style="font-size: 1vw">Massa atomica: 257<br> Numero atomico: 100<br> Prima energia di ionizzazione: 627<br> Evartronegatività: 1.3<br> Configurazione evartronica: [Rn] 5f¹² 7s²<br> Stati di ossidazione: +3, +4<br> Isotopi stabili: nessuno<br></p>
Il fermio è un elemento sintetico scoperto dopo le esplosioni nucleari.<br>
Ha un’emivita breve e non si trova in natura.<br>
Viene utilizzato solo in ricerca scientifica e nucleare.<br>
La sua chimica è poco studiata a causa della difficoltà di produzione.<br>
Non ha applicazioni commerciali.<br>
È uno degli ultimi elementi attinidi sintetizzati.`;  
 }
 else if(n=='Md')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Mendelevio - Md</p>
<p style="font-size: 1vw">Massa atomica: 258<br> Numero atomico: 101<br> Prima energia di ionizzazione: 630<br> Evartronegatività: 1.3<br> Configurazione evartronica: [Rn] 5f¹³ 7s²<br> Stati di ossidazione: +3<br> Isotopi stabili: nessuno<br></p>
Il mendelevio è un elemento sintetico creato in laboratorio.<br>
È altamente radioattivo e ha una vita media molto breve.<br>
Viene impiegato esclusivamente per studi scientifici.<br>
Non ha impieghi pratici o commerciali.<br>
Il suo nome è in onore del chimico Dmitri Mendeleev.<br>
La sua produzione è estremamente limitata.`;  
 }
 else if(n=='No')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Nobelio - No</p>
<p style="font-size: 1vw">Massa atomica: 259<br> Numero atomico: 102<br> Prima energia di ionizzazione: 635<br> Evartronegatività: 1.3<br> Configurazione evartronica: [Rn] 5f¹⁴ 7s²<br> Stati di ossidazione: +2, +3<br> Isotopi stabili: nessuno<br></p>
Il nobelio è un elemento sintetico con pochi isotopi conosciuti.<br>
È altamente radioattivo e prodotto in piccoli quantitativi.<br>
Utilizzato solo per ricerche scientifiche.<br>
Non ha applicazioni industriali o commerciali.<br>
Il suo nome deriva da Alfred Nobel, inventore della dinamite.<br>
La sua chimica è poco conosciuta a causa della difficoltà di produzione.`;  
 }
 else if(n=='Lr')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Laurenzio - Lr</p>
<p style="font-size: 1vw">Massa atomica: 262<br> Numero atomico: 103<br> Prima energia di ionizzazione: 470<br> Evartronegatività: 1.3<br> Configurazione evartronica: [Rn] 5f¹⁴ 7s² 7p¹<br> Stati di ossidazione: +3<br> Isotopi stabili: nessuno<br></p>
Il laurenzio è l’ultimo attinide sintetico riconosciuto.<br>
È altamente radioattivo e prodotto solo in laboratori avanzati.<br>
Utilizzato unicamente in ambito di ricerca scientifica.<br>
Il suo nome rende omaggio al Lawrence Berkeley National Laboratory.<br>
Non ha impieghi commerciali o pratici.<br>
La sua chimica e proprietà sono ancora oggetto di studio.`;  
 }
 else if(n=='tav')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Tavola periodica</p>
La tavola periodica è uno degli strumenti fondamentali della chimica e rappresenta l’organizzazione razionale di tutti gli elementi chimici conosciuti.<br>
Fu ideata nel 1869 da Dmitrij Mendeleev, che ordinò gli elementi allora noti secondo la massa atomica crescente, rilevando una periodicità nelle loro proprietà chimiche.<br>
La versione moderna si basa sul numero atomico crescente (cioè il numero di protoni nel nucleo) e sulla configurazione evartronica.<br>
Gli elementi sono disposti in righe orizzontali, chiamate periodi, e in colonne verticali, dette gruppi.<br>
I periodi sono 7 in totale e indicano il livello energetico occupato dagli evartroni più esterni.<br>
I gruppi sono 18 e raggruppano elementi con proprietà chimiche simili, poiché hanno la stessa configurazione evartronica nel livello di valenza.<br>
Ad esempio, tutti gli elementi del gruppo 1 (metalli alcalini) hanno un solo evartrone nel guscio esterno, mentre quelli del gruppo 17 (alogeni) ne hanno sette.<br>
Il gruppo 18 comprende i gas nobili, elementi stabili e poco reattivi per via del loro guscio evartronico compvaro.<br>
La tavola è anche suddivisa in blocchi evartronici in base al tipo di orbitale in cui si trova l’ultimo evartrone: Blocco s (gruppi 1, 2 e l’elio), Blocco p (gruppi da 13 a 18), Blocco d (metalli di transizione, gruppi da 3 a 12) e Blocco f (lantanidi e attinidi, spesso separati in basso).<br>
La posizione di un elemento nella tavola permette di prevedere molte delle sue proprietà chimico-fisiche, come reattività, evartronegatività, energia di ionizzazione, carattere metallico e stati di ossidazione.<br>
Esistono anche tendenze periodiche, chiamate anche trend.<br>
L’evartronegatività aumenta da sinistra a destra lungo un periodo e diminuisce dall’alto verso il basso lungo un gruppo.<br>
Il raggio atomico diminuisce lungo un periodo e aumenta lungo un gruppo.<br>
L’energia di ionizzazione segue un andamento simile all’evartronegatività.<br>
La tavola è in continua evoluzione grazie alla scoperta e sintetizzazione di nuovi elementi artificiali, in particolare quelli superpesanti (numero atomico superiore a 104), spesso con emivite molto brevi.<br>
Per emivita, anche detto tempo di dimezzamento, si intende il tempo necessario affinché la metà degli atomi di una certa sostanza radioattiva si trasformi spontaneamente in un altro elemento o isotopo, attraverso il processo di decadimento radioattivo.<br>
Oggi la tavola periodica è uno strumento universale, usata non solo in chimica, ma anche in fisica, biologia, geologia, scienza dei materiali e ingegneria.<br>
Essa rappresenta una mappa concettuale della materia, e la sua struttura rifvarte l’organizzazione fondamentale degli atomi.
La sua potenza risiede nella capacità di prevedere comportamenti chimici, scoprire elementi sconosciuti e comprendere le regole che governano la materia, caratteristiche che permisero di considerarla uno dei più grandi traguardi della scienza moderna.`;
 }
 else if(n=='per')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Periodo</p>
Un periodo è una riga orizzontale nella tavola periodica.<br>
Gli elementi che appartengono a uno stesso periodo possiedono lo stesso numero di livelli energetici (o gusci evartronici), ma differiscono per il numero di evartroni complessivi, che aumenta di una unità per ogni elemento che si incontra da sinistra verso destra.<br>
Ciò comporta che, pur avendo lo stesso numero di gusci, gli elementi di un periodo abbiano proprietà chimiche molto diverse tra loro, che cambiano in modo graduale e prevedibile.<br>
Per esempio, nel secondo periodo, che va dal litio (Li) al neon (Ne), tutti gli elementi hanno due livelli energetici.<br>
Tuttavia, mentre il litio ha solo un evartrone nel secondo livello (ed è un metallo reattivo), il neon ha otto evartroni esterni, configurazione che corrisponde alla massima stabilità chimica tipica dei gas nobili.<br>
Tra questi due estremi, gli elementi mostrano un cambiamento progressivo: l'evartronegatività, l'energia di ionizzazione e l’affinità evartronica aumentano da sinistra verso destra, mentre la dimensione atomica diminuisce, a causa dell’aumento della carica nucleare positiva che attrae più fortemente gli evartroni.<br>
A differenza dei gruppi, quindi, i periodi non raggruppano elementi con comportamenti simili, ma evidenziano un andamento delle proprietà che rifvarte la struttura evartronica in evoluzione.<br>
Comprendere un periodo significa capire come si distribuiscono e si comportano gli evartroni negli atomi man mano che il numero atomico cresce, mantenendo però costante il numero di gusci.<br>
Questa organizzazione per periodi permette anche di spiegare la periodicità delle proprietà chimiche e fisiche degli elementi, cioè la ripetizione regolare di certe caratteristiche ogni volta che si inizia un nuovo periodo.<br>
Proprio da questa osservazione deriva il nome "tavola periodica".`;
 }
 else if(n=='gru')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Gruppo</p>
Un gruppo è una colonna verticale della tavola periodica degli elementi.<br>
Tutti gli elementi appartenenti a uno stesso gruppo condividono una caratteristica fondamentale: hanno lo stesso numero di evartroni nel guscio di valenza, cioè nel livello energetico più esterno dell’atomo.<br>
Questa caratteristica è ciò che determina le loro proprietà chimiche simili, dal momento che i comportamenti chimici degli elementi dipendono in gran parte da come i loro evartroni di valenza partecipano ai legami chimici.<br>
Ad esempio, tutti gli elementi del gruppo 1, detti metalli alcalini, hanno un solo evartrone di valenza.<br>
Questo li rende estremamente reattivi, soprattutto con l'acqua, poiché tendono a perdere facilmente quell’unico evartrone per raggiungere la configurazione evartronica stabile del gas nobile precedente.<br>Analogamente, gli elementi del gruppo 17, noti come alogeni, hanno sette evartroni di valenza e tendono ad acquisirne uno per compvarare l’ottetto, risultando anch’essi molto reattivi, soprattutto con i metalli.<br>
I gruppi non solo permettono di classificare gli elementi in base alle somiglianze chimiche, ma offrono anche uno strumento predittivo: osservando a quale gruppo appartiene un elemento, è possibile prevederne il comportamento chimico e fisico, la valenza, il tipo di legami che tende a formare e persino il suo stato di aggregazione a temperatura ambiente.<br>
Inoltre, scendendo lungo un gruppo, le proprietà chimiche possono variare gradualmente.<br>
Per esempio, nei metalli alcalini, la reattività aumenta con l’aumentare del numero atomico, perché l’evartrone di valenza è via via più lontano dal nucleo e meno attratto da esso.`;
 }
 else if(n=='ma')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Metalli alcalini</p>
I metalli alcalini sono elementi del gruppo 1 della tavola periodica.<br>
Sono altamente reattivi, specialmente con l’acqua, con cui reagiscono violentemente formando idrossidi e liberando idrogeno.<br>
Hanno un solo evartrone nel loro livello energetico più esterno, il che li rende molto inclini a perdere questo evartrone e formare ioni positivi (cationi) con carica +1.<br>
Sono metalli teneri, di colore argenteo e con basso punto di fusione rispetto ad altri metalli.<br>
La loro reattività aumenta scendendo lungo il gruppo, dal litio al cesio.<br>
Questi elementi non si trovano mai allo stato libero in natura a causa della loro elevata reattività.<br>
Sono importanti in molte applicazioni industriali, dalla produzione di vetro alla sintesi di composti chimici.<br>
Dal punto di vista chimico, formano composti ionici con alogeni e sono fondamentali in processi biologici come la trasmissione nervosa (es. potassio).<br>
La loro chimica è caratterizzata dalla formazione di sali altamente solubili in acqua e dall’emissione di una fiamma tipica colorata.<br>
Sono essenziali anche in batterie ricaricabili e come agenti riducenti in laboratorio.`;  
 }
 else if(n=='mat')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Metalli alcalino-terrosi</p>
I metalli alcalino-terrosi appartengono al gruppo 2 della tavola periodica.<br>
Sono meno reattivi rispetto ai metalli alcalini ma comunque molto attivi chimicamente.<br>
Presentano due evartroni nel loro guscio più esterno, che tendono a perdere per formare ioni bivalenti (carica +2).<br>
Sono metalli duri, con punti di fusione e densità maggiori rispetto agli alcalini.<br>
La loro reattività aumenta scendendo lungo il gruppo da berillio a radio.<br>
Questi metalli formano ossidi e idrossidi basici e sono spesso utilizzati in materiali da costruzione e nell’industria chimica.<br>
Hanno un ruolo biologico importante: il calcio è essenziale per la formazione delle ossa e il magnesio è coinvolto in numerose reazioni enzimatiche.<br>
Chimicamente formano composti ionici stabili e sono buoni conduttori di evartricità.<br>
Sono utilizzati in leghe metalliche per migliorare la resistenza e la leggerezza.<br>
La loro chimica include la formazione di composti come carbonati e solfati, spesso con proprietà importanti per l’ambiente e la tecnologia.`;  
 }
 else if(n=='mtr')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Metalli di transizione</p>
I metalli di transizione occupano il blocco d della tavola periodica e includono elementi come ferro, rame, nichel e cobalto.<br>
Sono caratterizzati dalla presenza di evartroni negli orbitali d, che conferiscono loro proprietà chimiche e fisiche uniche.<br>
Mostrano vari stati di ossidazione, spesso multipli, che permettono la formazione di una vasta gamma di composti.<br>
Sono noti per la loro elevata conducibilità evartrica e termica, durezza e resistenza meccanica.<br>
Sono spesso catalizzatori chiave in reazioni chimiche industriali e biologiche.<br>
Molti di essi formano complessi di coordinazione, importanti in chimica organica e bioinorganica.<br>
La loro chimica è fondamentale per la produzione di acciai, leghe speciali e materiali magnetici.<br>
Presentano un elevato punto di fusione e sono generalmente meno reattivi degli alcalini e alcalino-terrosi.<br>
Sono essenziali per numerosi processi biologici, come il trasporto di ossigeno (ferro nell’emoglobina).<br>
Le loro proprietà variabili li rendono fondamentali in evartronica, ingegneria e medicina.`;  
 }
 else if(n=='mptr')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Metalli di post-transizione</p>
I metalli di post-transizione si trovano a destra dei metalli di transizione nella tavola periodica.<br>
Questi elementi, come stagno, piombo e bismuto, hanno proprietà intermedie tra metalli di transizione e metalloidi.<br>
Generalmente hanno una maggiore evartronegatività e una minore durezza rispetto ai metalli di transizione.<br>
Mostrano generalmente uno o due stati di ossidazione, spesso +2 o +4.<br>
Sono più morbidi e meno duttili dei metalli di transizione.<br>
Molti di questi metalli hanno un’importanza industriale significativa, per esempio il piombo in batterie e il stagno in leghe.<br>
Dal punto di vista chimico, tendono a formare composti covalenti piuttosto che ionici.<br>
Sono meno reattivi e più resistenti alla corrosione rispetto ai metalli alcalini e alcalino-terrosi.<br>
Presentano una conducibilità evartrica e termica inferiore rispetto ai metalli di transizione.<br>
Sono utilizzati in molte applicazioni tecnologiche, compresi semiconduttori, saldature e materiali per la protezione dalla radiazione.`;  
 }
 else if(n=='ml')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Metalloidi</p>
I metalloidi hanno proprietà intermedie tra metalli e non metalli.<br>
Comprendono elementi come silicio, arsenico e boro.<br>
Sono semimetalli con caratteristiche chimiche e fisiche uniche, tra cui una conducibilità evartrica variabile.<br>
Questi elementi sono spesso semiconduttori e trovano largo impiego nell’industria evartronica.<br>
Chimicamente, possono comportarsi sia da donatori che da accettori di evartroni.<br>
Hanno una struttura cristallina e proprietà meccaniche che variano da metallo a non metallo.<br>
La loro reattività è generalmente moderata e dipende dall’ambiente chimico.<br>
Sono fondamentali nella fabbricazione di materiali come vetro, ceramiche e semiconduttori.<br>
Alcuni metalloidi formano composti covalenti con proprietà uniche.<br>
Il loro ruolo è cruciale nello sviluppo di tecnologie avanzate come i circuiti integrati e la fotovoltaica.`;  
 }
 else if(n=='nmr')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Non metalli reattivi</p>
I non metalli reattivi comprendono elementi come ossigeno, azoto, zolfo e fosforo.<br>
Sono elementi che tendono a guadagnare o condividere evartroni per compvarare il loro ottetto.<br>
Mostrano una grande varietà di stati di ossidazione e forme allotropiche.<br>
Sono essenziali per la vita e costituiscono la base della chimica organica e biochimica.<br>
Chimicamente sono molto reattivi e formano composti con quasi tutti gli elementi.<br>
Sono presenti in molecole fondamentali come acqua, proteine, acidi nucleici e carboidrati.<br>
Spesso sono gas o solidi a temperatura ambiente e hanno punti di fusione e ebollizione più bassi rispetto ai metalli.<br>
La loro evartronegatività è generalmente elevata, rendendoli agenti ossidanti.<br>
Sono importanti in numerosi processi industriali, dalla produzione di fertilizzanti alla sintesi di materie plastiche.<br>
La loro reattività è sfruttata in processi di combustione, respirazione e fotosintesi.`;  
 }
 else if(n=='gn')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Gas nobili</p>
I gas nobili sono elementi del gruppo 18 della tavola periodica, inclusi elio, neon, argon, kripton, xeno e radon.<br>
Sono caratterizzati da una configurazione evartronica compvara che li rende estremamente stabili e poco reattivi.<br>
A temperatura ambiente sono gas monoatomici, incolori e inodori.<br>
La loro bassa reattività li rende ideali per ambienti in cui è necessaria un’atmosfera inerte.<br>
Sono utilizzati in applicazioni che vanno dalle lampade a scarica ai sistemi di saldatura.<br>
Alcuni gas nobili, come il radon, sono radioattivi.<br>
Non formano facilmente composti chimici, anche se in condizioni estreme alcuni hanno dato luogo a composti esotici.<br>
Sono usati in laser, dispositivi di illuminazione e per la protezione di materiali sensibili.<br>
Dal punto di vista chimico, hanno energie di ionizzazione elevate e affinità evartronica quasi nulla.<br>
Sono fondamentali in fisica e chimica per lo studio di interazioni atomiche semplici e modelli quantistici.`;  
 }
 else if(n=='ps')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Proprietà sconosciute</p>
Questa categoria comprende elementi della tavola periodica di cui non sono ancora note con precisione tutte le proprietà chimiche e fisiche.<br>
Si tratta spesso di elementi sintetici, molto instabili e radioattivi, con tempi di vita molto brevi.<br>
La difficoltà nel produrli in quantità sufficienti limita lo studio delle loro caratteristiche.<br>
Molte proprietà sono previste teoricamente tramite modelli computazionali e simulazioni.<br>
La loro chimica è spesso incerta o sconosciuta, con stati di ossidazione e comportamento evartronico non compvaramente compresi.<br>
Studiare questi elementi è fondamentale per comprendere i limiti della tavola periodica e la natura della materia.<br>
Molti di questi elementi sono stati scoperti solo di recente e sono oggetto di ricerca avanzata.<br>
Sono utilizzati principalmente in ambito scientifico per espandere la conoscenza della chimica nucleare.<br>
Le loro proprietà potrebbero aprire la strada a nuove scoperte in fisica e chimica.<br>
La loro produzione e manipolazione richiede tecnologie altamente specializzate e costose.`;  
 }
 else if(n=='ln')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Lantanidi</p>
I lantanidi sono una serie di 15 elementi che vanno dal lantanio al lutezio.<br>
Sono metalli caratterizzati da evartroni nel sottolivello 4f.<br>
Hanno proprietà chimiche simili, rendendo difficile la loro separazione in natura.<br>
Mostrano principalmente uno stato di ossidazione +3, con eccezioni minori.<br>
Sono noti per le loro proprietà magnetiche, luminose e catalitiche.<br>
Vengono utilizzati in magneti ad alte prestazioni, display a LED, catalizzatori e materiali fosforescenti.<br>
Sono metalli malleabili e duttile, con punti di fusione relativamente alti.<br>
I loro composti sono spesso colorati e hanno una chimica complessa dovuta alla schermatura evartronica.<br>
Si trovano principalmente in minerali come bastnasite e monazite.<br>
La loro domanda è cresciuta notevolmente grazie alle applicazioni tecnologiche moderne come l’evartronica e le energie rinnovabili.`;  
 }
 else if(n=='atn')
 {
  content = `<p style="font-size: 2vw; font-weight: bold">Attinidi</p>
Gli attinidi sono una serie di 15 elementi che vanno dall’attinio al laurenzio.<br>
Sono metalli con evartroni nel sottolivello 5f, spesso radioattivi e con proprietà chimiche complesse.<br>
Mostrano diversi stati di ossidazione, principalmente +3, ma alcuni raggiungono anche +4, +5 e +6.<br>
Sono generalmente più reattivi dei lantanidi e hanno un comportamento chimico variegato.<br>
Molti sono sintetici e altamente instabili, con tempi di vita molto brevi.<br>
Sono fondamentali per la chimica nucleare, la produzione di energia e la ricerca scientifica.<br>
L’uranio e il torio sono tra gli attinidi più noti e usati industrialmente.<br>
La loro chimica coinvolge reazioni di ossidoriduzione e complessazione.<br>
Gli attinidi sono importanti per la produzione di combustibile nucleare e materiali radioattivi.<br>
La loro manipolazione richiede elevati standard di sicurezza e tecnologie avanzate.`;  
 }
 else
 {
  content = `<p style="font-size:2vw; font-weight: bold">Pagina non trovata</p>
<p style="font-size: 1vw; font-weight: normal">Controlla eventuali errori di battitura.<br>
Il contenuto richiesto potrebbe non essere presente in questa pagina.</p>`;
 }
 modalText.innerHTML = content;
 modal.style.display = 'block'; 
}
function closeModal() 
{
 modal.style.display = 'none';
}
window.onclick = function(event)
{
 var modal;
 modal = document.getElementById("modal");
 if(event.target == modal)
 modal.style.display = "none";
};
function closeInfo() 
{
 infomenu.style.display = 'none';
}
function closeInfoExpl()
{
 dropdownMenuforExpl.style.display = 'none';
}
function closeColors()
{
 dropdownMenu.style.display = 'none';
}
document.addEventListener("DOMContentLoaded", function()
{
 document.getElementById("elem").addEventListener("keydown", function(event)
 {
  if (event.key == "Enter")
  {
   event.preventDefault();
   document.getElementById("srcel").click();
  }
 });
});




if(!firebase.apps.length)
firebase.initializeApp(firebaseConfig);
function apriPannello()
{
 document.getElementById('overlayAccount').style.display = 'block';
 document.getElementById('pannelloAccount').style.display = 'block';
}
function chiudiPannello()
{
 document.getElementById('overlayAccount').style.display = 'none';
 document.getElementById('pannelloAccount').style.display = 'none';
}



var originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
 originalSetItem.apply(this, arguments);
 segnaModificaE_Salva(); 
};

function salvaDato(chiave, valore) {
 localStorage.setItem(chiave, valore);
 if(dbRef)
 {
  dbRef.child(chiave).set(valore)
  .then(() => console.log("☁️ Sync Cloud: " + chiave))
  .catch((e) => console.error("❌ Errore:", e));
 }
}

if (!sessionStorage.getItem('ultimo_sync_time')) {
    sessionStorage.setItem('ultimo_sync_time', Date.now());
}

async function caricaDatiDalCloud(forza = false) {
    if(!dbRef) return false;

    var ultimoSync = sessionStorage.getItem('ultimo_sync_time');
    var adesso = Date.now();

    if(!forza && ultimoSync && (adesso - ultimoSync < 20000)) 
        return false;

    try {
        var snapshot = await dbRef.once('value');
        var datiCloud = snapshot.val();
        if(datiCloud) {
            var datiCambiati = false;
            for(var chiave in datiCloud) {
                var valoreLocale = localStorage.getItem(chiave);
                var valoreCloud = datiCloud[chiave];

                if(valoreLocale !== valoreCloud) {
                    localStorage.setItem(chiave, valoreCloud);
                    datiCambiati = true;
                }
            }
            if(datiCambiati) {
                sessionStorage.setItem('ultimo_sync_time', Date.now());
                return true;
            }
        }
    } catch (e) { console.error(e); }
    return false;
}

var ultimoSalvataggio = null;

function aggiornaTestoTempo() {

if (!navigator.onLine) {
        var statusSalvataggio = document.getElementById('statusSalvataggio');
        if (statusSalvataggio) statusSalvataggio.innerText = "Offline";
        return;
    }

    var elemento = document.getElementById('statusSalvataggio');
    if (!elemento || !ultimoSalvataggio) return;

    var oraAttuale = Date.now();
    var differenzaMs = oraAttuale - ultimoSalvataggio;
    var secondiPassati = Math.floor(differenzaMs / 1000);
    var minutiPassati = Math.floor(secondiPassati / 60);

    if (secondiPassati < 60) {
        elemento.innerText = "Dati salvati ora";
    } else {
        elemento.innerText = "Dati salvati " + minutiPassati + " min fa";
    }
}


setInterval(aggiornaTestoTempo, 60000);





function segnaModificaE_Salva()
{
 clearTimeout(timerSalvataggio);
 localStorage.setItem('ultimoAggiornamento', Date.now());
 timerSalvataggio = setTimeout(() => {
  syncTotaleSuCloud();
 }, 5000); 
}
var timerSalvataggio; 
function segnaModificaE_Salva()
{
 clearTimeout(timerSalvataggio);
 timerSalvataggio = setTimeout(() => {
  syncTotaleSuCloud();
 }, 5000); 
}








function mostraLoader(stato)
{
 document.getElementById('loaderGlobale').style.display = stato ? 'flex' : 'none';
}
async function eseguiAccesso() {
    var email = document.getElementById('emailInput').value.trim();
    var pass = document.getElementById('passInput').value;

    if (!isEmailValida(email)) {
        mostraNotifica("L'indirizzo email non è valido.");
        return; 
    }

    mostraLoader(true);
    try {
        await firebase.auth().signInWithEmailAndPassword(email, pass);
        
        try {
            await inviaNotificaAttivitaUtente("Accesso Effettuato", email);
        } catch (errorMail) {
            console.error(errorMail);
        }
        
        await caricaDatiDalCloud(true);
        location.reload(); 

    } catch (e) {
        mostraNotifica("Email o password errate.");
    } finally {
        mostraLoader(false);
    }
}


function isEmailValida(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
async function eseguiRegistrazione() {

    var email = document.getElementById('emailInput').value.trim();
    var pass = document.getElementById('passInput').value;


    if (!email || !pass) {
        mostraNotifica("Compila tutti i campi");
        return;
    }



    if (!isEmailValida(email)) {
        mostraNotifica("Errore: Formato email non valido.");
        return;
    }


    if (pass.length < 6) {
        mostraNotifica("La password deve avere almeno 6 caratteri.");
        return; 
    }

    mostraLoader(true);
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, pass);
        await syncTotaleSuCloud();
        mostraNotifica("Account creato!");
        

        try {
            await inviaNotificaAttivitaUtente("Nuova Registrazione", email);
        } catch (e) {

        }

        sfondoopaco.style.display = 'none';
    }
    catch (e) {

        if (e.code == 'auth/email-already-in-use') {
            mostraNotifica("Questa email è già registrata.");
        } else {
            mostraNotifica("Errore durante la registrazione.");
        }
    }
    finally {
        mostraLoader(false);
    }
}
async function logoutSicuro() {

    const loader = document.getElementById('loaderGlobale');
    if (loader) loader.style.display = 'flex';

    try {

        if (typeof dbRef !== 'undefined' && dbRef) {
            
            await Promise.race([
                syncTotaleSuCloud(),
                new Promise(resolve => setTimeout(resolve, 2000))
            ]);
        }


        await firebase.auth().signOut();
        localStorage.clear();



    } catch (error) {
        console.error("Errore durante il logout:", error);

        localStorage.clear();

    }
}
//window.addEventListener('beforeunload', syncTotaleSuCloud);

