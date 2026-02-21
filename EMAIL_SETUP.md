# Email Configuration for Daily Progress Reports

## Setup Instructions

### 1. Install Required Package
```bash
pip install schedule
```

### 2. Configure Email Settings

Edit `email_service.py` and update these variables:

```python
SENDER_EMAIL = 'your-email@gmail.com'  # Your Gmail address
SENDER_PASSWORD = 'your-app-password'  # Gmail App Password (not regular password)
```

### 3. Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Select **Security**
3. Under "Signing in to Google," select **2-Step Verification** (enable if not already)
4. At the bottom, select **App passwords**
5. Select **Mail** and **Other (Custom name)**
6. Enter "SignBridge" and click **Generate**
7. Copy the 16-character password
8. Paste it in `email_service.py` as `SENDER_PASSWORD`

### 4. How It Works

- **Student Signup**: Students provide parent email during registration
- **Daily Reports**: Automated emails sent every day at 8:00 PM
- **Report Content**:
  - Overall statistics (total activities, completed, progress %)
  - Today's activities with scores
  - Completion status for each activity

### 5. Customize Report Time

Edit `email_service.py` line 107 to change the time:

```python
schedule.every().day.at("20:00").do(send_daily_reports)  # Change "20:00" to your preferred time
```

### 6. Manual Test

To test email sending immediately, add this route to `app.py`:

```python
@app.route('/test_email/<int:student_id>')
@login_required
@role_required('admin')
def test_email(student_id):
    from email_service import send_daily_reports
    student = User.query.get(student_id)
    if student and student.parent_email:
        from email_service import generate_progress_report, send_email
        report = generate_progress_report(student)
        send_email(student.parent_email, "Test Report", report)
        return "Email sent!"
    return "No parent email found"
```

### 7. Database Migration

Delete old database and restart to add parent_email field:

```bash
del signlanguage.db
python app.py
```

## Features

✅ Parent email captured during student signup
✅ Daily automated progress reports at 8 PM
✅ Beautiful HTML email template with color theme
✅ Overall statistics and today's activities
✅ Runs in background thread (non-blocking)

## Troubleshooting

- **Email not sending**: Check Gmail App Password is correct
- **"Less secure app" error**: Use App Password, not regular password
- **Time zone issues**: Server uses system time for scheduling
- **No emails received**: Check spam folder
