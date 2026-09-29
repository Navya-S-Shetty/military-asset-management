from django.conf import settings
from django.db import models


class Base(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class EquipmentType(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Inventory(models.Model):
    base = models.ForeignKey(Base, on_delete=models.CASCADE)
    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['base', 'equipment_type'],
                name='unique_base_equipment'
            )
        ]

    def __str__(self):
        return f"{self.base} - {self.equipment_type}"


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('BASE_COMMANDER', 'Base Commander'),
        ('LOGISTICS_OFFICER', 'Logistics Officer'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES
    )
    base = models.ForeignKey(
        Base,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class Purchase(models.Model):
    base = models.ForeignKey(Base, on_delete=models.CASCADE)
    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField()
    purchase_date = models.DateField()
    reference_number = models.CharField(
        max_length=100,
        blank=True
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Purchase - {self.equipment_type} ({self.quantity})"


class Transfer(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    source_base = models.ForeignKey(
        Base,
        on_delete=models.CASCADE,
        related_name='outgoing_transfers'
    )
    destination_base = models.ForeignKey(
        Base,
        on_delete=models.CASCADE,
        related_name='incoming_transfers'
    )
    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField()
    transfer_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"{self.source_base} → "
            f"{self.destination_base} - "
            f"{self.equipment_type}"
        )


class Assignment(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('RETURNED', 'Returned'),
    ]

    base = models.ForeignKey(Base, on_delete=models.CASCADE)
    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.CASCADE
    )
    personnel_name = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField()
    assigned_date = models.DateField()
    returned_date = models.DateField(
        null=True,
        blank=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    def __str__(self):
        return f"{self.personnel_name} - {self.equipment_type}"


class Expenditure(models.Model):
    base = models.ForeignKey(Base, on_delete=models.CASCADE)
    equipment_type = models.ForeignKey(
        EquipmentType,
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField()
    expenditure_date = models.DateField()
    reason = models.CharField(max_length=255)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Expenditure - {self.equipment_type} ({self.quantity})"


class AuditLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    action = models.CharField(max_length=100)
    entity = models.CharField(max_length=100)
    entity_id = models.PositiveIntegerField(
        null=True,
        blank=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True)

    def __str__(self):
        return f"{self.action} - {self.timestamp}"