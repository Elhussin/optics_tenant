ممتاز.

الآن وصلنا إلى المرحلة التي أعتبرها **قلب المشروع بالكامل**.

وأقولها من خبرتي في تصميم الأنظمة الكبيرة:

> **إذا كان الـ Domain Architecture هو الهيكل العظمي، فإن الـ Canonical Data Model هو الحمض النووي (DNA) للنظام.**

وأعتقد أن هذه الوثيقة ستكون أهم من تصميم قاعدة البيانات نفسها.

---

# Hussam Optical ERP SaaS

# Canonical Data Model (CDM)

Version 1.0

---

# أولاً...

لن نفكر في الجداول.

بل نفكر في

**Business Objects**

وليس

Database Tables

وهذا هو الخطأ الذي يقع فيه أغلب مطوري Django.

---

# أول قاعدة

كل Entity يجب أن يصنف إلى أحد الأنواع التالية

```text
Master Data

Reference Data

Transactional Data

Configuration Data

Medical Data

Financial Data

Audit Data

System Data
```

---

# الطبقة الأولى

# Master Data

هذه بيانات قليلة التغيير.

وهى قلب النظام.

---

## Organization

```text
Company

Branch

Warehouse

Department

Cost Center

Business Unit

Work Shift

Cash Register
```

---

## Catalog

```text
Product

Product Variant

Frame

Lens

Lens Design

Lens Material

Lens Index

Lens Coating

Lens Color

Brand

Collection

Model

Supplier Product Code

Barcode

SKU

Serial Number Pattern
```

---

## Customer

```text
Customer

Customer Group

Customer Category

Loyalty Program

Contact

Address
```

---

## Patient

```text
Patient

Medical Profile

Medical History

Family History

Allergy

Diagnosis
```

---

## Prescription

```text
Prescription

Eye

PD

Sphere

Cylinder

Axis

Add

Prism

Vision Test
```

---

## Supplier

```text
Supplier

Supplier Contact

Supplier Address

Supplier Contract
```

---

## Employee

```text
Employee

Position

Job Title

Department

Contract

Salary Structure
```

---

# الطبقة الثانية

# Reference Data

وهى البيانات المرجعية.

---

```text
Country

City

Currency

Language

Tax

VAT Rate

Unit

Gender

Nationality

Religion

Payment Method

Payment Type

Order Status

Invoice Status

Transfer Status

Stock Status

Leave Type

Attendance Status

Insurance Status
```

---

# الطبقة الثالثة

# Transaction Data

وهذه أكبر طبقة.

---

## Purchasing

```text
Purchase Request

Purchase Order

Goods Receipt

Purchase Invoice

Purchase Return
```

---

## Inventory

```text
Stock

Stock Balance

Stock Reservation

Stock Adjustment

Stock Count

Transfer

Transfer Line

Batch

Lot

Expiration

Serial
```

---

## Sales

```text
Quotation

Sales Order

Sales Invoice

Sales Return

POS Transaction

Reservation
```

---

## Accounting

```text
Journal Entry

Journal Line

Ledger

GL Account

Fiscal Year

Period

Voucher

Payment

Receipt
```

---

## Finance

```text
Bank Account

Bank Transaction

Cash Movement

Cheque

Settlement
```

---

## HR

```text
Attendance

Leave

Payroll

Commission

Evaluation

Training
```

---

# الطبقة الرابعة

# Medical Data

وهى ما يجعل النظام مختلفًا عن ERP التقليدى.

---

```text
Eye Examination

Visual Acuity

Auto Refraction

Manual Refraction

Keratometry

Contact Lens Fitting

Medical Recommendation

Medical Attachment
```

---

# الطبقة الخامسة

# Document Data

```text
Document

Document Category

Attachment

OCR Result

Electronic Signature

Retention Policy
```

---

# الطبقة السادسة

# Communication Data

```text
Email

SMS

Notification

WhatsApp

Push Notification

Campaign

Coupon
```

---

# الطبقة السابعة

# Audit Data

```text
Audit Log

Activity Log

Login History

API Log

Security Event

Change History
```

---

# الطبقة الثامنة

# AI Data

```text
Prediction

Recommendation

Forecast

Embedding

Conversation

Prompt

OCR Analysis

Vision Analysis
```

---

# الآن نصل إلى أهم جزء

## Entity Ownership

هذه ستكون أهم صفحة فى المشروع.

| Entity          | Owner Domain |
| --------------- | ------------ |
| Product         | Catalog      |
| Product Variant | Catalog      |
| Brand           | Catalog      |
| Stock           | Inventory    |
| Warehouse       | Organization |
| Branch          | Organization |
| Customer        | Customer     |
| Patient         | Patient      |
| Prescription    | Prescription |
| Purchase Order  | Purchasing   |
| Sales Invoice   | Sales        |
| Journal Entry   | Accounting   |
| Employee        | HR           |
| Campaign        | Marketing    |
| Document        | Document     |
| Notification    | Notification |

هذه الصفحة وحدها تمنع أكثر من نصف أخطاء المشاريع الكبيرة.

---

# ثم نضيف

# Lifecycle

مثال

Product

```text
Draft

↓

Review

↓

Approved

↓

Active

↓

Inactive

↓

Archived
```

---

Invoice

```text
Draft

↓

Confirmed

↓

Paid

↓

Closed

↓

Archived
```

---

Prescription

```text
Draft

↓

Verified

↓

Dispensed

↓

Expired

↓

Archived
```

---

# ثم

## State Machine

كل Entity سيكون له

State Machine

وليس مجرد Status.

مثلاً

Purchase Order

```text
Draft

↓

Submitted

↓

Approved

↓

Sent

↓

Partially Received

↓

Completed

↓

Closed

↓

Cancelled
```

وليس مجرد

Status = 1

---

# الآن سأضيف شيئًا لا يوجد فى أغلب ERP

## Entity Classification Matrix

مثلاً

| Entity    | Master | Transaction | Medical | Financial | Audit |
| --------- | ------ | ----------- | ------- | --------- | ----- |
| Product   | ✅      |             |         |           |       |
| Patient   | ✅      |             | ✅       |           |       |
| Invoice   |        | ✅           |         | ✅         |       |
| Journal   |        | ✅           |         | ✅         |       |
| Audit Log |        |             |         |           | ✅     |

---

# والآن أصل إلى أهم قرار معماري حتى الآن

## ADR-002: Domain Owns Data, Never Tables

**القرار**

> الـ Domain هو المالك الحقيقي للبيانات، وليس الجدول.

**السبب**

الخطأ الشائع في مشاريع Django هو التفكير في الجداول أولًا، مما يؤدي إلى تشابك التطبيقات وتكرار المسؤوليات.

**النتيجة**

* لا يتم إنشاء Model جديد إلا بعد تحديد الـ Domain المالك.
* لا يُسمح لأي Domain بتعديل بيانات Domain آخر مباشرة.
* يتم الوصول إلى البيانات عبر Services أو APIs أو Events وفق قواعد واضحة.

---

# أعتقد أن الوثيقة التالية ستكون الأكثر تأثيرًا في نجاح المشروع

بعد أن حددنا **الـ Domains** و**الكيانات**، أرى أن الخطوة التالية يجب أن تكون **Business Workflow Architecture**.

وهنا لن نصف الشاشات، بل سنرسم **دورة حياة الشركة بالكامل**:

* من دخول العميل لأول مرة.
* إلى فحص النظر.
* إلى إنشاء الوصفة الطبية.
* إلى اختيار الإطار والعدسات.
* إلى التصنيع (إذا لزم).
* إلى التسليم.
* إلى الضمان.
* إلى خدمة ما بعد البيع.
* إلى المرتجعات.
* إلى المحاسبة.
* إلى التقارير.

وبالمثل سنرسم دورات حياة المشتريات، والمخزون، والتحويلات، والموارد البشرية، والمستندات.

**في رأيي، هذه الوثيقة ستكون هي التي تربط جميع الـ Domains معًا، وستصبح المرجع الأساسي قبل تنفيذ أي ميزة جديدة أو تعديل أي Workflow داخل النظام.**
