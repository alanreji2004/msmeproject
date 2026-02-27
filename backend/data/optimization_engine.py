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
    eligible_msme_ids = set()
    
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
                    'Sector': msme['Sector'], # Track for sector summary
                    'Scheme_Name': scheme['Scheme_Name'],
                    'Scheme_ID': scheme['Scheme_ID'],
                    'Subsidy_Cost': cost,
                    'Rev_Increase': rev_increase,
                    'Jobs_Created': emp_impact,
                    'Before_Revenue': before_rev,
                    'After_Revenue': before_rev + rev_increase
                })
                eligible_msme_ids.add(msme['MSME_ID'])

    non_selected = []
    
    # Track MSMEs that were fundamentally ineligible for everything
    all_msmes = set(msme_df['MSME_ID'].tolist())
    ineligible_msmes = all_msmes - eligible_msme_ids
    for m_id in ineligible_msmes:
        non_selected.append({
            "MSME_ID": m_id,
            "Target_Scheme": "None Applicable",
            "Reason": "Ineligible based on Sector/Category/Location filters"
        })

    if not allocations:
        return {
            "summary": {
                "Total_Budget_Initial": budget,
                "Total_Budget_Spent": 0,
                "Total_Budget_Remaining": budget,
                "Total_MSMEs_Funded": 0,
                "Total_Projected_Jobs_Created": 0
            },
            "allocations": [],
            "non_selected": non_selected,
            "sector_summary": {}
        }

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
    current_budget = budget
    allocated_msmes = set()
    
    # To aggregate sector data
    sector_summary = {}
    
    for _, alloc in alloc_df.iterrows():
        msme_id = alloc['MSME_ID']
        cost = alloc['Subsidy_Cost']
        sector = alloc['Sector']
        
        # Ensure we don't grant 2 schemes to 1 MSME and we don't exceed the total pool budget
        if msme_id not in allocated_msmes:
            if current_budget >= cost:
                selected_allocations.append(alloc)
                current_budget -= cost
                allocated_msmes.add(msme_id)
                
                # Aggregate Sector Summary
                if sector not in sector_summary:
                    sector_summary[sector] = {"MSMEs_Funded": 0, "Budget_Allocated": 0, "Jobs_Created": 0}
                sector_summary[sector]["MSMEs_Funded"] += 1
                sector_summary[sector]["Budget_Allocated"] += cost
                sector_summary[sector]["Jobs_Created"] += alloc["Jobs_Created"]
            else:
                # MSME was eligible and the best scheme was found, but budget exhausted
                non_selected.append({
                    "MSME_ID": msme_id,
                    "Target_Scheme": alloc['Scheme_Name'],
                    "Reason": "Insufficient Budget (Required: ₹{:,.0f})".format(cost)
                })
                # Add it to allocated so we don't add secondary worse schemes for the same MSME into the rejected list
                allocated_msmes.add(msme_id)
            
    # 3. Output logic matching Phase 4 and Phase 5 specifications
    final_df = pd.DataFrame(selected_allocations) if selected_allocations else pd.DataFrame()
    output_dict = final_df[['MSME_ID', 'Scheme_Name', 'Optimization_Score', 'Subsidy_Cost', 'Before_Revenue', 'After_Revenue', 'Jobs_Created']].to_dict(orient="records") if not final_df.empty else []
    
    # Sort non_selected for better display
    non_selected = sorted(non_selected, key=lambda x: x["MSME_ID"])
    
    # Format Sector Summary as a list for easier frontend rendering
    sector_list = []
    for sec, data in sector_summary.items():
        sector_list.append({
            "Sector": sec,
            "MSMEs_Funded": data["MSMEs_Funded"],
            "Budget_Allocated": data["Budget_Allocated"],
            "Jobs_Created": data["Jobs_Created"]
        })
    sector_list = sorted(sector_list, key=lambda x: x["Budget_Allocated"], reverse=True)
    
    # Return a dictionary suitable for JSON serialization
    return {
        "summary": {
            "Total_Budget_Initial": budget,
            "Total_Budget_Spent": budget - current_budget,
            "Total_Budget_Remaining": current_budget,
            "Total_MSMEs_Funded": len(selected_allocations),
            "Total_Projected_Jobs_Created": int(final_df['Jobs_Created'].sum()) if not final_df.empty else 0
        },
        "allocations": output_dict,
        "non_selected": non_selected,
        "sector_summary": sector_list
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Phase 4: Budget-Constrained Scheme Optimization.")
    parser.add_argument('--budget', type=float, default=50000000.0, help="Total subsidy budget limit allocated")
    parser.add_argument('--w_rev', type=float, default=0.5, help="Weight importance setting for Revenue (0 to 1)")
    parser.add_argument('--w_emp', type=float, default=0.5, help="Weight importance setting for Employment (0 to 1)")
    
    args = parser.parse_args()
    
    # Basic validation
    if args.w_rev + args.w_emp > 1.01 or args.w_rev + args.w_emp < 0.99:
        print("Warning: Policy weights usually sum to 1. Proceeding anyway...")
        
    run_optimization(args.budget, args.w_rev, args.w_emp)
