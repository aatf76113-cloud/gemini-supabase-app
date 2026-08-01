# Zain Automation - دليل النشر والإنتاج الشامل (Production Deployment & PWA Guide)

هذا المستند يتضمن كافة الخطوات والتعليمات البرمجية والتشغيلية الخاصة بنشر منصة **Zain Automation** على كافة البيئات والأنظمة (Firebase Hosting, PWA, Android, Windows, macOS, Linux, iOS).

---

## 1. إعداد ونشر Firebase Hosting و SPA Routing

تم تكوين ملف `firebase.json` وملف `.firebaserc` لتوجيه المسارات وتهيئة أداء التخزين المؤقت والحماية:

```bash
# 1. تثبيت أدوات Firebase CLI (إن لم تكن مثبتة)
npm install -g firebase-tools

# 2. تسجيل الدخول إلى حساب Firebase
firebase login

# 3. بناء المشروع للإنتاج (Generates /dist and server bundle)
npm run build

# 4. نشر قواعد Firestore والتطبيق على Firebase Hosting
firebase deploy --only hosting,firestore
```

### إعدادات SPA Routing وضغط التخزين المؤقت (Cache-Control)
في ملف `firebase.json`:
- **التوجيه الشامل**: توجيه جميع الطلبات `/**` إلى `index.html`.
- **الخدمات الفورية**: تعطيل التخزين المؤقت لملف الخدمة `/sw.js` و `/version.json`.
- **الأصول الثابتة**: التخزين المؤقت لملفات `/assets/**` لمدة سنة كاملة مع رأس `immutable`.
- **ترويسة الأمان**: إجبار بروتوكول HTTPS عبر `Strict-Transport-Security` وتفعيل `X-Content-Type-Options` و `X-Frame-Options`.

---

## 2. تحويل المنصة إلى Progressive Web App (PWA)

المنصة مجهزة بالكامل بالخصائص التالية:
1. **Web App Manifest (`/public/manifest.json`)**: مجهز بالأيقونات والألوان بالوضع الداكن وشاشة البدء المخصصة.
2. **Service Worker (`/public/sw.js`)**:
   - **العمل أوفلاين (Offline Mode)**: التخزين المؤقت للهيكل الأساسي للصفحات وأصول الواجهة.
   - **Network-First للطلبات الديناميكية**: ضمان استلام أحدث بيانات مسارات العمل مع الاحتفاظ بنسخة محلية احتياطية عند انقطاع الشبكة.
   - **Push Notifications**: استقبال وتفاعل الإشعارات الفورية للأنشطة.
3. **مكتشف التحديثات (Update Checker)**: فحص دوري لملف `/version.json` وعرض تنبيه تلقائي للمستخدم للتحديث الفوري بدون فقدان البيانات.

---

## 3. التثبيت على الأجهزة (Android, Windows, macOS, Linux, ChromeOS, iOS)

تم تزويد التطبيق بشرائط وأدوات التثبيت التفاعلية:
- **Android**: تفعيل تقنية WebAPK لتوليد تطبيق أندرويد تلقائياً عبر المتصفح مع الدعم للربط العميق عبر `.well-known/assetlinks.json`.
- **Windows / macOS / Linux**: تثبيت كـ PWA Desktop App عبر أزرار التثبيت المباشرة في شريط الملاحة.
- **iOS**: دعم كامل للتثبيت عبر Safari "Add to Home Screen" والتعامل مع المناطق الآمنة (Safe Area Insets).

---

## 4. بناء وتصدير تطبيقات الموبايل الهجينة عبر Capacitor

مشروع **Capacitor** مهيأ في الملفين `capacitor.config.json` و `capacitor.config.ts`:

### أ) بناء تطبيق Android (APK / AAB):
```bash
# 1. مزامنة ملفات البناء
npx cap add android
npx cap sync android

# 2. فتح المشروع في Android Studio لبناء APK نهائي
npx cap open android
```
- المسار الناتج لبناء APK: `android/app/build/outputs/apk/release/app-release.apk`

### ب) بناء تطبيق iOS (IPA):
```bash
# 1. مزامنة أصول iOS على macOS
npx cap add ios
npx cap sync ios

# 2. فتح المشروع في Xcode
npx cap open ios
```

---

## 5. فحص النسخ والتحديث التلقائي (Automatic Versioning)

- ملف النسخة: `/public/version.json` يحتوي على رقم الإصدار الحالي `v2.4.0-prod` وطوابع البناء.
- عند نشر تحديث جديد، يقوم ملف `pwaService.ts` باكتشاف الاختلاف وتنبيه المستخدم بشريط يطفو أسفل الشاشة لإعادة التحميل وتفعيل النسخة الجديدة فوراً.

---

## 6. التحقق من جاهزية البناء والإنتاج

تم التحقق واختبار كافة مكونات البناء بنجاح عبر:
- `npm run lint` -> نجاح الفحص دون أي أخطاء.
- `npm run build` -> إنشاء دليل `dist/` مع bundling كامل للـ Express Server ببروتوكول CommonJS.
