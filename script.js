// Data Structure
let reports = JSON.parse(localStorage.getItem('jamshoroReports')) || [];

// Elements
const form = document.getElementById('problemForm');
const fileInput = document.getElementById('screenshot');
const previewImg = document.getElementById('imagePreview');
const reportsGrid = document.getElementById('reportsGrid');
const emptyState = document.getElementById('emptyState');
const toast = new bootstrap.Toast(document.getElementById('liveToast'));
const modal = new bootstrap.Modal(document.getElementById('reportModal'));

// Category Color Mapping
const catColors = {
    'Water': 'bg-primary',
    'Electricity': 'bg-warning text-dark',
    'Roads': 'bg-danger',
    'Gas': 'bg-secondary',
    'Internet': 'bg-info',
    'Other': 'bg-dark'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderReports();
    updateStats();
});

// Image Preview Handler
fileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

// Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newReport = {
        id: Date.now(),
        name: document.getElementById('reporterName').value,
        contact: document.getElementById('contactInfo').value,
        category: document.getElementById('category').value,
        location: document.getElementById('location').value,
        description: document.getElementById('description').value,
        date: new Date().toLocaleString(),
        image: previewImg.src !== window.location.href && previewImg.style.display !== 'none' ? previewImg.src : null
    };

    reports.unshift(newReport);
    saveData();
    showToast("Report submitted successfully!");
    form.reset();
    previewImg.style.display = 'none';
    renderReports();
    updateStats();
    
    // Scroll to reports
    window.location.hash = '#reports';
});

// Save to LocalStorage
function saveData() {
    localStorage.setItem('jamshoroReports', JSON.stringify(reports));
}

// Render Grid
function renderReports(filter = null) {
    let dataToRender = filter ? reports.filter(r => r.category === filter) : reports;
    
    if (dataToRender.length === 0) {
        reportsGrid.innerHTML = '';
        reportsGrid.appendChild(emptyState);
        return;
    }

    reportsGrid.innerHTML = dataToRender.map(report => `
        <div class="col-md-6 col-lg-4">
            <div class="report-item" onclick="viewDetails(${report.id})">
                <div class="thumbnail-container">
                    ${report.image ? `<img src="${report.image}" alt="Issue">` : `<i class="bi bi-image text-muted display-4"></i>`}
                </div>
                <div class="p-4">
                    <span class="category-badge ${catColors[report.category] || 'bg-dark'} text-white mb-2 d-inline-block">
                        ${report.category}
                    </span>
                    <h5 class="fw-bold text-truncate">${report.location}</h5>
                    <p class="text-muted small mb-3 text-truncate-2">${report.description.substring(0, 80)}...</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted"><i class="bi bi-person me-1"></i> ${report.name}</small>
                        <small class="text-muted">${report.date.split(',')[0]}</small>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// View Details in Modal
window.viewDetails = function(id) {
    const r = reports.find(x => x.id === id);
    if (!r) return;

    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="row">
            <div class="col-lg-6">
                ${r.image ? `<img src="${r.image}" class="img-fluid rounded-4 shadow-sm mb-3" style="width:100%">` : 
                `<div class="bg-light rounded-4 d-flex align-items-center justify-content-center mb-3" style="height:300px">
                    <i class="bi bi-image display-1 text-muted"></i>
                 </div>`}
            </div>
            <div class="col-lg-6">
                <span class="badge ${catColors[r.category]} mb-2 px-3 py-2">${r.category}</span>
                <h2 class="fw-bold mb-3">${r.location}</h2>
                <p class="text-muted mb-4" style="line-height:1.6">${r.description}</p>
                
                <div class="bg-light p-3 rounded-4 mb-4">
                    <div class="mb-2"><strong>Reporter:</strong> ${r.name}</div>
                    <div class="mb-2"><strong>Contact:</strong> ${r.contact}</div>
                    <div><strong>Timestamp:</strong> ${r.date}</div>
                </div>

                <div class="d-flex gap-2">
                    <button class="btn btn-outline-danger w-100 py-2 rounded-3" onclick="deleteReport(${r.id})">
                        <i class="bi bi-trash me-2"></i>Delete Report
                    </button>
                    <button class="btn btn-dark w-100 py-2 rounded-3" data-bs-dismiss="modal">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    modal.show();
};

// Delete Report
window.deleteReport = function(id) {
    if(confirm("Are you sure you want to remove this report?")) {
        reports = reports.filter(r => r.id !== id);
        saveData();
        modal.hide();
        renderReports();
        updateStats();
        showToast("Report deleted successfully.");
    }
};

// Update Stats Dashboard
function updateStats() {
    document.getElementById('statTotal').innerText = reports.length;
    document.getElementById('statImages').innerText = reports.filter(r => r.image).length;
    
    // Find most frequent category
    if (reports.length > 0) {
        const counts = {};
        reports.forEach(r => counts[r.category] = (counts[r.category] || 0) + 1);
        const top = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        document.getElementById('statHot').innerText = top;
    } else {
        document.getElementById('statHot').innerText = "-";
    }
}

// Notification Utility
function showToast(msg) {
    document.getElementById('toastMsg').innerText = msg;
    toast.show();
}