from datetime import datetime, timedelta
from models import db, User, UserLog, Progress, Attendance, Alert, Notification
from sms_service import send_sms_alert

class AIRiskDetector:
    
    @staticmethod
    def detect_inactivity(user_id):
        """Detect if student hasn't logged in for 7 days"""
        last_log = UserLog.query.filter_by(user_id=user_id, action='login').order_by(UserLog.timestamp.desc()).first()
        if last_log:
            days_inactive = (datetime.now() - last_log.timestamp).days
            if days_inactive >= 7:
                return True, f"Student inactive for {days_inactive} days"
        return False, None
    
    @staticmethod
    def detect_failed_logins(user_id):
        """Detect multiple failed login attempts"""
        recent_logs = UserLog.query.filter_by(user_id=user_id, action='login_failed').filter(
            UserLog.timestamp >= datetime.now() - timedelta(hours=24)
        ).count()
        if recent_logs >= 5:
            return True, f"{recent_logs} failed login attempts in 24 hours"
        return False, None
    
    @staticmethod
    def detect_no_attendance(user_id):
        """Detect if student has no attendance for 14 days"""
        last_attendance = Attendance.query.filter_by(student_id=user_id).order_by(Attendance.date.desc()).first()
        if last_attendance:
            days_absent = (datetime.now().date() - last_attendance.date).days
            if days_absent >= 14:
                return True, f"No attendance recorded for {days_absent} days"
        return False, None
    
    @staticmethod
    def detect_low_performance(user_id):
        """Detect declining quiz scores"""
        recent_progress = Progress.query.filter_by(user_id=user_id, module='quiz').order_by(Progress.timestamp.desc()).limit(5).all()
        if len(recent_progress) >= 5:
            avg_score = sum([p.score for p in recent_progress]) / len(recent_progress)
            if avg_score < 40:
                return True, f"Average quiz score dropped to {avg_score:.1f}%"
        return False, None
    
    @staticmethod
    def detect_unusual_behavior(user_id):
        """Detect unusual login patterns"""
        logs = UserLog.query.filter_by(user_id=user_id, action='login').filter(
            UserLog.timestamp >= datetime.now() - timedelta(days=7)
        ).all()
        
        if len(logs) > 50:  # More than 50 logins in a week
            return True, f"Unusual login pattern: {len(logs)} logins in 7 days"
        return False, None
    
    @staticmethod
    def analyze_student_risk(user_id):
        """Run all risk detection checks"""
        risks = []
        
        checks = [
            AIRiskDetector.detect_inactivity,
            AIRiskDetector.detect_failed_logins,
            AIRiskDetector.detect_no_attendance,
            AIRiskDetector.detect_low_performance,
            AIRiskDetector.detect_unusual_behavior
        ]
        
        for check in checks:
            detected, message = check(user_id)
            if detected:
                risks.append(message)
        
        return risks
    
    @staticmethod
    def send_risk_alert(user_id, risks):
        """Send alert to parent and teacher"""
        user = User.query.get(user_id)
        if not user:
            return
        
        risk_message = f"🧠 AI detected unusual patterns for {user.username}:\n" + "\n".join([f"• {r}" for r in risks])
        
        # Create alert
        alert = Alert(
            student_id=user_id,
            parent_id=user.parent_id,
            sign_detected="AI_RISK_ALERT",
            latitude=0,
            longitude=0
        )
        db.session.add(alert)
        
        # Notify parent
        if user.parent_id:
            notif = Notification(
                user_id=user.parent_id,
                message=risk_message
            )
            db.session.add(notif)
            
            # Send SMS
            if user.parent_phone:
                send_sms_alert(user.parent_phone, user.username, "AI Risk Alert", 0, 0)
        
        # Notify teacher
        if user.teacher_id:
            notif = Notification(
                user_id=user.teacher_id,
                message=risk_message
            )
            db.session.add(notif)
        
        db.session.commit()
        return True
