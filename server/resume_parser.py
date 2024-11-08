from flask import Flask, request, jsonify
import spacy

app = Flask(__name__)
nlp = spacy.load("en_core_web_sm")

@app.route('/parse_resume', methods=['POST'])
def parse_resume():
    data = request.json
    text = data['text']
    doc = nlp(text)

    resume_data = {
        "name": None,
        "contact": None,
        "experience": [],
        "education": []
    }
    
    # Simple extraction logic for demonstration
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            resume_data["name"] = ent.text
        elif ent.label_ == "ORG":
            resume_data["experience"].append(ent.text)
    
    return jsonify(resume_data)

if __name__ == '__main__':
    app.run(port=5000)
