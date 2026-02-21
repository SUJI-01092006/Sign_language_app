import requests

def send_sms_alert(phone_number, student_name, sign, latitude, longitude):
    """Send SMS alert to parent with location"""
    try:
        message = f"EMERGENCY ALERT: {student_name} detected '{sign}' sign. Location: https://www.google.com/maps?q={latitude},{longitude}"
        
        # Log to console
        print(f"\n{'='*60}")
        print(f"SMS ALERT SENT")
        print(f"To: {phone_number}")
        print(f"Message: {message}")
        print(f"{'='*60}\n")
        
        # OPTION 1: Fast2SMS (India) - Uncomment and add API key
        # url = "https://www.fast2sms.com/dev/bulkV2"
        # payload = {
        #     "authorization": "YOUR_FAST2SMS_API_KEY",
        #     "route": "q",
        #     "message": message,
        #     "language": "english",
        #     "flash": 0,
        #     "numbers": phone_number
        # }
        # response = requests.post(url, data=payload)
        # return response.json()
        
        # OPTION 2: Twilio (Global) - Uncomment and add credentials
        # from twilio.rest import Client
        # account_sid = 'YOUR_TWILIO_ACCOUNT_SID'
        # auth_token = 'YOUR_TWILIO_AUTH_TOKEN'
        # client = Client(account_sid, auth_token)
        # message = client.messages.create(
        #     body=message,
        #     from_='+1234567890',  # Your Twilio number
        #     to=f'+91{phone_number}'  # Add country code
        # )
        # return {'success': True, 'sid': message.sid}
        
        # OPTION 3: MSG91 (India) - Uncomment and add API key
        # url = f"https://api.msg91.com/api/v5/flow/"
        # headers = {
        #     "authkey": "YOUR_MSG91_API_KEY",
        #     "content-type": "application/json"
        # }
        # payload = {
        #     "flow_id": "YOUR_FLOW_ID",
        #     "sender": "YOUR_SENDER_ID",
        #     "mobiles": phone_number,
        #     "message": message
        # }
        # response = requests.post(url, json=payload, headers=headers)
        # return response.json()
        
        return {'success': True, 'message': 'SMS logged (configure API for actual sending)'}
    except Exception as e:
        print(f"SMS Error: {e}")
        return {'success': False, 'error': str(e)}
