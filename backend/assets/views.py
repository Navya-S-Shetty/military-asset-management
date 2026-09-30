from django.http import JsonResponse
from django.db.models import Q
from django.utils import timezone
from .models import (
    Base,
    EquipmentType,
    Inventory,
    Purchase,
    Transfer,
    Assignment,
    Expenditure,
    UserProfile,
    AuditLog
)
import json
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User


def create_audit_log(request, action, entity, entity_id=None, details=''):
    AuditLog.objects.create(
        user=request.user,
        action=action,
        entity=entity,
        entity_id=entity_id,
        details=details
    )



@csrf_exempt
def view_login(request):

    if request.method == 'POST':
        data = json.loads(request.body)

        username = data['username']
        password = data['password']

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            return JsonResponse(
                {'error': 'Invalid username or password'},
                status=401
            )

        login(request, user)

        role = get_user_role(request)

        return JsonResponse({
    'message': 'Login successful',
    'username': user.username,
    'role': role,
    'base_id': (
        user.userprofile.base.id
        if hasattr(user, 'userprofile') and user.userprofile.base
        else None
    )
})

    return JsonResponse(
        {'error': 'Only POST method is allowed'},
        status=405
    )


@csrf_exempt
def view_register(request):

    if request.method != 'POST':
        return JsonResponse(
            {'error': 'Method not allowed'},
            status=405
        )

    data = json.loads(request.body)

    username = data.get('username')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    role = data.get('role')
    base_id = data.get('base_id')

    if not username or not password or not confirm_password or not role:
        return JsonResponse(
            {'error': 'All required fields must be filled'},
            status=400
        )

    if password != confirm_password:
        return JsonResponse(
            {'error': 'Passwords do not match'},
            status=400
        )

    if User.objects.filter(username=username).exists():
        return JsonResponse(
            {'error': 'Username already exists'},
            status=400
        )

    if role not in ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']:
        return JsonResponse(
            {'error': 'Invalid role'},
            status=400
        )

    base = None

    if role == 'BASE_COMMANDER':
        if not base_id:
            return JsonResponse(
                {'error': 'Base is required for Base Commander'},
                status=400
            )

        try:
            base = Base.objects.get(id=base_id)
        except Base.DoesNotExist:
            return JsonResponse(
                {'error': 'Invalid base'},
                status=400
            )

    user = User(username=username)
    user.set_password(password)
    user.save()

    UserProfile.objects.create(
        user=user,
        role=role,
        base=base
    )

    return JsonResponse({
        'message': 'Registration successful',
        'username': user.username,
        'role': role,
        'base_id': base.id if base else None
    }, status=201)


@login_required
def view_bases(request):
    role = get_user_role(request)

    if role not in ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']:
        return JsonResponse(
            {'error': 'You do not have permission to access bases'},
            status=403
        )

    if role == 'BASE_COMMANDER':
        user_base = get_user_base(request)

        if user_base is None:
            return JsonResponse(
                {'error': 'No base assigned to this commander'},
                status=403
            )

        bases = Base.objects.all()

    else:
        bases = Base.objects.all()
    data = []

    for base in bases:
        data.append({
            'id': base.id,
            'name': base.name,
            'location': base.location
        })

    return JsonResponse(data, safe=False)

def view_registration_bases(request):

    if request.method != 'GET':
        return JsonResponse(
            {'error': 'Only GET method is allowed'},
            status=405
        )

    bases = Base.objects.all().order_by('name')

    data = []

    for base in bases:
        data.append({
            'id': base.id,
            'name': base.name,
            'location': base.location
        })

    return JsonResponse(data, safe=False)
    
@login_required
def view_equipment(request):
    role = get_user_role(request)

    if role not in ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']:
        return JsonResponse(
            {'error': 'You do not have permission to access equipment'},
            status=403
        )
    equipment = EquipmentType.objects.all()

    data = []

    for item in equipment:
        data.append({
            'id': item.id,
            'name': item.name,
            'category': item.category
        })

    return JsonResponse(data, safe=False)

@login_required
def view_inventory(request):
    role = get_user_role(request)

    if role not in ['ADMIN', 'BASE_COMMANDER']:        return JsonResponse(
            {'error': 'You do not have permission to access inventory'},
            status=403
        )
    inventory = Inventory.objects.all()

    if role == 'BASE_COMMANDER':
        user_base = get_user_base(request)

        if user_base is None:
            return JsonResponse(
                {'error': 'No base assigned to this commander'},
                status=403
        )

        inventory = inventory.filter(base=user_base)

    data = []

    for item in inventory:
        data.append({
            'id': item.id,
            'base': item.base.name,
            'equipment_type': item.equipment_type.name,
            'quantity': item.quantity,
            'updated_at': item.updated_at
        })

    return JsonResponse(data, safe=False)

@csrf_exempt
@login_required
def view_purchases(request):
    role = get_user_role(request)

    if role not in ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER']:
        return JsonResponse(
            {'error': 'You do not have permission to access purchases'},
            status=403
        )

    if request.method == 'GET':

        if role == 'BASE_COMMANDER':
            assigned_base = get_user_base(request)

            if assigned_base is None:
               return JsonResponse(
                    {'error': 'No base assigned to this commander'},
            status=403
        )

            purchases = Purchase.objects.filter(base=assigned_base)

        else:
            purchases = Purchase.objects.all()

        purchase_date = request.GET.get('purchase_date')
        equipment_type_id = request.GET.get('equipment_type_id')

        if purchase_date:
            purchases = purchases.filter(
                purchase_date=purchase_date
    )

        if equipment_type_id:
            purchases = purchases.filter(
                equipment_type_id=equipment_type_id
    )

        data = []

        for purchase in purchases:
            data.append({
                'id': purchase.id,
                'base': purchase.base.name,
                'equipment_type': purchase.equipment_type.name,
                'quantity': purchase.quantity,
                'purchase_date': purchase.purchase_date,
                'reference_number': purchase.reference_number,
            })

        return JsonResponse(data, safe=False)

    if request.method == 'POST':
        data = json.loads(request.body)

        if role == 'BASE_COMMANDER':
            base = get_user_base(request)

            if base is None:
                return JsonResponse(
                    {'error': 'No base assigned to this commander'},
                    status=403
                )

        else:
            base = Base.objects.get(id=data['base_id'])

        equipment = EquipmentType.objects.get(
            id=data['equipment_type_id']
        )

        purchase = Purchase.objects.create(
            base=base,
            equipment_type=equipment,
            quantity=data['quantity'],
            purchase_date=data['purchase_date'],
            reference_number=data['reference_number'],
            created_by=request.user if request.user.is_authenticated else None
        )

        create_audit_log(
            request,
            'PURCHASE',
            'Purchase',
            purchase.id,
            f'Purchased {purchase.quantity} units'
        )

        inventory, created = Inventory.objects.get_or_create(
            base=base,
            equipment_type=equipment
        )

        inventory.quantity += purchase.quantity
        inventory.save()

        return JsonResponse({
            'message': 'Purchase added successfully',
            'purchase_id': purchase.id,
            'new_inventory_quantity': inventory.quantity
        })

    return JsonResponse(
        {'error': 'Invalid request method'},
        status=405
    )


@csrf_exempt
@login_required
def view_transfers(request):
    role = get_user_role(request)

    if role not in ['ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER']:
        return JsonResponse(
            {'error': 'You do not have permission to access transfers'},
            status=403
        )

    if request.method == 'GET':
        if role == 'BASE_COMMANDER':
            assigned_base = get_user_base(request)

            transfers = Transfer.objects.filter(
                Q(source_base=assigned_base) |
                Q(destination_base=assigned_base)
            )
        else:
            transfers = Transfer.objects.all()
        
        data = []

        for transfer in transfers:
            data.append({
                'id': transfer.id,
                'source_base': transfer.source_base.name,
                'destination_base': transfer.destination_base.name,
                'equipment_type': transfer.equipment_type.name,
                'quantity': transfer.quantity,
                'transfer_date': transfer.transfer_date,
                'status': transfer.status,
            })

        return JsonResponse(data, safe=False)

    if request.method == 'POST':
        data = json.loads(request.body)

        if role == 'BASE_COMMANDER':
            assigned_base = get_user_base(request)

            if int(data['source_base_id']) != assigned_base.id:
                return JsonResponse(
                    {'error': 'You can only transfer assets from your assigned base'},
                    status=403
                )

            if int(data['destination_base_id']) == assigned_base.id:
                return JsonResponse(
                    {'error': 'Source and destination base cannot be the same'},
                    status=400
                )

        source_base = Base.objects.get(
            id=data['source_base_id']
        )

        destination_base = Base.objects.get(
            id=data['destination_base_id']
        )

        equipment = EquipmentType.objects.get(
            id=data['equipment_type_id']
        )

        source_inventory = Inventory.objects.get(
            base=source_base,
            equipment_type=equipment
        )

        quantity = int(data['quantity'])

        if source_inventory.quantity < quantity:
            return JsonResponse(
                {'error': 'Not enough inventory'},
                status=400
            )

        destination_inventory, created = Inventory.objects.get_or_create(
            base=destination_base,
            equipment_type=equipment
        )

        source_inventory.quantity -= quantity
        destination_inventory.quantity += quantity

        source_inventory.save()
        destination_inventory.save()

        transfer = Transfer.objects.create(
            source_base=source_base,
            destination_base=destination_base,
            equipment_type=equipment,
            quantity=quantity,
            transfer_date=data['transfer_date'],
            status='COMPLETED',
            created_by=request.user
        )

        create_audit_log(
            request,
            'TRANSFER',
            'Transfer',
            transfer.id,
            f'Transferred {transfer.quantity} units'
        )

        return JsonResponse({
            'message': 'Transfer completed successfully',
            'transfer_id': transfer.id,
            'source_quantity': source_inventory.quantity,
            'destination_quantity': destination_inventory.quantity
        })

@csrf_exempt
@login_required
def view_assignments(request):
    role = get_user_role(request)

    if role not in ['ADMIN', 'BASE_COMMANDER']:
        return JsonResponse(
            {'error': 'You do not have permission to access assignments'},
            status=403
        )

    if request.method == 'GET':

        if role == 'BASE_COMMANDER':
            user_base = get_user_base(request)

            if user_base is None:
                return JsonResponse(
                    {'error': 'No base assigned to this commander'},
                    status=403
                )

            assignments = Assignment.objects.filter(
                base=user_base
            )

        else:
            assignments = Assignment.objects.all()

        data = []

        for assignment in assignments:
            data.append({
                'id': assignment.id,
                'base': assignment.base.name,
                'equipment_type': assignment.equipment_type.name,
                'personnel_name': assignment.personnel_name,
                'quantity': assignment.quantity,
                'assigned_date': assignment.assigned_date,
                'status': assignment.status
            })

        return JsonResponse(data, safe=False)

    if request.method == 'POST':
        data = json.loads(request.body)

        base = Base.objects.get(id=data['base_id'])

        
        if role == 'BASE_COMMANDER':
            user_base = get_user_base(request)

            if user_base is None:
                return JsonResponse(
                    {'error': 'No base assigned to this commander'},
                    status=403
                )

            if base.id != user_base.id:
                return JsonResponse(
                    {'error': 'You can only assign assets from your assigned base'},
                    status=403
                )

        equipment = EquipmentType.objects.get(
            id=data['equipment_type_id']
        )

        quantity = int(data['quantity'])

        inventory = Inventory.objects.get(
            base=base,
            equipment_type=equipment
        )

        if inventory.quantity < quantity:
            return JsonResponse(
                {'error': 'Not enough inventory'},
                status=400
            )

        assignment = Assignment.objects.create(
            base=base,
            equipment_type=equipment,
            personnel_name=data['personnel_name'],
            quantity=quantity,
            assigned_date=data['assigned_date'],
            status='ACTIVE',
            created_by=request.user
        )

        create_audit_log(
            request,
            'ASSIGNMENT',
            'Assignment',
            assignment.id,
            f'Assigned {assignment.quantity} units'
        )

        inventory.quantity -= quantity
        inventory.save()

        return JsonResponse({
            'message': 'Asset assigned successfully',
            'assignment_id': assignment.id,
            'remaining_quantity': inventory.quantity
        })

    return JsonResponse(
        {'error': 'Method not allowed'},
        status=405
    )


@csrf_exempt
@login_required
def return_assignment(request, assignment_id):

    role = get_user_role(request)

    if role not in ['ADMIN', 'BASE_COMMANDER']:
        return JsonResponse(
            {'error': 'You do not have permission to return assignments'},
            status=403
        )

    if request.method != 'POST':
        return JsonResponse(
            {'error': 'Method not allowed'},
            status=405
        )

    try:
        assignment = Assignment.objects.get(id=assignment_id)
    except Assignment.DoesNotExist:
        return JsonResponse(
            {'error': 'Assignment not found'},
            status=404
        )

    if role == 'BASE_COMMANDER':
        user_base = get_user_base(request)

        if user_base is None:
            return JsonResponse(
                {'error': 'No base assigned to this commander'},
                status=403
            )

        if assignment.base.id != user_base.id:
            return JsonResponse(
                {'error': 'You can only return assignments from your assigned base'},
                status=403
            )

    
    if assignment.status == 'RETURNED':
        return JsonResponse(
            {'error': 'This assignment has already been returned'},
            status=400
        )

    inventory = Inventory.objects.get(
        base=assignment.base,
        equipment_type=assignment.equipment_type
    )

    inventory.quantity += assignment.quantity
    inventory.save()

    assignment.status = 'RETURNED'
    assignment.returned_date = timezone.now().date()
    assignment.save()

    create_audit_log(
        request,
        'ASSIGNMENT_RETURN',
        'Assignment',
        assignment.id,
        f'Returned {assignment.quantity} units'
    )

    return JsonResponse({
        'message': 'Asset returned successfully',
        'assignment_id': assignment.id,
        'returned_quantity': assignment.quantity,
        'new_inventory_quantity': inventory.quantity,
        'status': assignment.status,
        'returned_date': assignment.returned_date
    })

@csrf_exempt
@login_required
def view_expenditures(request):
    role = get_user_role(request)

    if role not in ['ADMIN', 'BASE_COMMANDER']:
        return JsonResponse(
            {'error': 'You do not have permission to access expenditures'},
            status=403
        )

    if request.method == 'GET':

        if role == 'BASE_COMMANDER':
            user_base = get_user_base(request)

            if user_base is None:
                return JsonResponse(
                    {'error': 'No base assigned to this commander'},
                    status=403
                )

            expenditures = Expenditure.objects.filter(
                base=user_base
            )

        else:
            expenditures = Expenditure.objects.all()

        data = []

        for expenditure in expenditures:
            data.append({
                'id': expenditure.id,
                'base': expenditure.base.name,
                'equipment_type': expenditure.equipment_type.name,
                'quantity': expenditure.quantity,
                'expenditure_date': expenditure.expenditure_date,
                'reason': expenditure.reason
            })

        return JsonResponse(data, safe=False)

    if request.method == 'POST':

        data = json.loads(request.body)

        base = Base.objects.get(id=data['base_id'])

        if role == 'BASE_COMMANDER':
            user_base = get_user_base(request)

            if user_base is None:
                return JsonResponse(
                    {'error': 'No base assigned to this commander'},
                    status=403
                )

            if base.id != user_base.id:
                return JsonResponse(
                    {'error': 'You can only record expenditures for your assigned base'},
                    status=403
                )

        equipment = EquipmentType.objects.get(
            id=data['equipment_type_id']
        )

        quantity = int(data['quantity'])

        inventory = Inventory.objects.get(
            base=base,
            equipment_type=equipment
        )

        if inventory.quantity < quantity:
            return JsonResponse(
                {'error': 'Not enough inventory'},
                status=400
            )

        expenditure = Expenditure.objects.create(
            base=base,
            equipment_type=equipment,
            quantity=quantity,
            expenditure_date=data['expenditure_date'],
            reason=data['reason'],
            created_by=request.user
        )

        create_audit_log(
            request,
            'EXPENDITURE',
            'Expenditure',
            expenditure.id,
            f'Expended {expenditure.quantity} units'
        )

        inventory.quantity -= quantity
        inventory.save()

        return JsonResponse({
            'message': 'Expenditure recorded successfully',
            'expenditure_id': expenditure.id,
            'remaining_quantity': inventory.quantity
        })

    return JsonResponse(
        {'error': 'Method not allowed'},
        status=405
    )

@login_required
def view_dashboard(request):
    role = get_user_role(request)

    if role not in ['ADMIN', 'BASE_COMMANDER']:
        return JsonResponse(
            {'error': 'You do not have permission to access dashboard'},
            status=403
        )
    base_id = request.GET.get('base_id')
    equipment_type_id = request.GET.get('equipment_type_id')
    date = request.GET.get('date')


    inventory = Inventory.objects.all()

    if role == 'BASE_COMMANDER':
        user_base = get_user_base(request)

        if user_base is None:
            return JsonResponse(
                {'error': 'No base assigned to this commander'},
            status=403
        )

        inventory = inventory.filter(base=user_base)

    elif base_id:
        inventory = inventory.filter(base_id=base_id)

    if equipment_type_id:
        inventory = inventory.filter(
            equipment_type_id=equipment_type_id
    )
    
    data = []

    for item in inventory:
        

        purchases = Purchase.objects.filter(
            base=item.base,
            equipment_type=item.equipment_type
        )

        transfers_in = Transfer.objects.filter(
            destination_base=item.base,
            equipment_type=item.equipment_type,
            status='COMPLETED'
        )

        transfers_out = Transfer.objects.filter(
            source_base=item.base,
            equipment_type=item.equipment_type,
            status='COMPLETED'
        )

        assignments = Assignment.objects.filter(
            base=item.base,
            equipment_type=item.equipment_type,
            status='ACTIVE'
        )

        expenditures = Expenditure.objects.filter(
            base=item.base,
            equipment_type=item.equipment_type
        )

        if date:
            purchases = purchases.filter(purchase_date=date)
            transfers_in = transfers_in.filter(transfer_date=date)
            transfers_out = transfers_out.filter(transfer_date=date)
            assignments = assignments.filter(assigned_date=date)
            expenditures = expenditures.filter(expenditure_date=date)

        if date and not (
            purchases.exists()
            or transfers_in.exists()
            or transfers_out.exists()
            or assignments.exists()
            or expenditures.exists()
        ):
            continue

        total_purchases = sum(
            purchase.quantity for purchase in purchases
        )

        total_transfers_in = sum(
            transfer.quantity for transfer in transfers_in
        )

        total_transfers_out = sum(
            transfer.quantity for transfer in transfers_out
        )

        print("PURCHASES:", total_purchases)
        print("TRANSFERS IN:", total_transfers_in)
        print("TRANSFERS OUT:", total_transfers_out)

        total_assigned = sum(
            assignment.quantity for assignment in assignments
        )

        total_expended = sum(
            expenditure.quantity for expenditure in expenditures
        )

        net_movement = (
            total_purchases
            + total_transfers_in
            - total_transfers_out
        )

        opening_balance = (
            item.quantity
            - net_movement
            + total_assigned
            + total_expended
        )

        latest_dates = []

        latest_purchase = purchases.order_by('-purchase_date').first()
        if latest_purchase:
            latest_dates.append(latest_purchase.purchase_date)

        latest_transfer_in = transfers_in.order_by('-transfer_date').first()
        if latest_transfer_in:
            latest_dates.append(latest_transfer_in.transfer_date)

        latest_transfer_out = transfers_out.order_by('-transfer_date').first()
        if latest_transfer_out:
            latest_dates.append(latest_transfer_out.transfer_date)

        latest_assignment = assignments.order_by('-assigned_date').first()
        if latest_assignment:
            latest_dates.append(latest_assignment.assigned_date)

        latest_expenditure = expenditures.order_by('-expenditure_date').first()
        if latest_expenditure:
            latest_dates.append(latest_expenditure.expenditure_date)

        latest_date = max(latest_dates) if latest_dates else "No Activity"
        data.append({
            'date': latest_date,
            'base': item.base.name,
            'equipment_type': item.equipment_type.name,
            'opening_balance': opening_balance,
            'closing_balance': item.quantity,
            'net_movement': net_movement,
            'assigned': total_assigned,
            'expended': total_expended,
            'purchases': total_purchases,
            'transfer_in': total_transfers_in,
            'transfer_out': total_transfers_out,
        })

    return JsonResponse(data, safe=False)

def get_user_role(request):

    if not request.user.is_authenticated:
        return None

    try:
        profile = UserProfile.objects.get(
            user=request.user
        )
        return profile.role

    except UserProfile.DoesNotExist:
        return None

def get_user_base(request):
    if not request.user.is_authenticated:
        return None

    try:
        profile = UserProfile.objects.get(user=request.user)
        return profile.base
    except UserProfile.DoesNotExist:
        return None

@login_required
def view_audit_logs(request):
    role = get_user_role(request)

    if role != 'ADMIN':
        return JsonResponse(
            {'error': 'You do not have permission to view audit logs'},
            status=403
        )

    if request.method != 'GET':
        return JsonResponse(
            {'error': 'Method not allowed'},
            status=405
        )

    logs = AuditLog.objects.all().order_by('-timestamp')

    data = []

    for log in logs:
        data.append({
            'id': log.id,
            'user': log.user.username if log.user else None,
            'action': log.action,
            'entity': log.entity,
            'entity_id': log.entity_id,
            'timestamp': log.timestamp,
            'details': log.details
        })

    return JsonResponse(data, safe=False)