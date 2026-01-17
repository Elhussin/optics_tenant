# توثيق الـ API (Swagger) 🔌

نظام EyeCare يوفر واجهة API قوية وموثقة بالكامل باستخدام **OpenAPI 3**. يمكنك التعرف على جميع نقاط النهاية (Endpoints) واختبارها مباشرة.

## 🚀 الوصول للواجهة التفاعلية

واجهة Swagger متوفرة محلياً عند تشغيل السيرفر على الرابط التالي:

[http://localhost:8000/api/schema/swagger-ui/](http://localhost:8000/api/schema/swagger-ui/)

> **ملاحظة**: يجب أن يكون سيرفر الباك آند قيد التشغيل (`python manage.py runserver`) لتتمكن من الوصول للرابط.

## 📑 ما الذي تحتويه هذه الواجهة؟
- **Authentication**: شرح كيفية استخدام JWT Tokens.
- **Endpoints**: قائمة بكل الـ URLs المتاحة (GET, POST, PUT, DELETE).
- **Schemas**: شرح تفصيلي لكل Object يتم إرساله أو استقباله.
- **Testing**: يمكنك الضغط على "Try it out" لتجربة الـ API مباشرة من المتصفح.

---

## 📄 توثيق Redoc (للقراءة فقط)
إذا كنت تفضل واجهة تركز على القراءة فقط، يمكنك استخدام Redoc:
[http://localhost:8000/api/schema/redoc/](http://localhost:8000/api/schema/redoc/)
