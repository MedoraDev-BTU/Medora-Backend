# hsynacar branch'ine push - Adim adim

## Yontem 1: Otomatik script (en kolay)
PowerShell'i `C:\Medora\Medora` klasorunde ac, sonra:

```powershell
# Eger script engelleniyorsa (sadece bu pencere icin)
Set-ExecutionPolicy -Scope Process Bypass

# Scripti calistir
.\git-setup.ps1

# Sonra push
git push -u origin hsynacar
```

## Yontem 2: Elle, satir satir
```powershell
cd C:\Medora\Medora

# 1) Eski bir .git varsa temizle
Remove-Item -Recurse -Force .git -ErrorAction Ignore

# 2) Init et
git init

# 3) Kim oldugunu yaz
git config user.email "hsyn20052018@gmail.com"
git config user.name  "hsynacar"

# 4) Orphan branch (kimseyle gecmis paylasmaz)
git checkout --orphan hsynacar

# 5) Tum dosyalari ekle (.gitignore zaten node_modules ve .env'i hariciyor)
git add -A
git status

# 6) Commit
git commit -m "Initial: Medora dogrulama servisi"

# 7) Remote
git remote add origin https://github.com/MedoraDev-BTU/Medora-Backend.git

# 8) Push
git push -u origin hsynacar
```

## "Orphan branch" ne demek
Normal bir branch ana daldan dallanir; senin branch'inde ana dalin tum kodu da bulunur. Orphan branch ise hicbir gecmis paylasmaz - ilk commit tamamen sifirdan baslar. Bu sayede senin `hsynacar` branch'inde **sadece senin kodun** olur, arkadaslarinin commitleri girmez.

## Push sirasinda kimlik dogrulama
GitHub artik sifre kabul etmiyor. Iki secenek var:

**A) Personal Access Token (kolay)**
1. https://github.com/settings/tokens adresine git
2. "Generate new token (classic)" tikla
3. Note: "Medora", expiration: 90 gun, scope: `repo` kutusunu isaretle
4. Token'i kopyala (tek seferlik gosterilir!)
5. `git push` dedikten sonra:
   - Username: GitHub kullanici adin
   - Password: kopyaladigin token'i yapistir

**B) GitHub CLI (daha temiz)**
```powershell
winget install --id GitHub.cli
gh auth login
git push -u origin hsynacar
```

## Push'tan sonra
GitHub'a girdiginde branch dropdown'unda `hsynacar` gorunecek. Pull Request acmadigin surece kimsenin branch'i bozma yetkisi olmaz.

Sonraki guncellemelerde:
```powershell
git add -A
git commit -m "Aciklayici mesaj"
git push
```

## Kontrol listesi (push'tan once)
- [ ] `.env` dosyasi commit'e dahil DEGIL (gitignore'da var)
- [ ] `node_modules/` dahil DEGIL
- [ ] `uploads/` dahil DEGIL
- [ ] Hassas bilgi (sifre, token) hicbir dosyada yok
- [ ] git status temiz, sadece istedigin dosyalar staged
