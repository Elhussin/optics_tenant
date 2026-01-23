"""
دوال مساعدة للتحقق من صحة البيانات
"""

from core.exceptions import validate_unique_field


def check_unique_field(model, field_name, value, instance=None, lang='ar'):
    """
    التحقق من تفرد حقل معين
    
    هذه الدالة هي wrapper لـ validate_unique_field من core.exceptions
    للحفاظ على التوافق مع الكود القديم
    
    Args:
        model: النموذج المراد التحقق منه
        field_name: اسم الحقل
        value: القيمة المراد التحقق منها
        instance: الكائن الحالي (للتحديث)
        lang: اللغة (ar/en)
    
    Returns:
        value: القيمة إذا كانت فريدة
    
    Raises:
        ValidationError: إذا كانت القيمة مكررة
    """
    return validate_unique_field(model, field_name, value, instance, lang)
