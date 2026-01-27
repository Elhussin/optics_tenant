# دليل إدارة الأخطاء الشامل

## 📚 نظرة عامة

نظام إدارة الأخطاء يتكون من 5 طبقات:

```
1. Exception Handler (DRF) ← معالجة أخطاء API
2. Middleware ← معالجة أخطاء Django العامة
3. Mixins ← معالجة موحدة في ViewSets
4. Decorators ← معالجة في view functions
5. Serializers ← validation في البيانات
```

---

## 🔧 التفعيل الكامل

### 1. Exception Handler (✅ مفعّل)

في `settings.py`:
```python
REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
}
```

### 2. Middleware

في `settings.py`:
```python
MIDDLEWARE = [
    # ... الـ middleware الموجودة
    'core.middleware.ErrorHandlingMiddleware.ErrorHandlingMiddleware',
]
```

### 3. Logging (موصى به)

في `settings.py`:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': 'logs/errors.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
}
```

---

## 📝 الاستخدام في كل طبقة

### 1. في Serializers

```python
from core.utils.ReusableFields import ReusableFields
from core.exceptions import validate_unique_field

class ProductSerializer(serializers.ModelSerializer):
    sku = ReusableFields.sku(required=True)
    selling_price = ReusableFields.price(required=True)
    
    def validate_sku(self, value):
        validate_unique_field(
            model=Product,
            field_name='sku',
            value=value,
            instance=self.instance
        )
        return value
```

### 2. في ViewSets (مع Mixin)

```python
from core.mixins.ErrorHandlingMixin import ErrorHandlingMixin, ValidationMixin

class ProductViewSet(ErrorHandlingMixin, ValidationMixin, viewsets.ModelViewSet):
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        try:
            product = self.get_object()
            # ... logic
            return self.success_response('ACTION_COMPLETED', data={'product': product.id})
        except Exception as e:
            return self.handle_error(e, 'GENERAL_ERROR')
```

### 3. في Views (مع Decorator)

```python
from core.decorators.error_handling import handle_exceptions, validate_request_data

class MyViewSet(viewsets.ModelViewSet):
    
    @handle_exceptions('INSUFFICIENT_STOCK')
    @validate_request_data('product_id', 'quantity')
    @action(detail=False, methods=['post'])
    def reserve_stock(self, request):
        # ... code
        return Response({'message': 'تم الحجز بنجاح'})
```

### 4. في Models

```python
from decimal import Decimal, InvalidOperation

class ProductVariant(models.Model):
    @property
    def discount_price(self):
        try:
            discount_pct = Decimal(str(self.discount_percentage or 0))
            selling_price = Decimal(str(self.selling_price or 0))
            
            if discount_pct > 0 and selling_price > 0:
                discount_amount = selling_price * (discount_pct / 100)
                return selling_price - discount_amount
        except (ValueError, TypeError, InvalidOperation):
            pass
        return None
```

---

## 🎯 أمثلة عملية

### مثال 1: ViewSet كامل مع معالجة أخطاء

```python
from core.mixins.ErrorHandlingMixin import ErrorHandlingMixin, ValidationMixin
from core.decorators.error_handling import validate_request_data

class StockTransferViewSet(ErrorHandlingMixin, ValidationMixin, viewsets.ModelViewSet):
    
    @validate_request_data('from_branch', 'to_branch', 'items')
    @action(detail=False, methods=['post'])
    def create_transfer(self, request):
        try:
            # التحقق من الحقول المطلوبة
            self.validate_required_fields(
                request.data,
                ['from_branch', 'to_branch', 'items']
            )
            
            # إنشاء التحويل
            serializer = StockTransferCreateSerializer(
                data=request.data,
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            transfer = serializer.save()
            
            return self.success_response(
                'CREATED',
                data=StockTransferSerializer(transfer).data
            )
        
        except ValidationError as e:
            # سيتم معالجته تلقائياً بواسطة exception handler
            raise
        
        except Exception as e:
            return self.handle_error(e, 'GENERAL_ERROR')
    
    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        try:
            transfer = self.get_object()
            
            # التحقق من الحالة
            if transfer.status != 'shipped':
                lang = self.get_error_lang()
                message = 'يمكن استلام التحويلات المشحونة فقط' if lang == 'ar' else 'Only shipped transfers can be received'
                raise ValidationError({'detail': message})
            
            # تنفيذ الاستلام
            transfer.execute_receiving()
            
            return self.success_response(
                'ACTION_COMPLETED',
                data=StockTransferSerializer(transfer).data
            )
        
        except ValidationError:
            raise
        except Exception as e:
            return self.handle_error(e, 'GENERAL_ERROR')
```

---

## ✅ Checklist التفعيل الكامل

### Backend:
- [x] ✅ Exception Handler مفعّل في settings
- [ ] ⏳ Middleware مضاف في settings
- [ ] ⏳ Logging مُعد
- [ ] ⏳ استخدام ReusableFields في Serializers
- [ ] ⏳ استخدام Mixins في ViewSets
- [ ] ⏳ استخدام Decorators في Actions

### Frontend:
- [ ] ⏳ معالجة أخطاء API في axios interceptor
- [ ] ⏳ عرض رسائل خطأ واضحة للمستخدم
- [ ] ⏳ إرسال Accept-Language header

---

## 🎯 الخلاصة

| الطبقة | الحالة | الأولوية | الملف |
|--------|--------|----------|-------|
| Exception Handler | ✅ مفعّل | عالية | `core/exceptions.py` |
| Middleware | ⏳ جاهز | متوسطة | `core/middleware/ErrorHandlingMiddleware.py` |
| Mixins | ⏳ جاهز | متوسطة | `core/mixins/ErrorHandlingMixin.py` |
| Decorators | ⏳ جاهز | منخفضة | `core/decorators/error_handling.py` |
| ReusableFields | ✅ محدّث | عالية | `core/utils/ReusableFields.py` |
| Logging | ⏳ يحتاج إعداد | متوسطة | `settings.py` |

**النتيجة**: النظام الحالي **كافٍ للبداية**، لكن لنظام شامل، يُنصح بتفعيل الـ Middleware والـ Logging.
