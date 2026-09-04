# 📊 Data Analyst Agent by Umer

An AI powered data analysis application designed to simplify **exploratory data analysis, dataset profiling, data quality assessment, visualization, and natural language data querying**.

## 📌 Overview

**Data Analyst Agent by Umer** is a full stack web application that allows users to upload structured datasets and interact with their data using natural language.

Instead of manually writing repetitive analysis code, users can upload **CSV, XLSX, or XLS** files and ask questions about their data in plain English. The application combines Python based data processing with Google Gemini AI to analyze datasets, generate statistical results, create visualizations, and provide meaningful insights.

The system is designed to make data analysis more accessible while maintaining a clear separation between deterministic data processing and AI based reasoning.

## 🚀 Key Features

* **Natural Language Data Querying:** Ask questions about uploaded datasets using plain English and receive relevant analytical responses.

* **Dataset Profiling:** Generate detailed information about dataset structure, data types, unique values, statistical measures, and missing value ratios.

* **Data Quality Analysis:** Analyze missing values, duplicate records, numerical outliers, and overall dataset health.

* **Interactive Data Visualization:** Generate interactive charts including Bar Charts, Line Graphs, Scatter Plots, Histograms, Box Plots, and Pie Charts using Plotly.

* **Automated Data Insights:** Analyze numerical distributions, correlations, and dataset characteristics to generate structured analytical insights.

* **Multiple Dataset Formats:** Supports commonly used structured data formats including CSV, XLSX, and XLS files.

* **AI Assisted Analysis:** Uses Google Gemini to understand natural language questions and connect them with relevant dataset analysis.

* **Data Health Assessment:** Provides a dataset health score based on data quality indicators and identifies areas that may require attention.

## 🛠️ Tools & Technologies

* **Programming Language:** Python 3.10+

* **Web Framework:** Flask

* **Data Processing:** Pandas, NumPy, OpenPyXL, SciPy

* **AI Engine:** Google Gemini AI

* **Visualization:** Plotly.js

* **Frontend:** HTML5, CSS3, JavaScript ES6+

* **Production Server:** Gunicorn

* **Development Tools:** Git, GitHub, VS Code

## 🏗️ System Architecture

The application follows a modular architecture where different components handle data processing, visualization, AI interaction, and the web interface.

```text id="v8nq2k"
User
  │
  ▼
Web Interface
  │
  ▼
Flask Backend
  │
  ├── Dataset Processing
  │      ├── Pandas
  │      ├── NumPy
  │      └── SciPy
  │
  ├── Data Quality Analysis
  │      ├── Missing Values
  │      ├── Duplicates
  │      └── Outliers
  │
  ├── Visualization Engine
  │      └── Plotly
  │
  └── AI Reasoning Engine
         └── Google Gemini
```

## 📂 Repository Structure

```text id="q3k6mp"
Data_Analyst_Agent_by_Umer/
│
├── app.py
├── requirements.txt
├── Procfile
├── README.md
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── script.js
│
├── templates/
│   └── index.html
│
└── services/
    ├── __init__.py
    ├── data_analyzer.py
    ├── visualizer.py
    └── gemini_agent.py
```

## 🔍 How It Works

1. **Upload Dataset:** The user uploads a CSV, XLSX, or XLS dataset.

2. **Dataset Processing:** The Flask backend reads and processes the uploaded data using Python based data processing libraries.

3. **Data Profiling:** The system analyzes columns, data types, missing values, unique values, statistical measures, and other dataset characteristics.

4. **Data Quality Analysis:** The application evaluates missing data, duplicate records, numerical outliers, and overall dataset health.

5. **Natural Language Query:** The user asks a question about the dataset in plain English.

6. **AI Reasoning:** Google Gemini interprets the user's question and determines the appropriate analytical response.

7. **Data Analysis:** Python based services perform the required calculations on the dataset.

8. **Visualization:** When appropriate, the system generates an interactive Plotly visualization.

9. **Result Presentation:** The final analytical result, visualization, or insight is presented through the web interface.

## 🎯 Purpose

The main purpose of this project is to simplify the process of exploratory data analysis and allow users to interact with structured datasets without manually writing analysis code for every question.

The project demonstrates the practical integration of:

**Data Analytics + Python + Artificial Intelligence + Natural Language Processing + Data Visualization + Web Development**

It also provides an example of how AI can be combined with deterministic data processing to create a practical data analysis application.

## 📈 Future Improvements

The application can be further extended with additional capabilities such as:

* Support for larger datasets
* Advanced predictive analytics
* Automated machine learning
* Additional visualization types
* Exportable analysis reports
* Advanced data cleaning operations
* User authentication and dataset management
* Additional AI models and providers
* More advanced statistical analysis

## 📜 Usage & Data Privacy

This project is intended for educational, development, demonstration, and portfolio purposes.

Users should avoid uploading confidential, sensitive, or personally identifiable information unless appropriate security and privacy measures have been implemented for the deployment environment.

## 👨‍💻 About

**Data Analyst Agent by Umer** was developed as a practical application of my skills in **Data Analytics, Python, Artificial Intelligence, Machine Learning, and Web Development**.

The project reflects my interest in building AI powered tools that can simplify real world data analysis and help users understand their data more efficiently.
