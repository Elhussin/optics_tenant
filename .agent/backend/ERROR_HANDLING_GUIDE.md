# دليل استخدام نظام معالجة الأخطاء الموحد

## 📚 المحتويات

1. [التفعيل](#التفعيل)
2. [الاستخدام في Serializers](#الاستخدام-في-serializers)
3. [الاستخدام في Views](#الاستخدام-في-views)
4. [رسائل الخطأ المخصصة](#رسائل-الخطأ-المخصصة)
5. [أمثلة عملية](#أمثلة-عملية)

---

## التفعيل

### 1. تفعيل Custom Exception Handler

في `settings.py`:

```python
REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'core.exceptions.custom_exception_handler',
    # ... باقي الإعدادات
}
```

### 2. إضافة Logging (اختياري)

في `settings.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': 'logs/errors.log',
        },
    },
    'loggers': {
        '': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}
```

---

## الاستخدام في Serializers

### استخدام ReusableFields

```python
from core.utils.ReusableFields import ReusableFields

class ProductSerializer(serializers.ModelSerializer):
    # استخدام الحقول الجاهزة
    sku = ReusableFields.sku(required=True)
    selling_price = ReusableFields.price(required=True)
    quantity = ReusableFields.quantity(default=0)
    
    class Meta:
        model = Product
        fields = ['sku', 'selling_price', 'quantity']
```

### التحقق من التفرد

```python
from core.exceptions import validate_unique_field

class ProductVariantSerializer(serializers.ModelSerializer):
    def validate_sku(self, value):
        """التحقق من أن SKU فريد"""
        validate_unique_field(
            model=ProductVariant,
            field_name='sku',
            value=value,
            instance=self.instance,  # للتحديث
            lang='ar'  # أو 'en'
        )
        return value
```

### معالجة الأسعار والكميات

```python
from decimal import Decimal, InvalidOperation

class ProductVariantSerializer(serializers.ModelSerializer):
    def validate_selling_price(self, value):
        """التحقق من صحة السعر"""
        try:
            price = Decimal(str(value))
            if price < 0:
                raise serializers.ValidationError("السعر يجب أن يكون أكبر من صفر")
            return price
        except (ValueError, InvalidOperation):
            raise serializers.ValidationError("أدخل سعراً صحيحاً")
    
    def validate_discount_percentage(self, value):
        """التحقق من نسبة الخصم"""
        try:
            discount = Decimal(str(value or 0))
            if discount < 0 or discount > 100:
                raise serializers.ValidationError("نسبة الخصم يجب أن تكون بين 0 و 100")
            return discount
        except (ValueError, InvalidOperation):
            raise serializers.ValidationError("أدخل نسبة خصم صحيحة")
```

---

## الاستخدام في Views

### معالجة الأخطاء في Views

```python
from rest_framework.decorators import action
from rest_framework.response import Response
from core.exceptions import ErrorMessages

class ProductViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        try:
            product = self.get_object()
            # ... logic
            return Response({'message': 'تم التأكيد بنجاح'})
        except ValidationError as e:
            # سيتم معالجته تلقائياً بواسطة custom_exception_handler
            raise
        except Exception as e:
            # سيتم معالجته تلقائياً
            raise
```

---

## رسائل الخطأ المخصصة

### إضافة رسائل خطأ جديدة

في `core/exceptions.py`:

```python
class ErrorMessages:
    # ... الرسائل الموجودة
    
    # إضافة رسالة جديدة
    INSUFFICIENT_STOCK = {
        'ar': 'الكمية المتاحة غير كافية. المتاح: {available}',
        'en': 'Insufficient stock. Available: {available}'
    }
```

### استخدام الرسائل المخصصة

```python
from core.exceptions import ErrorMessages

def validate_stock(self, value):
    available = self.context['stock'].available_quantity
    if value > available:
        lang = self.context['request'].headers.get('Accept-Language', 'ar')
        lang = 'en' if lang.startswith('en') else 'ar'
        
        message = ErrorMessages.get(
            'INSUFFICIENT_STOCK',
            lang,
            available=available
        )
        raise serializers.ValidationError(message)
    return value
```

---

## أمثلة عملية

### مثال 1: إنشاء منتج مع validation كامل

```python
class ProductCreateSerializer(serializers.ModelSerializer):
    sku = ReusableFields.sku(required=True)
    selling_price = ReusableFields.price(required=True)
    discount_percentage = ReusableFields.price(required=False, default=0)
    
    class Meta:
        model = Product
        fields = ['sku', 'selling_price', 'discount_percentage']
    
    def validate_sku(self, value):
        """التحقق من تفرد SKU"""
        validate_unique_field(
            model=Product,
            field_name='sku',
            value=value,
            instance=self.instance
        )
        return value
    
    def validate(self, data):
        """التحقق من البيانات الكاملة"""
        # التحقق من الأسعار
        try:
            selling_price = Decimal(str(data.get('selling_price', 0)))
            discount_pct = Decimal(str(data.get('discount_percentage', 0)))
            
            if selling_price <= 0:
                raise serializers.ValidationError({
                    'selling_price': 'السعر يجب أن يكون أكبر من صفر'
                })
            
            if discount_pct < 0 or discount_pct > 100:
                raise serializers.ValidationError({
                    'discount_percentage': 'نسبة الخصم يجب أن تكون بين 0 و 100'
                })
        
        except (ValueError, InvalidOperation):
            raise serializers.ValidationError({
                'detail': 'البيانات المرسلة غير صحيحة'
            })
        
        return data
```

### مثال 2: معالجة أخطاء التحويلات

```python
class StockTransferViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        transfer = self.get_object()
        
        # التحقق من الحالة
        if transfer.status != 'shipped':
            raise serializers.ValidationError({
                'detail': 'يمكن استلام التحويلات المشحونة فقط'
            })
        
        try:
            # تنفيذ الاستلام
            transfer.execute_receiving()
            return Response({
                'message': 'تم استلام التحويل بنجاح',
                'transfer': StockTransferSerializer(transfer).data
            })
        except Exception as e:
            # سيتم معالجته تلقائياً
            raise
```

---

## 🎯 الفوائد

1. ✅ **رسائل خطأ موحدة** بالعربية والإنجليزية
2. ✅ **معالجة تلقائية** لجميع أنواع الأخطاء
3. ✅ **Logging تلقائي** للأخطاء
4. ✅ **سهولة الصيانة** - كل شيء في مكان واحد
5. ✅ **تجربة مستخدم أفضل** - رسائل واضحة ومفهومة

---

## 📝 ملاحظات مهمة

1. **اللغة الافتراضية**: العربية
2. **تحديد اللغة**: عبر header `Accept-Language`
3. **Logging**: يتم تسجيل الأخطاء غير المتوقعة تلقائياً
4. **Debug Info**: تظهر فقط للمستخدمين الـ staff
