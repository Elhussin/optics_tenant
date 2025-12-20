# RoleOrPermissionRequired

RoleOrPermissionRequired

## How to use it
```python   

from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired

class DashboardView(APIView):
    permission_classes = [
        # المستخدم يجب أن يكون مسجلاً للدخول أولاً1. الاستخدام المباشر (Direct Instantiation)
        # وهي الطريقة الكلاسيكية عند تعريف permission_classes.
        
        # مثال: السماح لمن لديه دور "Manager" أو لديه صلاحية "view_dashboard"
        IsAuthenticated, 
        # ثم نطبق صلاحياتنا الخاصة
        RoleOrPermissionRequired(
            allowed_roles=["manager"],
            required_permissions=["view_dashboard"],
            require_all=False  # يكفي تحقق شرط واحد (إما الدور أو الصلاحية)
        )
    ]
    # ... your code ...


class PrescriptionViewSet(viewsets.ModelViewSet):
    permission_classes = [
        IsAuthenticated,
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=["pharmacist"], 
            required_permissions=["create_prescription"],
            super_roles=["admin", "owner"] # هؤلاء يدخلون دائماً
        )
    ]

class SensitiveDataView(APIView):
    permission_classes = [
        RoleOrPermissionRequired.with_requirements(
            required_permissions=["delete_data", "export_data"],
            require_all=True  # 👈 يجب أن يمتلك الصلاحيتين معاً
        )
    ]

class SystemSettingsView(APIView):
    permission_classes = [
        RoleOrPermissionRequired.with_requirements(
            allowed_roles=[], # لا أدوار عادية مسموحة
            required_permissions=[], # لا صلاحيات مسموحة
            super_roles=["admin", "owner"] # فقط هؤلاء
        )
    ]
```