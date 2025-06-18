# core/permissions/roles.py
from enum import Enum

class Role(Enum):
    ADMIN = 'admin'
    BRANCH_MANAGER = 'branch_manager'
    TECHNICIAN = 'technician'
    SALESPERSON = 'salesperson'
    ACCOUNTANT = 'accountant'
    INVENTORY_MANAGER = 'inventory_manager'
    RECEPTIONIST = 'receptionist'
    CRM = 'crm'
