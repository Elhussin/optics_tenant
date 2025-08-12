from django.contrib import admin

# Register your models here.
from .models import AboutPage, BlogPage, CareersPage, ContactPage, FAQPage, PrivacyPage, SupportPage, TermsPage
admin.site.register(AboutPage)
admin.site.register(BlogPage)
admin.site.register(CareersPage)
admin.site.register(ContactPage)
admin.site.register(FAQPage)   
admin.site.register(PrivacyPage)
admin.site.register(SupportPage)
admin.site.register(TermsPage)
