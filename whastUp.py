import csv
import requests
import time

# إعدادات API الخاصة بك
INSTANCE_ID = "instance146445"  # غيّر هذا حسب حسابك في UltraMsg
TOKEN = "g55byj9vkyxeiodi"  # التوكن من لوحة UltraMsg
MESSAGE = """
عميلنا العزيز،
                    نود إبلاغكم بأن
                      طلبكم  رقم: 054091
                        جاهز للتسليم.
                    شكرًا لاختياركم حسام للنظارات.
                    لأي استفسارات، يُرجى التواصل معنا.

                    مع أطيب التحيات،
                    فريق حسام للنظارات
                    
                Dear Valued Customer,
                We are pleased to inform you that your 
                order number: 
                is ready for delivery.
                Thank you for choosing Hossam Optics.
                For any inquiries, please feel free to contact us.

                Best regards,
                Hossam Optics Team

"""
# رابط الإرسال

URL = f"https://api.ultramsg.com/{INSTANCE_ID}/messages/chat"

# قراءة الأرقام من ملف CSV
# مثال ملف contacts.csv:
# phone
# 966512345678
# 966598765432
def read_numbers_from_csv(file_path="contacts.csv"):
    numbers = []
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            number = row.get("phone")
            if number:
                numbers.append(number.strip())
    return numbers


# إرسال رسالة لرقم معين
def send_message(phone, message):
    payload = {
        "token": TOKEN,
        "to": phone,
        "body": message,
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    try:
        response = requests.post(URL, data=payload, headers=headers)
        if response.status_code == 200:
            print(f"✅ تم إرسال الرسالة إلى: {phone}")
        else:
            print(f"⚠️ فشل الإرسال إلى {phone} | {response.text}")
    except Exception as e:
        print(f"❌ خطأ أثناء الإرسال إلى {phone}: {e}")


def main():
    numbers = read_numbers_from_csv("contacts.csv")
    print(f"📋 عدد الأرقام التي سيتم الإرسال إليها: {len(numbers)}")

    for number in numbers:
        send_message(number, MESSAGE)
        time.sleep(2)  # تأخير بسيط لتفادي الحظر أو rate limit

    print("🎉 تم إرسال جميع الرسائل بنجاح!")


if __name__ == "__main__":
    main()
