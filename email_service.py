import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from models import User, Progress, db
import schedule
import time
import threading

# Email configuration
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SENDER_EMAIL = 'your-email@gmail.com'  # Replace with your email
SENDER_PASSWORD = 'your-app-password'  # Replace with your app password

def send_email(to_email, subject, html_content):
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

def generate_progress_report(student):
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    
    # Get today's progress
    today_progress = Progress.query.filter(
        Progress.user_id == student.id,
        Progress.timestamp >= datetime.combine(today, datetime.min.time())
    ).all()
    
    # Get overall stats
    all_progress = Progress.query.filter_by(user_id=student.id).all()
    total_activities = len(all_progress)
    completed = len([p for p in all_progress if p.completed])
    avg_score = sum([p.score for p in all_progress]) / len(all_progress) if all_progress else 0
    
    html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background: #F4E1D7; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; }}
            h1 {{ color: #70161E; }}
            h2 {{ color: #D96432; }}
            .stats {{ background: #F4E1D7; padding: 15px; border-radius: 10px; margin: 20px 0; }}
            .stat-item {{ margin: 10px 0; }}
            .activity {{ background: #F4E1D7; padding: 10px; margin: 10px 0; border-left: 4px solid #D96432; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 2px solid #F4E1D7; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📊 Daily Progress Report</h1>
            <p>Dear Parent,</p>
            <p>Here is the daily learning progress report for <strong>{student.username}</strong> on {today.strftime('%B %d, %Y')}.</p>
            
            <div class="stats">
                <h2>Overall Statistics</h2>
                <div class="stat-item">📚 Total Activities: <strong>{total_activities}</strong></div>
                <div class="stat-item">✅ Completed: <strong>{completed}</strong></div>
                <div class="stat-item">📈 Progress: <strong>{int(completed/total_activities*100) if total_activities else 0}%</strong></div>
                <div class="stat-item">⭐ Average Score: <strong>{int(avg_score)}%</strong></div>
            </div>
            
            <h2>Today's Activities ({len(today_progress)})</h2>
    """
    
    if today_progress:
        for p in today_progress:
            status = "✅ Completed" if p.completed else "⏳ In Progress"
            html += f"""
            <div class="activity">
                <strong>{p.module}</strong> - {p.item}<br>
                Status: {status} | Score: {p.score}%<br>
                <small>Time: {p.timestamp.strftime('%I:%M %p')}</small>
            </div>
            """
    else:
        html += "<p>No activities completed today.</p>"
    
    html += """
            <div class="footer">
                <p>This is an automated daily report from SignBridge Learning Platform.</p>
                <p>For any questions, please contact your child's teacher.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html

def send_daily_reports():
    if SENDER_EMAIL == 'your-email@gmail.com':
        print("Email not configured. Skipping daily reports.")
        return
    
    print(f"Sending daily reports at {datetime.now()}")
    students = User.query.filter_by(role='student').all()
    
    for student in students:
        if student.parent_email:
            report_html = generate_progress_report(student)
            subject = f"Daily Progress Report - {student.username} - {datetime.now().strftime('%B %d, %Y')}"
            success = send_email(student.parent_email, subject, report_html)
            if success:
                print(f"Report sent to {student.parent_email} for {student.username}")
            else:
                print(f"Failed to send report for {student.username}")

def start_scheduler():
    # Schedule daily report at 8 PM
    schedule.every().day.at("20:00").do(send_daily_reports)
    
    while True:
        schedule.run_pending()
        time.sleep(60)

def init_email_scheduler(app):
    try:
        with app.app_context():
            scheduler_thread = threading.Thread(target=start_scheduler, daemon=True)
            scheduler_thread.start()
            print("Email scheduler started - Daily reports will be sent at 8:00 PM")
    except Exception as e:
        print(f"Email scheduler error (non-critical): {e}")
