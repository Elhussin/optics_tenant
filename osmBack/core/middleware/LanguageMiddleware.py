"""
Middleware to automatically activate language from Accept-Language header
"""

from django.utils import translation


class AutoLanguageMiddleware:
    """
    Middleware to automatically activate language from Accept-Language header

    Reads the header and activates the appropriate language (ar/en)
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get language from header
        lang = request.META.get('HTTP_ACCEPT_LANGUAGE', 'ar')

        # Determine language (ar or en)
        if lang.startswith('en'):
            lang_code = 'en'
        else:
            lang_code = 'ar'

        # Activate language
        translation.activate(lang_code)
        request.LANGUAGE_CODE = lang_code

        # Process request
        response = self.get_response(request)

        # Deactivate language after completion
        translation.deactivate()

        return response
