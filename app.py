from flask import Flask, request, render_template, redirect, session, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///meubanco.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'catapimbas'
db = SQLAlchemy(app)

class Usuarios(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Favoritos(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    video_id = db.Column(db.Integer, nullable=False)  

    usuario = db.relationship('Usuarios', backref=db.backref('favoritos', lazy=True))

@app.route('/')
@app.route('/index')
def index():
    if 'user_id' not in session:
        return redirect('/login')
    
    with open('static/dados_video/arquivo.json', 'r', encoding='utf-8') as f:
        dados = json.load(f)
    
    videos = dados['videos']
    favoritos_usuario = Favoritos.query.filter_by(user_id=session['user_id']).all()
    ids_favoritos = {f.video_id for f in favoritos_usuario}

    for video in videos:
        video['favorito'] = video['id'] in ids_favoritos

    return render_template('index.html', videos=videos)
    
@app.route('/favoritar', methods=['POST'])
def favoritar():
    if 'user_id' not in session:
        return jsonify({'erro': 'Usuário não logado'}), 401

    user_id = session['user_id']
    video_id = request.json.get('video_id')

    if not video_id:
        return jsonify({'erro': 'Vídeo inválido'}), 400

    favorito = Favoritos.query.filter_by(user_id=user_id, video_id=video_id).first()

    if favorito:
        db.session.delete(favorito)
        db.session.commit()
        return jsonify({'status': 'removido'})
    else:
        novo_favorito = Favoritos(user_id=user_id, video_id=video_id)
        db.session.add(novo_favorito)
        db.session.commit()
        return jsonify({'status': 'adicionado'})
@app.route('/registro', methods=['GET', 'POST'])
def registro():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        novo_usuario = Usuarios(username=username, email=email, password=password)
        db.session.add(novo_usuario)
        db.session.commit()
        
        return redirect('/login')
    
    return render_template('registro.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        usuario = Usuarios.query.filter_by(username=username, password=password).first()
        if usuario:
            session['user_id'] = usuario.id
            return redirect('/')
        else:
            flash("Invalid credentials")
            return render_template('login.html'), 401
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect('/login')

@app.route('/salvos')
def ver_salvos():
    if 'user_id' not in session:
        return redirect('/login')

    user_id = session['user_id']
    busca = request.args.get('q', '').lower().strip()

    favoritos = Favoritos.query.filter_by(user_id=user_id).all()
    video_ids = [fav.video_id for fav in favoritos]

    with open('static/dados_video/arquivo.json', 'r', encoding='utf-8') as f:
        dados = json.load(f)

    todos_videos = dados['videos']

    videos_favoritos = []
    for v in todos_videos:
        if v['id'] in video_ids:
            if busca == '' or busca in v['titulo'].lower():
                v['favorito'] = True
                videos_favoritos.append(v)

    return render_template('salvos.html', videos=videos_favoritos, busca=busca)



@app.route('/calendario')
def calendario():
    return render_template('calendario.html')
    
@app.route('/perfil')
def perfil():
    return render_template('perfil.html')

@app.route('/salvar_video', methods=['POST'])
def salvar_video():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Usuário não logado'}), 401

    video_id = request.json.get('video_id')

    if 'favoritos' not in session:
        session['favoritos'] = []

    if video_id not in session['favoritos']:
        session['favoritos'].append(video_id)
        session.modified = True  

    return jsonify({'success': True})

@app.route('/toggle_favorito', methods=['POST'])
def toggle_favorito():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401

    data = request.json
    video_id = data.get('video_id')

    favorito = Favoritos.query.filter_by(user_id=session['user_id'], video_id=video_id).first()

    if favorito:
        db.session.delete(favorito)
        db.session.commit()
        return jsonify({'success': True, 'favorited': False})
    else:
        novo_favorito = Favoritos(user_id=session['user_id'], video_id=video_id)
        db.session.add(novo_favorito)
        db.session.commit()
        return jsonify({'success': True, 'favorited': True})



if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

