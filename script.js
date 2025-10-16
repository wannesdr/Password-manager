// --- Custom Encryption Algorithm ---
// Alphabet: a-z + U+3164
const alphabet = [...'abcdefghijklmnopqrstuvwxyz', '\u3164'];
const size = alphabet.length;

function charToNum(c) {
  return alphabet.indexOf(c) + 1;
}

function numToChar(n) {
  return alphabet[n - 1];
}

function textToNumbers(text) {
  return [...text].map(c => charToNum(c)).filter(n => n > 0);
}

function numbersToText(nums) {
  return nums.map(n => numToChar(n)).join('');
}

function encrypt(message, key) {
  const msgNums = textToNumbers(message);
  const keyNums = textToNumbers(key);
  return numbersToText(msgNums.map((m, i) => {
    const k = keyNums[i % keyNums.length];
    return ((m + k - 1) % size) + 1;
  }));
}

function decrypt(cipher, key) {
  const cNums = textToNumbers(cipher);
  const kNums = textToNumbers(key);
  return numbersToText(cNums.map((c, i) => {
    const k = kNums[i % kNums.length];
    return ((c - k - 1 + size) % size) + 1;
  }));
}

// --- Vault Logic ---
function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let pass = '';
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById('password').value = pass;
}

function savePassword() {
  const key = document.getElementById('key').value;
  const account = document.getElementById('account').value.toLowerCase();
  const password = document.getElementById('password').value.toLowerCase();

  if (!key || !account || !password) {
    alert('Please fill in all fields!');
    return;
  }

  const encrypted = encrypt(password, key);
  const vault = JSON.parse(localStorage.getItem('vault') || '{}');
  vault[account] = encrypted;
  localStorage.setItem('vault', JSON.stringify(vault));

  alert('✅ Password saved securely!');
  document.getElementById('account').value = '';
  document.getElementById('password').value = '';
}

function loadVault() {
  const key = document.getElementById('key').value;
  const vaultDiv = document.getElementById('vault');
  vaultDiv.innerHTML = '';

  if (!key) {
    alert('Enter your key to decrypt!');
    return;
  }

  const vault = JSON.parse(localStorage.getItem('vault') || '{}');
  Object.keys(vault).forEach(acc => {
    let decrypted;
    try {
      decrypted = decrypt(vault[acc], key);
    } catch (e) {
      decrypted = '(invalid key)';
    }
    const div = document.createElement('div');
    div.className = 'vault-entry';
    div.innerHTML = `<strong>${acc}</strong>: ${decrypted}
      <button class="delete-btn" onclick="deleteEntry('${acc}')">Delete</button>`;
    vaultDiv.appendChild(div);
  });
}

function deleteEntry(account) {
  const vault = JSON.parse(localStorage.getItem('vault') || '{}');
  delete vault[account];
  localStorage.setItem('vault', JSON.stringify(vault));
  loadVault();
}
