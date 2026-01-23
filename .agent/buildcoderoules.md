أولاً: قواعد الخلفية (Backend - Django)
قاعدة التعددية (Multi-tenancy):
يمنع تفعيل auto_create_schema في موديل العميل. إنشاء الجداول والبيانات الأساسية يتم يدوياً فقط من خلال أمر setup_tenant أو وظيفة الخلفية في 
active_tenant.py
 لتجنب تعليق قاعدة البيانات (Deadlocks).
قاعدة النماذج (Models):
يجب أن ترث جميع النماذج الجديدة من 
BaseModel
 لضمان وجود ميزة "الحذف الناعم" (Soft Delete) وتتبع تاريخ الإنشاء والتحديث تلقائياً.
قاعدة الأدوار (Multi-Role System):
التعامل مع أدوار المستخدم يكون حصرياً عبر علاقة Many-to-Many (user.roles). يمنع استخدام حقل role المفرد أو getattr(user, "role").
قاعدة منطق الأعمال (Service Layer):
العمليات المعقدة (مثل تأكيد الطلب، حساب الضرائب، خصم المخزون) لا توضع في الـ 
Views
 أو الـ Models؛ بل تنشأ لها "خدمة" مستقلة في مجلد services داخل التطبيق المعني.
قاعدة استيراد البيانات (Seed Data):
أي بيانات ثابتة (أدوار، صلاحيات، طرق دفع) يجب أن تُضاف في ملفات CSV في مجلد data/csv/ وتُحدث في 
csv_config.json
 لضمان قدرة النظام على تأسيس أي متجر جديد فوراً.



🎨 ثانياً: قواعد الواجهة الأمامية (Frontend - Next.js)
قاعدة التصميم (Glassmorphism & Premium):
الالتزام بالهوية البصرية الموحدة: خلفيات زجاجية (GlassCard)، حواف ناعمة، تأثيرات الحوم (Hover)، واستخدام نظام الألوان المتدرج (Gradients) المعرف في index.css.
قاعدة النماذج الديناميكية (Dynamic Forms):
يمنع بناء نماذج CRUD يدوياً لكل كيان. يجب استخدام DynamicFormGenerator وتحديث ملفات الإعدادات entityConfig.ts و generatFormConfig.ts.
قاعدة الترجمة (Internationalization):
يمنع كتابة أي نص ثابت (Hardcoded String) داخل المكونات. يجب استخدام useTranslations وتحديث ملفات ar/formGenerator.json و en/formGenerator.json.
قاعدة الحالة والبيانات (State Management):
استخدام useApiForm للتعامل مع النماذج و useApiData لجلب البيانات، لضمان استجابة الواجهة فورياً للأخطاء وحالات التحميل (Loading States).
🔑 ثالثاً: أهم الأدوار (Core Roles) لإدارة المشروع بسلاسة
بناءً على نظامنا الجديد، هذه هي الأدوار الأساسية التي يجب الحفاظ على برمجتها بدقة:

TenantOwner: القوة المطلقة داخل المتجر (Wildcard Permission *). هو الوحيد القادر على الوصول للإعدادات الحساسة وفواتير الاشتراك.
BranchManager: صلاحيات كاملة ولكن مقيدة بفرعه فقط. لا يرى مبيعات أو مخزون الفروع الأخرى.
Optometrist (فاحص النظر): وصول حصري لتطبيق "الوصفات الطبية" و"فحص العيون"، مع صلاحية قراءة سجلات العملاء فقط.
InventoryManager: مسؤول عن المنتجات، التحويلات بين الفروع، والموردين. لا يرى تقارير الأرباح أو بيانات الموظفين.
FinanceOfficer: مسؤول عن الفواتير، المدفوعات، والقيود المحاسبية، دون التدخل في الجوانب الطبية أو الموارد البشرية.


🎨 قواعد الواجهة الأمامية (Frontend - Next.js) - "محدثة"
قاعدة "الجمالية الفاخرة" (Visual Excellence): (قاعدة رقم 1 المحدثة)
الهوية الزجاجية: الالتزام الصارم باستخدام مكون GlassCard لكافة الحاويات والكروت. يجب أن تحتوي على تأثير الضباب (backdrop-blur) والشفافية المحسوبة بدقة.
نظام الألوان: يمنع استخدام الألوان الافتراضية الصريحة (مثل Pure Red أو Blue). يجب استخدام التدرجات (Gradients) المعرفة في النظام والظلال العميقة (Deep Shadows) التي تعطي شعوراً بالبعد الثالث.
الأنيميشن (Visual Life): كل عنصر جديد يدخل الشاشة يجب أن يتبع نمط animate-fade-in-up. يجب أن تتفاعل الأزرار والعناصر القابلة للنقر بحركات مجهرية (Micro-interactions) عند الحوم (Hover) أو الضغط.
قاعدة النماذج الديناميكية (Dynamic Forms):
يمنع بناء نماذج CRUD يدوياً لكل كيان. يجب استخدام DynamicFormGenerator لضمان اتساق شكل الحقول والمسافات البينية (Spacing) والتحقق من البيانات (Validation).
قاعدة الترجمة (Internationalization):
يمنع كتابة أي نص ثابت (Hardcoded String) داخل المكونات. كل كلمة يجب أن تمر عبر نظام الترجمة لتدعم الـ RTL (العربية) والـ LTR (الإنجليزية) بشكل مثالي.
قاعدة الحالة والبيانات (State Management):
استخدام useApiForm للنماذج و useApiData للجلب، لضمان ظهور الـ Skeleton Loaders والـ Spinners بنفس الأسلوب في كل صفحات النظام.



"طبق قاعدة الجمالية الفاخرة"

 كيف تستخدم هذه القواعد معي؟
في أي محادثة قادمة، يمكنك ببساطة قول:

"يا Antigravity، طبق قاعدة منطق الأعمال في بناء ميزة التحويل بين المستودعات." أو "تذكر قاعدة التصميم Premium عند بناء صفحة التقارير الجديدة."





<!-- دستور العمل -->

1. هيكلية الواجهة الأمامية (Frontend Architecture)
يعتمد النظام بشكل أساسي على "مولد النماذج الديناميكي" (Dynamic Form Generator)، وهو القلب النابض للتطبيق.

مصدر الحقيقة (Single Source of Truth):
الملف 
src/features/formGenerator/constants/entityConfig.ts
 هو المرجع الأساسي. أي كيان (Entity) جديد يجب تعريفه هنا أولاً.
يحتوي على: schemaName، aliases (لروابط الـ API)، fields (للقوائم)، و detailsField (للتفاصيل).
إدارة العلاقات (Relationships):
الملف 
generatFormConfig.ts
 يدير حقول الربط (Foreign Keys).
قاعدة ذهبية: يجب أن تكون قيمة entityName في هذا الملف مطابقة تماماً لمفتاح الكيان في 
entityConfig.ts
 (مثال: استخدام hrm-departments وليس departments).
التسميات والترجمة (Localization):
ملفات الترجمة src/messages/[lang]/formGenerator.json يجب أن تحتوي على مفتاح مطابق تماماً للمفتاح في 
entityConfig.ts
.
قسم formsConfig داخل ملف الترجمة هو المسؤول عن عرض العناوين (Title, DetailsTitle).
طريقة الاستدعاء (Routing & Menus):
في ملف 
dashboard/page.tsx
، قيمة href يجب أن تطابق مفتاح الكيان في 
entityConfig.ts
 (تم تصحيح products إلى product لهذا السبب).
2. التعامل مع الواجهة الخلفية (Backend Integration)
النظام مبني على معمارية معيارية (Modular Architecture) باستخدام Django.

توحيد الروابط (API Aliases):
نستخدم نظام Alias في الواجهة الأمامية (مثل users_users_list) لفك الارتباط المباشر مع روابط الـ Backend.
يجب التأكد دائماً من أن الـ Alias المستخدم في entityConfig له تعريف مقابل في طبقة الـ API (RTK Query).
بناء الاستعلامات (Query Building):
نعتمد على filterOptionsMixin.py في الباك إند لتوحيد طريقة الفلترة.
الاستعلامات يجب أن تدعم معايير التصفية الموحدة التي يتوقعها DynamicTable في الفرونت إند.
3. معايير التصميم (Design System)
النظام يتبع هوية بصرية "Premium" موحدة:

المظهر: Glassmorphism (تأثير الزجاج)، حواف ناعمة، واستخدام TailwindCSS.
المكونات: استخدام مكونات موحدة (مثل GlassCard, ActionButton) بدلاً من كتابة div بتنسيقات عشوائية.
الألوان: الالتزام بلوحة الألوان المحددة في globals.css وعدم استخدام ألوان ثابتة (Hardcoded) لضمان دعم الـ Dark Mode مستقبلاً.
4. قواعد التسمية (Naming Conventions)
لضمان عدم حدوث تضارب في النظام الضخم (Tenants, CRM, HRM, Accounting):

الكيانات: نستخدم البادئة (Prefix) للتفريق بين المديولات.
محاسبة: accounting-
موارد بشرية: hrm-
علاقات عملاء: crm-
منتجات: product- (مفرد)
المفاتيح: الحروف صغيرة مفصولة بشرطة (kebab-case) في ملفات الكونفيج (مثل product-variants).
ملخص سير العمل لإضافة ميزة جديدة (Workflow Checklist):
Backend: إنشاء الموديل والـ API View.
Frontend Config: إضافة تعريف الكيان في 
entityConfig.ts
.
Relationships: إذا كان له علاقات، تضاف في 
generatFormConfig.ts
.
Translation: إضافة الاسم والعناوين في 
formGenerator.json
 (العربي والإنجليزي).
Access: إضافة الرابط في 
dashboard/page.tsx
 مع الصلاحيات المناسبة.