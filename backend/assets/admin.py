from django.contrib import admin

from .models import (
    Base,
    EquipmentType,
    Inventory,
    UserProfile,
    Purchase,
    Transfer,
    Assignment,
    Expenditure,
    AuditLog,
)


admin.site.register(Base)
admin.site.register(EquipmentType)
admin.site.register(Inventory)
admin.site.register(UserProfile)
admin.site.register(Purchase)
admin.site.register(Transfer)
admin.site.register(Assignment)
admin.site.register(Expenditure)
admin.site.register(AuditLog)