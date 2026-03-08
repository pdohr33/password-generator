/* === SecurePass app.js === */
/* All generation is done client-side using crypto.getRandomValues */

'use strict';

// =====================================================
// CHARACTER SETS
// =====================================================

const CHARS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
  ambig: /[0O1Ill]/g
};

// =====================================================
// WORDLIST (EFF Short Word List - 1296 words)
// Subset used here for passphrase generation
// =====================================================

const WORDLIST = [
  'able','acorn','acid','aged','also','area','army','atom','aunt','avid',
  'away','axle','baby','back','bake','ball','band','bank','bare','barn',
  'base','bath','bead','beam','bean','bear','beat','beef','been','bell',
  'belt','best','bike','bill','bird','bite','blow','blue','boat','body',
  'bold','bolt','bond','bone','book','boom','boot','boss','both','bowl',
  'bulk','bull','burn','busy','cage','cake','call','calm','came','camp',
  'card','care','cart','cave','cell','chad','chef','chip','city','clam',
  'clap','claw','clay','clip','club','clue','coal','coat','code','coin',
  'cold','come','cook','copy','cord','core','cork','corn','cost','cozy',
  'crab','crew','crop','cube','cups','curl','dare','dark','dart','data',
  'date','dawn','days','dead','deal','dean','debt','deck','deed','deep',
  'deer','deny','desk','dial','dirt','disk','dive','dock','does','dome',
  'done','door','dose','dove','down','draw','drew','drip','drop','drum',
  'dual','duel','dump','dunk','dust','duty','dyed','each','earn','ease',
  'east','edge','else','envy','epic','even','ever','evil','exam','exit',
  'face','fact','fade','fail','fair','fall','fame','farm','fast','fate',
  'fawn','fear','feat','feel','feet','fell','felt','fend','fern','file',
  'fill','film','find','fine','fire','firm','fish','fist','flag','flat',
  'flaw','flea','flew','flex','flip','flow','foam','fold','folk','font',
  'food','fool','foot','ford','fore','fork','form','fort','foul','four',
  'free','frog','from','fuel','full','fume','fund','fuse','gale','game',
  'gang','gave','gear','gild','give','glad','glow','glue','goal','goat',
  'gold','golf','good','gown','grab','gray','grew','grid','grim','grip',
  'grit','grow','gulf','gull','gust','half','hall','hand','hang','hard',
  'hare','harm','harp','hash','hate','have','hawk','haze','head','heal',
  'heap','heat','heel','held','helm','help','herb','herd','here','hero',
  'hide','high','hike','hill','hint','hire','hole','holy','home','hood',
  'hook','hope','horn','host','hour','huge','hull','hump','hunt','hymn',
  'icon','idle','inch','info','into','iron','isle','item','jade','jail',
  'jamb','java','jest','join','joke','jolt','jump','jury','just','keen',
  'kept','kick','kind','king','knee','knew','knob','know','lack','land',
  'lane','lark','last','late','lawn','lead','leaf','lean','leap','left',
  'lend','lens','lest','lick','life','lift','like','lime','limp','line',
  'link','lion','list','live','load','loan','lock','loft','logo','lone',
  'long','look','loom','loop','lord','lore','lose','lost','loud','love',
  'luck','lure','made','make','mane','many','mark','mars','mast','maze',
  'meal','mean','meat','meet','melt','mesh','mild','mile','milk','mill',
  'mind','mine','mint','miss','mist','mode','mole','moon','more','moss',
  'most','move','much','mule','muse','must','name','navy','near','neck',
  'need','nest','next','nice','nine','node','none','noon','norm','nose',
  'note','noun','obey','opal','open','oral','oven','over','pace','pack',
  'pact','page','paid','pain','pair','palm','park','part','pass','past',
  'path','pave','peak','peel','peer','pelt','pest','pick','pier','pike',
  'pile','pine','pipe','plan','play','plod','plot','plow','plum','plus',
  'poem','poet','pole','poll','polo','pond','pool','poor','port','pose',
  'post','pour','prey','pride','prop','pull','pump','pure','push','quay',
  'rack','rain','ramp','rank','rare','rate','read','real','reap','reef',
  'reel','rely','rent','rest','rice','rich','ride','ring','riot','rise',
  'risk','road','roam','roar','robe','rock','rode','role','roll','roof',
  'room','root','rope','rose','rote','rout','rove','ruin','rule','rush',
  'rust','safe','sage','sail','sale','salt','same','sand','sane','save',
  'seal','seed','seek','seem','seen','self','sell','send','shed','shin',
  'ship','shoe','shop','shot','show','shut','sick','side','sift','silk',
  'sing','sink','site','size','skip','skull','slab','slap','slim','slip',
  'slow','slum','snap','snow','soft','soil','sole','some','song','soot',
  'sort','soul','soup','sour','span','spar','spin','spot','stab','stag',
  'star','stay','stem','step','stir','stop','stub','such','suit','sung',
  'surf','sway','swim','tail','tale','tall','tame','tank','tape','task',
  'team','tear','tent','term','test','than','that','them','then','this',
  'tide','tier','tile','till','time','tiny','tire','toad','told','toll',
  'tomb','tone','took','tool','tore','torn','tote','tour','town','trap',
  'tree','trim','trip','trod','true','tube','tuck','tuft','tusk','twin',
  'type','ugly','undo','unit','upon','used','vale','vane','vast','veal',
  'veil','vein','vest','view','vine','void','vole','volt','vote','wade',
  'wail','wake','walk','wall','wand','ward','warm','wary','wave','waxy',
  'weak','weed','well','went','were','west','what','when','whip','wide',
  'wife','wild','will','wilt','wind','wine','wing','wire','wise','wish',
  'with','wolf','womb','wool','word','wore','worm','worn','wrap','wren',
  'yard','yarn','year','yell','your','zeal','zero','zinc','zone','zoom'
];

// =====================================================
// CRYPTO-SAFE RANDOM
// =====================================================

function randomInt(max) {
  // Unbiased random integer in [0, max) using rejection sampling
  const limit = Math.floor(0x100000000 / max) * max;
  let val;
  do {
    val = crypto.getRandomValues(new Uint32Array(1))[0];
  } while (val >= limit);
  return val % max;
}

function randomChar(alphabet) {
  return alphabet[randomInt(alphabet.length)];
}

// =====================================================
// PASSWORD GENERATOR
// =====================================================

function buildCharset() {
  let charset = '';
  const upper = document.getElementById('optUpper').checked;
  const lower = document.getElementById('optLower').checked;
  const numbers = document.getElementById('optNumbers').checked;
  const symbols = document.getElementById('optSymbols').checked;
  const noAmbig = document.getElementById('optNoAmbig').checked;

  if (upper) charset += CHARS.upper;
  if (lower) charset += CHARS.lower;
  if (numbers) charset += CHARS.numbers;
  if (symbols) charset += CHARS.symbols;

  if (noAmbig) {
    charset = charset.replace(CHARS.ambig, '');
  }

  return charset;
}

function generatePassword(length, charset) {
  if (!charset || charset.length === 0) return '';

  // Ensure at least one of each enabled character type
  let guaranteed = [];
  if (document.getElementById('optUpper').checked) {
    let pool = CHARS.upper;
    if (document.getElementById('optNoAmbig').checked) pool = pool.replace(CHARS.ambig, '');
    if (pool.length > 0) guaranteed.push(randomChar(pool));
  }
  if (document.getElementById('optLower').checked) {
    let pool = CHARS.lower;
    if (document.getElementById('optNoAmbig').checked) pool = pool.replace(CHARS.ambig, '');
    if (pool.length > 0) guaranteed.push(randomChar(pool));
  }
  if (document.getElementById('optNumbers').checked) {
    let pool = CHARS.numbers;
    if (document.getElementById('optNoAmbig').checked) pool = pool.replace(CHARS.ambig, '');
    if (pool.length > 0) guaranteed.push(randomChar(pool));
  }
  if (document.getElementById('optSymbols').checked) {
    guaranteed.push(randomChar(CHARS.symbols));
  }

  // Fill remaining
  const remaining = length - guaranteed.length;
  const extra = Array.from({ length: Math.max(0, remaining) }, () => randomChar(charset));

  // Shuffle all together
  const all = [...guaranteed, ...extra];
  for (let i = all.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [all[i], all[j]] = [all[j], all[i]];
  }

  return all.join('');
}

// =====================================================
// PASSPHRASE GENERATOR
// =====================================================

function generatePassphrase() {
  const count = parseInt(document.getElementById('wordCount').value, 10);
  const sep = document.getElementById('separator').value;
  const capitalize = document.getElementById('optCapitalize').checked;
  const addNum = document.getElementById('optAddNumber').checked;

  const words = Array.from({ length: count }, () => {
    const w = WORDLIST[randomInt(WORDLIST.length)];
    return capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  });

  let phrase = words.join(sep);
  if (addNum) phrase += sep + randomInt(1000);

  const display = document.getElementById('passphraseDisplay');
  display.textContent = phrase;

  // Strength
  const entropy = calculatePhraseEntropy(count);
  showPhraseStrength(entropy);

  // Reset HIBP if any
  const outputBox = document.getElementById('passphraseOutputBox');
  outputBox.classList.add('generating');
  setTimeout(() => outputBox.classList.remove('generating'), 300);
}

function calculatePhraseEntropy(wordCount) {
  // log2(wordlist_size ^ words)
  return Math.round(wordCount * Math.log2(WORDLIST.length));
}

// =====================================================
// STRENGTH CALCULATION
// =====================================================

function calculateEntropy(password) {
  // Pool size based on character classes present
  let pool = 0;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 32;
  if (pool === 0) return 0;
  return Math.round(password.length * Math.log2(pool));
}

function entropyToLevel(bits) {
  if (bits < 40) return { level: 'weak', bars: 1, cls: 'fill-weak', labelCls: 'level-weak' };
  if (bits < 60) return { level: 'fair', bars: 2, cls: 'fill-fair', labelCls: 'level-fair' };
  if (bits < 80) return { level: 'strong', bars: 3, cls: 'fill-strong', labelCls: 'level-strong' };
  return { level: 'great', bars: 4, cls: 'fill-great', labelCls: 'level-great' };
}

function showStrength(password) {
  const meter = document.getElementById('strengthMeter');
  if (!password || password === 'Click Generate') {
    meter.style.display = 'none';
    return;
  }

  meter.style.display = 'block';
  const bits = calculateEntropy(password);
  const { level, bars, cls, labelCls } = entropyToLevel(bits);

  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById('bar' + i);
    bar.className = 'strength-bar' + (i <= bars ? ' ' + cls : '');
  }

  const label = document.getElementById('strengthLabel');
  label.textContent = level.charAt(0).toUpperCase() + level.slice(1);
  label.className = 'level ' + labelCls;

  document.getElementById('entropyLabel').textContent = bits + ' bits';
}

function showPhraseStrength(bits) {
  const meter = document.getElementById('phraseStrengthMeter');
  meter.style.display = 'block';

  const { level, bars, cls, labelCls } = entropyToLevel(bits);

  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById('pbar' + i);
    bar.className = 'strength-bar' + (i <= bars ? ' ' + cls : '');
  }

  const label = document.getElementById('phraseStrengthLabel');
  label.textContent = level.charAt(0).toUpperCase() + level.slice(1);
  label.className = 'level ' + labelCls;

  document.getElementById('phraseEntropyLabel').textContent = bits + ' bits';
}

// =====================================================
// MAIN GENERATE
// =====================================================

function generate() {
  const length = parseInt(document.getElementById('lengthSlider').value, 10);
  const charset = buildCharset();

  if (!charset) {
    document.getElementById('passwordDisplay').textContent = 'Enable at least one character type';
    document.getElementById('strengthMeter').style.display = 'none';
    return;
  }

  const password = generatePassword(length, charset);
  const display = document.getElementById('passwordDisplay');
  display.textContent = password;

  showStrength(password);

  // Visual flash
  const outputBox = document.getElementById('outputBox');
  outputBox.classList.add('generating');
  setTimeout(() => outputBox.classList.remove('generating'), 300);

  // Reset HIBP
  const hibpResult = document.getElementById('hibpResult');
  hibpResult.className = 'hibp-result';
  hibpResult.textContent = '';
}

// =====================================================
// COPY
// =====================================================

async function copyPassword() {
  const text = document.getElementById('passwordDisplay').textContent;
  if (!text || text === 'Click Generate') return;
  await copyToClipboard(text, document.getElementById('copyBtn'));
}

async function copyPassphrase() {
  const text = document.getElementById('passphraseDisplay').textContent;
  if (!text || text === 'Click Generate') return;
  await copyToClipboard(text, document.getElementById('copyPhraseBtn'));
}

async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    const orig = btn.textContent;
    btn.textContent = '✅';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove('copied');
    }, 1500);
  } catch (e) {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

// =====================================================
// BULK GENERATOR
// =====================================================

let bulkPasswords = [];

function generateBulk() {
  const count = parseInt(document.getElementById('bulkCount').value, 10);
  const length = parseInt(document.getElementById('bulkLength').value, 10);

  // Use current password options (upper/lower/numbers/symbols)
  const charset = buildCharset();
  if (!charset) return;

  bulkPasswords = Array.from({ length: count }, () => generatePassword(length, charset));

  const list = document.getElementById('bulkList');
  list.innerHTML = '';

  bulkPasswords.forEach((pw, i) => {
    const item = document.createElement('div');
    item.className = 'bulk-item';
    item.title = 'Click to copy';
    item.innerHTML = `
      <span class="bulk-num">${i + 1}.</span>
      <span class="bulk-pass">${escapeHtml(pw)}</span>
      <span class="bulk-copy-btn">📋</span>
    `;
    item.addEventListener('click', async () => {
      await navigator.clipboard.writeText(pw).catch(() => {});
      item.classList.add('copied-flash');
      setTimeout(() => item.classList.remove('copied-flash'), 800);
    });
    list.appendChild(item);
  });

  document.getElementById('copyAllBtn').style.display = 'flex';
  document.getElementById('downloadBtn').style.display = 'flex';
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function copyAllBulk() {
  if (bulkPasswords.length === 0) return;
  const text = bulkPasswords.join('\n');
  await navigator.clipboard.writeText(text).catch(() => {});
  const btn = document.getElementById('copyAllBtn');
  const orig = btn.innerHTML;
  btn.innerHTML = '✅ Copied!';
  setTimeout(() => { btn.innerHTML = orig; }, 1500);
}

function downloadBulk() {
  if (bulkPasswords.length === 0) return;
  const text = bulkPasswords.join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'passwords.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// =====================================================
// HAVEIBEENPWNED CHECK (k-anonymity API)
// =====================================================

async function checkHIBP() {
  const password = document.getElementById('passwordDisplay').textContent;
  const result = document.getElementById('hibpResult');
  const btn = document.getElementById('hibpBtn');

  if (!password || password === 'Click Generate') {
    result.className = 'hibp-result checking';
    result.innerHTML = '⚠️ Generate a password first';
    return;
  }

  result.className = 'hibp-result checking';
  result.innerHTML = '⏳ Checking...';
  btn.disabled = true;

  try {
    // SHA-1 of the password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    // Query HIBP with first 5 chars only (k-anonymity -- password never sent)
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' }
    });

    if (!response.ok) throw new Error('API error');

    const text = await response.text();
    const lines = text.split('\n');
    const match = lines.find(line => line.toUpperCase().startsWith(suffix));

    if (match) {
      const count = parseInt(match.split(':')[1].trim(), 10);
      result.className = 'hibp-result pwned';
      result.innerHTML = `🚨 Found in ${count.toLocaleString()} data breaches. Generate a new one.`;
    } else {
      result.className = 'hibp-result safe';
      result.innerHTML = '✅ Not found in any known breaches. Good to go.';
    }
  } catch (err) {
    result.className = 'hibp-result checking';
    result.innerHTML = '❌ Check failed — try again. (Note: your password was never sent.)';
  }

  btn.disabled = false;
}

// =====================================================
// TABS
// =====================================================

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  document.getElementById('tab-' + name).classList.add('active');
  document.getElementById('tab-' + name).setAttribute('aria-selected', 'true');
  document.getElementById('panel-' + name).classList.add('active');
}

// =====================================================
// SLIDERS
// =====================================================

function updateLength(val) {
  document.getElementById('lengthDisplay').textContent = val;
  generate();
}

function updateWordCount(val) {
  document.getElementById('wordCountDisplay').textContent = val;
  generatePassphrase();
}

// =====================================================
// THEME TOGGLE
// =====================================================

function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  setTheme(theme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
  document.getElementById('themeIcon').textContent = theme === 'light' ? '🌙' : '☀️';
  document.getElementById('themeLabel').textContent = theme === 'light' ? 'Dark' : 'Light';
  localStorage.setItem('theme', theme);
}

document.getElementById('themeToggle').addEventListener('click', () => {
  const current = localStorage.getItem('theme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// =====================================================
// KEYBOARD SHORTCUTS
// =====================================================

document.addEventListener('keydown', (e) => {
  // Ctrl+G or Cmd+G = Generate
  if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
    e.preventDefault();
    const active = document.querySelector('.tab.active');
    if (active && active.id === 'tab-passphrase') {
      generatePassphrase();
    } else {
      generate();
    }
  }
  // Ctrl+C when password is focused = copy
  if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement.classList.contains('password-text')) {
    copyPassword();
  }
});

// =====================================================
// INIT
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  generate();          // Auto-generate on load
  generatePassphrase(); // Pre-fill passphrase tab too
});
