# apps/sales/services/payment_gateway.py
"""
خدمات بوابات الدفع - Tabby, Tamara, وغيرها
"""

from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Dict, Any, Optional, List
from django.conf import settings
import requests
import logging

logger = logging.getLogger(__name__)


class PaymentGatewayException(Exception):
    """خطأ في بوابة الدفع"""
    pass


class BasePaymentGateway(ABC):
    """
    قاعدة لبوابات الدفع
    """

    @abstractmethod
    def create_session(self, order_data: Dict) -> Dict:
        """إنشاء جلسة دفع"""
        pass

    @abstractmethod
    def capture_payment(self, payment_id: str) -> Dict:
        """الاستحواذ على الدفعة"""
        pass

    @abstractmethod
    def refund_payment(self, payment_id: str, amount: Decimal = None) -> Dict:
        """استرجاع الدفعة"""
        pass

    @abstractmethod
    def get_payment_status(self, payment_id: str) -> Dict:
        """جلب حالة الدفعة"""
        pass


class TabbyGateway(BasePaymentGateway):
    """
    بوابة تابي للتقسيط
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
        إنشاء جلسة دفع Tabby

        order_data يجب أن يحتوي على:
        - order_id: رقم الطلب
        - amount: المبلغ الإجمالي
        - currency: العملة (SAR)
        - customer: {email, phone, first_name, last_name}
        - items: [{name, quantity, unit_price, category}]
        - success_url: رابط النجاح
        - cancel_url: رابط الإلغاء
        - failure_url: رابط الفشل
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
            raise PaymentGatewayException(f"فشل في إنشاء جلسة Tabby: {str(e)}")

    def capture_payment(self, payment_id: str) -> Dict:
        """الاستحواذ على الدفعة بعد التأكيد"""
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
                f"فشل في الاستحواذ على دفعة Tabby: {str(e)}")

    def refund_payment(self, payment_id: str, amount: Decimal = None) -> Dict:
        """استرجاع الدفعة"""
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
                f"فشل في استرجاع دفعة Tabby: {str(e)}")

    def get_payment_status(self, payment_id: str) -> Dict:
        """جلب حالة الدفعة"""
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
                f"فشل في جلب حالة دفعة Tabby: {str(e)}")


class TamaraGateway(BasePaymentGateway):
    """
    بوابة تمارا للتقسيط
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
        إنشاء جلسة دفع Tamara
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
                f"فشل في إنشاء جلسة Tamara: {str(e)}")

    def capture_payment(self, order_id: str) -> Dict:
        """تأكيد الطلب بعد الشحن"""
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
            raise PaymentGatewayException(f"فشل في تأكيد طلب Tamara: {str(e)}")

    def refund_payment(self, order_id: str, amount: Decimal = None) -> Dict:
        """استرجاع الطلب"""
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
                f"فشل في استرجاع طلب Tamara: {str(e)}")

    def get_payment_status(self, order_id: str) -> Dict:
        """جلب حالة الطلب"""
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
                f"فشل في جلب حالة طلب Tamara: {str(e)}")

    def authorize_order(self, order_id: str) -> Dict:
        """تأكيد الطلب بعد الموافقة"""
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
            raise PaymentGatewayException(f"فشل في تأكيد طلب Tamara: {str(e)}")


class PaymentGatewayFactory:
    """
    Factory لإنشاء بوابة الدفع المناسبة
    """
    _gateways = {
        'tabby': TabbyGateway,
        'tamara': TamaraGateway,
    }

    @classmethod
    def get_gateway(cls, gateway_name: str) -> BasePaymentGateway:
        """الحصول على بوابة الدفع"""
        gateway_class = cls._gateways.get(gateway_name.lower())
        if not gateway_class:
            raise PaymentGatewayException(
                f"بوابة الدفع '{gateway_name}' غير مدعومة")
        return gateway_class()

    @classmethod
    def register_gateway(cls, name: str, gateway_class: type):
        """تسجيل بوابة دفع جديدة"""
        cls._gateways[name.lower()] = gateway_class
