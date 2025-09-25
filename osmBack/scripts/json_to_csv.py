import json
import csv

# JSON الأصلي (يمكنك قراءته من ملف JSON بدل لصقه هنا)
data = {
    "contact": {
        "title": "Contact Us",
        "description": "Need help? Have feedback or suggestions? We'd love to hear from you.",
        "company": "Company",
        "email": "Email",
        "phone": "Phone",
        "address": "Address",
        "name": "Your Name",
        "message": "Your Message",
        "image": "Upload Image (optional)",
        "submit": "Send Message",
        "successMessage": "Message sent successfully!",
        "errorMessage": "Something went wrong. Please try again later."
    },
    "NotFound": {
        "title": "Page Not Found",
        "description": "The page you are looking for does not exist.",
        "goHome": "Go to Home"
    },
    "privacy": {
        "title": "Privacy Policy",
        "description": "We value your privacy and commit to protecting your personal data.",
        "section1": {
            "title": "Information Collection",
            "content": "We collect minimal personal data necessary to operate the platform."
        },
        "section2": {
            "title": "Data Protection",
            "content": "Your data is encrypted and not shared with third parties."
        }
    },
    "terms": {
        "title": "Terms of Service",
        "description": "Please read these terms before using our services.",
        "section1": {
            "title": "Usage Terms",
            "content": "You agree to use the platform lawfully and responsibly."
        },
        "section2": {
            "title": "Liability",
            "content": "We are not responsible for data loss due to misuse."
        }
    },
    "faq": {
        "title": "Frequently Asked Questions",
        "q1": {
            "question": "How do I register?",
            "answer": "Go to the registration page and fill out your details."
        },
        "q2": {
            "question": "How can I contact support?",
            "answer": "You can use the contact form or email us directly."
        },
        "q3": {
            "question": "Is there a free trial?",
            "answer": "Yes, we offer a free trial for 30 days."
        }
    }
}

# تحديد اسم ملف CSV الناتج
csv_file = "pages.csv"

# الحقول الأساسية في CSV
fieldnames = ["type", "slug", "title", "body", "sections"]

with open(csv_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()

    for slug, page_data in data.items():
        row = {}
        row["type"] = "GenericPage"  # يمكن تغييره حسب نوع الصفحة
        row["slug"] = slug
        row["title"] = page_data.get("title", "")
        
        # نص رئيسي body (الوصف)
        row["body"] = page_data.get("description", "")
        
        # أي بيانات إضافية مثل sections أو q1, q2, q3
        extra_fields = {k:v for k,v in page_data.items() if k not in ["title","description"]}
        if extra_fields:
            row["sections"] = json.dumps(extra_fields, ensure_ascii=False)
        else:
            row["sections"] = ""
        
        writer.writerow(row)

print(f"CSV file '{csv_file}' has been created successfully.")
