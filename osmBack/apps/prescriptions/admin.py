from django.contrib import admin
from .models import PrescriptionRecord

# Register your models here.
class PrescriptionRecordAdmin(admin.ModelAdmin):
    list_display = ('customer', 'created_at', 'right_sphere', 'left_sphere', 'visual_acuity_right', 'visual_acuity_left')
    list_filter = ('customer', 'created_at')
    search_fields = ('customer__full_name', 'customer__email')

admin.site.register(PrescriptionRecord, PrescriptionRecordAdmin)
