import pandas as pd
import plotly.express as px
import plotly.io as pio
import json
from typing import Dict, Any, Optional

class DataVisualizer:
    """
    Generates interactive Plotly charts formatted for light-theme dashboard integration.
    """
    
    THEME_COLORS = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626", "#0891B2", "#4F46E5"]

    @classmethod
    def _apply_layout_styling(cls, fig):
        """Standardizes typography, margins, and centers Plotly charts within containers."""
        fig.update_layout(
            template="plotly_white",
            font=dict(family="Inter, sans-serif", size=12, color="#334155"),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            margin=dict(l=50, r=50, t=60, b=50),
            autosize=True,
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        return fig

    @classmethod
    def create_chart(cls, df: pd.DataFrame, chart_type: str, x_col: str, y_col: Optional[str] = None, title: Optional[str] = None) -> Dict[str, Any]:
        """
        Creates a chart based on type and converts it to Plotly JSON format.
        """
        if df.empty or x_col not in df.columns:
            return {"error": "Invalid input data or column selection."}
            
        chart_type = chart_type.lower().replace(" ", "")
        
        try:
            if chart_type in ["bar", "barchart"]:
                fig = px.bar(df, x=x_col, y=y_col, title=title or f"{y_col} by {x_col}", color_discrete_sequence=cls.THEME_COLORS)
            elif chart_type in ["line", "linechart"]:
                fig = px.line(df, x=x_col, y=y_col, title=title or f"{y_col} Trend Over {x_col}", color_discrete_sequence=cls.THEME_COLORS, markers=True)
            elif chart_type in ["pie", "piechart"]:
                fig = px.pie(df, names=x_col, values=y_col, title=title or f"Distribution of {y_col} by {x_col}", color_discrete_sequence=cls.THEME_COLORS, hole=0.35)
            elif chart_type in ["scatter", "scatterplot"]:
                fig = px.scatter(df, x=x_col, y=y_col, title=title or f"{y_col} vs {x_col}", color_discrete_sequence=cls.THEME_COLORS)
            elif chart_type in ["histogram", "dist"]:
                fig = px.histogram(df, x=x_col, title=title or f"Distribution of {x_col}", color_discrete_sequence=cls.THEME_COLORS, nbins=30)
            elif chart_type in ["box", "boxplot"]:
                fig = px.box(df, x=x_col, y=y_col, title=title or f"Box Plot of {y_col or x_col}", color_discrete_sequence=cls.THEME_COLORS)
            else:
                fig = px.bar(df, x=x_col, y=y_col, title=title or f"{y_col} by {x_col}", color_discrete_sequence=cls.THEME_COLORS)

            fig = cls._apply_layout_styling(fig)
            return json.loads(pio.to_json(fig))
            
        except Exception as e:
            return {"error": f"Failed to generate visualization: {str(e)}"}