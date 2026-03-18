import fs from 'fs';
import path from 'path';

// Read .env file for keys
const envPath = path.resolve('.env');
const envFile = fs.readFileSync(envPath, 'utf-8');
const anonKeyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
const anonKey = anonKeyMatch ? anonKeyMatch[1].trim() : '';

const supabaseUrl = 'https://bcdyxnauokxikrtmhnlm.supabase.co';

fetch(`${supabaseUrl}/functions/v1/form-lp-lead`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`,
  },
  body: JSON.stringify({
    name: "Gamer pc Novo Teste",
    email: "gamerpcoliver2@teste.com",
    whatsapp: "11999999913",
    source: "amazo-sdr",
    services: ["Teste Edge via Node"],
    message: "Validando criação do deal para Gamer pc."
  })
})
  .then(r => r.json())
  .then(data => {
    console.log("Edge Function Response:", data);
  })
  .catch(err => {
    console.error("Fetch Error:", err);
  });
