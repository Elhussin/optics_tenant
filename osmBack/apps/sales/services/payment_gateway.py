# apps/sales/services/payment_gateway.py
"""
Payment Gateway Services - Tabby, Tamara, etc.
"""

from abc import ABC, abstractmethod
from decimal import Decimal
from django.utils.translation import gettext_lazy as _
from typing import Dict, Any, Optional, List
from django.conf import settings
import requests
import logging

logger = logging.getLogger(__name__)


class PaymentGatewayException(Exception):
    """Payment Gateway Error"""
    pass


class BasePaymentGateway(ABC):
    """
    Base class for payment gateways
    """

    @abstractmethod
    def create_session(self, order_data: Dict) -> Dict:
        """Create payment session"""
        pass

    @abstractmethod
    def capture_payment(self, payment_id: str) -> Dict:
        """Capture payment"""
        pass

    @abstractmethod
    def refund_payment(self, payment_id: str, amount: Decimal = None) -> Dict:
        """Refund payment"""
        pass

    @abstractmethod
    def get_payment_status(self, payment_id: str) -> Dict:
        """Get payment status"""
        pass


class TabbyGateway(BasePaymentGateway):
    """
    Tabby Installment Gateway
    https://docs.tabby.ai/
    """

    def __init__(self):
        self.api_key = getattr(settings, 'TABBY_API_KEY', '')
        self.secret_key = getattr(settings, 'TABBY_SECRET_KEY', '')
        self.merchant_code = getattr(settings, 'TABBY_MERCHANT_CODE', '')
        self.base_url = getattr(settings, 'TABBY_API_URL',
                                'https://api.tabby.ai/api/v2')
        self.is_sandbox = getattr(settings, 'TABBY_SANDBOX', True)

        if self.is_sandbox:
            self.base_url = 'https://api.tabby.ai/api/v2'

    def _get_headers(self) -> Dict:
        return {
            'Authorization': f'Bearer {self.secret_key}',
            'Content-Type': 'application/json',
        }

    def create_session(self, order_data: Dict) -> Dict:
        """
        Create Tabby payment session

        order_data must contain:
        - order_id: Order ID
        - amount: Total amount
        - currency: Currency (SAR)
        - customer: {email, phone, first_name, last_name}
        - items: [{name, quantity, unit_price, category}]
        - success_url: Success URL
        - cancel_url: Cancel URL
        - failure_url: Failure URL
        """
        payload = {
            "payment": {
                "amount": str(order_data['amount']),
                "currency": order_data.get('currency', 'SAR'),
                "buyer": {
                    "email": order_data['customer']['email'],
                    "phone": order_data['customer']['phone'],
                    "name": f"{order_data['customer']['first_name']} {order_data['customer']['last_name']}",
                },
                "order": {
                    "reference_id": order_data['order_id'],
                    "items": [
                        {
                            "title": item['name'],
                            "quantity": item['quantity'],
                            "unit_price": str(item['unit_price']),
                            "category": item.get('category', 'eyewear'),
                        }
                        for item in order_data.get('items', [])
                    ],
                },
            },
            "lang": order_data.get('lang', 'ar'),
            "merchant_code": self.merchant_code,
            "merchant_urls": {
                "success": order_data['success_url'],
                "cancel": order_data['cancel_url'],
                "failure": order_data['failure_url'],
            },
        }

        try:
            response = requests.post(
                f"{self.base_url}/checkout",
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            return {
                'success': True,
                'session_id': data.get('id'),
                'checkout_url': data.get('configuration', {}).get('available_products', {}).get('installments', [{}])[0].get('web_url'),
                'payment_id': data.get('payment', {}).get('id'),
                'installments': data.get('configuration', {}).get('available_products', {}).get('installments', []),
                'raw_response': data,
            }
        except requests.RequestException as e:
            logger.error(f"Tabby create_session error: {e}")
            raise PaymentGatewayException(
                str(_("Failed to create Tabby session: {0}").format(e)))

    def capture_payment(self, payment_id: str) -> Dict:
        """Capture payment after confirmation"""
        try:
            response = requests.post(
                f"{self.base_url}/payments/{payment_id}/captures",
                json={"amount": None},  # Capture full amount
                headers=self._get_headers(),
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            return {
                'success': True,
                'captured_amount': data.get('amount'),
                'status': data.get('status'),
                'raw_response': data,
            }
        except requests.RequestException as e:
            logger.error(f"Tabby capture_payment error: {e}")
            raise PaymentGatewayException(
                str(_("Failed to capture Tabby payment: {0}").format(e)))

    def refund_payment(self, payment_id: str, amount: Decimal = None) -> Dict:
        """Refund payment"""
        payload = {}
        if amount:
            payload['amount'] = str(amount)

        try:
            response = requests.post(
                f"{self.base_url}/payments/{payment_id}/refunds",
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            return {
                'success': True,
                'refund_id': data.get('id'),
                'refunded_amount': data.get('amount'),
                'status': data.get('status'),
                'raw_response': data,
            }
        except requests.RequestException as e:
            logger.error(f"Tabby refund_payment error: {e}")
            raise PaymentGatewayException(
                str(_("Failed to refund Tabby payment: {0}").format(e)))

    def get_payment_status(self, payment_id: str) -> Dict:
        """Get payment status"""
        try:
            response = requests.get(
                f"{self.base_url}/payments/{payment_id}",
                headers=self._get_headers(),
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            return {
                'success': True,
                'status': data.get('status'),
                'amount': data.get('amount'),
                'captured_amount': data.get('captured_amount'),
                'raw_response': data,
            }
        except requests.RequestException as e:
            logger.error(f"Tabby get_payment_status error: {e}")
            raise PaymentGatewayException(
                str(_("Failed to get Tabby payment status: {0}").format(e)))


class TamaraGateway(BasePaymentGateway):
    """
    Tamara Installment Gateway
    https://docs.tamara.co/
    """

    def __init__(self):
        self.api_token = getattr(settings, 'TAMARA_API_TOKEN', '')
        self.notification_token = getattr(
            settings, 'TAMARA_NOTIFICATION_TOKEN', '')
        self.base_url = getattr(
            settings, 'TAMARA_API_URL', 'https://api.tamara.co')
        self.is_sandbox = getattr(settings, 'TAMARA_SANDBOX', True)

        if self.is_sandbox:
            self.base_url = 'https://api-sandbox.tamara.co'

    def _get_headers(self) -> Dict:
        return {
            'Authorization': f'Bearer {self.api_token}',
            'Content-Type': 'application/json',
        }

    def create_session(self, order_data: Dict) -> Dict:
        """
        Create Tamara payment session
        """
        payload = {
            "order_reference_id": order_data['order_id'],
            "total_amount": {
                "amount": str(order_data['amount']),
                "currency": order_data.get('currency', 'SAR'),
            },
            "description": order_data.get('description', 'طلب نظارات'),
            "country_code": order_data.get('country_code', 'SA'),
            "payment_type": "PAY_BY_INSTALMENTS",
            "instalments": order_data.get('installments_count', 3),
            "locale": order_data.get('lang', 'ar_SA'),
            "items": [
                {
                    "reference_id": str(item.get('id', i)),
                    "type": "physical",
                    "name": item['name'],
                    "quantity": item['quantity'],
                    "total_amount": {
                        "amount": str(item['unit_price'] * item['quantity']),
                        "currency": order_data.get('currency', 'SAR'),
                    },
                }
                for i, item in enumerate(order_data.get('items', []))
            ],
            "consumer": {
                "email": order_data['customer']['email'],
                "first_name": order_data['customer']['first_name'],
                "last_name": order_data['customer']['last_name'],
                "phone_number": order_data['customer']['phone'],
            },
            "merchant_url": {
                "success": order_data['success_url'],
                "failure": order_data['failure_url'],
                "cancel": order_data['cancel_url'],
                "notification": order_data.get('webhook_url', ''),
            },
        }

        # إضافة العنوان إذا متوفر
        if order_data.get('shipping_address'):
            payload['shipping_address'] = order_data['shipping_address']

        try:
            response = requests.post(
                f"{self.base_url}/checkout",
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            return {
                'success': True,
                'order_id': data.get('order_id'),
                'checkout_id': data.get('checkout_id'),
                'checkout_url': data.get('checkout_url'),
                'raw_response': data,
            }
        except requests.RequestException as e:
            logger.error(f"Tamara create_session error: {e}")
            raise PaymentGatewayException(
                str(_("Failed to create Tamara session: {0}").format(e)))

    def capture_payment(self, order_id: str) -> Dict:
        """Capture order after shipping"""
        payload = {
            "order_id": order_id,
            "total_amount": {
                "amount": "0",  # Will be calculated automatically
                "currency": "SAR",
            },
        }

        try:
            response = requests.post(
                f"{self.base_url}/orders/{order_id}/capture",
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            return {
                'success': True,
                'capture_id': data.get('capture_id'),
                'captured_amount': data.get('captured_amount'),
                'raw_response': data,
            }
        except requests.RequestException as e:
            logger.error(f"Tamara capture_payment error: {e}")
            raise PaymentGatewayException(
                str(_("Failed to capture Tamara order: {0}").format(e)))

    def refund_payment(self, order_id: str, amount: Decimal = None) -> Dict:
        """Refund order"""
        payload = {
            "comment": "Customer refund request",
        }
        if amount:
            payload['total_amount'] = {
                "amount": str(amount),
                "currency": "SAR",
            }

        try:
            response = requests.post(
                f"{self.base_url}/orders/{order_id}/refund",
                json=payload,
                headers=self._get_headers(),
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            return {
                'success': True,
                'refund_id': data.get('refund_id'),
                'refunded_amount': data.get('refunded_amount'),
                'raw_response': data,
            }
        except requests.RequestException as e:
            logger.error(f"Tamara refund_payment error: {e}")
            raise PaymentGatewayException(
                str(_("Failed to refund Tamara order: {0}").format(e)))

    def get_payment_status(self, order_id: str) -> Dict:
        """Get order status"""
        try:
            response = requests.get(
                f"{self.base_url}/orders/{order_id}",
                headers=self._get_headers(),
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            return {
                'success': True,
                'status': data.get('status'),
                'total_amount': data.get('total_amount'),
                'paid_amount': data.get('paid_amount'),
                'raw_response': data,
            }
        except requests.RequestException as e:
            logger.error(f"Tamara get_payment_status error: {e}")
            raise PaymentGatewayException(
                str(_("Failed to get Tamara order status: {0}").format(e)))

    def authorize_order(self, order_id: str) -> Dict:
        """Authorize order after approval"""
        try:
            response = requests.post(
                f"{self.base_url}/orders/{order_id}/authorise",
                headers=self._get_headers(),
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            return {
                'success': True,
                'order_id': data.get('order_id'),
                'status': data.get('status'),
                'raw_response': data,
            }
        except requests.RequestException as e:
            logger.error(f"Tamara authorize_order error: {e}")
            raise PaymentGatewayException(
                str(_("Failed to authorize Tamara order: {0}").format(e)))


class PaymentGatewayFactory:
    """
    Factory for creating appropriate payment gateway
    """
    _gateways = {
        'tabby': TabbyGateway,
        'tamara': TamaraGateway,
    }

    @classmethod
    def get_gateway(cls, gateway_name: str) -> BasePaymentGateway:
        """Get payment gateway"""
        gateway_class = cls._gateways.get(gateway_name.lower())
        if not gateway_class:
            raise PaymentGatewayException(
                str(_("Payment gateway '{0}' is not supported").format(gateway_name)))
        return gateway_class()

    @classmethod
    def register_gateway(cls, name: str, gateway_class: type):
        """Register new payment gateway"""
        cls._gateways[name.lower()] = gateway_class
