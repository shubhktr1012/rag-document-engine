from flask import Flask, request, jsonify
from flask_cors import CORS
from rag_core import get_answer_with_sources, initialize_rag_model, reset_rag_model
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}) # Allow requests from our frontend

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/reset", methods=["POST"])
def reset():
    """Resets the RAG model and deletes all uploaded documents."""
    try:
        reset_rag_model()
        return jsonify({"message": "Session reset successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ask", methods=["POST"]) # a decorator, is followed by a function
def ask():
    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()
    if not question:
        return jsonify({"error": "Question is required"}), 400
    
    payload = get_answer_with_sources(question)
    return jsonify(payload)

@app.route("/upload-document", methods=["POST"])
def upload_document():
    # Always reset the session before a new upload
    reset_rag_model()

    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    # category = request.form.get('category') # We can use this later if needed

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        upload_dir = 'uploaded_documents'
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
        
        filepath = os.path.join(upload_dir, file.filename)
        file.save(filepath)

        # Initialize the RAG model with the newly uploaded document
        success, error_message = initialize_rag_model(filepath)
        if success:
            return jsonify({
                "message": f"File '{file.filename}' uploaded and AI model initialized.",
                "filepath": filepath
            }), 200
        else:
            return jsonify({"error": f"Failed to initialize AI model: {error_message}"}), 500
    
    return jsonify({"error": "File could not be processed"}), 500

if __name__ == "__main__":
    print("Starting server...")
    app.run(host="0.0.0.0", port=5000, debug=True)