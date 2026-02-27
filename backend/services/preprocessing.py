import pandas as pd
from sklearn.preprocessing import OneHotEncoder
import joblib
import os

ENCODER_PATH = os.path.join(os.path.dirname(__file__), '..', 'model', 'encoder.pkl')

def preprocess_data(df, training=True):
    df_processed = df.copy()

    if 'MSME_ID' in df_processed.columns:
        df_processed = df_processed.drop('MSME_ID', axis=1)

    if 'Growth_Category' in df_processed.columns:
        growth_map = {'Low': 0, 'Moderate': 1, 'High': 2}
        df_processed['Growth_Category'] = df_processed['Growth_Category'].map(growth_map)

    cat_cols = ['Sector', 'Ownership_Type', 'Category', 'Location_Type', 'Technology_Level']
    cat_cols_present = [col for col in cat_cols if col in df_processed.columns]

    if training:
        encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
        encoded_cols = encoder.fit_transform(df_processed[cat_cols_present])
        encoded_df = pd.DataFrame(encoded_cols, columns=encoder.get_feature_names_out(cat_cols_present))
        
        df_processed = df_processed.drop(cat_cols_present, axis=1)
        df_processed = pd.concat([df_processed, encoded_df], axis=1)
        
        joblib.dump(encoder, ENCODER_PATH)
    else:
        if os.path.exists(ENCODER_PATH):
            encoder = joblib.load(ENCODER_PATH)
            encoded_cols = encoder.transform(df_processed[cat_cols_present])
            encoded_df = pd.DataFrame(encoded_cols, columns=encoder.get_feature_names_out(cat_cols_present))
            
            df_processed = df_processed.drop(cat_cols_present, axis=1)
            df_processed = pd.concat([df_processed, encoded_df], axis=1)
            
    return df_processed
