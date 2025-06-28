from flask import Flask, request, jsonify
from db import get_connection

app = Flask(__name__)

def insert_data(table, data):
    conn = get_connection()
    cursor = conn.cursor()
    cols = ", ".join(data.keys())
    vals = ", ".join(["%s"] * len(data))
    sql = f"INSERT INTO {table} ({cols}) VALUES ({vals})"
    cursor.execute(sql, list(data.values()))
    conn.commit()
    cursor.close()
    conn.close()

@app.route("/api/ram", methods=["POST"])
def ram():
    data = request.get_json()
    data["api"] = "Python"
    insert_data("ram", data)
    return jsonify({"message": "RAM recibida"}), 201

@app.route("/api/cpu", methods=["POST"])
def cpu():
    data = request.get_json()
    data["api"] = "Python"
    insert_data("cpu", data)
    return jsonify({"message": "CPU recibida"}), 201

@app.route("/api/procesos", methods=["POST"])
def procesos():
    data = request.get_json()
    data["api"] = "Python"
    insert_data("procesos", data)
    return jsonify({"message": "Procesos recibidos"}), 201

@app.route("/api/ping", methods=["GET"])
def ping():
    try:
        conn = get_connection()
        conn.close()
        return jsonify({"status": "success", "message": "Conexión a Cloud SQL exitosa"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001)
