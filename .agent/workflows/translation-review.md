---
description: مراجعة الملفات لتطبيق نظام الترجمة ورسائل الأخطاء
---
# Translation & Error Handling Review Workflow

## الهدف
مراجعة الملفات للتأكد من تطبيق نظام الترجمة (`gettext_lazy`) ورسائل الأخطاء الموحدة.

---

## خطوات المراجعة لكل ملف

### 1. التحقق من الـ Import
```python
# يجب أن يكون موجوداً في أعلى الملف
from django.utils.translation import gettext_lazy as _
```

### 2. مراجعة Serializers

#### ✅ إضافة `extra_kwargs` مع `error_messages`:
```python
class Meta:
    extra_kwargs = {
        'field_name': {
            'error_messages': {
                'required': _('Field is required'),
                'blank': _('Field cannot be blank'),
                'unique': _('Already exists'),
                'does_not_exist': _('Not found'),
                'invalid': _('Enter a valid value'),
            }
        },
    }
```

#### ✅ ValidationError format:
```python
# ربط الخطأ بحقل معين (الأفضل)
raise serializers.ValidationError({
    'field_name': _('Error message')
})

# أو خطأ عام
raise serializers.ValidationError(_('Error message'))
```

### 3. مراجعة Views

#### ✅ Response errors تستخدم `'detail'`:
```python
return Response(
    {'detail': str(_('Error message'))},
    status=status.HTTP_400_BAD_REQUEST
)
```

#### ❌ تجنب:
- `'error'` - غير قياسي
- `'message'` - يتعارض مع رسائل النجاح

### 4. مراجعة Models

#### ✅ verbose_name مترجم:
```python
name = models.CharField(max_length=100, verbose_name=_('Name'))
```

#### ✅ ValidationError مترجم:
```python
raise ValidationError(_('Error message'))
```

#### ✅ choices مترجمة:
```python
CHOICES = [
    ('value', _('Display Name')),
]
```

---

## قائمة التحقق السريع

| العنصر | التحقق |
|--------|--------|
| `gettext_lazy as _` import | ☐ |
| `extra_kwargs` في Serializers | ☐ |
| `error_messages` للحقول المطلوبة | ☐ |
| `ValidationError` تستخدم `_()` | ☐ |
| Response errors → `'detail'` | ☐ |
| `verbose_name` في Models | ☐ |
| `choices` مترجمة | ☐ |

---

## بعد الانتهاء

// turbo
```bash
pdm run python manage.py check
```

// turbo
```bash
pdm run python manage.py makemessages -l ar --ignore=__pypackages__ --ignore=site
```

// turbo
```bash
pdm run python manage.py compilemessages --ignore=__pypackages__
```

---

## الملفات التي تمت مراجعتها ✅
- [x] `apps/products/serializers/inventory.py`
- [x] `apps/crm/models/insurance.py`
- [x] `apps/tenants/signals.py`
- [x] `apps/tenants/models.py`
- [x] `apps/tenants/views/active_tenant.py`
- [x] `apps/api/views_mobile.py`
- [x] `apps/branches/serializers.py`
- [x] `apps/branches/views.py` (نظيف)
- [x] `apps/branches/models.py` (نظيف)
- [x] `apps/accounting/views.py`
- [x] `apps/accounting/serializers.py`
- [x] `core/decorators/error_handling.py`
- [x] `core/mixins/ErrorHandlingMixin.py`
- [x] `apps/crm/models/partner.py`
- [x] `apps/crm/models/customer.py`
- [x] `apps/crm/views/partner.py`
- [x] `apps/hrm/models.py`
- [x] `apps/hrm/serializers.py`
- [x] `apps/hrm/views.py`
- [x] `apps/prescriptions/models.py`
- [x] `apps/prescriptions/serializers.py`
- [x] `apps/users/models.py`
- [x] `apps/users/serializers.py`
- [x] `apps/users/views.py`
- [x] `apps/tenants/models.py`
- [x] `apps/tenants/serializers.py`
- [x] `apps/tenants/views/paymant_views.py`
- [x] `apps/tenants/views/tenant_views.py`
- [x] `apps/crm/serializers/crm_serializers.py`
- [x] `apps/crm/serializers/partner.py`

## الملفات المتبقية للمراجعة
- [ ] `apps/users/serializers.py`
- [ ] `apps/users/views.py`
- [ ] `apps/sales/serializers/`
- [ ] `apps/sales/views/`
- [ ] `apps/crm/serializers/`
- [ ] `apps/crm/views/`
- [ ] `apps/hrm/serializers.py`
- [ ] `apps/hrm/views.py`
