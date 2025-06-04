from django.db import models
from django.contrib.auth.models import User
from core.models import BaseModel


class Branch(BaseModel):
    BRANCH_CHOICES = [
        ('store', 'Store'),
        ('branch', 'Branch'),
    ]
    name = models.CharField(max_length=100)
    branch_code = models.CharField(max_length=10, unique=True)
    branch_type = models.CharField(max_length=10, choices=BRANCH_CHOICES)
    country = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    def __str__(self):
        return self.name


class BranchUsers(BaseModel):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.user} - {self.branch}"    


class Customer(models.Model):
    """عملاء المتجر"""
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    identification_number = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=200, blank=True)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Membership
    customer_since = models.DateTimeField(auto_now_add=True)
    is_vip = models.BooleanField(default=False)
    loyalty_points = models.IntegerField(default=0)
    
    # Marketing
    accepts_marketing = models.BooleanField(default=True)
    preferred_contact = models.CharField(max_length=10, choices=[
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('sms', 'SMS')
    ], default='email')
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Employee(BaseModel):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    hire_date = models.DateField()
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    

# إجراء لتحديث المخزون بعد البيع
# sqlDELIMITER //
# CREATE PROCEDURE UpdateStockAfterSale(
#     IN p_variant_id INT,
#     IN p_quantity INT,
#     IN p_sale_id INT
# )
# BEGIN
#     DECLARE current_stock INT;
    
#     -- التحقق من المخزون الحالي
#     SELECT stock_quantity INTO current_stock 
#     FROM Product_Variants 
#     WHERE variant_id = p_variant_id;
    
#     IF current_stock >= p_quantity THEN
#         -- تحديث المخزون
#         UPDATE Product_Variants 
#         SET stock_quantity = stock_quantity - p_quantity,
#             updated_at = NOW()
#         WHERE variant_id = p_variant_id;
        
#         -- إضافة حركة مخزون
#         INSERT INTO Stock_Movements (variant_id, movement_type, quantity, reference_type, reference_id)
#         VALUES (p_variant_id, 'إخراج', -p_quantity, 'مبيعات', p_sale_id);
#     ELSE
#         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'المخزون غير كافي';
#     END IF;
# END //
# DELIMITER ;