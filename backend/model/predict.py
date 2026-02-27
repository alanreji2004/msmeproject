import os
import joblib
from services.data_loader import load_predicted_data
from services.preprocessing import preprocess_data

MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, 'model.pkl')

def get_predictions():
    df = load_predicted_data()
    if df is not None:
        return df.to_dict(orient='records')
    return []

def get_prediction_by_id(msme_id):
    df = load_predicted_data()
    if df is not None:
        msme_data = df[df['MSME_ID'] == msme_id]
        if not msme_data.empty:
            msme_dict = msme_data.iloc[0].to_dict()
            
            original_data = {k: v for k, v in msme_dict.items() if k not in ['Predicted_Growth_Category', 'Growth_Score']}
            predicted_category = msme_dict.get('Predicted_Growth_Category')
            growth_score = msme_dict.get('Growth_Score')
            
            top_features = {}
            if os.path.exists(MODEL_PATH):
                model = joblib.load(MODEL_PATH)
                feature_importances = model.feature_importances_
                
                dummy_df = load_predicted_data().head(1)
                processed_dummy = preprocess_data(dummy_df, training=False)
                
                try:
                    features = processed_dummy.drop(['Growth_Category', 'Predicted_Growth_Category', 'Growth_Score'], axis=1, errors='ignore').columns
                    if len(features) == len(feature_importances):
                        imp_dict = dict(zip(features, feature_importances))
                        top_features = dict(sorted(imp_dict.items(), key=lambda item: item[1], reverse=True)[:5])
                except Exception as e:
                    pass

            return {
                "original_data": original_data,
                "predicted_category": predicted_category,
                "growth_score": growth_score,
                "top_important_features": top_features
            }
    return None
