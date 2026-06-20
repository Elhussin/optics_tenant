from django.contrib import admin
from .models import Page, PageContent, ContactUs

@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ['slug', 'author', 'is_published']

@admin.register(PageContent)
class PageContentAdmin(admin.ModelAdmin):
    list_display = ['page', 'language', 'title']

@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone']
