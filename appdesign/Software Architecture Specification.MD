ممتاز، الآن نصل إلى أخطر وثيقة في المشروع، وهي الوثيقة التي ستحدد **كيف يُكتب الكود**.

وأعتقد أن هذه الوثيقة هي التي كانت تنقص مشروعك منذ البداية.

من خلال متابعتي لمشروعك الحالي (Django + Next.js + Multi-Tenant)، لاحظت أن المشكلة ليست في اختيار التقنيات، بل في **عدم وجود حدود إلزامية بين الطبقات (Layers)**، مما يجعل من السهل أن تنتقل Business Logic إلى Views أو Serializers أو حتى React Components.

لذلك سنبني الآن الوثيقة التي سأعتبرها **قانون الكود**.

---

# Software Architecture Specification (SAS)

**Version 1.0**

> **Purpose**
>
> هذه الوثيقة تحدد الهيكل الرسمي للكود داخل Hussam Optical ERP SaaS، ولا يجوز لأي مطور أو وكيل AI مخالفتها إلا من خلال ADR معتمد.

---

# الفصل الأول

# الطبقات الرسمية للنظام

لن نبني النظام على Django Apps فقط.

بل على طبقات واضحة.

```text
Presentation Layer

↓

Application Layer

↓

Domain Layer

↓

Infrastructure Layer

↓

Database
```

كل طبقة لها مسؤولية واحدة فقط.

---

# Presentation Layer

هى

API

Admin

Frontend

ولا يجوز لها اتخاذ قرارات Business.

وظيفتها فقط

Receive

↓

Validate

↓

Call Service

↓

Return Response

---

# Application Layer

وهى قلب النظام.

تحتوى على

Use Cases

Application Services

Commands

Queries

Transactions

Workflow Coordination

---

مثال

```text
Create Sales Invoice

Approve Purchase Order

Receive Inventory

Transfer Stock

Create Patient

Register Customer
```

---

# Rule

Business Workflow

يبدأ وينتهى هنا.

---

# Domain Layer

وهذا أهم جزء.

يحتوى على

Entities

Value Objects

Business Rules

Policies

Specifications

Domain Services

Business Events

---

مثال

Product

Invoice

Prescription

Stock

Customer

---

# Rule

Domain

لا يعرف

Database

ولا

REST

ولا

Next.js

---

# Infrastructure Layer

تشمل

ORM

Repositories

Email

SMS

Storage

Redis

Celery

OCR

AI

Payment Gateway

ZATCA

External APIs

---

# Rule

يمكن تغيير Infrastructure

بدون تغيير Business Logic.

---

# Database Layer

قاعدة البيانات.

ولا تحتوى على أى Business Logic.

---

# القرار الأول

## ADR-004

> Domain Never Depends on Infrastructure

---

# الفصل الثانى

# الهيكل الرسمى لكل Domain

مثلاً

Inventory

```text
inventory/

    domain/

        entities/

        value_objects/

        events/

        services/

        policies/

    application/

        commands/

        queries/

        handlers/

        dto/

    infrastructure/

        models/

        repositories/

        orm/

        cache/

    presentation/

        api/

        serializers/

        permissions/

        filters/

        views/

    tests/
```

---

وهذا ينطبق على جميع الـ Domains.

---

# الفصل الثالث

# Rules of Django

Models

↓

Persistence Only

---

Model

لا يكتب فيه

Business Logic

مثل

```python
approve_invoice()

calculate_stock()

reserve_quantity()
```

كل ذلك يذهب إلى

Application Services

أو

Domain Services

---

# Rule

Model

هو

Persistence Object

وليس

Business Object

---

# الفصل الرابع

# Service Classification

فى المشروع سيكون لدينا أربعة أنواع فقط.

---

## Domain Service

يحتوى قواعد الأعمال.

مثال

```text
LensPriceCalculator

PrescriptionValidator

CommissionCalculator
```

---

## Application Service

ينسق أكثر من Domain.

مثال

```text
CreateInvoiceService

TransferInventoryService

ReceivePurchaseService
```

---

## Infrastructure Service

يتعامل مع الخارج.

مثال

```text
SMS

Email

OCR

Payment

Storage
```

---

## Integration Service

يربط النظام بأنظمة أخرى.

مثل

ZATCA

Insurance

Payment Gateway

WhatsApp

---

# الفصل الخامس

# Repository Rules

Repository

يقرأ

ويكتب

Database

فقط.

---

ممنوع

Business Logic

داخل Repository.

---

# الفصل السادس

# Selector Rules

Selectors

تقرأ فقط.

ولا تعدل.

مثلاً

```text
Available Stock

Customer Balance

Patient History

Sales Summary
```

---

# الفصل السابع

# API Rules

كل API

يمر بهذا التسلسل

```text
Request

↓

Validation

↓

Permission

↓

Application Service

↓

Domain

↓

Repository

↓

Response
```

ولا يجوز تخطى أى طبقة.

---

# الفصل الثامن

# Events

كل Event

له

Producer

Consumers

Payload

Version

---

مثلاً

```text
InvoiceConfirmed

Producer

Sales

Consumers

Inventory

Accounting

CRM

Notification

AI
```

---

# الفصل التاسع

# Background Jobs

الأعمال الثقيلة

تخرج خارج الـ Request.

مثل

OCR

PDF

Email

SMS

Large Reports

AI

Analytics

Archive

Backups

---

# الفصل العاشر

# Permission Architecture

لن نستخدم

Role Only

---

بل

RBAC + ABAC

Role Based Access Control

*

Attribute Based Access Control

---

أى أن القرار يعتمد على

Role

Branch

Department

Tenant

Document Status

Workflow Stage

Ownership

---

# الفصل الحادى عشر

# Multi Tenant Rules

أى Query

يجب أن يكون

Tenant Aware

---

ممنوع

```python
Product.objects.all()
```

الصحيح

```python
Tenant.current.products
```

أو من خلال Repository يضمن العزل.

---

# الفصل الثانى عشر

# Audit Rules

كل عملية مهمة

يجب أن تسجل

Who

When

Where

Old Value

New Value

Reason

---

# الفصل الثالث عشر

# Logging

لن نستخدم

print()

نهائياً.

بل

Structured Logging

Correlation ID

Request ID

Tenant ID

User ID

---

# الفصل الرابع عشر

# Exception Rules

لن نستخدم

Exception

عشوائياً.

سيكون لدينا

```text
BusinessException

ValidationException

SecurityException

IntegrationException

InfrastructureException

```

---

# الفصل الخامس عشر

# Testing Strategy

كل Domain

له

Unit Tests

Integration Tests

Workflow Tests

Contract Tests

Performance Tests (عند الحاجة)

---

# الفصل السادس عشر

# Feature Template (إلزامي)

أي Feature جديد يمر بالنموذج التالي:

1. Business Requirement.
2. Domain Owner.
3. Workflow.
4. Data Impact.
5. API Contract.
6. Database Changes.
7. Events.
8. Permissions.
9. Tests.
10. Documentation.

ولا يبدأ التنفيذ قبل اكتمال هذه البنود.

---

# ما الذي أريد إضافته على مشروعك تحديدًا؟

بعد مراجعة طبيعة مشروع **Hussam Optical ERP SaaS**، أرى أن المعمارية وحدها لا تكفي. المشروع يجمع بين ERP، والسجل الطبي، وقطاع التجزئة، وSaaS متعدد المستأجرين، وهذا يجعله يحتاج إلى **نظام حوكمة للتطوير** وليس مجرد قواعد للكود.

لذلك أقترح أن تكون الوثيقة التالية هي الأهم على الإطلاق، وأسميها:

# **Project Governance & Development Lifecycle (PGDL)**

هذه الوثيقة لن تتحدث عن البرمجة، بل عن **كيفية إدارة المشروع نفسه**، وستحدد:

* متى يُسمح بإضافة Feature جديدة.
* كيف يتم تقييم أثر أي تغيير على بقية النظام.
* كيف تُدار الإصدارات (Versioning).
* سياسة التوافق مع الإصدارات السابقة (Backward Compatibility).
* إدارة الديون التقنية (Technical Debt).
* معايير قبول Pull Requests.
* قواعد العمل بين عدة وكلاء AI ومطورين في الوقت نفسه.
* خطة مراجعة المعمارية بشكل دوري.

**وأعتبر هذه الوثيقة ضرورية جدًا لمشروعك، لأنها ستكون الضمان الحقيقي لاستمرار التطوير لسنوات دون أن يفقد المشروع تماسكه أو يتحول إلى مجموعة تعديلات متفرقة يصعب صيانتها.**
