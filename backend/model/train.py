import os
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from services.data_loader import load_msme_data, save_predicted_data
from services.preprocessing import preprocess_data

MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, 'model.pkl')

def train_model():
    df = load_msme_data()
    df_processed = preprocess_data(df, training=True)
    
    X = df_processed.drop('Growth_Category', axis=1)
    y = df_processed['Growth_Category']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    conf_matrix = confusion_matrix(y_test, y_pred)
    class_report = classification_report(y_test, y_pred, output_dict=True)
    
    feature_importances = model.feature_importances_
    features = X.columns
    importance_dict = dict(zip(features, feature_importances))
    
    joblib.dump(model, MODEL_PATH)
    
    probabilities = model.predict_proba(X)
    
    df['Growth_Score'] = (probabilities[:, 2] + (probabilities[:, 1] * 0.5)) * 100
    
    y_pred_all = model.predict(X)
    
    rev_growth_map = {0: 'Low', 1: 'Moderate', 2: 'High'}
    df['Predicted_Growth_Category'] = [rev_growth_map[val] for val in y_pred_all]
    
    save_predicted_data(df)
    
    return {
        "accuracy": accuracy,
        "confusion_matrix": conf_matrix.tolist(),
        "classification_report": class_report,
        "feature_importance": importance_dict
    }
