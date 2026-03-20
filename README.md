# Telefon Numarası Doğrulama Servisi (Mikroservis Mimarisi)

Bu proje, kurgusal bir kasabada kullanılan **6 basamaklı telefon numaralarının** belirli matematiksel kurallara göre doğrulanmasını sağlayan, **mikroservis mimarisi** ile geliştirilmiş bir web uygulamasıdır.

Proje; **Backend API**, **MySQL Veritabanı** ve **Frontend Web Arayüzü** olmak üzere en az 3 container’dan oluşur ve **Docker / docker-compose** kullanılarak çalıştırılır.

---

## Telefon Numarası Kuralları

Bir telefon numarasının geçerli sayılabilmesi için:

1. Numara **6 basamaklı** ve **sadece rakamlardan** oluşmalıdır.
2. En az **bir adet 0’dan farklı rakam** içermelidir.
3. İlk üç basamağın toplamı, son üç basamağın toplamına eşit olmalıdır.

   * `(a1 + a2 + a3 = a4 + a5 + a6)`
4. Tek sıradaki basamakların toplamı, çift sıradaki basamakların toplamına eşit olmalıdır.

   * `(a1 + a3 + a5 = a2 + a4 + a6)`

Örnek geçerli numara:

```
054153
```

---

## Sistem Mimarisi

```
frontend   →  backend (API)   →  MySQL
   |              |                |
   |-------- Docker Network -------|
```

### Kullanılan Teknolojiler

* **Backend:** Node.js + Express
* **Veritabanı:** MySQL
* **Frontend:** HTML / CSS / JavaScript
* **Container:** Docker & Docker Compose
* **API Türü:** RESTful (JSON)

---

## Çalıştırma Talimatları

### Gereksinimler

* Docker
* Docker Compose
* (Opsiyonel) VS Code

---

### Projeyi Çalıştırma

Proje ana dizininde terminal açın ve aşağıdaki komutu çalıştırın:

```bash
docker-compose up --build
```

Bu komut:

* Backend API servisini
* MySQL veritabanını
* Frontend servisini

aynı Docker ağı üzerinde ayağa kaldırır.

---

### Projeyi Durdurma

İşiniz bittiğinde:

```bash
docker-compose down
```

---

## API Endpointleri

### 1. Telefon Numarası Doğrulama

**Endpoint:**

```
POST /api/phone/validate
```

**İstek (JSON):**

```json
{
  "number": "054153"
}
```

**Başarılı Yanıt:**

```json
{
  "number": "054153",
  "rules": {
    "hasNonZeroDigit": true,
    "sumFirstEqualsLast": true,
    "sumOddEqualsEven": true
  },
  "isValid": true
}
```

**Hatalı Format (400):**

```json
{
  "error": "phone must be a 6-digit string."
}
```

---

### 2. Kullanıcı Kaydı

**Endpoint:**

```
POST /api/registration
```

**İstek (JSON):**

```json
{
  "name": "Ali Veli",
  "email": "ali@example.com",
  "phone": "054153"
}
```

**Başarılı Yanıt (201):**

```json
{
  "status": "accepted",
  "message": "Telefon numarası geçerli, kayıt başarıyla oluşturuldu.",
  "data": {
    "id": 1,
    "name": "Ali Veli",
    "email": "ali@example.com",
    "phone": "054153",
    "createdAt": "2025-11-17T12:34:56"
  }
}
```

**Geçersiz Numara (422):**

```json
{
  "status": "denied",
  "message": "Geçersiz telefon numarası. Lütfen yeni bir numara deneyin.",
  "isValid": false
}
```

---

### 3. Kayıtları Listeleme

**Endpoint:**

```
GET /api/registrations
```

**Yanıt:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Ali Veli",
      "email": "ali@example.com",
      "phone": "054153",
      "createdAt": "2025-11-17T12:34:56"
    }
  ]
}
```

---

### 4. Geçerli Telefon Numarası Sayısı

**Endpoint:**

```
GET /api/phone/count
```

**Yanıt:**

```json
{
  "count": 6699
}
```

> Bu değer backend başlarken **algoritmik olarak hesaplanır** ve performans için cache/JSON dosyası üzerinden döndürülür.

---

## Notlar

* Telefon numarası doğrulaması tamamen backend tarafında yapılır.
* Geçerli olmayan numaralar **veritabanına kaydedilmez**.
* Telefon numarası alanı veritabanında **UNIQUE** olarak tanımlıdır.

---

## Geliştirici

Bu proje eğitim amaçlı olarak geliştirilmiştir.

---

