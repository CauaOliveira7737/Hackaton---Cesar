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
    tempo_estudo_minutos = db.Column(db.Integer, default=0)  
    videos_concluidos = db.Column(db.Integer, default=0)
    conquistas = db.Column(db.String(255), default='')
    foto = db.Column(db.String(255), default='')

class Favoritos(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    video_id = db.Column(db.Integer, nullable=False)  
    
    usuario = db.relationship('Usuarios', backref=db.backref('favoritos', lazy=True))

class Atividade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(120), nullable=False)
    descricao = db.Column(db.Text)
    categoria = db.Column(db.String(50))
    data = db.Column(db.String(10))  # YYYY-MM-DD
    hora = db.Column(db.String(5))   # HH:MM
    duracao = db.Column(db.Integer)
    concluida = db.Column(db.Boolean, default=False)
    externa = db.Column(db.Boolean, default=False)
    local = db.Column(db.String(120))
    user_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)


# TELAS -----------------------------------------------------------

@app.route('/')
@app.route('/index')
def index():
    if 'user_id' not in session:
        return redirect('/login')
    
    user_id = session['user_id']
    usuario = Usuarios.query.get(user_id)

    with open('static/dados_video/arquivo.json', 'r', encoding='utf-8') as f:
        dados = json.load(f)
    
    videos = dados['videos']
    favoritos_usuario = Favoritos.query.filter_by(user_id=user_id).all()
    ids_favoritos = {f.video_id for f in favoritos_usuario}

    for video in videos:
        video['favorito'] = video['id'] in ids_favoritos

    return render_template('index.html', videos=videos, usuario=usuario, pagina_atual='index')

    
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

@app.route('/calendario')
def calendario():
    if 'user_id' not in session:
        return redirect('/login')

    user_id = session['user_id']
    usuario = Usuarios.query.get(user_id)

    return render_template('calendario.html', usuario=usuario, pagina_atual='calendario')
    
@app.route('/perfil')
def perfil():
    if 'user_id' not in session:
        return redirect('/login')
    
    user_id = session['user_id']
    usuario = Usuarios.query.get(user_id)

    horas = usuario.tempo_estudo_minutos // 60
    minutos = usuario.tempo_estudo_minutos % 60
    tempo_estudo_formatado = f"{horas}h {minutos}m"

    return render_template('perfil.html', pagina_atual='perfil', usuario=usuario, tempo_estudo=tempo_estudo_formatado) 

@app.route('/editar_perfil', methods=['POST'])
def editar_perfil():
    if 'user_id' not in session:
        return redirect('/login')

    user_id = session['user_id']
    usuario = Usuarios.query.get(user_id)

    novo_username = request.form.get('username')
    novo_email = request.form.get('email')
    foto = request.files.get('foto')

    if novo_username:
        usuario.username = novo_username
    if novo_email:
        usuario.email = novo_email

    if foto and foto.filename != '':
        from werkzeug.utils import secure_filename
        import os
        nome_arquivo = secure_filename(foto.filename)
        caminho = os.path.join(app.root_path, 'static', 'fotos', nome_arquivo)
        foto.save(caminho)
        usuario.foto = nome_arquivo

    db.session.commit()
    return redirect('/perfil')

@app.route('/salvos')
def ver_salvos():
    if 'user_id' not in session:
        return redirect('/login')

    user_id = session['user_id']
    usuario = Usuarios.query.get(user_id)
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

    return render_template('salvos.html', videos=videos_favoritos, busca=busca, usuario=usuario, pagina_atual='salvos')


# FUNÇÕES -----------------------------------------------------------

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

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect('/login')

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

@app.route('/atividades', methods=['GET'])
def listar_atividades():
    if 'user_id' not in session:
        return jsonify([])
    atividades = Atividade.query.filter_by(user_id=session['user_id']).all()
    return jsonify([{
        'id': a.id,
        'titulo': a.titulo,
        'descricao': a.descricao,
        'categoria': a.categoria,
        'data': a.data,
        'hora': a.hora,
        'duracao': a.duracao,
        'concluida': a.concluida,
        'externa': a.externa,
        'local': a.local
    } for a in atividades])

@app.route('/atividades', methods=['POST'])
def adicionar_atividade():
    if 'user_id' not in session:
        return jsonify({'erro': 'Não autenticado'}), 401
    dados = request.json
    nova = Atividade(
        titulo=dados['titulo'],
        descricao=dados.get('descricao'),
        categoria=dados.get('categoria', 'geral'),
        data=dados['data'],
        hora=dados['hora'],
        duracao=dados['duracao'],
        concluida=False,
        externa=dados.get('externa', False),
        local=dados.get('local'),
        user_id=session['user_id']
    )
    db.session.add(nova)
    db.session.commit()
    return jsonify({'sucesso': True})

@app.route('/atividades/<int:id>/toggle', methods=['POST'])
def alternar_conclusao(id):
    if 'user_id' not in session:
        return jsonify({'erro': 'Não autenticado'}), 401
    atv = Atividade.query.filter_by(id=id, user_id=session['user_id']).first()
    if not atv:
        return jsonify({'erro': 'Não encontrada'}), 404
    atv.concluida = not atv.concluida
    db.session.commit()
    return jsonify({'sucesso': True, 'concluida': atv.concluida})

@app.route('/atividades/<int:id>', methods=['DELETE'])
def deletar_atividade(id):
    if 'user_id' not in session:
        return jsonify({'erro': 'Não autenticado'}), 401
    atv = Atividade.query.filter_by(id=id, user_id=session['user_id']).first()
    if not atv:
        return jsonify({'erro': 'Não encontrada'}), 404
    db.session.delete(atv)
    db.session.commit()
    return jsonify({'sucesso': True})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)