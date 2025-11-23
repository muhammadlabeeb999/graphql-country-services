import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_graphql import GraphQLView
from schema import schema
from database import init_db, SessionLocal

app = Flask(__name__)
CORS(app)

# initialize DB (no-op if already created by alembic)
init_db()

@app.teardown_appcontext
def shutdown_session(exception=None):
    SessionLocal.remove()

app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True
    )
)

@app.route('/health')
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
