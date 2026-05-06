# ===================================================================
# Medora -> GitHub hsynacar branch'i hazirlama scripti (Windows / PowerShell)
# Kullanim:
#   1) PowerShell'i C:\Medora\Medora klasorunde ac
#   2) Eger script engelleniyorsa once: Set-ExecutionPolicy -Scope Process Bypass
#   3) Calistir: .\git-setup.ps1
# ===================================================================

$ErrorActionPreference = "Stop"

Write-Host "[1/7] Git klasoru kontrol ediliyor..." -ForegroundColor Cyan
if (Test-Path ".git") {
    Write-Host "  Mevcut .git silinip yeniden olusturulacak." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".git"
}

Write-Host "[2/7] git init..." -ForegroundColor Cyan
git init | Out-Null

Write-Host "[3/7] Kullanici bilgileri ayarlaniyor..." -ForegroundColor Cyan
git config user.email "hsyn20052018@gmail.com"
git config user.name  "hsynacar"

Write-Host "[4/7] Orphan branch (hsynacar) olusturuluyor..." -ForegroundColor Cyan
# Orphan = ana dalla hicbir gecmis paylasmaz, tamamen sifirdan baslar
git checkout --orphan hsynacar

Write-Host "[5/7] Dosyalar staging'e ekleniyor (.gitignore'daki dosyalar haric)..." -ForegroundColor Cyan
git add -A
Write-Host ""
git status --short
Write-Host ""

Write-Host "[6/7] Ilk commit..." -ForegroundColor Cyan
git commit -m "Initial: Medora dogrulama servisi (hasta OTP + klinik otomatik dogrulama)" | Out-Null

Write-Host "[7/7] Remote ekleniyor..." -ForegroundColor Cyan
# Eger remote zaten ekliyse hata vermesin diye once kaldir
git remote remove origin 2>$null
git remote add origin https://github.com/MedoraDev-BTU/Medora-Backend.git

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "Hazir! Simdi GitHub'a push at:" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "    git push -u origin hsynacar" -ForegroundColor White
Write-Host ""
Write-Host "Push sirasinda GitHub kullanici adi ve PERSONAL ACCESS TOKEN" -ForegroundColor Yellow
Write-Host "isteyecek (sifre degil!). Token nasil alinir:" -ForegroundColor Yellow
Write-Host "  https://github.com/settings/tokens -> Generate new token (classic)" -ForegroundColor Yellow
Write-Host "  Yetki olarak 'repo' kutusunu isaretle" -ForegroundColor Yellow
Write-Host ""
Write-Host "Veya GitHub CLI kuruluysa cok daha kolay:" -ForegroundColor Yellow
Write-Host "  gh auth login" -ForegroundColor White
Write-Host "  git push -u origin hsynacar" -ForegroundColor White
