import os
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

class DataAIAgent:
    """
    LLM Integration Agent using Google Gemini API with fallback analytics execution.
    Synthesizes dataset metadata to answer questions, generate charts, and uncover business insights.
    """

    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.has_genai = False
        
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                self.has_genai = True
            except Exception:
                self.has_genai = False

    def _build_dataset_context(self) -> str:
        """Constructs a compact textual profile of column data types, distributions, and sample records."""
        total_rows, total_cols = self.df.shape
        col_info = []
        for col in self.df.columns:
            dtype = str(self.df[col].dtype)
            uniques = self.df[col].nunique()
            col_info.append(f"- '{col}' ({dtype}): {uniques} unique values")
            
        sample_data = self.df.head(3).to_dict(orient="records")
        num_summary = self.df.describe().to_dict()
        
        return f"""
Dataset Dimensions: {total_rows} rows x {total_cols} columns
Column Details:
{chr(10).join(col_info)}

Sample Records:
{json.dumps(sample_data, default=str)}

Numerical Distribution Summary:
{json.dumps(num_summary, default=str)}
"""

    def ask(self, question: str) -> Dict[str, Any]:
        """Processes natural language user questions and returns text response plus visual actions."""
        # Execute fast local Pandas computations for specific question patterns
        q_lower = question.lower()
        num_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = self.df.select_dtypes(include=['object', 'category']).columns.tolist()

        # Fast path 1: Missing values check
        if "missing" in q_lower or "null" in q_lower:
            missing = self.df.isna().sum()
            missing_cols = missing[missing > 0]
            if len(missing_cols) == 0:
                answer_text = "Analysis shows **zero missing values** across all columns in this dataset."
            else:
                formatted = ", ".join([f"**{c}**: {v} missing" for c, v in missing_cols.items()])
                answer_text = f"The dataset contains missing values in the following column(s): {formatted}."
            return {"answer": answer_text, "chart_recommended": False}

        # Fast path 2: Top performing aggregations
        if ("top" in q_lower or "highest" in q_lower or "best" in q_lower) and cat_cols and num_cols:
            group_col, target_col = cat_cols[0], num_cols[0]
            top_df = self.df.groupby(group_col, as_index=False)[target_col].sum().sort_values(by=target_col, ascending=False).head(5)
            best_cat = top_df.iloc[0][group_col]
            best_val = top_df.iloc[0][target_col]
            
            answer_text = f"Based on aggregate analysis of **{target_col}**, the top-performing **{group_col}** is **'{best_cat}'** with total value of **{best_val:,.2f}**."
            return {
                "answer": answer_text,
                "chart_recommended": True,
                "chart_type": "bar",
                "x_col": group_col,
                "y_col": target_col,
                "title": f"Top 5 {group_col} by {target_col}"
            }

        # Query LLM Provider if available
        if self.has_genai:
            try:
                context = self._build_dataset_context()
                prompt = f"""
You are an expert AI Lead Data Analyst. Answer the user's question directly and concisely based on the dataset summary provided below.

Context:
{context}

Question: {question}

Return a clear, professional answer. Format key numbers in bold.
"""
                response = self.model.generate_content(prompt)
                return {"answer": response.text, "chart_recommended": False}
            except Exception as e:
                pass

        # Fallback Engine if API key is not configured or fails
        fallback_msg = f"Analyzed dataset containing {len(self.df):,} rows and {len(self.df.columns)} columns. Primary numerical variables: {', '.join(num_cols[:3])}."
        return {"answer": f"[Local Data Engine]: {fallback_msg}", "chart_recommended": False}

    def generate_suggested_questions(self) -> List[Dict[str, str]]:
        """Dynamically formulates suggested context questions based on dataset schema."""
        num_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = self.df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        suggestions = []
        if cat_cols and num_cols:
            suggestions.append({
                "category": "Analyze Performance",
                "question": f"Which {cat_cols[0]} has the highest total {num_cols[0]}?"
            })
            suggestions.append({
                "category": "Category Breakdown",
                "question": f"Show breakdown of {num_cols[0]} by {cat_cols[0]}."
            })
        if len(num_cols) >= 2:
            suggestions.append({
                "category": "Correlation Check",
                "question": f"What is the correlation between {num_cols[0]} and {num_cols[1]}?"
            })
            
        suggestions.append({
            "category": "Data Quality",
            "question": "Are there any missing values or unusual patterns in this dataset?"
        })
        
        return suggestions[:4]

    def generate_automated_insights(self) -> List[Dict[str, Any]]:
        """Scans distributions, numerical metrics, and patterns to output business insight cards."""
        insights = []
        
        # 1. Dataset Scale Insight
        total_rows, total_cols = self.df.shape
        insights.append({
            "title": "Dataset Volume Profile",
            "explanation": f"The uploaded dataset contains {total_rows:,} observation rows and {total_cols} columns.",
            "metric": f"{total_rows:,} Records",
            "level": "Good"
        })

        # 2. Missing Data Insight
        missing_count = int(self.df.isna().sum().sum())
        total_cells = total_rows * total_cols
        missing_pct = round((missing_count / total_cells * 100), 1) if total_cells > 0 else 0
        
        if missing_pct > 0:
            insights.append({
                "title": "Data Completeness Flag",
                "explanation": f"Detected {missing_count:,} missing cells ({missing_pct}% of dataset total). Consider applying mean/median imputation.",
                "metric": f"{missing_pct}% Missing",
                "level": "Warning"
            })
        else:
            insights.append({
                "title": "Data Completeness Score",
                "explanation": "No missing or null data cells were detected across any attribute in this dataset.",
                "metric": "100% Complete",
                "level": "Good"
            })

        # 3. Categorical & Numeric Analytics
        num_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = self.df.select_dtypes(include=['object', 'category']).columns.tolist()

        if cat_cols and num_cols:
            cat, num = cat_cols[0], num_cols[0]
            try:
                grouped = self.df.groupby(cat, as_index=False)[num].sum().sort_values(by=num, ascending=False)
                if not grouped.empty:
                    top_name = str(grouped.iloc[0][cat])
                    top_val = float(grouped.iloc[0][num])
                    total_val = float(grouped[num].sum())
                    share = round((top_val / total_val * 100), 1) if total_val > 0 else 0
                    insights.append({
                        "title": f"Top Performer: {top_name}",
                        "explanation": f"The category segment '{top_name}' accounts for {share}% of total aggregate '{num}'.",
                        "metric": f"{share}% Share",
                        "level": "Good"
                    })
            except Exception:
                pass

        # 4. Feature Correlations
        if len(num_cols) >= 2:
            try:
                corr_matrix = self.df[num_cols].corr().abs()
                np.fill_diagonal(corr_matrix.values, 0)
                if not corr_matrix.empty and not corr_matrix.isna().all().all():
                    max_pair = corr_matrix.unstack().idxmax()
                    max_val = float(corr_matrix.loc[max_pair[0], max_pair[1]])
                    if max_val > 0.4:
                        insights.append({
                            "title": "Strong Correlation Detected",
                            "explanation": f"Significant linear relationship (r = {max_val:.2f}) found between '{max_pair[0]}' and '{max_pair[1]}'.",
                            "metric": f"r = {max_val:.2f}",
                            "level": "Good"
                        })
            except Exception:
                pass

        return insights