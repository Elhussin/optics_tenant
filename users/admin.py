from django.contrib import admin
from .models import Employee ,Branch ,BranchUsers ,Customer
# Register your models here.
admin.site.register(Employee)
admin.site.register(Branch)
admin.site.register(BranchUsers)
admin.site.register(Customer)

