import pandas as pd
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
MSME_DATA_PATH = os.path.join(DATA_DIR, 'MSME_PROJECT_DATA.xlsx')
PREDICTED_DATA_PATH = os.path.join(DATA_DIR, 'MSME_WITH_PREDICTIONS.xlsx')

def load_msme_data():
    return pd.read_excel(MSME_DATA_PATH)

def load_predicted_data():
    if os.path.exists(PREDICTED_DATA_PATH):
        return pd.read_excel(PREDICTED_DATA_PATH)
    return None

def save_predicted_data(df):
    df.to_excel(PREDICTED_DATA_PATH, index=False)
