import pandas as pd
import os

def load_data():
    project_data_path = os.path.join(os.path.dirname(__file__), 'MSME_PROJECT_DATA.xlsx')
    scheme_data_path = os.path.join(os.path.dirname(__file__), 'SCHEME_DATASET_FINAL.xlsx')
    
    msme_df = pd.read_excel(project_data_path)
    scheme_df = pd.read_excel(scheme_data_path)
    return msme_df, scheme_df

def check_eligibility(msme, scheme):
    # Sector check
    sector_match = scheme['Eligible_Sectors'] == 'All' or msme['Sector'] in scheme['Eligible_Sectors']
    
    # Category check
    cat_match = scheme['Target_Category'] == 'All' or msme['Category'] == scheme['Target_Category']
    
    # Location check
    loc_match = scheme['Location_Criteria'] == 'All' or scheme['Location_Criteria'] == 'Urban/Rural' or msme['Location_Type'] == scheme['Location_Criteria']
    
    return sector_match and cat_match and loc_match

def run_simulation():
    msme_df, scheme_df = load_data()
    
    results = []
    
    for _, msme in msme_df.iterrows():
        eligible_schemes = []
        for _, scheme in scheme_df.iterrows():
            if check_eligibility(msme, scheme):
                eligible_schemes.append(scheme)
                
        if eligible_schemes:
            # Pick the scheme with the highest revenue impact if multiple are eligible
            best_scheme = max(eligible_schemes, key=lambda x: x['Impact_Factor_Revenue (%)'] if pd.notnull(x['Impact_Factor_Revenue (%)']) else 0)
            
            before_rev = msme['Annual_Revenue']
            impact_percent = best_scheme['Impact_Factor_Revenue (%)']
            after_rev = before_rev + (before_rev * (impact_percent / 100))
            jobs = int(best_scheme['Impact_Factor_Employment (Jobs)'])
            
            results.append({
                'MSME_ID': msme['MSME_ID'],
                'Scheme_Name': best_scheme['Scheme_Name'],
                'Before_Revenue': before_rev,
                'After_Revenue': round(after_rev, 2),
                'Jobs_Created': jobs
            })
            
    results_df = pd.DataFrame(results)
    print("SAMPLE PROJECTIONS (Before vs After):")
    print(results_df.head(10).to_string())
    
    return results_df

if __name__ == "__main__":
    run_simulation()
