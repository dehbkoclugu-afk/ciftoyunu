# PROJECT DUO — MASTER IMPLEMENTATION HANDOFF

**Belge türü:** Ürün, tasarım, yazılım, içerik, lokalizasyon, monetizasyon ve yayın planı  
**Belge tarihi:** 14 Ağustos 2026  
**Durum:** Uygulamayı geliştirecek ajana doğrudan verilebilir  
**Geçici kod adı:** `Project Duo`  
**Nihai marka:** Henüz seçilmedi. Kod içinde marka sabit yazılmayacak.  
**Ana hedef:** Debatium benzeri çalışan “soru kartı + yüz yüze sohbet + sert fakat şeffaf paywall” ürün döngüsünü, özgün marka ve çok daha güçlü çok-dilli içerik sistemiyle küresel pazara çıkarmak.

---

## İçindekiler

0. Ajan talimatları
1. Ürün tanımı
2. Kullanıcı problemi ve değer
3. Hedef kitle ve pazarlar
4. MVP/V1.1/V2 kapsamı
5. Başarı metrikleri
6. Marka
7. Tasarım sistemi
8. Navigasyon
9. Ekran şartnamesi
10. Teknik mimari
11. Oyun motoru
12. İçerik veri modeli
13. Soru bankası hedefi ve örnekler
14. Soru üretim/editörlük protokolü
15. Lokalizasyon
16. Monetizasyon
17. Analitik
18. Bildirimler
19. Gizlilik/policy
20. Erişilebilirlik
21. Performans
22. Test
23. CI/CD
24. PR sırası
25. ASO
26. Büyüme/kreatif
27. Release checklist
28. Definition of Done
29. Yapılmayacaklar
30. İlk çalışma günü
31. Kısa ürün özeti
32. Araştırma notları

---

## 0. BU BELGEYİ KULLANACAK AJANA KESİN TALİMATLAR

Bu belge bir fikir listesi değildir. Uygulama geliştirme sözleşmesi gibi uygulanmalıdır.

1. Kullanıcı küçük teknik kararlarla meşgul edilmemelidir.
2. İnsan müdahalesi gerektirmeyen işler için onay beklenmemelidir.
3. Akış: `incele → uygula → test et → typecheck → lint → içerik doğrulama → build → commit → push → PR → CI → merge`.
4. Kullanıcı açıkça başka bir repo söylemeden Dailyprayer, İhvan, Telve/Fal, Hikaye veya başka mevcut projelere yazılmayacaktır.
5. Yeni repo verilirse yalnız o repo kullanılacaktır. Repo yoksa kod üretimine başlamadan kullanıcıdan sadece repo bağlantısı istenir.
6. Force-push yapılmaz. Kullanıcı değişiklikleri ezilmez. Kirli worktree varsa alakasız değişikliklere dokunulmaz.
7. Placeholder ekran, sahte satın alma başarısı, sahte veri senkronizasyonu veya çalışmayan buton bırakılmaz.
8. Harici secret gerektiren yerde kod sınırı, mock ve doğrulama hazırlanır; secret değeri sohbette istenmez.
9. “Tamamlandı” denebilmesi için bu belgedeki Definition of Done karşılanmalıdır.
10. Uygulamanın marka adı, ikonları, soru metinleri, görselleri ve ekranları Debatium’dan kopyalanmayacaktır.
11. Debatium’dan alınacak şeyler: problem, ürün döngüsü, kategori mantığı, oyuncu kişiselleştirme, soru temposu, sürpriz kart fikri, paywall stratejisi ve reklam anlatım kalıbı.
12. Her soru ve her lokalizasyon özgün ürün verisi olarak saklanacak; içerik kaynağı ve editörlük durumu izlenebilir olacaktır.
13. Nihai metinler makine çevirisi olarak yayınlanmayacaktır. AI taslak üretebilir; yerel editör onayı olmadan `approved` durumuna geçemez.
14. Uygulama terapi, evlilik danışmanlığı veya ilişkiyi iyileştirme garantisi iddia etmeyecektir. Ürün bir konuşma ve eğlence oyunudur.

---

## 1. TEK CÜMLELİK ÜRÜN TANIMI

İki veya daha fazla kişinin aynı telefonu sırayla kullanarak eğlenceli, derin, tartışmalı veya yetişkinlere yönelik soru kartları üzerinden birbirini yeniden keşfettiği, hızlı başlayan, çevrimdışı çalışabilen, yerel kültüre göre uyarlanmış çok-dilli bir sohbet oyunudur.

---

## 2. ÜRÜNÜN NEDEN VAR OLDUĞU

### 2.1 Kullanıcı problemi

- Çiftler birlikte vakit geçirirken aynı konuşmaları tekrar ediyor.
- Yeni ilişkilerde hangi soruların sorulacağı bilinmiyor.
- Uzun ilişkilerde konuşmalar günlük lojistiğe sıkışıyor.
- Arkadaş grupları bir araya geldiğinde konuşmayı başlatacak malzeme arıyor.
- Fiziksel soru kartları pahalı, taşınması zor ve içerikleri kısa sürede tükeniyor.
- Mevcut uygulamaların çoğu kötü çevrilmiş, kültürden bağımsız, reklam dolu veya fazla karmaşık.

### 2.2 Verilen temel değer

- Uygulama açıldıktan sonra 30 saniye içinde ilk soru gösterilir.
- Kullanıcı hesap açmadan oynayabilir.
- Soru, oyuncuya adıyla hitap ederek katılımı artırır.
- Paketler kullanıcının ruh hâline ve ilişki evresine göre seçilir.
- Sorular rastgele bir liste gibi değil, iyi bir sohbet gecesi gibi tempolanır.
- Her dilde kelime kelime çeviri değil, kültürel yeniden yazım kullanılır.

### 2.3 Ürün vaadi

**“Telefonu bırakmadan telefondan uzaklaştıran oyun.”**  
Telefon yalnızca kart destesidir; asıl ürün insanların birbirine bakıp konuşmasıdır.

---

## 3. HEDEF KİTLE VE PAZARLAR

### 3.1 Birincil segmentler

1. **18–34 yaş çiftler**
   - Yeni sevgililer
   - Uzun süreli ilişkiler
   - Nişanlılar/yeni evliler
   - Uzak mesafe ilişkisi yaşayanlar
   - Evde date-night yapmak isteyenler

2. **18–34 yaş arkadaş grupları**
   - Ev partileri
   - Bar/kafe buluşmaları
   - Yolculuklar
   - Yeni tanışan gruplar

3. **İçerik üreticileri**
   - Çift hesapları
   - Sokak röportajı hesapları
   - “Partnerine bunu sor” videoları
   - Podcast ve canlı yayın formatları

### 3.2 İlk lokalizasyon dalgası

Teknik altyapı tüm dilleri destekleyecek; mağaza çıkışı şu sırayla yapılacaktır:

1. `en` — kanonik içerik ve küresel kontrol dili
2. `ar` — Modern Standart Arapça, RTL
3. `ja` — Japonca
4. `ko` — Korece
5. `zh-Hant` — Tayvan/Hong Kong için Geleneksel Çince

### 3.3 Sonraki dalgalar

- Dalga 2: `nl`, `sv`, `nb`, `da`, `fi`, `he`
- Dalga 3: `pl`, `tr`, `ro`, `cs`, `el`, `hu`
- Dalga 4: `id`, `th`, `vi`, `ms`, `hi`
- Savunma/genişleme dalgası: `fr`, `de`, `es`, `pt-BR`, `it`
- İlk aşamada ertelenecek: Rusya ödeme sorunları nedeniyle `ru`; Çin anakarası dağıtım/regülasyon nedeniyle `zh-Hans`.

### 3.4 Dil bazında ürün konumu

| Dil grubu | Birincil konum | Ana ödeme paketi | İçerik notu |
| --- | --- | --- | --- |
| Arapça | Evli/nişanlı çiftler için kaliteli sohbet gecesi | Aylık + yıllık | Spicy katalog ülkeye göre ayrılır |
| Japonca | Aynı ortamda kısa date-night oturumu | Yıllık + lifetime test | Daha dolaylı, nazik ve bağlama duyarlı dil |
| Korece | Cesur ve hızlı çift oyunu | Aylık + yıllık | Yerel çift uygulamalarından daha oyunlaştırılmış |
| Geleneksel Çince | Çift/arkadaş için premium kart destesi | Lifetime + yıllık test | Tayvan ve Hong Kong mağaza metni ayrı |
| Batı Avrupa | Yerel dilde premium date-night oyunu | Yıllık | İngilizce bilen kullanıcıya anadil avantajı satılır |
| Güneydoğu Asya | Uygun fiyatlı sosyal/çift oyunu | Düşük yıllık + lifetime | Haftalık pahalı abonelik kullanılmaz |

---

## 4. KAPSAM: MVP, V1.1, V2

## 4.1 MVP / Store V1 — yapılacaklar

- Aynı telefonda oynama
- Çift ve arkadaş modu
- Dil seçimi ve otomatik cihaz dili algılama
- Oyuncu isimleri
- 10/20/30 dakikalık oturum
- Soru paketi seçimi
- Yoğunluk/konfor seçimi
- Soru kartı oynanışı
- Pas geçme
- Favoriye alma
- Sürpriz/ara kartlar
- Görülen soruları tekrar etmeme
- Oturum özeti
- Ücretsiz başlangıç paketi
- Premium paketler
- RevenueCat satın alma/restore
- Offline çalışma
- Yerel bildirimle “günün sorusu” opt-in
- Analitik olayları
- Hata raporlama
- Erişilebilirlik
- Light/dark tema
- Arapça RTL
- Mağaza metinleri ve ekran görüntüleri

## 4.2 V1.1 — V1 stabil olduktan sonra

- Günün sorusu ekranı
- Kullanıcıya özel haftalık seri
- Paylaşılabilir soru kartı üretme
- Kullanıcı tarafından özel deste oluşturma
- Favorilerden özel oturum
- Seasonal remote deck güncellemeleri
- Basit içerik geri bildirimi: sevmedim/uygunsuz/tekrar
- Daha gelişmiş deney A/B altyapısı

## 4.3 V2 — MVP’ye karıştırılmayacak

- İki telefonla eşleşme
- Kullanıcı hesabı
- Davet kodu/deep link
- İki taraf ayrı cevaplayıp aynı anda açma
- Ortak geçmiş ve özel günlük
- Uzak mesafe modu
- Partner bildirimleri
- Bulut senkronizasyonu
- Kullanıcı üretimi herkese açık desteler
- Moderasyon paneli

V2 özellikleri MVP koduna sahte buton veya “yakında” ekranı olarak eklenmeyecektir.

---

## 5. BAŞARI METRİKLERİ

### 5.1 Kuzey yıldızı

**Haftalık tamamlanan kaliteli oturum sayısı.**  
Kaliteli oturum: en az 8 kart görüntülenmiş, en az 5 kart 6 saniyeden uzun ekranda kalmış ve kullanıcı uygulamadan hata nedeniyle çıkmamış oturum.

### 5.2 Aktivasyon

- Kurulumdan ilk soruya ulaşma: hedef `%70+`
- İlk soruya ulaşma süresi: medyan `<60 saniye`
- İlk oturumda en az 8 kart: hedef `%55+`
- İlk oturum tamamlama: hedef `%40+`

### 5.3 Retention

- D1: `%20+`
- D7: `%10+`
- D30: `%4+`
- İlk haftada ikinci oturum: `%15+`

Bu ürün her gün kullanılan yardımcı araç değildir; retention hedefleri date-night davranışına göre değerlendirilmelidir.

### 5.4 Monetizasyon

- Paywall görüntüleme → trial: dil/pazar bazında ölçülür
- Trial → paid
- D35 download → paid
- Refund rate
- İlk yenileme
- Yıllık paket payı
- Gelir/kurulum
- Dil bazında LTV/CAC

### 5.5 Kalite koruma metrikleri

- Crash-free session: `%99.7+`
- ANR-free session: `%99.5+`
- Soru raporlama oranı: `<%0.5`
- Aynı sorunun 30 gün içinde istemeden tekrarı: `<%1`
- Satın alma sonrası entitlement hatası: `0 kritik vaka`
- Mağaza puanı: `4.4+`

---

## 6. MARKA VE İSİMLENDİRME

### 6.1 Geçici kullanım

Kod adı `Project Duo` olacaktır. Kullanıcı-facing metinde nihai marka gelene kadar `APP_NAME` yapılandırma anahtarı kullanılır.

### 6.2 Nihai isim kriterleri

- 4–9 karakter tercihen
- Latin alfabesinde kolay yazılabilir
- Arapça/Japonca/Korece telaffuz edilebilir
- “therapy”, “marriage saver”, “sex” gibi dar veya riskli kelime içermez
- `.com` zorunlu değil; sosyal kullanıcı adı ve mağaza araması kontrol edilir
- App Store ve Google Play’de aynı kategoride yakın marka olmamalı
- WIPO/USPTO/EUIPO ve hedef pazarlarda temel marka taraması yapılır
- Marka seçilmeden ikon üstüne harf konmaz

### 6.3 Marka karakteri

- Samimi ama çocukça değil
- Cesur ama pornografik değil
- Premium ama klinik değil
- Oyuncu ama bağıran neon parti uygulaması değil
- Kültürel olarak nötr, içerikte yerel

### 6.4 Ton

Doğru:

- “Bu gece ne kadar derine inmek istersiniz?”
- “Pas geçmek tamamen serbest.”
- “İkiniz de cevaplayın.”
- “Hazırsanız kartı çevirin.”

Yanlış:

- “İlişkinizi 7 günde kurtarın.”
- “Partnerinizin gerçek yüzünü ortaya çıkarın.”
- “Bu soruyu cevaplamıyorsa kesin bir şey saklıyor.”
- Suçlayıcı veya manipülatif bildirimler

---

## 7. TASARIM YÖNÜ

### 7.1 Görsel fikir

**Editorial card game + premium date-night atmosphere.**  
Debatium’un kırmızı ekranı, ikonları veya kart düzeni kopyalanmayacaktır. Tasarım koyu erik tonu, sıcak krem zemin, mercan vurgu ve kategoriye özel illüstrasyonlardan oluşur.

### 7.2 Ana palet

| Token | Light | Dark | Kullanım |
| --- | --- | --- | --- |
| `canvas` | `#FFF9F4` | `#121015` | Ana zemin |
| `surface` | `#FFFFFF` | `#1D1922` | Kart/yüzey |
| `surfaceRaised` | `#FFFDFB` | `#28212E` | Modal/premium yüzey |
| `ink` | `#1C1720` | `#FFF8F2` | Ana metin |
| `inkMuted` | `#756C79` | `#B9AFBC` | İkincil metin |
| `primary` | `#7357E8` | `#9B86FF` | Ana CTA |
| `coral` | `#F25F70` | `#FF7685` | Flört/enerji |
| `gold` | `#E9A83B` | `#FFC45C` | Premium |
| `mint` | `#2FB89D` | `#54D8BC` | Güven/başarı |
| `danger` | `#C63D4F` | `#FF6A79` | Hata/uyarı |
| `outline` | `#E8DFE7` | `#3A3240` | Sınırlar |

Kurallar:

- Uzun ve kirli gradientler kullanılmaz.
- CTA üzerinde metin kontrastı WCAG AA altında kalmaz.
- Kategori renkleri anlamı destekler, metnin tek taşıyıcısı olmaz.
- Saf siyah/beyaz geniş yüzeyler yerine sıcak tonlar kullanılır.

### 7.3 Kategori renkleri

| Kategori | Renk |
| --- | --- |
| Warm-up | `#F3B65C` |
| Fun | `#55BCEB` |
| Deep | `#7357E8` |
| Memories | `#C879D6` |
| Future | `#2FB89D` |
| Conflict | `#E16A55` |
| Appreciation | `#F09AAB` |
| Spicy | `#D8425B` |
| Friends | `#4E8CD8` |
| Wildcards | `#786B82` |

### 7.4 Tipografi

- Latin/Kiril/Yunanca: `Manrope` veya lisansı doğrulanmış eşdeğer sans
- Arapça: `Noto Sans Arabic`
- Japonca: sistem `Hiragino Sans` / Android Noto fallback
- Korece: sistem `Apple SD Gothic Neo` / `Noto Sans KR`
- Geleneksel Çince: sistem PingFang / Noto fallback
- Soru metni gösterim fontu ayrı bir serif olmayacak; tüm scriptlerde eşit kalite sağlamak zor.

Boyut tokenları:

| Token | Boyut | Satır yüksekliği |
| --- | ---: | ---: |
| `display` | 36 | 42 |
| `h1` | 30 | 36 |
| `h2` | 24 | 30 |
| `h3` | 20 | 26 |
| `questionLarge` | 28 | 36 |
| `questionMedium` | 24 | 32 |
| `questionSmall` | 20 | 28 |
| `body` | 16 | 24 |
| `bodySmall` | 14 | 20 |
| `caption` | 12 | 16 |
| `button` | 16 semibold | 20 |

Soru kartı fontu karakter sayısına körlemesine bağlanmaz. Önce ölçüm yapılır; sığmıyorsa 28 → 24 → 20 kademeleri kullanılır. Son kademe de sığmıyorsa kart içi dikey scroll açılır. Metin asla kesilmez.

### 7.5 Spacing, radius ve dokunma

- Grid: 4 px taban, ana aralık 8 px
- Ekran yatay padding: küçük cihaz 16, normal 20, tablet 28
- Kart radius: 28
- Button radius: 16
- Chip radius: 999
- Minimum dokunma alanı: iOS 44×44, Android 48×48
- Ana CTA yüksekliği: 56
- Kart gölgesi hafif; dark modda gölge yerine outline/elevation kullanılır

### 7.6 Hareket ve haptics

- Kart giriş: 180–240 ms fade + 8 px translate
- Swipe threshold: ekran genişliğinin `%22`si veya 72 px’den büyük olan
- Kart geçişi: spring, overshoot düşük
- Favori: light impact
- Pas: selection haptic
- Oturum tamamlanması: success haptic
- Satın alma başarısı: success haptic
- Reduce Motion açıkken parallax, rotation ve spring kapatılır; basit fade kullanılır

### 7.7 Görsel/illustration sistemi

Her premium paketin özgün kapak sanatı olacaktır.

Asset kuralları:

- Her paket için light ve dark varyant
- Kaynak boyut en az 1440×1920 WebP/PNG
- Metin görsele gömülmez
- Gerçek marka/logolar görünmez
- Tanınabilir gerçek insan yüzü kullanılmaz
- Açık cinsel görsel kullanılmaz
- Soyut semboller, nesneler, ışık, masa, kart, şehir, yol, gökyüzü kullanılabilir
- Aynı görsel birden fazla pakette kullanılmaz

Registry örneği:

```ts
type PackArtwork = {
  packId: string;
  light: ImageSource;
  dark: ImageSource;
  focalX: number; // 0..1
  focalY: number; // 0..1
  lightVeil: number;
  darkVeil: number;
};
```

Render kuralları:

- Görsel `absoluteFill`
- `resizeMode="cover"`
- Odak noktası metadata ile korunur
- Light modda tek renk beyaz veil, dark modda tek renk koyu veil
- Görseli kartın yalnız sağına sıkıştırma, `contain`, split-card veya opak duvar kullanma
- 360×640, 390×844, 430×932 ve tablet ölçülerinde crop testi yapılır

### 7.8 İkon

- İki iç içe geçen konuşma balonu veya iki kart şekli
- Kalp tek başına kullanılmaz; kategori klişesine düşer
- Küçük boyutta okunur tek siluet
- App icon içinde metin yok
- Light/dark monochrome marka işareti ayrıca hazırlanır
- Android adaptive foreground/background ve monochrome icon sağlanır

### 7.9 Zorunlu component envanteri

Primitive’ler tek tek ekran içinde yeniden yazılmayacaktır.

| Component | Zorunlu durumlar |
| --- | --- |
| `AppText` | bütün typography tokenları, RTL, scaling |
| `AppButton` | primary/secondary/ghost/destructive, loading, disabled |
| `IconButton` | 44/48 px hitSlop, tooltip/accessibility label |
| `AppScreen` | safe area, scroll, keyboard avoidance |
| `AppSheet` | focus trap, dismiss, keyboard |
| `Chip` | selected/unselected/disabled |
| `PackCard` | free/premium/new/seasonal/progress |
| `PackArtwork` | light/dark, focal cover, veil |
| `QuestionCard` | short/long/scroll/RTL/special |
| `SessionProgress` | determinate/estimated/accessibility text |
| `PlayerBadge` | name truncation, emoji fallback |
| `PlanSelector` | monthly/annual/trial/best value |
| `InlineNotice` | info/warning/error/success |
| `StateView` | loading/empty/offline/error |
| `SettingRow` | toggle/navigation/value/disabled |

Component Storybook veya küçük development gallery ekranı hazırlanır. Gallery production navigation’a girmez ama screenshot regression ve tema QA için CI’da kullanılabilir.

### 7.10 Asset teslim sayısı

V1 için minimum:

- 17 pack × light/dark = 34 artwork
- 1 app icon master
- Android adaptive foreground/background/monochrome
- 1 splash mark light/dark
- 8 küçük special-card sembolü
- Store screenshot’ları her açık locale için 6–8 adet
- App preview/social paylaşım için 9:16 ve 1:1 şablon

Asset isimleri stable ID kullanır; yerelleştirilmiş metin görsele gömülmez.

---

## 8. BİLGİ MİMARİSİ VE NAVİGASYON

Bottom tab kullanılmayacaktır. Oyun, stack tabanlı kısa bir akıştır.

```text
Launch
├── First run
│   ├── Language
│   ├── Welcome
│   ├── Age & comfort
│   └── Notification opt-in (deferred)
└── Home
    ├── Choose mode
    ├── Player setup
    ├── Pack library
    ├── Session setup
    ├── Gameplay
    │   ├── Pause sheet
    │   ├── Pack paywall
    │   └── Report question
    ├── Recap
    ├── Favorites
    ├── Daily question
    ├── Premium
    └── Settings
```

Expo Router rota önerisi:

```text
app/
  _layout.tsx
  index.tsx
  onboarding/
    language.tsx
    welcome.tsx
    comfort.tsx
  home.tsx
  mode.tsx
  players.tsx
  packs.tsx
  session-setup.tsx
  play.tsx
  recap.tsx
  favorites.tsx
  daily.tsx
  premium.tsx
  settings/
    index.tsx
    language.tsx
    appearance.tsx
    notifications.tsx
    privacy.tsx
    legal.tsx
  modal/
    pause.tsx
    report-question.tsx
    purchase-result.tsx
```

Deep link şeması:

```text
projectduo://home
projectduo://pack/:packId
projectduo://daily
projectduo://premium
```

Nihai marka seçildiğinde scheme migration planı yapılır; universal link sonraki aşamada eklenir.

---

## 9. EKRAN EKRAN UX ŞARTNAMESİ

## 9.1 Splash / boot

Amaç: hydration ve satın alma durumunu güvenli yüklemek.

- Native splash, marka işareti ve canvas rengi
- Local settings ve içerik manifesti yüklenir
- RevenueCat konfigürasyonu timeout ile başlatılır
- Ağ yoksa uygulama açılmaya devam eder
- 4 saniyeden uzun bloklama yok
- Hata varsa uygulama offline free state ile açılır ve sessiz log gönderir
- Router, store hydration tamamlanmadan yanlış ekrana atlamaz

Kabul:

- İlk kurulum onboarding’e
- Sonraki açılış home’a
- Bozuk satın alma SDK’sı açılışı engellemez

## 9.2 Dil seçimi

- Cihaz desteklenen dildeyse önerilir
- Arama alanı
- Her dil kendi adıyla yazılır: العربية, 日本語, 한국어, 繁體中文
- Dil değişimi uygulamayı yeniden başlatmadan uygulanır
- RTL değişimi güvenli re-render ile yapılır; gerekirse kontrollü restart açıklaması gösterilir
- Eksik soru paketi İngilizce karışık gösterilmez; o paketin yerel sürümü yoksa gizlenir

## 9.3 Welcome

İçerik:

- Tek güçlü başlık
- Ürünü gösteren canlı kart mockup’ı
- “Hesap gerekmez” ve “aynı telefonda oynayın” mikro faydaları
- Ana CTA: “Başlayalım”
- İkincil: “Nasıl çalışır?” kısa sheet

Onboarding en fazla üç ekran olacaktır. Kullanıcıdan ilişki durumu gibi uzun anket alınmayacaktır.

## 9.4 Age & comfort

- Doğum tarihi toplanmaz; `18 yaş ve üzeriyim` onayı yeterli
- Spicy içerik varsayılan kapalı
- Konfor seviyesi:
  - Light
  - Open
  - Spicy 18+
- “Pas her zaman serbest” açıklaması
- Seçim sonradan settings’ten değiştirilebilir
- 18+ onayı yoksa explicit paketler tamamen filtrelenir

## 9.5 Home

Üst bölüm:

- Yerelleştirilmiş selamlama; kullanıcı adı gerekmez
- Settings ikonu
- Premium durumunda küçük premium rozeti

Ana eylemler:

1. “Birlikte oynayın” büyük hero
2. Son oynanan pakete devam
3. Günün sorusu
4. Popüler paketler yatay liste
5. Favoriler

Home üzerinde aynı anda birden fazla dev CTA olmayacak. Ana akış her zaman “oyna”.

## 9.6 Mode selection

İki büyük seçenek:

- Couple
- Friends

Kartlar görsel, kısa açıklama ve oyuncu sayısı içerir.

Couple:

- 2 oyuncu
- Romantik/deep/spicy katalog

Friends:

- 2–8 oyuncu
- Fun/hot takes/wildcards katalog
- Spicy ancak tüm kullanıcılar 18+ onaylıysa

Son seçilen mod varsayılan olarak vurgulanır ama otomatik geçilmez.

## 9.7 Player setup

- Couple: iki isim alanı
- Friends: minimum 2, maksimum 8
- Boş isimler `Player 1` gibi yerelleştirilmiş fallback alabilir
- Aynı isim için “ayırt etmek ister misiniz?” uyarısı; bloklama yok
- Emoji avatar isteğe bağlı, fotoğraf izni yok
- Son oyuncu listesi sadece cihazda saklanabilir; “bu isimleri hatırla” toggle
- Klavye CTA’yı kapatmaz

## 9.8 Pack library

Filtreler:

- All
- Free
- Fun
- Deep
- Relationship
- Spicy
- Friends

Pack kartı:

- Özgün kapak görseli
- Yerel başlık
- Tek satır vaat
- Yaklaşık süre
- Yoğunluk göstergesi
- Free/Premium rozeti
- Yeni/seasonal rozeti
- Tamamlanma/görülme yüzdesi

Premium karta basıldığında önce pack detail bottom sheet, sonra paywall gösterilir. Kullanıcı ne satın aldığını görmeden duvara çarpmaz.

## 9.9 Pack detail

- Paketin amacı
- Kimler için
- Yoğunluk
- Yaklaşık soru sayısı
- 2 örnek ücretsiz kart; premium soru metni sızdırılmadan gerçek kalite gösterilir
- İçerik uyarıları
- “Bu deste ile oyna” veya “Premium’u aç”

## 9.10 Session setup

Seçenekler:

- Süre: Quick 10 / Standard 20 / Long 30 dakika
- Yoğunluk: Light / Mixed / Deep
- Spicy açık/kapalı; yaş ve locale policy izin veriyorsa
- İstenmeyen konular: para, aile, geçmiş ilişkiler, cinsellik, çocuk, din/politika
- Oturumdaki soru sayısı otomatik tahmin edilir

Varsayılanlar çok karar yorgunluğu yaratmamalı. “Standard / Mixed” seçili gelir.

## 9.11 Gameplay

Ekran yapısı:

- Üstte progress; kesin soru sayısı veya ince bar
- Sol üst kapat/pause
- Sağ üst pack adı veya favoriler
- Merkezde büyük kart
- Kartta küçük kategori etiketi
- Oyuncuya hitap: “Maya, önce sen cevapla”
- Büyük soru metni
- Gerekirse küçük follow-up
- Alt eylemler: Pas, Favori, Sonraki
- Swipe da çalışır; butonlar daima alternatif olarak bulunur

Davranış:

- Kart gösterildiğinde kronometre başlar
- 1 saniye altında geçilirse `rapid_skip`
- 6 saniye üstünde kalırsa `engaged_card`
- Favoriye basmak kartı otomatik geçmez
- Pas hiçbir zaman suçlayıcı animasyon üretmez
- Ekran kapanıp açılırsa oturum kaldığı yerden sürer
- Uygulama kill edilirse son oturum 24 saat korunur

Uzun soru:

- Dinamik font tier
- Son tier yetmezse scroll
- Metin baştan ve ortalanmış görünür; overflow varsa üstten başlar
- RTL kart yönü ve alignment doğru uygulanır

## 9.12 Special cards

Standart sorular arasına `%10–15` oranında girer.

Türler:

- Both Answer
- Predict Your Partner
- Rapid Fire
- Rank Three
- Gratitude
- Tell a Story
- Switch Starter
- Take a Breath
- Wildcard

Special kartlar soru paketi temasını bozmamalı ve aynı oturumda aynı tür üç kez tekrar etmemelidir.

## 9.13 Pause sheet

- Devam et
- Başka soru seç
- Konu filtresini değiştir
- Oturumu bitir
- Uygunsuz soru bildir

Oturumu bitir seçimi yanlışlıkla veri kaybetmez; confirm gerekir. En az 5 kart oynandıysa recap sunulur.

## 9.14 Recap

- Kaç kart görüldü
- Kaç favori eklendi
- Oturum süresi
- “Bu geceden saklamak istediğiniz soru” seçimi
- Aynı paketle devam
- Başka paket seç
- Premium olmayan kullanıcı için tek bağlamsal upsell
- Share card; V1’de yalnız yerel render, kişisel cevap içermez

Puan, ilişki uyumu veya bilimsel skor üretilmez.

## 9.15 Favorites

- Yerel cihazda saklanır
- Pack ve kategori filtresi
- Tek kart olarak açma
- Favorilerden özel oturum başlatma V1.1
- Locale değişince eski dil favorileri tutulur; yalnız ilgili dilde gösterilir

## 9.16 Daily question

- Bir ücretsiz soru
- Cihaz tarihine ve locale’e göre deterministik
- Spicy olamaz
- Cevap uygulamaya yazdırılmaz; çift yüz yüze konuşur
- “Bu akşam hatırlat” yerel bildirim
- Streak baskısı veya suçlayıcı dil yok

## 9.17 Paywall

Detayları monetizasyon bölümünde. UI şartları:

- Tek ekran
- Kullanıcıya açılacak paketler net
- Yıllık ve aylık plan
- Trial varsa bitiş sonrası ücret açık
- Restore
- Terms ve Privacy
- Kapatma butonu görünür; deneyde geciktirilmez
- Satın alma loading/success/error durumları ayrı
- Ağ yok, offering empty ve misconfigured durumları ayrı
- Fiyatlar hard-code edilmez; RevenueCat package’dan gelir

## 9.18 Settings

- Language
- Appearance: system/light/dark
- Sound/haptics
- Comfort & mature content
- Notifications
- Purchases/restore
- Privacy
- Terms
- Content licenses/credits
- Delete local data
- App version/build
- Support email

Hesap olmadığı için “hesabı sil” gösterilmez; “yerel verileri temizle” açıklanır.

---
## 10. TEKNİK MİMARİ

## 10.1 Teknoloji kararı

Başlangıç önerisi:

- Expo + React Native
- Expo Router
- TypeScript `strict`
- Zustand
- AsyncStorage veya MMKV; karar tek adapter arkasında tutulur
- React Native Reanimated
- React Native Gesture Handler
- Expo Haptics
- Expo Localization
- Expo Notifications
- Expo Secure Store yalnız satın alma/anon kimlik gibi hassas küçük değerler için
- RevenueCat `react-native-purchases`
- i18next + react-i18next
- Zod
- Sentry
- PostHog veya eşdeğer ürün analitiği; adapter arkasında

Sürüm kuralı:

- Implementasyon başladığı gün Expo’nun kararlı sürümü seçilir.
- `package.json` ve lockfile pinlenir.
- Beta/RC paket kullanılmaz.
- Paket yükseltmesi özellik PR’larıyla karıştırılmaz.
- Expo Doctor temiz olmadan release alınmaz.

## 10.2 Mimari ilkeler

1. Offline-first.
2. Hesapsız kullanılabilir.
3. İçerik, UI kodundan ayrıdır.
4. Satın alma sağlayıcısı adapter arkasındadır.
5. Analitik sağlayıcısı adapter arkasındadır.
6. Her soru stable ID taşır.
7. Dil değişimi veri kaybetmez.
8. Partial content bundle kullanıcıya açılmaz.
9. Remote content bozulursa gömülü bundle’a geri dönülür.
10. Feature flag kapalıyken yarım özellik görünmez.

## 10.3 Önerilen klasör yapısı

```text
app/                          # Expo Router ekranları
src/
  assets/
    artwork/
    icons/
    fonts/
  components/
    primitives/              # Button, Text, Card, Sheet, Chip
    feedback/                # Empty, Error, Loading
    artwork/                 # PackArtwork, veils, focal cover
  design/
    colors.ts
    spacing.ts
    typography.ts
    radius.ts
    motion.ts
    themes.ts
  features/
    onboarding/
    home/
    modes/
    players/
    packs/
    session/
    favorites/
    daily/
    paywall/
    settings/
  content/
    schema/
    manifests/
    locales/
      en/
      ar/
      ja/
      ko/
      zh-Hant/
    loader.ts
    validator.ts
    selector.ts
  i18n/
    index.ts
    ui/
    localeCatalog.ts
  services/
    analytics/
    experiments/
    purchases/
    notifications/
    crash/
    contentUpdates/
  state/
    appStore.ts
    settingsStore.ts
    sessionStore.ts
    contentStore.ts
    purchaseStore.ts
  storage/
    keys.ts
    migrations.ts
    adapter.ts
  utils/
  types/
scripts/
  validate-content.ts
  validate-i18n.ts
  detect-duplicates.ts
  generate-content-report.ts
  verify-native-config.ts
  export-store-copy.ts
content-source/              # editörlerin çalıştığı kaynak; runtime değil
  canonical/
  localization/
  reports/
docs/
  product/
  content/
  release/
  privacy/
```

## 10.4 State sınırları

### `settingsStore`

```ts
type SettingsState = {
  locale: SupportedLocale;
  theme: 'system' | 'light' | 'dark';
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  matureContentEnabled: boolean;
  ageConfirmed18: boolean;
  excludedTopics: TopicTag[];
  notificationsEnabled: boolean;
  dailyReminderTime?: string;
  rememberPlayers: boolean;
};
```

### `sessionStore`

```ts
type GameSession = {
  id: string;
  locale: SupportedLocale;
  mode: 'couple' | 'friends';
  packIds: string[];
  playerNames: string[];
  durationPreset: 10 | 20 | 30;
  intensity: 'light' | 'mixed' | 'deep';
  allowMature: boolean;
  excludedTopics: TopicTag[];
  seed: string;
  questionIds: string[];
  currentIndex: number;
  favoriteIds: string[];
  skippedIds: string[];
  startedAt: string;
  lastActiveAt: string;
  completedAt?: string;
};
```

### `purchaseStore`

- `status`: unconfigured/loading/ready/offline/error
- `entitlement`: unknown/free/premium
- `offerings`
- `lastSyncedAt`
- `purchaseInFlight`
- `restoreInFlight`
- Kullanıcıya premium özelliği yalnız doğrulanmış entitlement ile açılır
- Preview/dev modunda açıkça `mock` adapter kullanılabilir; production’da mock yasaktır

## 10.5 Storage anahtarları ve migration

Tüm kalıcı anahtarlar namespace taşır:

```text
duo:v1:settings
duo:v1:players
duo:v1:favorites
duo:v1:seen-questions:<locale>
duo:v1:last-session
duo:v1:completed-sessions
duo:v1:content-manifest
duo:v1:anonymous-id
```

Kurallar:

- Store shape değişirse migration numarası artar.
- Migration başarısızsa bütün veriyi körlemesine silme; hatalı bölümü quarantine et.
- Favorites stable question ID ile tutulur.
- Seen history locale bazlıdır.
- Completed session özetleri maksimum son 50 oturum veya 180 gün saklanır.

## 10.6 İçerik dağıtımı

V1’de tüm onaylı Wave-1 içerik uygulamaya gömülür. Text boyutu düşük olduğu için güvenilirlik, küçük bundle kazancından önemlidir.

Opsiyonel remote update:

1. Uygulama gömülü `manifest.json` ile açılır.
2. Arka planda CDN manifesti kontrol edilir.
3. Manifest schema, minimum app version ve checksum doğrulanır.
4. İlgili locale bundle indirilir.
5. Bundle Zod ile tam doğrulanır.
6. Soru sayısı/parite/güvenlik alanları geçmezse reddedilir.
7. Başarılı bundle atomik şekilde aktif edilir.
8. Son iyi bundle saklanır.

Network hatası, uygulama açılışını veya oyunu engellemez.

Manifest örneği:

```json
{
  "schemaVersion": 1,
  "contentVersion": "2026.08.1",
  "minimumAppVersion": "1.0.0",
  "locales": {
    "ar": {
      "url": "...",
      "sha256": "...",
      "questionCount": 1150,
      "approvedAt": "2026-08-01T00:00:00Z"
    }
  }
}
```

## 10.7 Feature flags ve deneyler

Feature flag’ler typed registry’den gelir:

```ts
type ExperimentKey =
  | 'paywall.freeCards60vs120'
  | 'paywall.trial3vs7'
  | 'paywall.annualFirst'
  | 'onboarding.showSampleCard'
  | 'home.dailyQuestion'
  | 'session.specialCardRate';
```

- Kullanıcı deney bucket’ına anonymous ID ile deterministik girer.
- Bucket oturumlar arasında değişmez.
- Deney sonucu event property olarak her ilgili event’e eklenir.
- Remote config yoksa kontrol varyantı kullanılır.
- Satın alma fiyatı UI ile store ürünü arasında tutarsızlaştırılamaz.

---

## 11. OYUN MOTORU

## 11.1 Soru seçiminin hedefi

Rastgele shuffle yeterli değildir. İyi oturum şu eğriyi izler:

1. Güvenli başlangıç
2. Eğlence ve ritim
3. Merak/keşif
4. Seçilen yoğunluğa göre derinlik
5. Pozitif veya düşündürücü kapanış

## 11.2 Soru seçme pipeline’ı

```text
locale bundle
→ mode filtresi
→ pack filtresi
→ entitlement filtresi
→ age/maturity filtresi
→ excluded topic filtresi
→ locale/country policy filtresi
→ seen-history filtresi
→ intensity dağılımı
→ special-card yerleştirme
→ player assignment
→ deterministic seeded shuffle
```

## 11.3 Oturum uzunluğu

Varsayılan soru sayıları:

- 10 dakika: 10 standart + 1 special
- 20 dakika: 18 standart + 2–3 special
- 30 dakika: 26 standart + 3–4 special

Kullanıcı hızlı ilerlerse oturum sonunda “5 kart daha” sunulabilir. Progress bar süre tahmini verir; kullanıcıyı kesin sona zorlamaz.

## 11.4 Yoğunluk dağılımları

| Preset | Light | Medium | Deep | Mature mümkün |
| --- | ---: | ---: | ---: | --- |
| Light | 70% | 30% | 0% | Hayır |
| Mixed | 35% | 45% | 20% | Kullanıcı seçerse en fazla 15% |
| Deep | 15% | 40% | 45% | Kullanıcı seçerse en fazla 20% |

İlk iki kart intensity 1–2, son kart intensity 1–3 aralığında olmalıdır. Oturum en ağır soruyla açılmaz veya bitmez.

## 11.5 Tekrar önleme

- Son 180 günde görülen soru önce elenir.
- Katalog yetersizse en eski görülen sorular sırayla geri açılır.
- Aynı `intentKey`e bağlı varyantlar aynı 30 günlük pencerede gösterilmez.
- Aynı kategori arka arkaya en fazla iki kart.
- Aynı starter oyuncu arka arkaya en fazla iki kart.
- Aynı special type aynı oturumda en fazla iki kez.

## 11.6 Oyuncu ataması

- Couple modunda starter A/B dengeli alternasyon
- `both` kartlarda isim gösterilmez veya ikisi gösterilir
- Friends modunda round-robin + seeded random
- Hiçbir oyuncu üç kart boyunca seçilmeden kalamaz
- Pronoun yerine kullanıcı adı tercih edilir; dilde cinsiyet varsayımı yapılmaz

## 11.7 Session resume

- Her kart değişiminden sonra index ve zaman yazılır
- 24 saatten eski unfinished session “devam etmek ister misiniz?” ile sunulur
- Content bundle güncellense bile aktif session kendi question snapshot’ını korur
- Soru kaldırılmış/retired ise resume sırasında güvenli şekilde atlanır ve loglanır

## 11.8 Pseudocode

```ts
function buildSession(input: SessionInput): QuestionInstance[] {
  const pool = getLocaleQuestions(input.locale)
    .filter(q => q.modes.includes(input.mode))
    .filter(q => input.packIds.some(id => q.packIds.includes(id)))
    .filter(q => isEntitled(q, input.entitlement))
    .filter(q => isAllowedByAge(q, input))
    .filter(q => !q.topicTags.some(tag => input.excludedTopics.includes(tag)))
    .filter(q => isAllowedInCountry(q, input.country));

  const fresh = excludeRecentIntentFamilies(pool, input.seenHistory);
  const staged = allocateByIntensity(fresh, input.intensity, input.targetCount);
  const ordered = arrangeConversationArc(staged, input.seed);
  const withSpecials = insertSpecialCards(ordered, input.specialRate, input.seed);
  return assignPlayers(withSpecials, input.players, input.seed);
}
```

---

## 12. SORU VE İÇERİK VERİ MODELİ

## 12.1 Kanonik soru intent’i

Kullanıcıya gösterilen her yerel metnin altında dil bağımsız bir intent bulunur.

```ts
type QuestionIntent = {
  id: string;                    // qi_values_0012
  intentKey: string;             // values.loyalty.definition
  mode: ('couple' | 'friends')[];
  packIds: string[];
  topicTags: TopicTag[];
  relationshipStages: RelationshipStage[];
  intensity: 1 | 2 | 3 | 4 | 5;
  maturity: 'general' | 'suggestive' | 'explicit';
  interactionType:
    | 'open'
    | 'choice'
    | 'rank'
    | 'predict'
    | 'memory'
    | 'scenario'
    | 'rapid'
    | 'both';
  starter: 'single' | 'both' | 'random';
  safetyTags: SafetyTag[];
  regionAllow?: string[];
  regionBlock?: string[];
  sourceClass: 'original' | 'common-concept' | 'research-inspired';
  editorialNotes?: string;
  status: 'draft' | 'review' | 'approved' | 'retired';
  version: number;
};
```

## 12.2 Yerel soru metni

```ts
type LocalizedQuestion = {
  questionId: string;
  locale: SupportedLocale;
  text: string;
  starterText?: string;
  followUp?: string;
  shortShareText?: string;
  culturalVariant?: string;
  translatorId: string;
  nativeReviewerId?: string;
  safetyReviewerId?: string;
  status:
    | 'draft'
    | 'adapted'
    | 'native_review'
    | 'safety_review'
    | 'approved'
    | 'rejected'
    | 'retired';
  updatedAt: string;
};
```

## 12.3 Pack modeli

```ts
type QuestionPack = {
  id: string;
  mode: 'couple' | 'friends' | 'both';
  category: PackCategory;
  premium: boolean;
  seasonal: boolean;
  requiredAge: 13 | 16 | 18;
  minimumQuestions: number;
  intensityRange: [1 | 2 | 3 | 4 | 5, 1 | 2 | 3 | 4 | 5];
  allowedLocales: SupportedLocale[];
  artworkId: string;
  sortOrder: number;
  status: 'draft' | 'active' | 'hidden' | 'retired';
};
```

Pack başlığı/açıklaması UI locale dosyasında değil, content bundle’ın pack localization bölümünde tutulur.

## 12.4 Topic tag sözlüğü

Minimum sözlük:

```text
daily-life
humor
habits
personality
memories
childhood
family
friends
money
career
home
values
trust
jealousy
privacy
conflict
repair
future
marriage
children
long-distance
social-media
ex-partners
religion
politics
body
affection
sexuality
fantasy
consent
alcohol
```

Topic filtreleri bu controlled vocabulary dışında string kabul etmez.

---

## 13. LAUNCH SORU BANKASI HEDEFİ

## 13.1 Sayısal hedef

Her Wave-1 locale için tam yayın eşiği:

- Couple standard: 800 soru
- Couple mature/optional: 180 soru
- Friends: 250 soru
- Special cards: 80 kart
- Toplam: yaklaşık 1.310 içerik öğesi/locale

İlk internal alpha eşiği:

- İngilizce 400
- Arapça 250
- Japonca 200
- Korece 200
- Geleneksel Çince 200

Store’a eksik alpha içeriğiyle çıkılmaz. Bir paketin locale’de minimum sayısı yoksa paket tamamen gizlenir.

## 13.2 Ücretsiz/premium dağılımı

Her locale:

- 120 ücretsiz couple sorusu
- 50 ücretsiz friends sorusu
- Günün sorusu havuzu 90 genel soru
- Premium kalan katalog
- Ücretsiz kullanıcı aynı soruyu ilk 14 günde görmemelidir
- Paywall’a ulaşmadan önce ürün kalitesi gerçek sorularla gösterilir

## 13.3 Pack listesi ve minimumlar

| ID | Pack | Mod | Yoğunluk | Min. soru | Ücretsiz |
| --- | --- | --- | ---: | ---: | --- |
| `warm_start` | Warm Start | Couple | 1–2 | 90 | Evet |
| `laugh_together` | Laugh Together | Both | 1–2 | 100 | Kısmi |
| `know_me` | Do You Know Me? | Couple | 1–3 | 90 | Kısmi |
| `our_story` | Our Story | Couple | 1–3 | 80 | Hayır |
| `deep_night` | Deep Night | Couple | 3–4 | 100 | Kısmi |
| `future_us` | Future Us | Couple | 2–4 | 90 | Hayır |
| `money_home` | Money & Home | Couple | 2–4 | 70 | Hayır |
| `boundaries_trust` | Boundaries & Trust | Couple | 3–5 | 90 | Hayır |
| `appreciation` | Appreciation | Couple | 1–3 | 70 | Kısmi |
| `what_if` | What If… | Both | 1–4 | 100 | Kısmi |
| `long_distance` | Miles Apart | Couple | 1–4 | 70 | Hayır |
| `engaged_married` | Before & After “I Do” | Couple | 2–4 | 80 | Hayır |
| `spicy_slow` | Slow Burn | Couple 18+ | 3–4 | 90 | Örnek |
| `spicy_bold` | After Dark | Couple 18+ | 4–5 | 90 | Hayır |
| `friends_easy` | Easy Icebreakers | Friends | 1–2 | 80 | Evet |
| `hot_takes` | Hot Takes | Friends | 2–4 | 80 | Kısmi |
| `secrets_stories` | Secrets & Stories | Friends | 2–4 | 90 | Hayır |

## 13.4 Paket editoryal tanımları

### Warm Start

Amaç: Gerilim yaratmadan konuşmayı açmak.

Formüller:

- Küçük tercih
- Günlük alışkanlık
- Tatlı tahmin
- Mini anı
- Birlikte yapılacak kolay şey

Örnekler:

- Birlikte geçirdiğimiz sıradan bir günü özel yapan küçük şey nedir?
- Benim hangi alışkanlığım seni istemeden güldürüyor?
- Bu akşam telefonları kapatsak ne yapmak isterdin?
- İkimiz için mükemmel bir tembel pazar nasıl görünür?
- Şu an benden duyabileceğin en güzel küçük cümle ne olurdu?

### Laugh Together

Amaç: Paylaşılabilir ve reklam kreatifine dönüşebilir mizah.

- Bir zombi filminde hangimiz daha uzun yaşar, neden?
- Evde bir eşya konuşabilse hangisi hakkımızda en çok dedikodu yapardı?
- Hangimiz yanlış bir trene binip bunu macera diye satmaya daha yatkın?
- Birlikte açacağımız en başarısız işletme ne olurdu?
- Benim hangi huyumu bir uygulama özelliği olarak satardın?

### Do You Know Me?

Amaç: Partner tahmini ve sürpriz keşif.

- Ben kötü bir gün geçirdiğimde gerçekten neye ihtiyaç duyarım?
- Bir yıl boyunca tek bir hobim olsaydı hangisini seçerdim?
- Kalabalık bir ortamda beni en hızlı ne rahatsız eder?
- Büyük bir karar verirken önce kalbimi mi mantığımı mı dinlerim?
- Benim için “iyi bir özür” hangi parçaları içermeli?

### Our Story

Amaç: Ortak anıları yeniden canlandırmak.

- Benden ilk gerçekten etkilendiğin an hangisiydi?
- Birlikte yaşadığımız hangi küçük anı film sahnesi gibi hatırlıyorsun?
- İlişkimizin başındaki hangi hâlimizi özlüyorsun?
- Birlikte atlattığımız hangi şey bizi daha güçlü yaptı?
- Tanıştığımız güne tek cümle gönderebilseydin ne yazardın?

### Deep Night

Amaç: Değerler, korkular ve görülme hissi.

- İnsanların sende çoğu zaman yanlış anladığı şey nedir?
- Sevilmekle anlaşılmak arasında seçim yapmak zorunda kalsan hangisini seçerdin?
- Kendinin hangi tarafını korumayı öğrenmen uzun sürdü?
- Hayatında artık taşımak istemediğin bir beklenti nedir?
- İlişkimizde daha fazla yer açmamızı istediğin duygu hangisi?

### Future Us

Amaç: Beklentileri suçlamadan görünür kılmak.

- Beş yıl sonra sıradan bir salı günümüzün nasıl görünmesini istersin?
- Gelecekteki evimizde kesinlikle bulunması gereken bir şey nedir?
- Birlikte öğrenmemizi istediğin beceri hangisi?
- Kariyer ve ilişki arasında zor bir seçim çıksa adil karar nasıl verilir?
- Yaşlandığımızda bizi hâlâ yakın tutacak ritüel ne olabilir?

### Money & Home

Amaç: Para ve ev işlerini kavga tetiklemeden konuşmak.

- Ortak harcamalarda hangi tutardan sonra birbirimize danışmalıyız?
- Para biriktirmek mi deneyim satın almak mı sana daha çok güven verir?
- Ev işlerinin adil paylaşımı sence eşitlik mi, kapasite mi demektir?
- Birimiz işsiz kalsa diğerinden ne beklemeli?
- Borç, bir ilişkiye başlamadan önce ne kadar açık konuşulmalı?

### Boundaries & Trust

Amaç: Mahremiyet, kıskançlık ve güven sınırları.

- İlişkide telefon şifresini paylaşmak güven mi, gereksiz kontrol mü?
- Eski partnerlerle arkadaş kalmanın sağlıklı sınırı nedir?
- Biri flörtöz davrandığında partnerin nasıl tepki vermeli?
- Tartışma sırasında hangi davranış senin için çizgiyi aşar?
- Partnerinin özel alan istemesi sende hangi duyguyu uyandırır?

### Appreciation

Amaç: Oturumu pozitif kapatmak ve gerçek takdir üretmek.

- Son zamanlarda yaptığım ama yeterince teşekkür etmediğin şey nedir?
- Bende sana güven veren özellik hangisi?
- Birlikteyken kendinin hangi hâlini daha çok seviyorsun?
- İlişkimize kattığım küçük ama önemli şey nedir?
- Bugünkü bana tek bir güzel cümle bırak.

### What If…

Amaç: Tartışma ve viral kreatif.

- Bir yıl boyunca başka bir ülkede yaşama şansımız olsa nereye giderdik?
- Biri geçmişimizi, diğeri geleceğimizi görebilse hangisini seçerdik?
- Ömür boyu tek bir ortak tatil türü seçmek zorunda kalsak hangisi olurdu?
- Büyük bir para kazansak ilk anlaşmazlığımız ne hakkında olurdu?
- Bir günlüğüne rollerimiz değişse benim hakkımda ilk ne fark ederdin?

### Miles Apart

Amaç: Uzak mesafe ilişkisinin gerçek ihtiyaçları.

- Uzakken sana yakın hissettiren en küçük şey nedir?
- Yoğun bir günde iletişim kuramadığımızda hangi açıklama sana yeter?
- Bir sonraki buluşmamızda ilk yapmak istediğin şey nedir?
- Fiziksel mesafe hangi konuda bizi daha iyi konuşturdu?
- Gelecek planımızın gerçek hissettirmesi için hangi tarih veya karar eksik?

### Before & After “I Do”

Amaç: Nişanlı, yeni evli ve uzun evlilik segmenti.

- Aileler kararlarımıza ne kadar dâhil olmalı?
- Bayram ve tatilleri hangi prensiple paylaşmalıyız?
- Çocuk konusunda fikir değiştirirsek bunu nasıl konuşmalıyız?
- Evlilikten sonra ayrı arkadaş çevreleri ne kadar önemli?
- Birbirimizin ailesiyle yaşanan anlaşmazlıkta ilk sadakatimiz kime olmalı?

### Slow Burn — 18+

Amaç: Rıza ve konforu koruyan flörtöz yakınlık.

- Sende en çok hangi iltifat arzulanmış hissettirir?
- Romantik bir gecenin başlaması için hangi küçük detay yeter?
- Yakınlıkta daha çok konuşmamızı istediğin şey nedir?
- Sana göre çekicilik en çok görünüşte mi davranışta mı ortaya çıkar?
- Yeni bir şey denerken güvende hissetmen için ne gerekir?

### After Dark — 18+

Bu paketin nihai soruları yetişkin içerik editörü ve ülke policy review gerektirir.

Kurallar:

- Rıza dışı senaryo yok
- Zorlama/şantaj yok
- Reşit olmayanlara çağrışım yok
- Aşağılama yalnız açık rıza bağlamı olsa bile V1’de kullanılmaz
- Alkolü rıza azaltıcı araç gibi sunma
- Sağlık veya korunma konusunda yanlış bilgi verme
- Kullanıcının “pas” ve mature toggle kontrolünü görünür tut

### Easy Icebreakers

- Bu grupta bir yarışma programını en muhtemel kim kazanır?
- Birinizin hayatı film olsa türü ne olurdu?
- Hepimizin denemesi gereken ucuz bir aktivite nedir?
- İlk izleniminizle şimdiki fikriniz en çok kimde değişti?
- Bir yolculukta hangi rolü kim alırdı?

### Hot Takes

- Ayrı tatillere çıkmak ilişki için sağlıklı mıdır?
- Mesaja geç cevap vermek kabalık sayılır mı?
- Arkadaş grubunda hesabı her zaman eşit bölmek adil midir?
- İnsanlar eski sevgilileriyle arkadaş kalabilir mi?
- Başarı için sevmediğin bir işi yapmak mantıklı mıdır?

### Secrets & Stories

- Bugüne kadar verdiğin en gereksiz cesur karar neydi?
- Bir arkadaşının senin hakkında bilip ailenin bilmediği şey nedir?
- Sonradan komik gelen en kötü ilk buluşman hangisiydi?
- Küçükken inandığın en garip şey neydi?
- Bir gecede öğrendiğin en pahalı ders neydi?

---


## 14. SORU ÜRETİM VE EDİTÖRLÜK PROTOKOLÜ

## 14.1 İçerik hattı

Her soru aşağıdaki sıralamadan geçer:

```text
research concept
→ canonical intent
→ özgün İngilizce taslak
→ editoryal yeniden yazım
→ safety review
→ locale cultural adaptation
→ native language review
→ duplicate/quality validation
→ approved bundle
→ analytics feedback
→ revise veya retire
```

Bir adım atlanamaz. `draft` veya `native_review` statüsündeki metin runtime bundle’a giremez.

## 14.2 Araştırmadan esinlenme kuralı

Rakip veya fiziksel kart destelerinden görülen bir soruyla çalışırken:

1. Rakip cümle runtime dosyasına yapıştırılmaz.
2. Önce cümlenin soyut intent’i yazılır.
3. Rakip ekran kapatılır.
4. Intent’ten en az üç farklı soru formu üretilir.
5. Hedef locale için kültürel senaryo eklenir.
6. Aynı kelime dizisi ve aynı kategori sırası korunmaz.
7. İçerik editörü “ürünümüze ait mi?” kontrolü yapar.

Örnek:

```text
Araştırma konsepti:
Partnerin başka biri tarafından beğenilince ne hissedersin?

Intent:
jealousy.external_attention.emotional_response

Yeni varyantlar:
- Bir yabancının bana açıkça flört etmesi sende ilk hangi duyguyu uyandırır?
- Partnerinin ilgi görmesinden gurur duymakla kıskanmak aynı anda mümkün mü?
- Biri bana yürüdüğünde bunu sana anlatmamı ister misin, neden?
```

## 14.3 Soru formülleri

Her paket yalnız açık uçlu “ne düşünüyorsun?” sorularından oluşmamalı.

Dağılım hedefi:

- Açık uçlu: `%35`
- Senaryo/what-if: `%20`
- Partner tahmini: `%15`
- Zorunlu seçim: `%10`
- Anı/hikâye: `%10`
- Sıralama/puanlama: `%5`
- Rapid/special: `%5`

Kullanılacak kalıplar:

1. **Memory:** “İlk kez … hissettiğin an neydi?”
2. **Prediction:** “Sence partnerin … seçerdi?”
3. **Boundary:** “… senin için hangi noktada çizgiyi aşar?”
4. **Scenario:** “Şöyle olsa ne yapardın?”
5. **Forced choice:** “A mı B mi; neden?”
6. **Ranking:** “Şunları önem sırasına koy.”
7. **Appreciation:** “Partnerinde takdir ettiğin…”
8. **Repair:** “Bir tartışmadan sonra sana ne iyi gelir?”
9. **Future projection:** “Beş yıl sonra…”
10. **Story starter:** “Bize şu anıyı anlat…”

## 14.4 Kalite rubric’i

Her soru 0–2 puanla değerlendirilir:

| Kriter | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Açıklık | Anlaşılmaz | İkinci okumada anlaşılır | İlk okumada net |
| Konuşma potansiyeli | Tek kelime | Kısa cevap | Hikâye/tartışma açar |
| Özgünlük | Klişe | Tanıdık ama düzgün | Beklenmedik açı |
| Yargısızlık | Suçlayıcı | Hafif yönlendirici | Güvenli ve açık |
| Yerellik | Çeviri kokuyor | Nötr | Kültürel olarak doğal |
| Paket uyumu | Alakasız | Yakın | Tam uyumlu |

Toplam 9 puan altı yayınlanmaz. Safety ihlali varsa puandan bağımsız reddedilir.

## 14.5 Otomatik duplicate kontrolleri

`scripts/detect-duplicates.ts` veya ayrı Python QA aracı:

- Unicode normalize
- Küçük harf
- Noktalama kaldırma
- Stop-word kontrollü tokenlaştırma
- Exact normalized duplicate: fail
- Token Jaccard `>0.82`: fail
- Levenshtein similarity `>0.88`: warning/review
- Aynı `intentKey`te üçten fazla çok yakın varyant: warning
- Opsiyonel offline sentence embedding cosine `>0.90`: fail
- Cosine `0.84–0.90`: human review

Kontrol hem aynı locale içinde hem aynı pack içinde yapılır. Cross-locale text benzerliği değil, ID/parite kontrol edilir.

## 14.6 Dil kalitesi kontrolleri

- Ham template kalamaz: `{{name}}`, `%s`, `[PLAYER]`
- Açılmamış quote/bracket fail
- Soru işareti olmayan soru warning; bazı dillerde editör override mümkün
- Maksimum karakter tek başına fail nedeni değil; UI render testi gerekir
- Arapça metinde yanlış Latin placeholder fail
- Japonca/Korece’de gereksiz doğrudan pronoun kullanımı review
- Geleneksel Çince bundle içinde yüksek oranlı Basitleştirilmiş karakter warning
- UI’de pack title iki satırı aşarsa short title gerekir

## 14.7 Güvenlik ve etik içerik kuralları

Yasak:

- Reşit olmayanlarla ilgili romantik/cinsel içerik
- Tecavüz, zorla ilişki veya rıza dışı davranışı oyunlaştırma
- Şiddet tehdidini komik ceza olarak kullanma
- Kullanıcıyı şifre paylaşmaya veya takip etmeye zorlama
- “Cevaplamıyorsa aldatıyor” türü manipülasyon
- Irk, din, engellilik, yönelim veya kimliğe hakaret
- Kendine zarar verme veya intiharı parti sorusuna dönüştürme
- Tıbbi/psikolojik teşhis
- Suç işlemeye yönelik pratik yönlendirme
- Alkol/uyuşturucu etkisinde rızayı teşvik
- Beden utandırma

Hassas ama kullanılabilir:

- Para, kıskançlık, eski ilişkiler, çocuk isteği, aile sınırları
- Yalnız kontrollü yoğunluk, konu uyarısı ve pas imkânıyla
- Travma ayrıntısı istemeyen, tercihe bağlı formda

## 14.8 İçerik raporlama

Kullanıcı rapor nedenleri:

- Rahatsız edici/zararlı
- Kötü çeviri
- Anlaşılmıyor
- Tekrar ediyor
- Yanlış pakette
- Kültürel olarak uygunsuz
- Teknik metin hatası

Hesapsız V1’de rapor, question ID + locale + reason + app version şeklinde anonim analitiğe gider. Serbest metin V1’de alınmaz; kişisel veri riskini azaltır.

Retire işlemi:

- Remote manifest ile soru `retired` olabilir
- Yeni session’a girmez
- Eski favoride “Bu kart artık mevcut değil” görünür ve kaldırma sunulur
- ID yeniden başka soruya atanmaz

## 14.9 İçerik authoring ve build araçları

Editörler runtime JSON’u elle düzenlemeyecektir. Kaynak format CSV/TSV veya kontrollü JSONL olabilir.

Kanonik authoring kolonları:

```text
question_id
intent_key
mode
pack_ids
topic_tags
relationship_stages
intensity
maturity
interaction_type
starter
safety_tags
region_allow
region_block
source_class
editorial_notes
status
version
```

Locale authoring kolonları:

```text
question_id
locale
text
starter_text
follow_up
short_share_text
cultural_variant
translator_id
native_reviewer_id
safety_reviewer_id
status
updated_at
```

Build komutları:

```text
npm run content:validate
npm run content:duplicates
npm run content:report
npm run content:build
npm run content:diff
```

Beklenen çıktılar:

- `content:validate`: fail/warning ve satır numarası
- `content:duplicates`: aynı/benzer soru kümeleri
- `content:report`: locale/pack/status/intensity sayıları
- `content:build`: yalnız approved satırlardan deterministic runtime JSON
- `content:diff`: önceki release’e göre eklenen/değişen/retired sorular

Runtime JSON deterministic olmalıdır: aynı kaynak aynı hash’i üretir. Build sırasında generated file elle değiştirilirse CI fail eder.

## 14.10 İçerik release onayı

Her content release için rapor:

```text
content version
locale
added / changed / retired
pack counts
intensity distribution
maturity distribution
duplicate warnings resolved
native reviewer
safety reviewer
sha256
minimum app version
```

Soru değiştiğinde stable ID korunabilir; anlam tamamen değişiyorsa yeni ID açılır. Analytics geçmişini bozacak şekilde eski ID başka intent’e dönüştürülmez.

---

## 15. LOKALİZASYON MİMARİSİ

## 15.1 UI ve içerik ayrımı

İki ayrı kaynak vardır:

1. **UI strings:** buton, başlık, hata, paywall açıklaması
2. **Content bundles:** soru, pack adı/açıklaması, special kartlar

Birinin paritesi diğerini geçerli saydırmaz.

## 15.2 Locale davranışı

- İlk açılış cihaz locale’i
- Desteklenmiyorsa İngilizce
- Kullanıcı seçimi cihaz ayarını geçersiz kılar
- `pt-BR` ile `pt-PT` ayrı olabilir; ilk hedef `pt-BR`
- `zh-Hant-TW` ve `zh-Hant-HK` ortak content tabanı + mağaza metni varyantı
- `ar` MSA tabanı; reklam ve bazı pack copy’leri KSA/GCC/Egypt varyantları taşıyabilir
- `nb` kullanılır; kullanıcı-facing adı Norwegian

## 15.3 Fallback politikası

- UI key eksikse development’da fail, production’da İngilizce fallback + log
- Pack localization eksikse pack o locale’de hidden
- Question localization eksikse soru pool’a alınmaz
- Bir oturumda iki dil karışmaz
- Bir locale minimum 400 uygun sorunun altındaysa store listing açılmaz

## 15.4 RTL

- `I18nManager` yönü merkezi adapter ile yönetilir
- Icon yönleri semantic: back/forward mirror; heart/star mirror edilmez
- Swipe yönü fiziksel jest olarak aynı kalabilir, ama next affordance RTL’de test edilir
- Sayılar, fiyatlar ve oyuncu isimleri bidi-safe wrapper kullanır
- Sol/sağ yerine start/end tokenları
- Görsel focalX RTL’de otomatik mirror edilmez; artwork metadata karar verir
- Arapça font clipping, diacritic ve line-height gerçek cihazda test edilir

## 15.5 Kültürel adaptasyon brief’leri

### Arapça

- MSA doğal ve sıcak; devlet dili gibi ağır değil
- “Boyfriend/girlfriend” her yerde doğrudan çevrilmez; partner/eş bağlama göre
- Aile, nişan, evlilik, mahremiyet ve sosyal çevre önemli paketler
- Explicit katalog country flag ile kapatılabilir
- KSA/UAE mağaza ekranları temiz couple conversation’a odaklanır
- Mısır kreatifinde lehçe kullanılabilir; app içi kanon MSA kalabilir

### Japonca

- Aşırı doğrudan suçlayıcı formdan kaçın
- Sessizlik, kişisel alan, iş yoğunluğu, sosyal beklenti gibi yerel senaryolar
- İsim + “önce sen” hitabının doğal honorific seviyesi editörce belirlenir
- Katakana dolu pazarlama dili kullanılmaz
- Date-night kavramı yerel karşılıkla anlatılır

### Korece

- İlişki süresi, yıldönümü, mesaj sıklığı ve kıskançlık kültürel bağlama göre
- Yaş/hiyerarşi varsayımı yapılmaz
- Banmal/jondaemal seçimi bütün uygulamada tutarlı
- Store copy daha enerjik olabilir; deep sorular hassas

### Geleneksel Çince

- Tayvan ve Hong Kong kelime tercihleri store copy’de ayrılır
- İlişki, aile ve para sorularında bölgesel örnekler
- Basitleştirilmiş karakter sızıntısı otomatik kontrol edilir
- Cümleler uzun İngilizce yapısını taklit etmez

## 15.6 Pseudo-localization

CI’da iki pseudo locale:

- `en-XA`: metni `%35` uzatır, aksan ekler
- `ar-XB`: RTL yönünü ve placeholder güvenliğini test eder

Ana ekranlar pseudo locale screenshot testinden geçer.

## 15.7 Native review teslim kriteri

Native reviewer şunları onaylar:

- Doğal konuşma dili
- Doğru yoğunluk
- Cinsiyet/ilişki varsayımları
- Kültürel hassasiyet
- Store age rating uyumu
- Reklamda kullanılabilirlik
- Yazım/noktalama
- Pack içi ton tutarlılığı

Reviewer kimliği content metadata’da tutulur; uygulamaya kişisel bilgi gönderilmez.

---

## 16. MONETİZASYON VE REVENUECAT

## 16.1 Ürün modeli

Freemium tadımlık + bağlamsal hard paywall.

Ücretsiz:

- Warm Start
- Friends Easy
- Günün sorusu
- Bazı premium pack’lerden iki örnek

Premium:

- Bütün paketler
- Mature katalog
- Favorites özel oturum V1.1
- Seasonal pack’ler
- Reklamsız deneyim; V1 zaten display ads içermez

## 16.2 Entitlement ve product IDs

RevenueCat entitlement:

```text
premium
```

Offering’ler:

```text
default
annual_first
monthly_first
arabic_monthly
apac_lifetime_test
seasonal_offer
```

Store product ID örneği:

```text
duo_premium_monthly
duo_premium_annual
duo_premium_weekly_test
duo_premium_lifetime
```

Product IDs son marka seçilse bile gereksiz değiştirilmez.

## 16.3 Fiyat mimarisi

Kesin yerel fiyatlar yayın gününde Store/RevenueCat üzerinden ayarlanır; kodda tutulmaz.

Önerilen göreli seviye:

| Pazar | Monthly | Annual | Lifetime test |
| --- | --- | --- | --- |
| NA / yüksek gelir APAC | yaklaşık $9.99 | $29.99–39.99 | $49.99–69.99 |
| GCC | $7.99–9.99 eşdeğeri | $24.99–34.99 | test |
| Batı Avrupa/Nordics | €8.99–9.99 | €29.99–39.99 | test |
| CEE/Türkiye | $3.99–5.99 eşdeğeri | $14.99–24.99 | $24.99–39.99 |
| IN/SEA | $2.99–3.99 eşdeğeri | $11.99–18.99 | $19.99–29.99 |

Debatium’un haftalık fiyatı kanıtlanmış olsa da her pazara kopyalanmaz.

- Arapça: monthly primary
- Japonca/Korece: annual ve lifetime testi
- IN/SEA: düşük yıllık/lifetime
- Weekly yalnız kontrollü A/B; varsayılan değil

## 16.4 Trial

İlk deneyler:

- 3 gün vs 7 gün
- Trial olmayan yıllık indirim
- 60 vs 120 ücretsiz kart

Guardrail:

- Refund
- Day-0 cancel
- Store rating
- Support complaint
- Paid renewal

Yalnız trial start yükseldi diye deney kazanmış sayılmaz.

## 16.5 Paywall state machine

```text
unconfigured
→ loading
→ ready
→ purchasing
→ success

Yan yollar:
loading → offline
loading → empty_offering
loading → configuration_error
purchasing → cancelled
purchasing → purchase_error
restore → nothing_to_restore | success | restore_error
```

Her state’in ayrı UI ve erişilebilir açıklaması olacaktır.

## 16.6 Purchase kuralları

- Purchase butonuna çift basma engellenir
- Satın alma sırasında ekran kapanabilir ama işlem state’i korunur
- User cancellation hata toast’ı değildir
- Store receipt doğrulanmadan premium açılmaz
- Success sonrası entitlement refetch
- Restore her platformda görünür
- Production RevenueCat key yoksa release build CI fail
- Preview key yoksa premium mock veya “test build” açıklaması; yarım paywall gösterilmez
- Offering boşsa free akış kullanılmaya devam eder

## 16.7 Paywall copy

Başlık:

- “Bütün konuşmaları açın”

Faydalar:

- Tüm çift ve arkadaş desteleri
- Yeni seasonal sorular
- Konunuza ve ruh hâlinize göre sınırsız oturum
- Tek satın alma iki oyuncunun aynı telefondaki deneyimini açar

Alt metin:

- Trial süresi
- Sonraki fiyat/periyot
- Auto-renew
- İptal yöntemi

“Bugün $0” tek başına büyük başlık olarak kullanılmaz; sonraki ücret aynı görsel hiyerarşide görünür.

---

## 17. ANALİTİK PLANI

## 17.1 İlkeler

- PII gönderilmez
- Oyuncu isimleri event’e gönderilmez
- Soru metni gönderilmez; yalnız question ID
- Kullanıcının cevapları toplanmaz
- Anonymous ID cihazda üretilir
- Analytics adapter dev/testte in-memory olabilir
- Event isimleri version control altındadır

## 17.2 Event sözlüğü

### Acquisition/onboarding

```text
app_opened
first_open
locale_auto_selected
locale_changed
onboarding_started
onboarding_completed
age_gate_confirmed
comfort_level_selected
```

### Core game

```text
mode_selected
players_configured
pack_library_viewed
pack_viewed
pack_selected
session_setup_completed
session_started
question_viewed
question_skipped
question_favorited
question_unfavorited
question_reported
special_card_viewed
session_paused
session_resumed
session_abandoned
session_completed
session_extended
recap_viewed
```

### Monetization

```text
paywall_viewed
paywall_dismissed
package_selected
trial_started
purchase_started
purchase_cancelled
purchase_failed
purchase_succeeded
restore_started
restore_succeeded
restore_empty
restore_failed
entitlement_changed
```

### Retention

```text
daily_question_viewed
daily_reminder_scheduled
notification_opened
favorite_library_viewed
share_card_created
```

## 17.3 Zorunlu properties

Ortak:

```text
anonymous_id
app_version
build_number
platform
os_version
device_class
locale
country_storefront
theme
entitlement
experiment_assignments
```

Question event:

```text
question_id
intent_key
pack_id
intensity
maturity
interaction_type
starter_position
session_id
session_index
time_on_card_ms
```

Paywall event:

```text
offering_id
placement
package_ids
selected_package
trial_days
displayed_price
currency
```

## 17.4 Funnel’lar

1. Install → onboarding complete → first question → 8th question → session complete
2. Pack view → paywall → trial → paid → first renewal
3. First session → second session D7
4. Locale → activation → trial → paid → refund
5. Creative campaign → store → install → paid

## 17.5 Dashboard’lar

- Executive: revenue, paid, LTV, refund, sessions
- Locale: activation/retention/revenue per language
- Content: skip, dwell, favorite, report per question
- Paywall: placement/variant conversion
- Quality: crash, content load failure, purchase errors
- Creative: campaign/UGC hook performance

## 17.6 İçerik karar kuralları

- 200+ view sonrası skip `%70+` ve favorite `<%1`: review
- Report `%1+`: immediate safety review
- Median dwell `<2s`: anlaşılmaz veya kötü kart incelemesi
- High dwell + high favorite: reklam/share adayı
- Locale’de performans çok farklıysa çeviri değil kültürel adaptasyon yapılır

---

## 18. BİLDİRİMLER

V1 yalnız local notifications kullanır.

İzin isteme zamanı:

- İlk açılışta isteme
- Kullanıcı Günün Sorusu’nda “Bu akşam hatırlat” seçince rationale göster
- Sonra OS permission

İzin verilmezse settings recovery açıklaması sunulur.

Bildirim türleri:

- Günün sorusu, kullanıcının seçtiği saat
- Yarım kalan oturum için yalnız kullanıcı açıkça isterse tek hatırlatma
- Seasonal pack duyuruları remote push olmadan V1’de yok

Yasak copy:

- “Partnerin seni bekliyor” — bunu bilmiyoruz
- “İlişkiniz soğuyor”
- “Serini kaybetme” baskısı
- Cinsel içerikli notification preview

---

## 19. GİZLİLİK, GÜVENLİK VE MAĞAZA POLİTİKASI

## 19.1 İzinler

MVP şu izinleri istemez:

- Konum
- Kamera
- Mikrofon
- Kişiler
- Takvim
- Sağlık verisi
- Arka plan konumu
- Bluetooth

Yalnız notification izni bağlamsal istenir.

## 19.2 Toplanan veri

- Anonymous installation ID
- App/device teknik bilgisi
- Question ID etkileşimleri
- Purchase/entitlement durumu
- Crash log
- Kullanıcının seçtiği locale ve ayarlar

Toplanmayan:

- Oyuncu isimleri server’a
- Soru cevapları
- Partner bilgisi
- Rehber
- Fotoğraf/video
- Hassas ilişki notları

## 19.3 Local data deletion

Settings → Privacy → “Tüm yerel verileri sil”:

- Favorites
- Seen history
- Session history
- Player names
- Notification schedule
- Settings

Satın alma mağaza hesabına bağlı olduğu için entitlement restore edilebilir; açıklanır.

## 19.4 Age rating

- General katalog ayrı olsa da mature paket nedeniyle iOS/Android rating dürüst doldurulur
- Explicit content text tabanlı ve erişim kontrollü
- Çocuk kategorisine başvurulmaz
- Aile reklam hedeflemesi yapılmaz
- Mature screenshot’lar genel mağaza sayfasında kullanılmaz

## 19.5 Subscription compliance

- Paywall’da fiyat ve süre
- Trial sonrası ücret
- Auto-renew açıklaması
- Terms/Privacy
- Restore
- Kullanıcı iptal ettiğinde premium gibi davranmama
- Misleading countdown kullanmama
- Sahte “yalnız bugün” indirimi kullanmama

## 19.6 İçerik hakları

- Kod, rakip asset’i, marka veya screenshot kopyalanmaz
- Genel ürün fikri ve mekanik yeniden uygulanabilir
- Kısa/genel soru konseptleri araştırma girdisi olabilir
- Rakibin tüm veri tabanı, sıralaması ve kategori örgüsü birebir taşınmaz
- Her yayın sorusunun özgün intent ve editoryal kayıt izi bulunur

---

## 20. ACCESSIBILITY

Zorunlu:

- Tüm eylemlerde accessibilityRole/label/hint
- Kart swipeları için görünür buton alternatifi
- Screen reader kart değişim duyurusu
- Progress yalnız renkle anlatılmaz
- 44/48 px touch target
- Text scaling `%200` test
- Uzun metin kesilmez
- Contrast AA
- Reduce Motion
- Haptics kapatma
- RTL screen reader sırası
- Paywall fiyatları screen reader’a tek mantıklı cümle olarak okunur
- Modal açıldığında focus modal içine taşınır
- Error mesajı canlı bölge olarak duyurulur

Soru kartı erişilebilirlik örneği:

```text
“Soru 4, Deep Night. Maya önce cevaplasın. İnsanların sende çoğu zaman yanlış anladığı şey nedir? Favoriye eklemek için Favori düğmesine, geçmek için Sonraki düğmesine dokunun.”
```

---

## 21. PERFORMANS VE DAYANIKLILIK

Hedefler:

- Warm cold start modern orta seviye Android’de `<2s`
- Home interactive `<2.5s`
- Pack açılışı `<200ms` local content
- Kart geçişi 60 fps hedef
- Content bundle parse ana thread’i uzun bloklamaz
- App bundle içindeki text content makul sıkıştırılır
- Görseller WebP, doğru çözünürlük; devasa PNG yok
- Sentry’de crash-free `%99.7+`

Offline senaryolar:

- İlk açılış offline
- Paywall offline
- Entitlement cache ile premium offline
- Remote manifest yarım inmiş
- Bundle checksum yanlış
- Device time yanlış
- Uygulama session ortasında kill

Her senaryo test edilir.

---

## 22. TEST STRATEJİSİ

## 22.1 Unit test

- Session selector filtreleri
- Intensity dağılımı
- Seen-history tekrar önleme
- Player assignment adaleti
- Country/maturity policy
- Daily deterministic selection
- Storage migrations
- Entitlement mapping
- Experiment bucketing
- Locale fallback
- Content schema

Seeded algoritma snapshot’ları stable olmalıdır.

## 22.2 Component test

- Button loading/disabled
- PackCard free/premium/new
- QuestionCard kısa/uzun/RTL
- Paywall bütün state’ler
- Purchase error/cancel/success
- Empty favorites
- Permission denied
- Content unavailable

## 22.3 Integration test

- First run → first question
- Free pack session complete
- Premium pack → paywall → mock success → play
- Restore success
- Locale switch LTR→RTL
- Session resume after reload
- Mature toggle off filters all explicit
- Report question
- Local data reset

## 22.4 E2E/Maestro

Minimum flows:

1. New Android user completes free couple session
2. Arabic user completes RTL session
3. Friend mode 5 players rotates names
4. Paywall dismissed, free flow remains usable
5. Purchase success unlocks premium immediately
6. Purchase cancellation does not show error
7. Offline app completes embedded session
8. Large font long Japanese question does not clip
9. Process death resumes session
10. Settings reset clears local data

## 22.5 İçerik testleri

CI’da:

- Schema
- Stable unique IDs
- Pack minimum counts
- Locale parity report
- Approved-only runtime
- Duplicate detection
- Forbidden placeholder
- Safety tag requirements
- Mature pack age gate
- Country block correctness
- Artwork registry completeness
- Missing translation
- UI key parity

## 22.6 Görsel QA matrisi

Ekranlar:

- Onboarding
- Home
- Mode
- Players
- Pack library
- Pack detail
- Session setup
- Short card
- Maximum-length card
- Special card
- Recap
- Paywall ready/error/offline
- Settings

Cihazlar:

- 360×640 Android
- 360×800 Android
- 412×915 Android
- iPhone SE sınıfı
- iPhone 15/16 normal
- Pro Max
- Tablet

Varyantlar:

- Light/dark
- English/Arabic/Japanese
- Font scale 1.0/1.3/2.0
- Reduce Motion

## 22.7 Manuel purchase QA

- iOS sandbox
- Google license tester
- New purchase
- Trial
- Renew
- Cancel
- Billing issue
- Refund/revoke
- Restore on reinstall
- Cross-device same store account
- Offline after cached entitlement

---

## 23. CI/CD

Her PR:

1. Checkout
2. Node pin
3. Package install immutable
4. Format check
5. ESLint
6. TypeScript
7. Unit/component tests
8. Content schema
9. Duplicate/content report
10. i18n parity
11. Expo Doctor
12. Expo export smoke

Main/release:

- Android preview APK secret gerektirmeyen local Gradle yoluyla mümkünse
- Android production AAB signed workflow
- iOS archive/build workflow
- Artifact upload
- Source maps Sentry
- Version/build number validation
- Production RevenueCat env validation
- Privacy/native permission validation
- Dependency audit

Release branch force-push almaz. Build artifact linki kullanıcıya açık şekilde verilir.

## 23.1 Environment değişkenleri

```text
EXPO_PUBLIC_APP_ENV
EXPO_PUBLIC_REVENUECAT_IOS_KEY
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
EXPO_PUBLIC_POSTHOG_KEY
EXPO_PUBLIC_POSTHOG_HOST
EXPO_PUBLIC_SENTRY_DSN
EXPO_PUBLIC_CONTENT_BASE_URL
```

Kurallar:

- Secret repo’ya yazılmaz
- `.env.example` açıklamalı
- Production build gerekli key yoksa fail
- Preview’da analytics kapatılabilir
- Dev adapter üretim bundle’ına giremez

---

## 24. REPO VE PR UYGULAMA SIRASI

Her PR küçük ama tamamlanmış dikey dilim olmalı.

### PR 1 — Bootstrap, quality gates, design tokens

- Expo/Router/TS
- Lint/format/test
- Theme tokens
- Primitive components
- CI başlangıcı

Kabul: örnek ekran light/dark, typecheck/test/Expo Doctor geçer.

### PR 2 — Navigation, hydration, onboarding

- Splash coordination
- Language
- Welcome
- Age/comfort
- Settings persistence/migration

### PR 3 — Content schema and validation

- Intent/localized/pack schema
- Embedded manifest
- Loader
- CI validators
- 50 EN seed question

### PR 4 — Home, mode and player setup

- Home
- Couple/friends mode
- 2–8 names
- Last players optional persistence

### PR 5 — Pack library and artwork system

- Artwork registry/focal crop
- Pack filters
- Pack detail
- Free/premium state

### PR 6 — Session engine

- Selector
- Seeded shuffle
- Intensity arc
- Seen history
- Player rotation
- Tests

### PR 7 — Gameplay and recap

- Question card
- Gestures/buttons
- Long text
- Special cards
- Pause/resume
- Favorites
- Recap

### PR 8 — Purchases/paywall

- RevenueCat adapter
- State machine
- Offerings
- Purchase/restore
- Dev mock boundary
- Error/offline/misconfigured screens

### PR 9 — Analytics, experiments, crash

- Typed event catalog
- Analytics adapter
- Experiment bucketing
- Sentry boundary
- Privacy controls

### PR 10 — Notifications and daily

- Daily deterministic question
- Deferred permission
- Local schedule
- Notification routing

### PR 11 — English content scale-up

- 1.310-item target
- Duplicate/safety reports
- Pack minimums
- Content editor QA

### PR 12 — Arabic and RTL

- Full UI
- Full content target
- RTL visual QA
- Arabic store copy
- Country content policies

### PR 13 — Japanese/Korean/Traditional Chinese

- UI localization
- Cultural adaptation
- Native review metadata
- Store copy/assets
- CJK typography QA

Bu PR gerekirse locale başına bölünür; yarım locale merge edilse bile feature flag ile store’da açılmaz.

### PR 14 — Accessibility/performance/reliability

- Screen reader
- Dynamic type
- Reduce motion
- Performance profile
- Offline/recovery
- Full E2E

### PR 15 — Store release

- Icon/splash
- Screenshots
- Privacy forms
- Age rating
- Subscription metadata
- Signed builds
- Release checklist

---

## 25. MAĞAZA VE ASO PLANI

Her locale için ayrı:

- App name varyantı
- Subtitle
- Keyword set
- Short description
- Long description
- 6–8 screenshot caption
- Preview video metni
- Support/marketing URL
- Privacy URL

Screenshot hikâyesi:

1. “Bu gece birbirinize yeni bir şey sorun”
2. İsim girme/kişiselleştirme
3. Ruh hâline göre paketler
4. Gerçek kaliteli soru örneği
5. Couple + friends
6. Deep/spicy kontrollü katalog
7. Offline/hesapsız
8. Premium katalog

Her locale screenshot gerçek o dilde olmalıdır; İngilizce cihaz screenshot’ına çeviri caption yapıştırılmaz.

Store listing deneyleri:

- Deep connection vs fun date night positioning
- Couple-only vs couple+friends
- Soru örneği 1 vs 2
- Premium miktar vurgusu vs quality vurgusu

---

## 26. BÜYÜME VE KREATİF SİSTEMİ

Ürün kodundan ayrı ama launch için zorunludur.

## 26.1 Ana kreatif format

İki kişi kadrajda, gerçek soruyu tartışıyor.

```text
0–2s: Ekranda vurucu soru
2–8s: Birinci kişinin hızlı cevabı
8–14s: İkinci kişinin itirazı/sürprizi
14–18s: Tartışmanın küçük zirvesi
18–21s: Uygulamadaki kart ve CTA
```

## 26.2 Hook aileleri

- “Partnerine bunu sormaya cesaretin var mı?”
- “Bu soru çiftleri ikiye böldü.”
- “Onun cevabını bildiğini sanıyorsun.”
- “İlk buluşmada sorulur mu?”
- “Evlenmeden önce bunu konuşun.”
- “Kıskançlık mı, mahremiyet mi?”
- “Arkadaş grubunda kavga çıkaran soru.”

## 26.3 Üretim temposu

Her aktif locale/hafta:

- 10 soru seç
- 5–10 kısa video çek
- 3 farklı ilk iki saniye hook’u
- 2 CTA varyantı
- En iyi üç içeriği ücretli reklama taşı

İlk launch locale başına minimum 12 kreatif olmadan ücretli UA açılmaz.

## 26.4 Kreatif güvenliği

- Rakip videosu/screenshot’ı kullanılmaz
- Kullanıcının rızası olmadan gerçek tartışma paylaşılmaz
- Explicit soru reklam platformu policy’sine göre yumuşatılır
- Reklam “ücretsiz” diyorsa free içeriğin kapsamı gerçektir
- Sahte yorum, sahte çift veya sahte download sayısı yok

---

## 27. RELEASE CHECKLIST

### Ürün

- [ ] Free kullanıcı ilk oturumu tamamlıyor
- [ ] Premium bütün pack’leri açıyor
- [ ] Offline session çalışıyor
- [ ] Restore çalışıyor
- [ ] Locale switch çalışıyor
- [ ] Mature off bütün mature içeriği kapatıyor
- [ ] Data reset çalışıyor

### İçerik

- [ ] Her açık locale minimum sayıda
- [ ] Draft soru runtime’da yok
- [ ] Duplicate fail yok
- [ ] Native reviewer metadata tam
- [ ] Country policy tam
- [ ] Pack açıklamaları ve artwork tam

### Tasarım

- [ ] Small Android’de taşma yok
- [ ] Long question kesilmiyor
- [ ] Light/dark doğru
- [ ] RTL doğru
- [ ] Artwork crop QA geçti
- [ ] Dynamic type geçti

### Commerce

- [ ] RC keys production
- [ ] Offerings ready
- [ ] Fiyat/periyot doğru
- [ ] Trial açıklaması doğru
- [ ] Restore/Terms/Privacy
- [ ] Sandbox purchase matrix geçti

### Policy

- [ ] Privacy policy yayınlandı
- [ ] Data safety/App Privacy doğru
- [ ] Age rating doğru
- [ ] Gereksiz permission yok
- [ ] Support email çalışıyor
- [ ] Content rights kayıtları mevcut

### Engineering

- [ ] Tests green
- [ ] Typecheck green
- [ ] ESLint green
- [ ] Expo Doctor green
- [ ] Content validators green
- [ ] E2E green
- [ ] Android AAB/APK
- [ ] iOS archive
- [ ] Source maps uploaded

---

## 28. DEFINITION OF DONE

Bir özellik ancak aşağıdakilerin tümü sağlanırsa tamamlanmıştır:

1. Gerçek kullanıcı akışından erişilebilir.
2. Loading/empty/error/offline/disabled state’leri vardır.
3. Light/dark ve RTL düşünülmüştür.
4. Screen reader label’ları vardır.
5. Unit veya integration testi vardır.
6. Analitik event’i gerekiyorsa eklenmiştir.
7. UI metni i18n anahtarıdır.
8. Placeholder veya TODO bırakılmamıştır.
9. Satın alma gerektiriyorsa gerçek entitlement boundary kullanır.
10. Content kullanıyorsa schema/approval doğrulamasından geçer.
11. Typecheck/lint/test/build geçer.
12. PR açıklamasında nasıl test edildiği yazılır.

Uygulamanın tamamı ancak:

- En az bir free ve bir premium uçtan uca akış gerçek cihazda
- Wave-1 locale içerik eşikleri
- Signed Android/iOS build
- Mağaza/policy formları
- RevenueCat production offering
- Crash/analytics
- Release checklist

tamamlandığında “yayına hazır” sayılır.

---

## 29. YAPILMAYACAKLAR

- İlk sürümde chat/messaging
- İlk sürümde AI ilişki terapisti
- İlk sürümde cevap analizi veya uyum puanı
- İlk sürümde kullanıcı fotoğrafı
- İlk sürümde herkese açık UGC marketplace
- Uygulama içinde banner/interstitial reklam
- Kullanıcı cevaplarını server’da toplama
- Sağlık/terapi iddiası
- Debatium marka, ikon, renk, ekran veya veri tabanını birebir kopyalama
- Yetersiz locale’i İngilizce sorularla doldurma
- Makine çevirisini native review olmadan yayınlama
- Paywall fiyatını hard-code etme
- RC key yokken production paywall’u çalışıyor gibi gösterme
- Uzun soruyu `numberOfLines` ile kesme
- Arapçada yalnız metni sağa yaslayıp RTL tamamlandı sanma
- Aynı artwork’ü farklı pack’lerde döndürme
- “Yakında” butonlarıyla yarım özellik doldurma

---

## 30. AJANIN İLK ÇALIŞMA GÜNÜNDE YAPACAĞI İŞLER

1. Verilen repoyu temiz biçimde incele.
2. `AGENTS.md`, mevcut CI, package manager ve branch kurallarını oku.
3. Bu belgeyle mevcut kod arasında gap raporu çıkar.
4. Marka adı yoksa config tabanlı `Project Duo` kod adını kullan.
5. PR 1 kapsamını uygula.
6. CI’yı ilk PR’da kur; testleri sona bırakma.
7. İçerik schema’sını UI’dan önce sabitle.
8. 50 soruluk İngilizce seed ile oyun motorunu doğrula.
9. Purchase için adapter boundary kur; secret beklerken UI’ı mock production’a bağlama.
10. Her PR sonrası kalan planı ve blocker’ları güncelle.

Kullanıcıya sorulabilecek gerçek blocker’lar:

- Repo bağlantısı/yetkisi
- Nihai marka seçimi
- Apple/Google developer hesap erişimi
- RevenueCat project/key kurulumu
- Store signing ve vergi/ödeme hesabı
- Native editör seçimi

Bunların dışındaki sıradan teknik kararlar kullanıcıya geri atılmaz.

---

## 31. KISA ÜRÜN ÖZETİ — AJAN HER PR’DA BURAYA DÖNMELİ

Project Duo’nun avantajı çok özellik değil:

- 30 saniyede başlar
- Aynı telefonda oynanır
- Sorular gerçekten konuşturur
- İçerik bir sohbet eğrisiyle gelir
- Her dil kültüre göre yeniden yazılır
- Ücretsiz kalite gösterilir
- Premium şeffaf biçimde satılır
- Kullanıcı cevapları toplanmaz
- Uygulama çevrimdışı da çalışır

Bir geliştirme bu dokuz maddeden birine hizmet etmiyorsa MVP’ye eklenmemelidir.

---

## 32. ARAŞTIRMA DAYANAKLARI VE KARAR NOTLARI

Bu planın ürün kararlarında kullanılan güncel gözlemler:

- Debatium 14 Ağustos 2026 itibarıyla yaklaşık 24–26 bin dolar aylık gelir/MRR ve yaklaşık 2.100 aktif abonelik gösteriyordu.
- Debatium’un App Store dilleri İngilizce, Fransızca, Almanca, İtalyanca, Portekizce ve İspanyolcaydı.
- Ürün genel parti oyunundan çift konumuna kaydırıldı; kurucu gelir artışını çift odağı, reklam yönetimi ve A/B testleriyle ilişkilendirdi.
- Kullanıcı yorumlarının ana şikâyeti sert paywall ve yetersiz ücretsiz içerikti; bu yüzden gerçek free starter pack bu planda zorunlu tutuldu.
- RevenueCat 2026 benchmark’ları hard paywall’un ilk dönüşüm ve RPI avantajını; buna karşın kısa trial iptalleri ve bölgesel fiyat farklarını gösteriyor.
- MEA aylık planlara, IN/SEA daha düşük fiyatlara; Batı Avrupa ve yüksek gelir APAC daha yüksek payer value’ya eğilimli.

Referanslar:

- TrustMRR Debatium: <https://trustmrr.com/startup/debatium>
- Debatium App Store: <https://apps.apple.com/us/app/debatium-couple-game-convo/id6444075752>
- Debatium Google Play: <https://play.google.com/store/apps/details?id=com.lesignobles.ze_debat>
- RevenueCat State of Subscription Apps 2026: <https://www.revenuecat.com/state-of-subscription-apps/>
- WIPO copyright idea/expression ayrımı: <https://www.wipo.int/en/web/copyright/protection>
- EU database protection: <https://europa.eu/youreurope/business/growing/protecting-intellectual-property/database-protection/index_en.htm>

Bu kaynaklar uygulamaya kopyalanacak varlık değil; ürün ve risk değerlendirme dayanağıdır.

---

**BELGE SONU**

