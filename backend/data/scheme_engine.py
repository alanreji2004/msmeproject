import pandas as pd
import os

def load_data():
    project_data_path = os.path.join(os.path.dirname(__file__), 'MSME_PROJECT_DATA.xlsx')
    scheme_data_path = os.path.join(os.path.dirname(__file__), 'SCHEME_DATASET_FINAL.xlsx')
    
    msme_df = pd.read_excel(project_data_path)
    scheme_df = pd.read_excel(scheme_data_path)
    return msme_df, scheme_df

def check_eligibility(msme, scheme):
    # Sector check (substring match for cases where scheme allows multiple e.g. "Manufacturing, IT")
    sector_match = 'all' in str(scheme['Eligible_Sectors']).lower() or str(msme['Sector']).lower() in str(scheme['Eligible_Sectors']).lower()
    
    # Category check (Target_Category in Scheme maps to Enterprise_Size in MSME: Micro/Small/Medium)
    cat_match = 'all' in str(scheme['Target_Category']).lower() or str(msme['Enterprise_Size']).lower() in str(scheme['Target_Category']).lower()
    
    # Location check
    loc_match = 'all' in str(scheme['Location_Criteria']).lower() or 'urban/rural' in str(scheme['Location_Criteria']).lower() or str(msme['Location_Type']).lower() in str(scheme['Location_Criteria']).lower()
    
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

def get_msme_schemes(msme_dict):
    """
    Given a single MSME dictionary, run eligibility checks against all schemes.
    Return an array of all eligible schemes (up to 5), simulating the before-and-after
    Revenue and Employment impact for each. Mark the highest-revenue scheme as 'recommended'.
    """
    _, scheme_df = load_data()
    
    eligible_schemes = []
    before_rev = msme_dict.get('Annual_Revenue', 0)
    
    for _, scheme in scheme_df.iterrows():
        # Sector check
        sector_match = 'all' in str(scheme['Eligible_Sectors']).lower() or str(msme_dict.get('Sector', '')).lower() in str(scheme['Eligible_Sectors']).lower()
        
        # Category check
        cat_match = 'all' in str(scheme['Target_Category']).lower() or str(msme_dict.get('Enterprise_Size', '')).lower() in str(scheme['Target_Category']).lower()
        
        # Location check
        loc_type = str(msme_dict.get('Location_Type', '')).lower()
        loc_criteria = str(scheme['Location_Criteria']).lower()
        loc_match = 'all' in loc_criteria or 'urban/rural' in loc_criteria or loc_type in loc_criteria
        
        if sector_match and cat_match and loc_match:
            impact_percent = scheme['Impact_Factor_Revenue (%)']
            if pd.isna(impact_percent): impact_percent = 0
            
            jobs = scheme['Impact_Factor_Employment (Jobs)']
            if pd.isna(jobs): jobs = 0
            
            after_rev = before_rev + (before_rev * (impact_percent / 100))
            
            eligible_schemes.append({
                "Scheme_Name": scheme['Scheme_Name'],
                "Impact_Factor_Revenue_Percent": float(impact_percent),
                "Impact_Factor_Employment": int(jobs),
                "Before_Revenue": float(before_rev),
                "Projected_After_Revenue": float(after_rev),
                "Revenue_Gain": float(after_rev - before_rev),
                "Subsidy_Cap": float(scheme['Max_Subsidy_Amount'])
            })
            
    # Sort eligible schemes by Revenue Gain descending, limit to 5
    eligible_schemes = sorted(eligible_schemes, key=lambda x: x.get('Revenue_Gain', 0), reverse=True)[:5]
    
    if len(eligible_schemes) > 0:
        eligible_schemes[0]['Recommended'] = True
        
    return eligible_schemes

if __name__ == "__main__":
    run_simulation()
