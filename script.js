// === Vault Storage ===
let vault = []; // array of { account, passwordEncrypted }

// === Custom Encryption Mapping ===
// Lowercase a-z, Uppercase A-Z, numbers 0-9, plus Unicode character \u3164
const chars = [
  'a','b','c','d','e','f','g','h','i','j','k','l','m',
  'n','o','p','q','r','s','t','u','v','w','x','y','z',
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9',
  '\u3164'
];

function textToNumbers(text) {
  return text.split('').map(c => {
    const idx = chars.indexOf(c);
    return idx >= 0 ? idx + 1 : c.charCodeAt(0); // fallback: char code
  });
}

function numbersToText(nums) {
  return nums.map(n => {
    if (n >= 1 && n <= chars.length) return chars[n-1];
    return String.fromCharCode(n);
  }).join('');
}

function encrypt(message, key) {
  const mNums = textToNumbers(message);
  const kNums = textToNumbers(key);

  // Add corresponding numbers; repeat key if needed
  const result = mNums.map((n, i) => n + kNums[i % kNums.length]);
  return result;
}

function decrypt(encryptedNums, key) {
  const kNums = textToNumbers(key);
  const result = encryptedNums.map((n, i) => n - kNums[i % kNums.length]);
  return numbersToText(result);
}

// === Generate Random Password ===
function generatePassword(length = 12) {
  const charsAll = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += charsAll[Math.floor(Math.random() * charsAll.length)];
  }
  document.getElementById('password').value = pass;
}

// === Save Password ===
function savePassword() {
  const account = document.getElementById('account').value.trim();
  const password = document.getElementById('password').value.trim();
  const key = document.getElementById('key').value.trim();

  if (!account || !password || !key) {
    alert('Please fill in all fields and enter a key.');
    return;
  }

  const encrypted = encrypt(password, key);
  vault.push({ account, passwordEncrypted: encrypted });

  // Clear inputs
  document.getElementById('account').value = '';
  document.getElementById('password').value = '';

  loadVault();
}

// === Load Vault ===
function loadVault() {
  const vaultDiv = document.getElementById('vault');
  const key = document.getElementById('key').value.trim();
  vaultDiv.innerHTML = '';

  if (!key) {
    vaultDiv.innerHTML = '<p style="color:#777C6D;">Enter your key to view stored passwords.</p>';
    return;
  }

  if (vault.length === 0) {
    vaultDiv.innerHTML = '<p style="color:#777C6D;">Vault is empty.</p>';
    return;
  }

  vault.forEach((entry, index) => {
    let passwordDecrypted = '';
    try {
      passwordDecrypted = decrypt(entry.passwordEncrypted, key);
    } catch {
      passwordDecrypted = '*** Unable to decrypt ***';
    }

    const div = document.createElement('div');
    div.classList.add('vault-entry');
    div.innerHTML = `
      <strong>${entry.account}</strong>
      <span>${passwordDecrypted}</span>
      <button class="delete-btn" onclick="deleteVaultEntry(${index})">Delete</button>
    `;
    vaultDiv.appendChild(div);
  });
}

// === Delete Vault Entry ===
function deleteVaultEntry(index) {
  if (confirm('Are you sure you want to delete this entry?')) {
    vault.splice(index, 1);
    loadVault();
  }
}
