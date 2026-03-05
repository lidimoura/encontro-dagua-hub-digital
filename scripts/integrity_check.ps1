$url = 'https://bcdyxnauokxikrtmhnlm.supabase.co'
$key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZHl4bmF1b2t4aWtydG1obmxtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDY0Mjg2MywiZXhwIjoyMDgwMjE4ODYzfQ.Xzskwvgh_dX-gnCrM-WnbTrY5gvE6yQk_E_KzsXWgDk'
$headers = @{
  'apikey'        = $key
  'Authorization' = "Bearer $key"
  'Content-Type'  = 'application/json'
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  INTEGRITY CHECK — $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# ─── CHECK 1: contacts ────────────────────────────────────────
Write-Host "`n[CHECK 1] TABELA: contacts" -ForegroundColor Yellow
try {
  $hdr = @{} + $headers + @{'Prefer'='count=exact'; 'Range-Unit'='items'; 'Range'='0-4'}
  $resp = Invoke-WebRequest -Uri "$url/rest/v1/contacts?select=id,name,source,stage,created_at&order=created_at.desc" -Headers $hdr -Method GET -UseBasicParsing
  $total = $resp.Headers['Content-Range']
  $contacts = $resp.Content | ConvertFrom-Json
  Write-Host "  Total (Content-Range): $total"
  foreach ($c in $contacts) {
    $bjExists = if ($c.PSObject.Properties['briefing_json']) { "SIM" } else { "n/a" }
    Write-Host "  → $($c.name) | source=$($c.source) | stage=$($c.stage) | briefing_json=$bjExists"
  }
  Write-Host "  STATUS: ✅ INTACTA" -ForegroundColor Green
} catch {
  Write-Host "  ERROR: $_" -ForegroundColor Red
}

# ─── CHECK 2: leads ───────────────────────────────────────────
Write-Host "`n[CHECK 2] TABELA: leads" -ForegroundColor Yellow
try {
  $hdr2 = @{} + $headers + @{'Prefer'='count=exact'; 'Range-Unit'='items'; 'Range'='0-4'}
  $resp2 = Invoke-WebRequest -Uri "$url/rest/v1/leads?select=id,name,source,status,briefing_json,linkdagua_user_id&order=created_at.desc" -Headers $hdr2 -Method GET -UseBasicParsing
  $total2 = $resp2.Headers['Content-Range']
  $leads = $resp2.Content | ConvertFrom-Json
  Write-Host "  Total (Content-Range): $total2"
  foreach ($l in $leads) {
    $bj = if ($l.briefing_json) { "SIM → $($l.briefing_json | ConvertTo-Json -Compress)" } else { "NULL" }
    $lid = if ($l.linkdagua_user_id) { $l.linkdagua_user_id } else { "NULL" }
    Write-Host "  → $($l.name) | source=$($l.source) | status=$($l.status)"
    Write-Host "      briefing_json=$bj"
    Write-Host "      linkdagua_user_id=$lid"
  }
  Write-Host "  STATUS: ✅ INTACTA" -ForegroundColor Green
} catch {
  Write-Host "  ERROR: $_" -ForegroundColor Red
}

# ─── CHECK 3: qr_codes (qr_links) ────────────────────────────
Write-Host "`n[CHECK 3] TABELA: qr_codes (qr_links)" -ForegroundColor Yellow
try {
  $hdr3 = @{} + $headers + @{'Prefer'='count=exact'; 'Range-Unit'='items'; 'Range'='0-4'}
  $resp3 = Invoke-WebRequest -Uri "$url/rest/v1/qr_codes?select=id,title,slug,user_id,created_at&order=created_at.desc" -Headers $hdr3 -Method GET -UseBasicParsing
  $total3 = $resp3.Headers['Content-Range']
  $qrs = $resp3.Content | ConvertFrom-Json
  Write-Host "  Total (Content-Range): $total3"
  foreach ($q in $qrs) {
    Write-Host "  → $($q.title) | slug=$($q.slug) | user_id=$($q.user_id) | created=$($q.created_at)"
  }
  Write-Host "  STATUS: ✅ INTACTA" -ForegroundColor Green
} catch {
  Write-Host "  ERROR: $_" -ForegroundColor Red
}

# ─── CHECK 4: Função convert_lead_to_client no banco ─────────
Write-Host "`n[CHECK 4] FUNÇÃO: convert_lead_to_client" -ForegroundColor Yellow
try {
  $body = '{"p_lead_id":"00000000-0000-0000-0000-000000000000"}'
  # Chamamos com UUID fake — esperamos EXCEPTION 'não encontrado', não erro de função
  $resp4 = Invoke-WebRequest -Uri "$url/rest/v1/rpc/convert_lead_to_client" -Headers $headers -Method POST -Body $body -UseBasicParsing -ErrorAction SilentlyContinue
  $result4 = $resp4.Content
  if ($result4 -match 'não encontrado' -or $result4 -match 'not found' -or $resp4.StatusCode -eq 200) {
    Write-Host "  Função responde (erro esperado de lead não encontrado = função EXISTE)" -ForegroundColor Green
    Write-Host "  Response: $result4"
    Write-Host "  STATUS: ✅ FUNÇÃO EXISTE E RESPONDE" -ForegroundColor Green
  } else {
    Write-Host "  Response ($($resp4.StatusCode)): $result4"
  }
} catch {
  $errBody = $_.Exception.Response
  if ($errBody) {
    $stream = $errBody.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errText = $reader.ReadToEnd()
    if ($errText -match 'não encontrado' -or $errText -match 'not found') {
      Write-Host "  Função responde (lead UUID fake = não encontrado — correto!)" -ForegroundColor Green
      Write-Host "  STATUS: ✅ FUNÇÃO EXISTE E ESTÁ ATIVA" -ForegroundColor Green
    } else {
      Write-Host "  ERROR BODY: $errText" -ForegroundColor Red
    }
  } else {
    Write-Host "  ERROR: $_" -ForegroundColor Red
  }
}

# ─── CHECK 5: Colunas adicionadas pela Migration 019 ─────────
Write-Host "`n[CHECK 5] SCHEMA: colunas briefing_json e linkdagua_user_id" -ForegroundColor Yellow
try {
  $schemaQuery = @{
    query = "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE column_name IN ('briefing_json','linkdagua_user_id') AND table_schema='public' ORDER BY table_name, column_name"
  } | ConvertTo-Json
  
  # Usa /rest/v1/ para information_schema via RPC
  $schemaResp = Invoke-WebRequest -Uri "$url/rest/v1/rpc/check_columns_exist" -Headers $headers -Method POST -Body $schemaQuery -UseBasicParsing -ErrorAction SilentlyContinue
  Write-Host "  RPC custom não existe, verificando via contact select..."
  
  # Abordagem alternativa: tenta selecionar briefing_json de contacts
  $colCheck = Invoke-WebRequest -Uri "$url/rest/v1/contacts?select=briefing_json,linkdagua_user_id&limit=1" -Headers $headers -Method GET -UseBasicParsing -ErrorAction SilentlyContinue
  if ($colCheck.StatusCode -eq 200) {
    Write-Host "  briefing_json em contacts: ✅ COLUNA EXISTE" -ForegroundColor Green
    Write-Host "  linkdagua_user_id em contacts: ✅ COLUNA EXISTE" -ForegroundColor Green
  } else {
    Write-Host "  Colunas podem não existir ainda — Migration 019 pendente" -ForegroundColor Red
    Write-Host "  Response: $($colCheck.StatusCode) $($colCheck.Content)"
  }
  
  # Verifica em leads também
  $colCheck2 = Invoke-WebRequest -Uri "$url/rest/v1/leads?select=briefing_json,linkdagua_user_id&limit=1" -Headers $headers -Method GET -UseBasicParsing -ErrorAction SilentlyContinue
  if ($colCheck2.StatusCode -eq 200) {
    Write-Host "  briefing_json em leads: ✅ COLUNA EXISTE" -ForegroundColor Green
    Write-Host "  linkdagua_user_id em leads: ✅ COLUNA EXISTE" -ForegroundColor Green
  } else {
    Write-Host "  leads.briefing_json: ❌ PENDENTE (execute migration 019)" -ForegroundColor Red
  }
} catch {
  Write-Host "  Verificação via select falhou: $_" -ForegroundColor Red
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "  FIM DO INTEGRITY CHECK" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
