from flask import Flask, request, jsonify
import xgboost as xgb
import numpy as np
import joblib

# 初始化 Flask
app = Flask(__name__)

# 加载 XGBoost 模型 & StandardScaler
model = xgb.Booster()
model.load_model("xgb_model_inside.json")
scaler = joblib.load("scaler_inside.pkl")  # 预先存储的归一化参数


@app.route("/predict", methods=["POST"])
def predict():
    try:
        # 获取 JSON 输入
        data = request.get_json()
        features = np.array(data["features"])  # 期望 JSON 格式：{"features": [[f1, f2, ..., fn]]}

        # 进行预测
        dmatrix = xgb.DMatrix(features)
        predictions = model.predict(dmatrix)

        # 反归一化
        predictions_real = scaler.inverse_transform(predictions.reshape(-1, 1)).tolist()

        return jsonify({"predictions": predictions_real})

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
