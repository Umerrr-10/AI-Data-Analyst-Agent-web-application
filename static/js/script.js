/**
 * Frontend JavaScript Controller for AI Data Analyst Agent.
 * Manages view routing, AJAX API requests, dynamic UI renders, and Plotly graphics.
 */

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------------------
    // 1. Navigation & View Routing Setup
    // -------------------------------------------------------------------------
    const navButtons = document.querySelectorAll(".nav-btn");
    const viewSections = document.querySelectorAll(".view-section");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetView = btn.getAttribute("data-view");
            
            navButtons.forEach(b => b.classList.remove("active"));
            viewSections.forEach(s => s.classList.remove("active"));
            
            btn.classList.add("active");
            document.getElementById(targetView).classList.add("active");

            // Lazy load view content if dataset is loaded
            if (targetView === "profile-view") fetchDatasetProfile();
            if (targetView === "quality-view") fetchQualityReport();

            // FIX: Force Plotly chart to recalculate width when tab becomes visible
            if (targetView === "visualizations-view") {
                setTimeout(() => {
                    const chartContainer = document.getElementById("plotly-chart-container");
                    if (chartContainer && chartContainer.data) {
                        Plotly.Plots.resize(chartContainer);
                    }
                }, 100);
            }
        });
    });

    // -------------------------------------------------------------------------
    // 2. File Upload Handling
    // -------------------------------------------------------------------------
    const uploadForm = document.getElementById("upload-form");
    const fileInput = document.getElementById("file-input");
    const filenameDisplay = document.getElementById("upload-filename-display");
    const loader = document.getElementById("global-loader");

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            filenameDisplay.textContent = `Selected: ${fileInput.files[0].name}`;
        }
    });

    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!fileInput.files.length) {
            alert("Please select a file to upload first.");
            return;
        }

        const formData = new FormData();
        formData.append("dataset", fileInput.files[0]);

        showLoader("Uploading & analyzing dataset...");

        try {
            const res = await fetch("/upload", { method: "POST", body: formData });
            const data = await res.json();

            if (res.ok) {
                // Update Badge Header
                document.getElementById("badge-filename").textContent = data.filename;
                document.getElementById("active-file-badge").classList.remove("hidden");
                
                // Render Dashboard
                renderDashboardMetrics(data.metrics);
                await fetchDatasetInfo();
                await fetchSuggestions();
            } else {
                alert(data.error || "Upload failed.");
            }
        } catch (err) {
            alert("An error occurred during file upload.");
        } finally {
            hideLoader();
        }
    });

    // -------------------------------------------------------------------------
    // 3. Dataset Info & Select Box Population
    // -------------------------------------------------------------------------
    async function fetchDatasetInfo() {
        try {
            const res = await fetch("/dataset");
            const data = await res.json();

            if (res.ok) {
                document.getElementById("empty-dashboard-state").classList.add("hidden");
                document.getElementById("dashboard-content").classList.remove("hidden");

                renderPreviewTable(data.preview);
                populateAxisDropdowns(data.columns, data.numeric_columns);
            }
        } catch (err) {
            console.error("Error fetching dataset info:", err);
        }
    }

    function renderDashboardMetrics(m) {
        document.getElementById("m-rows").textContent = m.total_rows.toLocaleString();
        document.getElementById("m-cols").textContent = m.total_columns;
        document.getElementById("m-numeric").textContent = m.numeric_columns_count;
        document.getElementById("m-missing").textContent = m.missing_cells.toLocaleString();
        document.getElementById("m-duplicates").textContent = m.duplicate_rows;
    }

    function renderPreviewTable(records) {
        if (!records || !records.length) return;
        
        const table = document.getElementById("preview-table");
        const thead = table.querySelector("thead");
        const tbody = table.querySelector("tbody");

        const headers = Object.keys(records[0]);
        thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>`;
        
        tbody.innerHTML = records.map(row => `
            <tr>${headers.map(h => `<td>${row[h] !== null ? row[h] : ""}</td>`).join("")}</tr>
        `).join("");
    }

    function populateAxisDropdowns(allCols, numCols) {
        const xAxisSelect = document.getElementById("x-axis-select");
        const yAxisSelect = document.getElementById("y-axis-select");

        xAxisSelect.innerHTML = allCols.map(c => `<option value="${c}">${c}</option>`).join("");
        yAxisSelect.innerHTML = numCols.map(c => `<option value="${c}">${c}</option>`).join("");
    }

    // -------------------------------------------------------------------------
    // 4. AI Analyst Chat Operations
    // -------------------------------------------------------------------------
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");
    const clearChatBtn = document.getElementById("clear-chat-btn");

    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const question = chatInput.value.trim();
        if (!question) return;

        appendChatMessage("user", question);
        chatInput.value = "";

        showLoader("AI Agent thinking...");

        try {
            const res = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question })
            });
            const data = await res.json();

            if (res.ok) {
                appendChatMessage("assistant", data.answer);
                if (data.chart) {
                    appendChatChart(data.chart);
                }
            } else {
                appendChatMessage("assistant", `⚠️ Error: ${data.error}`);
            }
        } catch (err) {
            appendChatMessage("assistant", "⚠️ Server connection failure.");
        } finally {
            hideLoader();
        }
    });

    function appendChatMessage(role, text) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${role}-message`;
        msgDiv.innerHTML = `
            <div class="avatar">${role === "user" ? "👤" : "🤖"}</div>
            <div class="message-content"><p>${text.replace(/\n/g, "<br>")}</p></div>
        `;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendChatChart(chartJson) {
        const chartId = `chat-chart-${Date.now()}`;
        const msgDiv = document.createElement("div");
        msgDiv.className = "message assistant-message";
        msgDiv.innerHTML = `
            <div class="avatar">📊</div>
            <div class="message-content" style="width: 100%;"><div id="${chartId}" style="height: 300px;"></div></div>
        `;
        chatMessages.appendChild(msgDiv);
        Plotly.newPlot(chartId, chartJson.data, chartJson.layout, { responsive: true });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    clearChatBtn.addEventListener("click", () => {
        chatMessages.innerHTML = `
            <div class="message assistant-message">
                <div class="avatar">🤖</div>
                <div class="message-content"><p>Chat history cleared. How else can I assist?</p></div>
            </div>
        `;
    });

    async function fetchSuggestions() {
        try {
            const res = await fetch("/suggestions");
            const data = await res.json();
            const container = document.getElementById("suggestions-container");

            if (data.suggestions && data.suggestions.length) {
                container.innerHTML = data.suggestions.map(s => `
                    <div class="chip" data-q="${s.question}">${s.question}</div>
                `).join("");

                container.querySelectorAll(".chip").forEach(c => {
                    c.addEventListener("click", () => {
                        chatInput.value = c.getAttribute("data-q");
                        chatForm.dispatchEvent(new Event("submit"));
                    });
                });
            }
        } catch (err) {
            console.error("Suggestions error:", err);
        }
    }

    // -------------------------------------------------------------------------
    // 5. Insights View
    // -------------------------------------------------------------------------
    const generateInsightsBtn = document.getElementById("generate-insights-btn");
    generateInsightsBtn.addEventListener("click", fetchInsights);

    async function fetchInsights() {
        showLoader("Generating automated AI insights...");
        try {
            const res = await fetch("/insights");
            const data = await res.json();
            const container = document.getElementById("insights-container");

            if (res.ok && data.insights && data.insights.length > 0) {
                container.innerHTML = data.insights.map(i => `
                    <div class="insight-card">
                        <div class="insight-header">
                            <h4 class="insight-title">${i.title}</h4>
                            <span class="badge ${i.level === 'Good' ? 'badge-good' : 'badge-warning'}">${i.level}</span>
                        </div>
                        <p style="color: #64748B; font-size: 0.875rem; margin-top: 0.5rem;">${i.explanation}</p>
                        <div style="margin-top: 0.75rem; font-weight: 600; font-size: 0.85rem; color: #2563EB;">
                            Indicator: ${i.metric}
                        </div>
                    </div>
                `).join("");
            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <p style="color: #EF4444;">${data.error || "Please upload a dataset first to generate AI insights."}</p>
                    </div>
                `;
            }
        } catch (err) {
            console.error("Insights Generation Error:", err);
            alert("Failed to reach server endpoint for insights.");
        } finally {
            hideLoader();
        }
    }

    // -------------------------------------------------------------------------
    // 6. Custom Visualization Render
    // -------------------------------------------------------------------------
    const renderChartBtn = document.getElementById("render-chart-btn");
    renderChartBtn.addEventListener("click", async () => {
        const chartType = document.getElementById("chart-type-select").value;
        const xCol = document.getElementById("x-axis-select").value;
        const yCol = document.getElementById("y-axis-select").value;

        showLoader("Building chart visual...");
        try {
            const res = await fetch("/visualize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chart_type: chartType, x_col: xCol, y_col: yCol })
            });
            const data = await res.json();

            if (res.ok) {
                const box = document.getElementById("plotly-chart-container");
                box.innerHTML = "";
                
                // Set explicit layout margins and dimensions
                data.chart.layout.autosize = true;
                data.chart.layout.width = null;
                data.chart.layout.height = 460;

                Plotly.newPlot("plotly-chart-container", data.chart.data, data.chart.layout, { 
                    responsive: true,
                    useResizeHandler: true 
                }).then(() => {
                    Plotly.Plots.resize(document.getElementById("plotly-chart-container"));
                });
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Chart rendering failed.");
        } finally {
            hideLoader();
        }
    });

    // -------------------------------------------------------------------------
    // 7. Profile & Quality API Handlers
    // -------------------------------------------------------------------------
    async function fetchDatasetProfile() {
        try {
            const res = await fetch("/profile");
            const data = await res.json();
            if (res.ok) {
                const tbody = document.getElementById("profile-table").querySelector("tbody");
                tbody.innerHTML = data.profiles.map(p => `
                    <tr>
                        <td><strong>${p.column_name}</strong></td>
                        <td><code>${p.data_type}</code></td>
                        <td>${p.unique_values}</td>
                        <td>${p.missing_values}</td>
                        <td>${p.missing_percentage}%</td>
                        <td>${p.mean}</td>
                        <td>${p.median}</td>
                        <td>${p.min}</td>
                        <td>${p.max}</td>
                    </tr>
                `).join("");
            }
        } catch (e) {}
    }

    async function fetchQualityReport() {
        try {
            const res = await fetch("/quality");
            const data = await res.json();
            if (res.ok) {
                const q = data.quality;
                const container = document.getElementById("quality-dashboard-content");
                container.innerHTML = `
                    <div style="display: flex; gap: 2rem; align-items: center; margin-bottom: 1.5rem;">
                        <div style="font-size: 2.5rem; font-weight: 700; color: ${q.score > 80 ? '#22C55E' : '#F59E0B'}">
                            ${q.score}/100
                        </div>
                        <div>
                            <h4>Overall Health Status: ${q.status}</h4>
                            <p style="color: #64748B;">${q.summary_message}</p>
                        </div>
                    </div>
                    <h4>Actionable Quality Recommendations</h4>
                    <ul style="margin-top: 0.5rem; padding-left: 1.25rem; color: #334155;">
                        ${q.recommendations.map(r => `<li style="margin-bottom: 0.35rem;">${r}</li>`).join("")}
                    </ul>
                `;
            }
        } catch (e) {}
    }

    // Loader Utilities
    function showLoader(text) {
        document.getElementById("loader-text").textContent = text || "Processing...";
        loader.classList.remove("hidden");
    }

    function hideLoader() {
        loader.classList.add("hidden");
    }
});