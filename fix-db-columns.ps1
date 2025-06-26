# Script para corrigir as colunas do banco de dados via Supabase
Write-Host "========================================" -ForegroundColor Green
Write-Host "Corrigindo estrutura do banco de dados" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "O projeto está usando Supabase!" -ForegroundColor Yellow
Write-Host "Para corrigir a estrutura do banco:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Acesse: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Vá para o projeto: vrxdffccfcckntayrowi" -ForegroundColor White
Write-Host "3. Clique em 'SQL Editor'" -ForegroundColor White
Write-Host "4. Cole e execute o seguinte SQL:" -ForegroundColor White
Write-Host ""

# Ler o conteúdo do arquivo SQL
$sqlContent = Get-Content "backend/database/fix_workout_student_id.sql" -Raw
Write-Host $sqlContent -ForegroundColor Gray

Write-Host ""
Write-Host "Ou execute via linha de comando se tiver psql configurado:" -ForegroundColor Cyan
Write-Host "psql -h db.vrxdffccfcckntayrowi.supabase.co -p 5432 -d postgres -U postgres -f backend/database/fix_workout_student_id.sql" -ForegroundColor White

Write-Host ""
Write-Host "Após executar o SQL, reinicie o backend!" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 