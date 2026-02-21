from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for, flash, session, Response
import os
import subprocess
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, User, Progress, Assignment, UserLog, Attendance, Remark, Notification, Feedback, Alert
from functools import wraps
import json
from datetime import datetime, date, timedelta
import csv
from io import StringIO, BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///signlanguage.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

model = None

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def log_activity(user_id, action, details=None):
    log = UserLog(
        user_id=user_id,
        action=action,
        details=details,
        ip_address=request.remote_addr,
        device_type=request.headers.get('User-Agent', '')[:100]
    )
    db.session.add(log)
    db.session.commit()

def role_required(*roles):
    def wrapper(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated or current_user.role not in roles:
                flash('Access denied')
                return redirect(url_for('login'))
            return f(*args, **kwargs)
        return decorated_function
    return wrapper

def load_whisper_model():
    global model
    if model is None:
        model = whisper.load_model("base")
    return model

UPLOAD_FOLDER = 'sign_videos'
ANIMATION_FOLDER = 'archive/INDIAN SIGN LANGUAGE ANIMATED VIDEOS'
AUDIO_FOLDER = 'audio_uploads'
MERGED_FOLDER = 'merged_videos'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)
os.makedirs(MERGED_FOLDER, exist_ok=True)

def convert_to_sign(text):
    return text.upper().split()

@app.route('/')
def landing():
    if current_user.is_authenticated:
        return render_template('landing.html', logged_in=True)
    return render_template('landing.html', logged_in=False)

@app.route('/home')
@login_required
def index():
    if not current_user.is_authenticated:
        return redirect(url_for('login'))
    videos = []
    if os.path.exists(UPLOAD_FOLDER):
        videos = [f.replace('.mp4', '') for f in os.listdir(UPLOAD_FOLDER) if f.endswith('.mp4')]
    
    # Get teacher uploaded videos
    try:
        teacher_videos = Assignment.query.filter_by(type='video').all()
    except:
        teacher_videos = []
    
    return render_template('index.html', videos=videos, teacher_videos=teacher_videos)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            data = request.get_json() if request.is_json else request.form
            user = User.query.filter_by(username=data.get('username')).first()
            if user and check_password_hash(user.password, data.get('password')):
                if not user.is_active:
                    return jsonify({'error': 'Account deactivated'}) if request.is_json else redirect(url_for('login'))
                login_user(user)
                log_activity(user.id, 'login', 'User logged in')
                
                return jsonify({'success': True, 'role': user.role}) if request.is_json else redirect(url_for('dashboard'))
            else:
                # Log failed login
                if user:
                    log_activity(user.id, 'login_failed', 'Failed login attempt')
            return jsonify({'error': 'Invalid credentials'}) if request.is_json else redirect(url_for('login'))
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        try:
            data = request.get_json() if request.is_json else request.form
            if User.query.filter_by(username=data.get('username')).first():
                return jsonify({'error': 'Username exists'}) if request.is_json else redirect(url_for('signup'))
            user = User(
                username=data.get('username'),
                email=data.get('email'),
                password=generate_password_hash(data.get('password')),
                role=data.get('role', 'student'),
                parent_email=data.get('parent_email') if data.get('role') == 'student' else None,
                parent_phone=data.get('parent_phone') if data.get('role') == 'student' else None
            )
            db.session.add(user)
            db.session.commit()
            return jsonify({'success': True}) if request.is_json else redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    return render_template('signup.html')

@app.route('/logout')
@login_required
def logout():
    log_activity(current_user.id, 'logout', 'User logged out')
    logout_user()
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    if current_user.role == 'student':
        return redirect(url_for('student_dashboard'))
    elif current_user.role == 'teacher':
        return redirect(url_for('teacher_dashboard'))
    elif current_user.role == 'parent':
        return redirect(url_for('parent_dashboard'))
    elif current_user.role == 'admin':
        return redirect(url_for('admin_dashboard'))
    return redirect(url_for('index'))

@app.route('/student/dashboard')
@login_required
@role_required('student')
def student_dashboard():
    progress = Progress.query.filter_by(user_id=current_user.id).all()
    teacher_videos = Assignment.query.filter_by(type='video').all()
    return render_template('student_dashboard.html', progress=progress, teacher_videos=teacher_videos)

@app.route('/teacher/dashboard')
@login_required
@role_required('teacher')
def teacher_dashboard():
    students = User.query.filter_by(role='student').all()
    assignments = Assignment.query.filter_by(teacher_id=current_user.id).all()
    teacher_videos = Assignment.query.filter_by(teacher_id=current_user.id, type='video').all()
    return render_template('teacher_dashboard.html', students=students, assignments=assignments, teacher_videos=teacher_videos)

@app.route('/parent/dashboard')
@login_required
@role_required('parent')
def parent_dashboard():
    students = User.query.filter_by(role='student', parent_id=current_user.id).all()
    for student in students:
        progress = Progress.query.filter_by(user_id=student.id).all()
        student.progress_count = len(progress)
        student.completed_count = len([p for p in progress if p.completed])
        student.avg_score = round(sum([p.score for p in progress]) / len(progress)) if progress else 0
    
    return render_template('parent_dashboard.html', students=students)

@app.route('/admin/dashboard')
@login_required
@role_required('admin')
def admin_dashboard():
    users = User.query.all()
    parents = User.query.filter_by(role='parent').all()
    stats = {
        'total_students': User.query.filter_by(role='student').count(),
        'total_teachers': User.query.filter_by(role='teacher').count(),
        'total_parents': User.query.filter_by(role='parent').count(),
        'active_users': User.query.filter_by(is_active=True).count()
    }
    recent_logs = UserLog.query.order_by(UserLog.timestamp.desc()).limit(20).all()
    all_progress = Progress.query.order_by(Progress.timestamp.desc()).limit(100).all()
    return render_template('admin_dashboard.html', users=users, parents=parents, stats=stats, recent_logs=recent_logs, all_progress=all_progress)

@app.route('/learning')
@login_required
def learning():
    return render_template('learning.html')

@app.route('/progress')
@login_required
def my_progress():
    progress = Progress.query.filter_by(user_id=current_user.id).all()
    stats = {
        'total': len(progress),
        'completed': len([p for p in progress if p.completed]),
        'avg_score': sum([p.score for p in progress]) / len(progress) if progress else 0,
        'quizzes': len([p for p in progress if p.module == 'quiz']),
        'videos_watched': len([p for p in progress if p.module == 'video'])
    }
    return render_template('progress.html', progress=progress, stats=stats)

@app.route('/save_progress', methods=['POST'])
@login_required
def save_progress():
    data = request.get_json()
    progress = Progress(
        user_id=current_user.id,
        module=data.get('module'),
        item=data.get('item'),
        completed=data.get('completed', False),
        score=data.get('score', 0)
    )
    db.session.add(progress)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    return jsonify({'error': 'Audio transcription not available on free tier'}), 400

@app.route('/upload_video', methods=['POST'])
def upload_video():
    if 'video' not in request.files or 'word' not in request.form:
        return jsonify({'error': 'Missing video or word'}), 400
    
    video = request.files['video']
    word = request.form['word'].upper()
    video.save(f'{UPLOAD_FOLDER}/{word}.mp4')
    
    return jsonify({'success': True, 'word': word})

@app.route('/get_videos')
def get_videos():
    videos = []
    if os.path.exists(UPLOAD_FOLDER):
        videos = [f.replace('.mp4', '') for f in os.listdir(UPLOAD_FOLDER) if f.endswith('.mp4')]
    return jsonify({'videos': videos})

@app.route('/sign_videos/<filename>')
def serve_video(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/audio_uploads/<filename>')
def serve_audio(filename):
    return send_from_directory(AUDIO_FOLDER, filename)

@app.route('/animations/<path:filename>')
def serve_animation(filename):
    return send_from_directory(ANIMATION_FOLDER, filename)

@app.route('/merge_videos', methods=['POST'])
def merge_videos():
    import time
    try:
        data = request.get_json()
        words = data.get('words', [])
        
        if not words:
            return jsonify({'error': 'No words provided'}), 400
        
        video_inputs = []
        filter_parts = []
        
        for i, word in enumerate(words):
            video_path = os.path.join(ANIMATION_FOLDER, f'{word}.mp4')
            if not os.path.exists(video_path):
                video_path = os.path.join(UPLOAD_FOLDER, f'{word}.mp4')
            if os.path.exists(video_path):
                video_inputs.extend(['-i', video_path])
                filter_parts.append(f'[{i}:v]scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,drawtext=text=\'{word}\':fontsize=40:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=10:x=(w-text_w)/2:y=h-th-20[v{i}]')
        
        if not video_inputs:
            return jsonify({'error': 'No valid videos found'}), 400
        
        filter_complex = ';'.join(filter_parts) + ';' + ''.join([f'[v{i}]' for i in range(len(filter_parts))]) + f'concat=n={len(filter_parts)}:v=1:a=0[outv]'
        
        # Use unique filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S%f')
        output_filename = f'merged_{timestamp}.mp4'
        output_path = os.path.join(MERGED_FOLDER, output_filename)
        
        # Clean up old merged files (older than 1 hour)
        try:
            for f in os.listdir(MERGED_FOLDER):
                if f.startswith('merged_') and f.endswith('.mp4'):
                    file_path = os.path.join(MERGED_FOLDER, f)
                    if os.path.getmtime(file_path) < time.time() - 3600:
                        try:
                            os.remove(file_path)
                        except:
                            pass
        except:
            pass
        
        cmd = ['ffmpeg'] + video_inputs + [
            '-filter_complex', filter_complex,
            '-map', '[outv]',
            '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28',
            '-pix_fmt', 'yuv420p',
            '-y',
            output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
        
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            return jsonify({'success': True, 'filename': output_filename})
        else:
            return jsonify({'error': f'Video merge failed: {result.stderr}'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Merge error: {str(e)}'}), 500

@app.route('/merged_videos/<filename>')
def serve_merged(filename):
    return send_from_directory(MERGED_FOLDER, filename)

@app.route('/download_with_caption/<word>')
def download_with_caption(word):
    try:
        video_path = os.path.join(ANIMATION_FOLDER, f'{word}.mp4')
        if not os.path.exists(video_path):
            video_path = os.path.join(UPLOAD_FOLDER, f'{word}.mp4')
        
        if not os.path.exists(video_path):
            return jsonify({'error': 'Video not found'}), 404
        
        output_path = os.path.join(MERGED_FOLDER, f'{word}_captioned.mp4')
        if os.path.exists(output_path):
            os.remove(output_path)
        
        cmd = ['ffmpeg', '-i', video_path,
               '-vf', f"drawtext=text='{word}':fontsize=40:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=10:x=(w-text_w)/2:y=h-th-20",
               '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
               '-pix_fmt', 'yuv420p', '-y',
               output_path]
        
        subprocess.run(cmd, capture_output=True, timeout=60)
        
        if os.path.exists(output_path):
            return send_from_directory(MERGED_FOLDER, f'{word}_captioned.mp4', as_attachment=True)
        else:
            return jsonify({'error': 'Failed to create captioned video'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/learning_videos/<filename>')
def serve_learning_video(filename):
    video_path = os.path.join('learning', 'Animation_video')
    if not os.path.exists(os.path.join(video_path, filename)):
        return jsonify({'error': 'Video not found'}), 404
    return send_from_directory(video_path, filename)

@app.route('/phrases/<phrase_type>/<filename>')
def serve_phrase_image(phrase_type, filename):
    folder = 'static/Daily_phrases' if phrase_type == 'daily' else 'static/Emergency_phrases'
    return send_from_directory(folder, filename)

@app.route('/get_phrases/<phrase_type>')
def get_phrases(phrase_type):
    folder = 'static/Daily_phrases' if phrase_type == 'daily' else 'static/Emergency_phrases'
    if os.path.exists(folder):
        images = [f for f in os.listdir(folder) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
        return jsonify({'phrases': [{'name': os.path.splitext(f)[0], 'file': f} for f in images]})
    return jsonify({'phrases': []})

@app.route('/teacher/upload_video', methods=['POST'])
@login_required
@role_required('teacher')
def teacher_upload_video():
    try:
        if 'video' not in request.files or 'title' not in request.form:
            return jsonify({'error': 'Missing video or title'}), 400
        
        video = request.files['video']
        title = request.form['title']
        
        if not video.filename:
            return jsonify({'error': 'No file selected'}), 400
        
        filename = f"teacher_{current_user.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.mp4"
        video_path = os.path.join(UPLOAD_FOLDER, filename)
        video.save(video_path)
        
        assignment = Assignment(
            title=title,
            type='video',
            video_path=filename,
            teacher_id=current_user.id
        )
        db.session.add(assignment)
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/teacher/delete_video/<int:video_id>', methods=['DELETE'])
@login_required
@role_required('teacher')
def teacher_delete_video(video_id):
    try:
        video = Assignment.query.get(video_id)
        if not video or video.teacher_id != current_user.id:
            return jsonify({'error': 'Video not found'}), 404
        
        video_path = os.path.join(UPLOAD_FOLDER, video.video_path)
        if os.path.exists(video_path):
            os.remove(video_path)
        
        db.session.delete(video)
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/student/video/<int:video_id>')
@login_required
@role_required('student')
def student_view_video(video_id):
    video = Assignment.query.get_or_404(video_id)
    return render_template('video_player.html', video=video)

# Admin Routes
@app.route('/admin/users/add', methods=['POST'])
@login_required
@role_required('admin')
def admin_add_user():
    data = request.get_json()
    user = User(
        username=data['username'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        role=data['role'],
        parent_id=data.get('parent_id'),
        teacher_id=data.get('teacher_id')
    )
    db.session.add(user)
    db.session.commit()
    log_activity(current_user.id, 'add_user', f'Added {data["role"]}: {data["username"]}')
    return jsonify({'success': True})

@app.route('/admin/users/<int:user_id>', methods=['GET'])
@login_required
def admin_get_user(user_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    user = User.query.get_or_404(user_id)
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'parent_id': user.parent_id
    })

@app.route('/admin/users/<int:user_id>/edit', methods=['PUT'])
@login_required
@role_required('admin')
def admin_edit_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.teacher_id = data.get('teacher_id', user.teacher_id)
    user.parent_id = data.get('parent_id', user.parent_id)
    if data.get('password'):
        user.password = generate_password_hash(data['password'])
    db.session.commit()
    log_activity(current_user.id, 'edit_user', f'Edited user: {user.username}')
    return jsonify({'success': True})

@app.route('/admin/users/<int:user_id>/toggle', methods=['POST'])
@login_required
@role_required('admin')
def admin_toggle_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = not user.is_active
    db.session.commit()
    log_activity(current_user.id, 'toggle_user', f"{'Activated' if user.is_active else 'Deactivated'} user: {user.username}")
    return jsonify({'success': True, 'is_active': user.is_active})

@app.route('/admin/users/<int:user_id>/delete', methods=['DELETE'])
@login_required
@role_required('admin')
def admin_delete_user(user_id):
    user = User.query.get_or_404(user_id)
    username = user.username
    db.session.delete(user)
    db.session.commit()
    log_activity(current_user.id, 'delete_user', f'Deleted user: {username}')
    return jsonify({'success': True})

@app.route('/admin/logs')
@login_required
@role_required('admin')
def admin_logs():
    role = request.args.get('role')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = UserLog.query
    if role:
        user_ids = [u.id for u in User.query.filter_by(role=role).all()]
        query = query.filter(UserLog.user_id.in_(user_ids))
    if start_date:
        query = query.filter(UserLog.timestamp >= datetime.strptime(start_date, '%Y-%m-%d'))
    if end_date:
        query = query.filter(UserLog.timestamp <= datetime.strptime(end_date, '%Y-%m-%d'))
    
    logs = query.order_by(UserLog.timestamp.desc()).all()
    return jsonify([{
        'id': log.id,
        'username': log.user.username,
        'role': log.user.role,
        'action': log.action,
        'details': log.details,
        'ip_address': log.ip_address,
        'timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    } for log in logs])

@app.route('/admin/report/pdf')
@login_required
@role_required('admin')
def admin_report_pdf():
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()
        
        title = Paragraph(f"<b>SignBridge Users Report</b><br/>{datetime.now().strftime('%B %d, %Y %H:%M')}", styles['Title'])
        elements.append(title)
        elements.append(Spacer(1, 0.3*inch))
        
        data = [['Username', 'Email', 'Role', 'Status', 'Parent Email', 'Created']]
        for user in User.query.all():
            data.append([
                user.username,
                user.email,
                user.role.capitalize(),
                'Active' if user.is_active else 'Inactive',
                user.parent_email or 'N/A',
                user.created_at.strftime('%Y-%m-%d')
            ])
        
        table = Table(data, colWidths=[1.2*inch, 1.8*inch, 0.8*inch, 0.8*inch, 1.5*inch, 1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#D96432')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
        ]))
        elements.append(table)
        
        doc.build(elements)
        buffer.seek(0)
        
        return Response(buffer.getvalue(), mimetype='application/pdf',
                        headers={'Content-Disposition': f'attachment; filename=SignBridge_Users_Report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/report/csv')
@login_required
@role_required('admin')
def admin_report_csv():
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Username', 'Email', 'Role', 'Active', 'Parent Email', 'Created At'])
    for user in User.query.all():
        writer.writerow([user.username, user.email, user.role, user.is_active, user.parent_email or 'N/A', user.created_at])
    
    response = Response(output.getvalue(), mimetype='text/csv')
    response.headers['Content-Disposition'] = f'attachment; filename=SignBridge_Users_Report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    return response

# Teacher Routes
@app.route('/teacher/students')
@login_required
@role_required('teacher')
def teacher_students():
    students = User.query.filter_by(role='student', teacher_id=current_user.id).all()
    return jsonify([{'id': s.id, 'username': s.username, 'email': s.email} for s in students])

@app.route('/teacher/attendance', methods=['POST'])
@login_required
@role_required('teacher')
def teacher_mark_attendance():
    data = request.get_json()
    attendance = Attendance(
        student_id=data['student_id'],
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        status=data['status'],
        teacher_id=current_user.id
    )
    db.session.add(attendance)
    db.session.commit()
    log_activity(current_user.id, 'mark_attendance', f'Marked attendance for student {data["student_id"]}')
    return jsonify({'success': True})

@app.route('/teacher/remark', methods=['POST'])
@login_required
@role_required('teacher')
def teacher_add_remark():
    data = request.get_json()
    remark = Remark(
        student_id=data['student_id'],
        teacher_id=current_user.id,
        remark_type=data.get('type', 'general'),
        content=data['content']
    )
    db.session.add(remark)
    db.session.commit()
    
    student = User.query.get(data['student_id'])
    if student.parent_id:
        notif = Notification(
            user_id=student.parent_id,
            message=f'New remark for {student.username}: {data["content"]}'
        )
        db.session.add(notif)
        db.session.commit()
    
    log_activity(current_user.id, 'add_remark', f'Added remark for student {data["student_id"]}')
    return jsonify({'success': True})

# Parent Routes
@app.route('/parent/child/<int:child_id>')
@login_required
@role_required('parent')
def parent_view_child(child_id):
    child = User.query.filter_by(id=child_id, parent_id=current_user.id).first_or_404()
    attendance = Attendance.query.filter_by(student_id=child_id).order_by(Attendance.date.desc()).limit(30).all()
    remarks = Remark.query.filter_by(student_id=child_id).order_by(Remark.created_at.desc()).all()
    progress = Progress.query.filter_by(user_id=child_id).all()
    return jsonify({
        'child': {'id': child.id, 'username': child.username, 'email': child.email},
        'attendance': [{'date': a.date.strftime('%Y-%m-%d'), 'status': a.status} for a in attendance],
        'remarks': [{'content': r.content, 'type': r.remark_type, 'date': r.created_at.strftime('%Y-%m-%d')} for r in remarks],
        'progress': [{'module': p.module, 'item': p.item, 'score': p.score, 'completed': p.completed} for p in progress]
    })

@app.route('/parent/notifications')
@login_required
@role_required('parent')
def parent_notifications():
    notifs = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()
    return jsonify([{'id': n.id, 'message': n.message, 'is_read': n.is_read, 'created_at': n.created_at.strftime('%Y-%m-%d %H:%M')} for n in notifs])

@app.route('/parent/notifications/<int:notif_id>/read', methods=['POST'])
@login_required
@role_required('parent')
def parent_mark_notification_read(notif_id):
    notif = Notification.query.get_or_404(notif_id)
    notif.is_read = True
    db.session.commit()
    return jsonify({'success': True})

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/alert')
def alert():
    return render_template('alert.html')

@app.route('/api/risk_stats')
def risk_stats():
    return jsonify({'total_students': 0, 'at_risk': 0, 'alerts_today': 0})

@app.route('/api/children_risks')
@login_required
def children_risks():
    return jsonify([])

@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.get_json()
        feedback = Feedback(
            name=data.get('name'),
            email=data.get('email'),
            message=data.get('message')
        )
        db.session.add(feedback)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/feedback')
@login_required
@role_required('admin')
def admin_view_feedback():
    feedbacks = Feedback.query.order_by(Feedback.created_at.desc()).all()
    return jsonify([{
        'id': f.id,
        'name': f.name,
        'email': f.email,
        'message': f.message,
        'created_at': f.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for f in feedbacks])



@app.route('/send_alert', methods=['POST'])
def send_alert():
    return jsonify({'error': 'SMS alerts not available'}), 400

@app.route('/parent/alerts')
@login_required
@role_required('parent')
def parent_alerts():
    alerts = Alert.query.filter_by(parent_id=current_user.id).order_by(Alert.created_at.desc()).all()
    return jsonify([{
        'id': a.id,
        'student': User.query.get(a.student_id).username,
        'sign': a.sign_detected,
        'latitude': a.latitude,
        'longitude': a.longitude,
        'is_read': a.is_read,
        'created_at': a.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for a in alerts])

@app.route('/parent/alerts/<int:alert_id>/read', methods=['POST'])
@login_required
@role_required('parent')
def parent_mark_alert_read(alert_id):
    alert = Alert.query.get_or_404(alert_id)
    alert.is_read = True
    db.session.commit()
    return jsonify({'success': True})

@app.route('/student/<int:student_id>/progress')
@login_required
def student_progress_details(student_id):
    # Check if user is parent of this student or admin
    student = User.query.get_or_404(student_id)
    if current_user.role == 'parent' and student.parent_id != current_user.id:
        return "Access denied", 403
    if current_user.role not in ['parent', 'admin', 'teacher']:
        return "Access denied", 403
    
    progress = Progress.query.filter_by(user_id=student_id).order_by(Progress.timestamp.desc()).all()
    attendance = Attendance.query.filter_by(student_id=student_id).order_by(Attendance.date.desc()).limit(30).all()
    remarks = Remark.query.filter_by(student_id=student_id).order_by(Remark.created_at.desc()).all()
    
    stats = {
        'total': len(progress),
        'completed': len([p for p in progress if p.completed]),
        'avg_score': round(sum([p.score for p in progress]) / len(progress)) if progress else 0,
        'quizzes': len([p for p in progress if p.module == 'quiz']),
        'videos_watched': len([p for p in progress if p.module == 'video'])
    }
    
    return render_template('student_progress_details.html', student=student, progress=progress, stats=stats, attendance=attendance, remarks=remarks)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
