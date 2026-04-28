from flask import Flask, jsonify, render_template

app = Flask(__name__)

# بيانات تجريبية (يمكن ربطها بقاعدة بيانات لاحقاً)
user_data = {
    "balance": 150.75,
    "referrals": 5,
    "status": "active"
}

@app.route('/')
def home():
    # هذا السطر يفترض أن ملف HTML موجود في مجلد اسمه templates
    return "الخادم يعمل! قم بربط ملف HTML الخاص بك هنا."

@app.route('/api/balance', methods=['GET'])
def get_balance():
    # إرسال الرصيد إلى الواجهة الأمامية
    return jsonify({"balance": user_data["balance"]})

@app.route('/api/withdraw', methods=['POST'])
def withdraw():
    # منطق السحب هنا
    return jsonify({"message": "تم استلام طلب السحب بنجاح"})

if __name__ == '__main__':
    app.run(debug=True)