"""
Middleware لتفعيل اللغة تلقائياً من Accept-Language header
"""

from django.utils import translation


class AutoLanguageMiddleware:
    """
    Middleware لتفعيل اللغة تلقائياً من Accept-Language header

    يقرأ الـ header ويفعّل اللغة المناسبة (ar/en)
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # الحصول على اللغة من الـ header
        lang = request.META.get('HTTP_ACCEPT_LANGUAGE', 'ar')

        # تحديد اللغة (ar أو en)
        if lang.startswith('en'):
            lang_code = 'en'
        else:
            lang_code = 'ar'

        # تفعيل اللغة
        translation.activate(lang_code)
        request.LANGUAGE_CODE = lang_code

        # معالجة الـ request
        response = self.get_response(request)

        # إلغاء تفعيل اللغة بعد الانتهاء
        translation.deactivate()

        return response
