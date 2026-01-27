# core/caching.py
"""
Caching system for frequently accessed data
"""

from django.core.cache import cache
from django.conf import settings
from functools import wraps
import hashlib
import json
import logging

logger = logging.getLogger(__name__)

# Default cache duration (in seconds)
DEFAULT_CACHE_TTL = 60 * 5  # 5 minutes
LONG_CACHE_TTL = 60 * 60    # 1 hour
SHORT_CACHE_TTL = 60 * 1    # 1 minute


def generate_cache_key(*args, prefix='cache'):
    """Generate a unique cache key"""
    key_parts = [str(arg) for arg in args]
    key_string = ':'.join(key_parts)
    hash_part = hashlib.md5(key_string.encode()).hexdigest()[:12]
    return f"{prefix}:{hash_part}"


def cache_result(ttl=DEFAULT_CACHE_TTL, prefix='func'):
    """
    Decorator to cache function results

    Usage:
        @cache_result(ttl=300, prefix='products')
        def get_products(category_id):
            return Product.objects.filter(category_id=category_id)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate unique key
            cache_key = generate_cache_key(
                func.__name__, *args, *kwargs.values(),
                prefix=prefix
            )

            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                logger.debug(f"Cache HIT: {cache_key}")
                return result

            # Execute function
            logger.debug(f"Cache MISS: {cache_key}")
            result = func(*args, **kwargs)

            # Store result
            cache.set(cache_key, result, ttl)
            return result

        # Add invalidation function
        def invalidate(*args, **kwargs):
            cache_key = generate_cache_key(
                func.__name__, *args, *kwargs.values(),
                prefix=prefix
            )
            cache.delete(cache_key)
            logger.debug(f"Cache INVALIDATED: {cache_key}")

        wrapper.invalidate = invalidate
        return wrapper
    return decorator


class CacheManager:
    """
    Central Cache Manager
    """

    # Common cache keys
    KEYS = {
        'product_list': 'products:list:{branch_id}',
        'product_detail': 'products:detail:{product_id}',
        'product_choices': 'products:choices',
        'customer_detail': 'customers:detail:{customer_id}',
        'dashboard_stats': 'dashboard:stats:{branch_id}',
        'reports_summary': 'reports:summary:{period}',
        'chart_of_accounts': 'accounting:coa',
        'order_choices': 'orders:choices',
        'branch_list': 'branches:list',
    }

    @classmethod
    def get_key(cls, key_name, **kwargs):
        """Get cache key"""
        template = cls.KEYS.get(key_name)
        if not template:
            return key_name
        return template.format(**kwargs)

    @classmethod
    def get(cls, key_name, default=None, **kwargs):
        """Get from cache"""
        key = cls.get_key(key_name, **kwargs)
        return cache.get(key, default)

    @classmethod
    def set(cls, key_name, value, ttl=DEFAULT_CACHE_TTL, **kwargs):
        """Set in cache"""
        key = cls.get_key(key_name, **kwargs)
        cache.set(key, value, ttl)
        logger.debug(f"Cache SET: {key}")

    @classmethod
    def delete(cls, key_name, **kwargs):
        """Delete from cache"""
        key = cls.get_key(key_name, **kwargs)
        cache.delete(key)
        logger.debug(f"Cache DELETE: {key}")

    @classmethod
    def delete_pattern(cls, pattern):
        """Delete by pattern"""
        try:
            # Works with Redis
            keys = cache.keys(pattern)
            for key in keys:
                cache.delete(key)
            logger.debug(f"Cache DELETE PATTERN: {pattern} ({len(keys)} keys)")
        except AttributeError:
            # Fallback for standard cache
            logger.warning(
                "delete_pattern is not supported on this cache backend")

    @classmethod
    def clear_all(cls):
        """Clear all cache"""
        cache.clear()
        logger.info("Cache CLEARED")


# ═══════════════════════════════════════════════════════════════════════════════
# Common Data Cache Functions
# ═══════════════════════════════════════════════════════════════════════════════

@cache_result(ttl=LONG_CACHE_TTL, prefix='choices')
def get_cached_order_choices():
    """Order choices (rarely change)"""
    from apps.sales.models import Order
    return {
        'order_type': Order.ORDER_TYPE_CHOICES,
        'payment_method': Order.PAYMENT_METHOD_CHOICES,
        'status': Order.STATUS_CHOICES,
        'payment_status': Order.PAYMENT_STATUS_CHOICES,
    }


@cache_result(ttl=LONG_CACHE_TTL, prefix='choices')
def get_cached_chart_of_accounts(account_type=None):
    """Chart of Accounts"""
    from apps.accounting.models import ChartOfAccounts

    queryset = ChartOfAccounts.objects.filter(
        is_active=True, is_header=False
    ).values('id', 'code', 'name', 'account_type')

    if account_type:
        queryset = queryset.filter(account_type=account_type)

    return list(queryset)


@cache_result(ttl=SHORT_CACHE_TTL, prefix='dashboard')
def get_cached_dashboard_stats(branch_id=None):
    """Dashboard Statistics"""
    from django.db.models import Sum, Count
    from django.utils import timezone
    from apps.sales.models import Order

    today = timezone.now().date()

    filters = {'created_at__date': today}
    if branch_id:
        filters['branch_id'] = branch_id

    orders = Order.objects.filter(**filters)

    return {
        'today_orders': orders.count(),
        'today_sales': float(orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0),
        'pending_orders': orders.filter(status='pending').count(),
    }


@cache_result(ttl=DEFAULT_CACHE_TTL, prefix='products')
def get_cached_product_variants(branch_id=None, category_id=None, limit=100):
    """List of available products"""
    from apps.products.models import ProductVariant, Stock

    variants = ProductVariant.objects.filter(
        is_active=True
    ).select_related('product').values(
        'id', 'sku', 'price', 'product__name', 'product__brand__name'
    )[:limit]

    return list(variants)


# ═══════════════════════════════════════════════════════════════════════════════
# Cache Middleware
# ═══════════════════════════════════════════════════════════════════════════════

class CacheMiddleware:
    """
    Middleware to cache requests
    """

    # Paths to be cached
    CACHEABLE_PATHS = [
        '/api/sales/orders/choices/',
        '/api/products/categories/',
        '/api/branches/',
    ]

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only GET requests
        if request.method != 'GET':
            return self.get_response(request)

        # Check path
        path = request.path_info
        if not any(path.startswith(p) for p in self.CACHEABLE_PATHS):
            return self.get_response(request)

        # Generate cache key
        cache_key = generate_cache_key(
            path, request.GET.urlencode(),
            prefix='http'
        )

        # Try to get from cache
        cached_response = cache.get(cache_key)
        if cached_response:
            return cached_response

        # Execute request
        response = self.get_response(request)

        # Store successful response
        if response.status_code == 200:
            cache.set(cache_key, response, DEFAULT_CACHE_TTL)

        return response


# ═══════════════════════════════════════════════════════════════════════════════
# Redis Cache Settings (for settings.py)
# ═══════════════════════════════════════════════════════════════════════════════

"""
# Add to settings.py for Redis usage:

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SERIALIZER': 'django_redis.serializers.json.JSONSerializer',
        },
        'KEY_PREFIX': 'optics',
        'TIMEOUT': 300,  # 5 minutes default
    }
}

# For development, you can use LocMem:
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
"""
