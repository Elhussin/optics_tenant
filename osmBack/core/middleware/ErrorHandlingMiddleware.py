"""
Middleware لمعالجة الأخطاء غير المتوقعة
"""

import logging
from django.http import JsonResponse
from django.core.exceptions import PermissionDenied
from django.http import Http404

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware:
    """
    Middleware لمعالجة الأخطاء التي تحدث خارج DRF
    مثل أخطاء الـ routing، CSRF، إلخ
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        """معالجة الأخطاء غير المتوقعة"""

        # الحصول على اللغة
        lang = request.headers.get('Accept-Language', 'ar')
        lang = 'en' if lang.startswith('en') else 'ar'

        # معالجة 404
        if isinstance(exception, Http404):
            message = 'الصفحة المطلوبة غير موجودة.' if lang == 'ar' else 'Page not found.'
            return JsonResponse({
                'detail': message,
                'error_type': 'not_found',
                'status_code': 404
            }, status=404)

        # معالجة PermissionDenied
        if isinstance(exception, PermissionDenied):
            message = 'ليس لديك صلاحية للوصول لهذه الصفحة.' if lang == 'ar' else 'Permission denied.'
            return JsonResponse({
                'detail': message,
                'error_type': 'permission_denied',
                'status_code': 403
            }, status=403)

        # تسجيل الأخطاء غير المتوقعة
        logger.error(f"Unhandled exception: {exception}", exc_info=True)

        # إرجاع None للسماح للـ exception handlers الأخرى بالمعالجة
        return None
