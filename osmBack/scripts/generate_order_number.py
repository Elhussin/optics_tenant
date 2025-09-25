def generate_order_number():
    """generate unique order number"""
    import datetime
    today = datetime.date.today()
    # format: ORD-YYYYMMDD-XXXX
    prefix = f"ORD-{today.strftime('%Y%m%d')}"
    
    # search for the last order number for today
    last_order = "ORD-20250614-1000"
    # Order.objects.filter(
    #     order_number__startswith=prefix
    # ).order_by('-created_at').first()
    
    if last_order:
        # extract the serial number and increment it
        last_number = int(last_order.split('-')[-1])
        next_number = last_number + 1
    else:
        next_number = 1
    print(f"{prefix}-{next_number:04d}")
    # return f"{prefix}-{next_number:04d}"



generate_order_number()
