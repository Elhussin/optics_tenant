from django.utils.timezone import now
from django.http import JsonResponse
from django.urls import reverse

class PlanValidationMiddleware:
    """
    يتحقق من صلاحية الخطة (نشطة / انتهت) لكل طلب Multi-Tenant
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        tenant = getattr(request, 'tenant', None)

        if tenant:
            # استثناء بعض المسارات (مثل الدفع أو تسجيل الدخول)
            exempt_paths = [
                reverse('payment:upgrade'),
                reverse('auth:login'),
                reverse('auth:logout')
            ]
            if any(request.path.startswith(path) for path in exempt_paths):
                return self.get_response(request)

            # تحقق من انتهاء الخطة
            if tenant.plan_expiry_date and tenant.plan_expiry_date < now().date():
                return JsonResponse({'error': 'Your subscription plan has expired.'}, status=403)

            # تحقق من حالة التفعيل
            if not tenant.is_active:
                return JsonResponse({'error': 'Your account is inactive.'}, status=403)

        return self.get_response(request)
