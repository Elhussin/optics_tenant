def get_variant_stock_summary(variant):
    """Get stock summary across all branches for a variant"""
    if hasattr(variant, 'branch_inventories'):
        inventories = variant.branch_inventories.select_related('branch')
        
        summary = {
            'total_stock': 0,
            'total_available': 0,
            'total_reserved': 0,
            'branches': [],
            'low_stock_branches': [],
            'out_of_stock_branches': [],
        }
        
        for inventory in inventories:
            summary['total_stock'] += inventory.quantity_in_stock
            summary['total_available'] += inventory.available_quantity
            summary['total_reserved'] += inventory.reserved_quantity
            
            branch_data = {
                'branch': inventory.branch,
                'stock': inventory.quantity_in_stock,
                'available': inventory.available_quantity,
                'reserved': inventory.reserved_quantity,
                'status': inventory.stock_status,
            }
            summary['branches'].append(branch_data)
            
            if inventory.needs_reorder:
                summary['low_stock_branches'].append(inventory.branch)
            
            if inventory.is_out_of_stock:
                summary['out_of_stock_branches'].append(inventory.branch)
        
        return summary
    
    return None


def find_nearest_branch_with_stock(variant, user_location=None, min_quantity=1):
    """Find nearest branch with stock (simplified version)"""
    available_inventories = BranchInventory.objects.get_available_branches(
        variant, min_quantity
    )
    
    # If no user location provided, return any available branch
    if not user_location or not available_inventories.exists():
        return available_inventories.first()
    
    # Here you would implement actual location-based logic
    # For now, return the first available branch
    return available_inventories.first()


def can_fulfill_order_across_branches(items_dict):
    """
    Check if order can be fulfilled across branches
    items_dict: {variant: quantity, ...}
    """
    fulfillment_plan = {}
    
    for variant, needed_quantity in items_dict.items():
        available_inventories = BranchInventory.objects.get_available_branches(variant)
        
        remaining_quantity = needed_quantity
        variant_plan = []
        
        for inventory in available_inventories:
            if remaining_quantity <= 0:
                break
                
            available = inventory.available_quantity
            if available > 0:
                take_quantity = min(remaining_quantity, available)
                variant_plan.append({
                    'branch': inventory.branch,
                    'quantity': take_quantity,
                    'inventory': inventory
                })
                remaining_quantity -= take_quantity
        
        if remaining_quantity > 0:
            # Cannot fulfill this item completely
            return None
        
        fulfillment_plan[variant] = variant_plan
    
    return fulfillment_plan