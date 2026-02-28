import pandas as pd
import argparse
import os

def load_data():
    project_data_path = os.path.join(os.path.dirname(__file__), 'MSME_PROJECT_DATA.xlsx')
    scheme_data_path = os.path.join(os.path.dirname(__file__), 'SCHEME_DATASET_FINAL.xlsx')
    
    msme_df = pd.read_excel(project_data_path)
    scheme_df = pd.read_excel(scheme_data_path)
    return msme_df, scheme_df

def check_eligibility(msme, scheme):
    sector_match = scheme['Eligible_Sectors'] == 'All' or msme['Sector'] in scheme['Eligible_Sectors']
    cat_match = scheme['Target_Category'] == 'All' or msme['Category'] == scheme['Target_Category']
    loc_match = scheme['Location_Criteria'] == 'All' or scheme['Location_Criteria'] == 'Urban/Rural' or msme['Location_Type'] == scheme['Location_Criteria']
    
    return sector_match and cat_match and loc_match

def run_optimization(budget, w_rev, w_emp):
    msme_df, scheme_df = load_data()
    
    # 1. Generate all eligible allocations (MSME -> Scheme match)
    allocations = []
    
    for _, msme in msme_df.iterrows():
        for _, scheme in scheme_df.iterrows():
            if check_eligibility(msme, scheme):
                
                # Retrieve impact factors
                rev_impact = scheme['Impact_Factor_Revenue (%)'] if pd.notnull(scheme['Impact_Factor_Revenue (%)']) else 0
                emp_impact = scheme['Impact_Factor_Employment (Jobs)'] if pd.notnull(scheme['Impact_Factor_Employment (Jobs)']) else 0
                cost = scheme['Max_Subsidy_Amount'] if pd.notnull(scheme['Max_Subsidy_Amount']) else 0
                
                # Calculate absolute projected revenue increase
                before_rev = msme['Annual_Revenue']
                rev_increase = before_rev * (rev_impact / 100)
                
                allocations.append({
                    'MSME_ID': msme['MSME_ID'],
                    'Sector': msme['Sector'],
                    'Scheme_Name': scheme['Scheme_Name'],
                    'Scheme_ID': scheme['Scheme_ID'],
                    'Subsidy_Cost': cost,
                    'Rev_Increase': rev_increase,
                    'Jobs_Created': emp_impact,
                    'Before_Revenue': before_rev,
                    'After_Revenue': before_rev + rev_increase
                })

    empty_response = {
        "summary": {
            "Total_Budget_Initial": budget,
            "Total_Budget_Spent": 0,
            "Total_Budget_Remaining": budget,
            "Total_MSMEs_Funded": 0,
            "Total_Projected_Jobs_Created": 0
        },
        "allocations": [],
        "rejected": [],
        "sector_stats": []
    }

    if not allocations:
        return empty_response

    alloc_df = pd.DataFrame(allocations)
    
    # Normalize features for accurate weighted scoring (Min-Max Scaling)
    max_rev = alloc_df['Rev_Increase'].max() or 1
    max_emp = alloc_df['Jobs_Created'].max() or 1
    
    alloc_df['Norm_Rev'] = alloc_df['Rev_Increase'] / max_rev
    alloc_df['Norm_Emp'] = alloc_df['Jobs_Created'] / max_emp
    
    # Calculate composite Weighted Score based on user policy weights
    alloc_df['Optimization_Score'] = (alloc_df['Norm_Rev'] * w_rev) + (alloc_df['Norm_Emp'] * w_emp)
    
    # Sort by the best Score per unit cost (Knapsack value density approximation)
    alloc_df['Score_per_Cost'] = alloc_df['Optimization_Score'] / alloc_df['Subsidy_Cost'].replace(0, 1)
    alloc_df = alloc_df.sort_values(by='Score_per_Cost', ascending=False)
    
    # 2. Greedily enforce budget constraints to pick best allocations (1 scheme per MSME max)
    selected_allocations = []
    rejected_allocations = []
    current_budget = budget
    allocated_msmes = set()
    
    for _, alloc in alloc_df.iterrows():
        msme_id = alloc['MSME_ID']
        cost = alloc['Subsidy_Cost']
        score = alloc['Optimization_Score']
        
        if msme_id in allocated_msmes:
            continue
            
        if current_budget >= cost:
            selected_allocations.append(alloc)
            current_budget -= cost
            allocated_msmes.add(msme_id)
        else:
            # Determine reason for rejection
            if score < 0.3:
                reason = "Policy priority mismatch"
            elif score < 0.5:
                reason = "Lower weighted score"
            else:
                reason = "Budget exhausted"
                
            rejected_dict = {
                'MSME_ID': msme_id,
                'Sector': alloc['Sector'],
                'Scheme_Name': alloc['Scheme_Name'],
                'Optimization_Score': score,
                'Reason': reason
            }
            rejected_allocations.append(rejected_dict)
            
    # 3. Output logic matching Phase 4 and Phase 5 specifications
    if not selected_allocations:
        return empty_response
        
    final_df = pd.DataFrame(selected_allocations)
    output_df = final_df[['MSME_ID', 'Sector', 'Scheme_Name', 'Optimization_Score', 'Subsidy_Cost', 'Before_Revenue', 'After_Revenue', 'Jobs_Created']]
    
    # Calculate sector-wise summary stats
    grouped = final_df.groupby('Sector').agg(
        Allocated_Budget=('Subsidy_Cost', 'sum'),
        Revenue_Gain=('Rev_Increase', 'sum'),
        Jobs_Created=('Jobs_Created', 'sum'),
        MSMEs_Funded=('MSME_ID', 'count')
    ).reset_index()
    sector_stats = grouped.to_dict(orient='records')
    
    # Return a dictionary suitable for JSON serialization
    return {
        "summary": {
            "Total_Budget_Initial": budget,
            "Total_Budget_Spent": budget - current_budget,
            "Total_Budget_Remaining": current_budget,
            "Total_MSMEs_Funded": len(selected_allocations),
            "Total_Projected_Jobs_Created": int(final_df['Jobs_Created'].sum()) if not final_df.empty else 0,
            "Total_Projected_Revenue_Gain": int(final_df['Rev_Increase'].sum()) if not final_df.empty else 0
        },
        "allocations": output_df.to_dict(orient="records"),
        "rejected": rejected_allocations,
        "sector_stats": sector_stats
    }
    return output

def generate_tradeoff_curve(budget: float):
    """
    Runs the optimization engine across 6 distinct w_rev vs w_emp scenarios
    (0.0 to 1.0) to generate the structural points for the Trade-off Curve UI.
    """
    points = []
    for i in range(6):
        w_rev = round(i * 0.2, 1)
        w_emp = round(1.0 - w_rev, 1)
        
        # Calculate for this specific weight
        res = run_optimization(budget, w_rev, w_emp)
        summary = res.get("summary", {})
        
        points.append({
            "w_rev": w_rev,
            "w_emp": w_emp,
            "revenue_gain": summary.get("Total_Projected_Revenue_Gain", 0),
            "jobs_created": summary.get("Total_Projected_Jobs_Created", 0),
            "msmes_funded": summary.get("Total_MSMEs_Funded", 0)
        })
        
    return points

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Phase 4: Budget-Constrained Scheme Optimization.")
    parser.add_argument('--budget', type=float, default=50000000.0, help="Total subsidy budget limit allocated")
    parser.add_argument('--w_rev', type=float, default=0.5, help="Weight importance setting for Revenue (0 to 1)")
    parser.add_argument('--w_emp', type=float, default=0.5, help="Weight importance setting for Employment (0 to 1)")
    parser.add_argument('--tradeoff', action='store_true', help="Generate tradeoff curve points instead of single optimization run")
    
    args = parser.parse_args()
    
    # Basic validation
    if args.w_rev + args.w_emp > 1.01 or args.w_rev + args.w_emp < 0.99:
        print("Warning: Policy weights usually sum to 1. Proceeding anyway...")
        
    run_optimization(args.budget, args.w_rev, args.w_emp)
