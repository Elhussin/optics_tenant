# تقرير مراجعة شامل لتطبيق Hussam Optical ERP

تاريخ المراجعة: 2026-06-19

## 0. الاستكشاف

### هيكل المشروع

- Backend: `osmBack`، مشروع Django/DRF باسم `optics_tenant`.
- Frontend: `osmFront`، تطبيق Next.js App Router.
- تطبيقات Django المكتشفة: `accounting`, `api`, `branches`, `cms`, `crm`, `hrm`, `prescriptions`, `products`, `sales`, `tenants`, `users`.
- أهم ملفات الإعداد: `osmBack/optics_tenant/settings/base.py`, `osmBack/.env`, `osmFront/src/middleware.ts`, `osmFront/src/shared/api/axios.ts`.
- مسارات API الرئيسية: `core`, `users`, `sales`, `accounting`, `products`, `branches`, `hrm`, `crm`, `prescriptions`, `tenants`, `cms`, وواجهات mobile عبر `apps.api.urls`.
- صفحات Next.js كثيرة وموزعة تحت `osmFront/src/app/[locale]` وتشمل `dashboard`, `orders`, `invoices`, `stock-management`, `accounting`, `products`, `partners`, `payments`, `roles`, `auth`, `payment`.

### خريطة النماذج الأساسية

- `Client` و`Domain` في `apps.tenants.models`: يمثلان tenant وdomain في `django_tenants`.
- `Branch` و`BranchUsers` في `apps.branches.models`: الفروع وربط الموظفين بالفروع.
- `Stock`, `StockMovement`, `StockTransfer`, `StockTransferItem` في `apps.products.models.inventory`: المخزون والحركات والتحويلات.
- `Customer` و`Partner` في `apps.crm.models`: العملاء والشركاء/التأمين.
- `Supplier`, `Product`, `ProductVariant` في `apps.products.models`.
- `Order`, `Invoice`, `InvoiceItem`, `Payment`, `InvoiceTax` في `apps.sales.models`.
- لا توجد نماذج ZATCA فعلية للفواتير الإلكترونية، QR, UBL, CSID, hash chain, clearance/reporting.

## 1. ملخص تنفيذي

| المحور | الحالة | الخلاصة |
|---|---|---|
| Multi-tenancy | يحتاج تحسين | يستخدم `django_tenants`، لكن إنشاء schemas يدوي وبعض public/tenant boundaries تحتاج تشديد. |
| Security | خطر | أسرار فعلية في `.env`، CORS مفتوح، JWT HS256، refresh بلا blacklist، وصلاحيات افتراضية ملتبسة. |
| Business Logic | يحتاج تحسين | توجد معاملات وقفل صفوف في مسارات مهمة، لكن rounding الضريبي، الترقيم، والحذف/الإرجاع/ZATCA غير مكتملة. |
| ZATCA | خطر | التكامل غير منفذ عمليًا؛ الموجود إشارات توثيقية وتعليق فقط. |
| Code Quality | يحتاج تحسين | تنظيم جيد نسبيًا مع Services/Mixins، لكن توجد bypasses للفلترة وتباين بين Zod/DRF. |
| Performance/Scalability | يحتاج تحسين | توجد select/prefetch في أماكن، لكن actions كثيرة غير paginated وcache غير واضح tenant-aware. |

أهم 5 مخاطر قبل الإطلاق:

1. غياب ZATCA Phase 1/2 كتنفيذ فعلي، وهو مانع إنتاج ضريبي.
2. أسرار وقيم إنتاجية حساسة ملتزمة في `osmBack/.env` و`.env`.
3. CORS مفتوح مع cookies credentials وJWT cookies.
4. نقاط مخزون يمكنها تجاوز عزل الفروع في actions مخصصة.
5. حساب الضريبة لا يستخدم rounding/quantize إلزامي للمال، ولا توجد credit notes/hash chain/UUID للفواتير.

## 2. تفاصيل المشاكل

| البند | الوصف |
|---|---|
| الخطورة | حرجة |
| الموقع | `osmBack/apps/sales/models.py`, `osmBack/apps/sales/services/order_service.py`, البحث عن ZATCA في المشروع |
| الوصف | لا يوجد تنفيذ فعلي لـ UBL 2.1، QR TLV/Base64، UUID فاتورة، invoice hash, PIH, CSID, clearance أو reporting. التعليق في `order_service.py` يقول إن إنشاء الفاتورة عند تأكيد الطلب لأجل ZATCA، لكنه لا ينفذ أي متطلب ZATCA. |
| الأثر المحتمل | مخالفة ضريبية مباشرة وعدم صلاحية النظام لإصدار فواتير إلكترونية سعودية في الإنتاج. |
| التوصية | بناء وحدة ZATCA صريحة: نماذج لحالة الفاتورة الإلكترونية، توليد UBL، QR TLV، hash chain، signing، queue/retry، وأرشفة XML/QR لمدة نظامية. |

الدليل:

```python
# osmBack/apps/sales/services/order_service.py
# Create invoice automatically upon confirmation for ZATCA compliance
```

| البند | الوصف |
|---|---|
| الخطورة | حرجة |
| الموقع | `osmBack/.env:9`, `osmBack/.env:12`, `osmBack/.env:16`, `osmBack/.env:25`, `osmBack/.env:45`, `.env:3` |
| الوصف | ملفات env تحتوي أسرارًا فعلية: `DEBUG=True`, `ALLOWED_HOSTS=*`, كلمة مرور قاعدة بيانات، `SECRET_KEY`, و`JWT_SECRET`. |
| الأثر المحتمل | اختراق بيئة الإنتاج أو إعادة توقيع JWT إذا تسرب المستودع أو النسخ الاحتياطية. |
| التوصية | إزالة الأسرار من git، تدويرها فورًا، استخدام secret manager، وإبقاء `.env.example` فقط بقيم وهمية. |

| البند | الوصف |
|---|---|
| الخطورة | حرجة |
| الموقع | `osmBack/optics_tenant/settings/base.py:168-169`, `osmBack/.env:31-32`, `osmBack/optics_tenant/settings/base.py:257,266` |
| الوصف | `CORS_ALLOW_ALL_ORIGINS=True` افتراضيًا ومع `CORS_ALLOW_CREDENTIALS=True`، بينما المصادقة تعتمد cookies. `AUTH_COOKIE_SECURE` افتراضيه False. |
| الأثر المحتمل | تعريض جلسات المستخدمين ومخاطر CSRF/XSS أعلى، خصوصًا مع cookies cross-origin. |
| التوصية | إغلاق CORS على domains محددة، تفعيل Secure cookies في كل بيئة غير محلية، ومراجعة CSRF مع SameSite وسياسة origin صارمة. |

| البند | الوصف |
|---|---|
| الخطورة | عالية |
| الموقع | `osmBack/optics_tenant/settings/base.py:157-159` |
| الوصف | `DEFAULT_PERMISSION_CLASSES` تحتوي `IsAuthenticated` و`AllowAny` معًا. في DRF كل permissions يجب أن تمر، لكن وجود `AllowAny` هنا يخلق التباسًا خطيرًا ويزيد احتمال سوء فهم عند إضافة views جديدة. |
| الأثر المحتمل | توسع endpoints عامة بالخطأ أو مراجعة أمنية مضللة. |
| التوصية | اجعل الافتراضي `IsAuthenticated` فقط، واجعل `AllowAny` صريحًا في endpoints العامة. |

| البند | الوصف |
|---|---|
| الخطورة | عالية |
| الموقع | `osmBack/optics_tenant/settings/base.py:269-270`, `osmBack/apps/users/views.py:151`, `osmBack/apps/users/views.py:321-322` |
| الوصف | JWT يستخدم HS256 وrefresh token يعاد استخدامه من cookie ولا يوجد blacklist/rotation عند logout؛ logout يحذف الكوكي فقط من المتصفح. |
| الأثر المحتمل | refresh token مسروق يبقى صالحًا حتى انتهاء مدته، وخطر أعلى عند تسرب `JWT_SECRET`. |
| التوصية | تفعيل `rest_framework_simplejwt.token_blacklist`, rotation وblacklist بعد refresh/logout، ويفضل RS256 مع مفاتيح منفصلة. |

| البند | الوصف |
|---|---|
| الخطورة | عالية |
| الموقع | `osmBack/apps/users/serializers.py:133-142`, `osmBack/apps/users/serializers.py:161-169`, `osmBack/apps/users/views.py:47-48` |
| الوصف | التسجيل العام `AllowAny` يقبل `role_ids` ويعين الأدوار إن أرسلت. |
| الأثر المحتمل | إذا كان endpoint التسجيل متاحًا داخل tenant وفيه أدوار معروفة، يمكن لمستخدم جديد طلب دور أعلى. |
| التوصية | منع `role_ids` في التسجيل العام، وتعيين دور منخفض ثابت server-side فقط. اجعل إنشاء المستخدمين ذوي الأدوار عبر endpoint إداري. |

| البند | الوصف |
|---|---|
| الخطورة | عالية |
| الموقع | `osmBack/apps/products/views/inventory.py:77`, `85`, `97`, `160`, `353`, `371`, `390` |
| الوصف | عدة actions تستخدم `Stock.objects...` أو `self.queryset...` مباشرة بدل `self.filter_queryset(self.get_queryset())`، فتتجاوز `BranchAccessMixin`. |
| الأثر المحتمل | IDOR داخل tenant: مستخدم فرع قد يستعرض مخزون/تحويلات فرع آخر بتغيير `branch_id` أو action endpoint. |
| التوصية | كل action يجب أن يبدأ من `self.filter_queryset(self.get_queryset())`، ومع create/update يجب استدعاء `validate_branch_access` أو `validate_transfer_branch_access`. |

| البند | الوصف |
|---|---|
| الخطورة | عالية |
| الموقع | `osmBack/apps/products/serializers/inventory.py:169` |
| الوصف | إنشاء `StockMovement` يحدث `stock.quantity_in_stock` داخل transaction لكن بلا `select_for_update` أو update شرطي بـ `F`. |
| الأثر المحتمل | race condition يؤدي إلى كمية خاطئة عند حركات متزامنة. |
| التوصية | أعد جلب stock بقفل `select_for_update()` داخل `create`، أو استخدم atomic conditional updates بـ `F`. |

| البند | الوصف |
|---|---|
| الخطورة | عالية |
| الموقع | `osmBack/apps/sales/services/base_document_service.py:17-18` |
| الوصف | حساب الضريبة والمجموع لا يستخدم `quantize(Decimal('0.01'))` ولا rounding mode واضح. |
| الأثر المحتمل | فروقات هللات وتباين مع متطلبات الفواتير والقيود المحاسبية. |
| التوصية | توحيد Money helper يستخدم Decimal وROUND_HALF_UP/السياسة المعتمدة، ويطبق على كل subtotal/tax/total/payment. |

| البند | الوصف |
|---|---|
| الخطورة | متوسطة |
| الموقع | `osmBack/apps/sales/utils.py:19,24-25`, `osmBack/apps/sales/models.py:454-455` |
| الوصف | الترقيم يستخدم sequence يومي، وهذا جيد للتزامن، لكنه يخلق gaps طبيعية عند rollback أو فشل لاحق. كما أن اسم sequence مبني raw SQL. |
| الأثر المحتمل | فجوات ترقيم قد تكون غير مقبولة تشغيليًا/ضريبيًا حسب السياسة، وصيانة أصعب لكل schema. |
| التوصية | فصل draft number عن fiscal invoice number، ولا تصدر الرقم الضريبي إلا عند الاعتماد النهائي، وسجل gaps/voids رسميًا. |

| البند | الوصف |
|---|---|
| الخطورة | متوسطة |
| الموقع | `osmBack/apps/tenants/models.py:85`, `osmBack/apps/tenants/models.py:114`, `osmBack/core/management/commands/setup_tenant.py:63,83-87` |
| الوصف | `schema_name.isalnum()` يمنع underscore لكنه لا يكفي كسياسة أسماء واضحة، و`auto_create_schema=False` يجعل إنشاء schema/migrations مسارًا يدويًا عبر management commands. |
| الأثر المحتمل | فشل تهيئة tenants أو عدم اتساق migrations إذا تغيرت العمليات التشغيلية. |
| التوصية | توحيد خدمة إنشاء tenant واحدة transaction-aware، validation واضح للأسماء، واختبارات provisioning/migration. |

| البند | الوصف |
|---|---|
| الخطورة | متوسطة |
| الموقع | `osmBack/apps/tenants/views/tenant_views.py:163-165` |
| الوصف | `TenantSettingsViewset` يسمح بـ `AllowAny` للـ list/retrieve. |
| الأثر المحتمل | كشف بيانات إعدادات tenant مثل الاسم، البريد، الهاتف، الحسابات البنكية إن كانت موجودة. |
| التوصية | اجعل القراءة العامة محدودة بحقول public profile فقط، وافصل إعدادات الفوترة والبنك خلف `IsAuthenticated` وصلاحية مناسبة. |

| البند | الوصف |
|---|---|
| الخطورة | متوسطة |
| الموقع | `osmBack/apps/sales/models.py` |
| الوصف | لا يوجد نموذج واضح لـ credit notes، cancellation/void، أو منع تعديل فاتورة مؤكدة. |
| الأثر المحتمل | تعديل أو حذف سجل مالي أصلي بدل إنشاء مستند تصحيحي، وهذا خطر محاسبي وضريبي. |
| التوصية | قفل الفواتير المؤكدة، منع الحذف، وإضافة CreditNote/DebitNote وVoid document audit trail. |

| البند | الوصف |
|---|---|
| الخطورة | متوسطة |
| الموقع | `osmFront/src/shared/api/schemas.ts` |
| الوصف | Zod مولد من OpenAPI، لكن الكثير من schemas تستخدم `passthrough()` وحقول object عامة مثل `z.object({}).partial().passthrough()`، وهذا لا يمثل تحققًا صارمًا مكافئًا للـ serializers. |
| الأثر المحتمل | الواجهة تقبل payloads لا تعكس قواعد backend بدقة، فيظهر فشل متأخر أو bypass لمنطق واجهة المستخدم. |
| التوصية | توليد schemas أكثر صرامة أو إضافة schemas يدوية للنماذج الحساسة: invoices, payments, stock movements, tenant registration. |

| البند | الوصف |
|---|---|
| الخطورة | منخفضة |
| الموقع | `osmBack/optics_tenant/urls.py:8-12`, `osmBack/schema.yml`, `osmBack/docs/api/swagger.md` |
| الوصف | OpenAPI/Swagger موجود، وهذه نقطة إيجابية، لكن يلزم توثيق ZATCA وحالات الأخطاء والتصاريح بشكل أدق. |
| الأثر المحتمل | صعوبة اختبار التكامل وتشغيل العملاء/الموبايل بثقة. |
| التوصية | تحديث schema لتشمل أمثلة، security schemes، وحالات 403/409/422. |

## 3. قائمة فحص ZATCA

| المتطلب | الحالة | الدليل |
|---|---|---|
| XML UBL 2.1 | غير موجود | لا توجد وحدة/دالة توليد UBL. |
| QR TLV Base64 | غير موجود | البحث عن `tlv/qr/base64` لم يجد تنفيذًا متعلقًا بالفواتير. |
| الحقول الخمسة للفاتورة المبسطة | غير موجود | لا توجد بنية QR invoice payload. |
| Standard vs Simplified | غير موجود | `InvoiceType` تجاري عام وليس نوع ZATCA clearance/reporting. |
| UUID لكل فاتورة | غير موجود | `Invoice` لا يحتوي UUID خاص بالفاتورة الإلكترونية. |
| Invoice hash وPIH | غير موجود | لا توجد حقول hash/previous hash. |
| CSID لكل tenant | غير موجود | لا توجد نماذج أو storage لـ CSID/cert/private key. |
| Cryptographic stamp | غير موجود | لا توجد signing pipeline. |
| Clearance للفواتير الضريبية | غير موجود | لا توجد API client لمنصة Fatoora. |
| Reporting خلال 24 ساعة | غير موجود | لا توجد queue/retry/Celery task مرتبطة بالفواتير. |
| معالجة رفض ZATCA | غير موجود | لا توجد حالات rejected/cleared/reported. |
| أرشفة XML/QR لمدة 6 سنوات | غير موجود | لا توجد storage policy أو نموذج archive. |
| Sandbox vs Production | غير موجود | لا توجد إعدادات Fatoora بيئية. |

## 4. خطة عمل مقترحة

### عاجل قبل الإطلاق

1. إزالة الأسرار من المستودع وتدوير `SECRET_KEY`, `JWT_SECRET`, DB credentials.
2. إغلاق CORS وتفعيل secure cookies وإلغاء `AllowAny` من defaults.
3. تعطيل `role_ids` في التسجيل العام وإضافة rate limiting على login/register/reset.
4. إصلاح كل actions التي تتجاوز `BranchAccessMixin`.
5. اعتبار ZATCA غير مكتمل رسميًا وعدم إطلاق إصدار إنتاجي للفوترة السعودية قبل تنفيذه.

### مهم خلال أسابيع

1. تنفيذ ZATCA Phase 1: UBL, QR TLV, UUID, hash chain, archive.
2. تنفيذ Phase 2: CSID, signing, clearance/reporting, queue/retry.
3. توحيد حسابات المال والضريبة مع rounding policy واختبارات دقيقة.
4. قفل الفواتير المؤكدة وإضافة credit notes/void flow.
5. تفعيل refresh token rotation/blacklist ويفضل RS256.

### تحسينات لاحقة

1. زيادة اختبارات integration للطلبات، المخزون، المدفوعات، والتحويلات.
2. مراجعة pagination لكل custom actions والقوائم الكبيرة.
3. جعل cache keys tenant-aware بشكل موثق ومختبر.
4. تشديد Zod schemas للعمليات المالية والمخزنية.
5. توثيق API بصلاحيات وأمثلة وحالات فشل واضحة.

## 5. ملاحظات ختامية

المشروع لديه أساس جيد: فصل apps واضح، استخدام `django_tenants`, وجود services لبعض العمليات، واستخدام `select_for_update` في مسارات مهمة. لكن لا يمكن اعتباره جاهزًا للإنتاج الضريبي في السعودية حاليًا بسبب غياب ZATCA، وتسرب الأسرار، وبعض مخاطر عزل الفروع والمصادقة.
