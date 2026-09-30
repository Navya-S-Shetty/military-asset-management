from django.urls import path
from .views import (
    view_bases,
    view_registration_bases,
    view_equipment,
    view_inventory,
    view_purchases,
    view_transfers,
    view_assignments,
    view_expenditures,
    view_dashboard,
    view_login,
    return_assignment,
    view_audit_logs,
    view_register
)


urlpatterns = [
    path('bases/', view_bases),
    path('registration-bases/', view_registration_bases),
    path('equipment/', view_equipment),
    path('inventory/', view_inventory),
    path('purchases/', view_purchases),
    path('transfers/', view_transfers),
    path('assignments/', view_assignments),
    path('expenditures/', view_expenditures),
    path('dashboard/', view_dashboard),
    path('login/', view_login, name='login'),
    path('register/', view_register),
    path(
    'assignments/<int:assignment_id>/return/',
    return_assignment
),
    path('audit-logs/', view_audit_logs),
]