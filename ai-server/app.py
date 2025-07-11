from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)

chemical_list = [
    "methyl butanoate", "pentanal", "propylbenzene", "triethylamine",
    "trichloroethylene", "toluene", "thiophene", "tertiary butyl acetate",
    "styrene", "s-butylamine", "pyridine", "propyl propanoate", "pentane",
    "propyl butanoate", "propyl acetate", "propene", "propanoic acid",
    "propane", "propanal", "phenol", "trimethylamine", "p-cresol"
]

def dummy_predict(input_vector: np.ndarray) -> dict:
    raw_scores = np.random.rand(22)
    probabilities = raw_scores / raw_scores.sum()
    result = dict(zip(chemical_list, probabilities.round(4)))
    return result

@app.route("/predict", methods=["POST"])
def predict():
    try:
        json_data = request.get_json()
        vector = json_data.get("vector", [])

        if len(vector) != 48:
            return jsonify({"error": "48차원 벡터가 필요합니다."}), 400

        input_array = np.array(vector)
        result = dummy_predict(input_array)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
