from decimal import Decimal
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
from apps.sales.models import Order

class SalesForecastingService:
    @staticmethod
    def forecast_branch_sales(branch_id, days_ahead=30):
        """
        Predicts future sales volume and value for a branch based on
        historical order records using moving averages.
        """
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=90)

        # Retrieve order totals for the branch in the last 90 days
        filters = {
            'status': 'confirmed',
            'created_at__date__range': (start_date, end_date)
        }
        if branch_id:
            filters['branch_id'] = branch_id

        historical_orders = Order.objects.filter(**filters)
        total_historical_sales = historical_orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
        orders_count = historical_orders.count()

        # Calculate daily averages
        daily_average_sales = total_historical_sales / Decimal('90')
        daily_average_orders = Decimal(str(orders_count)) / Decimal('90')

        # Project future stats
        projected_sales = daily_average_sales * Decimal(str(days_ahead))
        projected_orders = daily_average_orders * Decimal(str(days_ahead))

        return {
            'branch_id': branch_id,
            'days_projected': days_ahead,
            'historical_days_analyzed': 90,
            'daily_average_sales': str(daily_average_sales.quantize(Decimal('0.01'))),
            'daily_average_orders': float(daily_average_orders),
            'projected_total_sales': str(projected_sales.quantize(Decimal('0.01'))),
            'projected_orders_count': int(projected_orders),
            'confidence_index': 'high' if orders_count >= 10 else 'low'
        }
