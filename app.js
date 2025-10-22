// app.js

// --- PHASE 3: MULTI-JURISDICTION FRAMEWORK DEFINITION (The Core Scalability Hook) ---

// Define compliance controls and their risk weights for different GCC countries
const FRAMEWORKS = {
    'BH': [ // Bahrain: Focus on CBB, PDPL, NCSC Fundamentals
        { id: 'control_mfa', label: 'Multi-Factor Authentication (MFA) is enabled for all admin accounts.', weight: 5, policy: true, type: 'Access' },
        { id: 'control_password', label: 'A Strong Password Policy is enforced (min 12 characters, no reuse).', weight: 4, policy: true, type: 'Governance' },
        { id: 'control_backup', label: 'Critical data is backed up to a tested, off-site cloud location.', weight: 4, policy: false, type: 'Technical' },
        { id: 'control_training', label: 'All employees received anti-phishing training in the last 6 months.', weight: 3, policy: false, type: 'Awareness' },
        { id: 'control_pdpl', label: 'A formal Data Destruction Policy exists for customer PII (PDPL Req).', weight: 4, policy: true, type: 'Privacy' },
        { id: 'control_segregation', label: 'Admin network is fully segregated from guest/public Wi-Fi.', weight: 3, policy: false, type: 'Technical' }
    ],
    'KSA': [ // KSA: Focus on NCA Essential Controls (ECC)
        { id: 'control_mfa', label: 'All critical system access (servers, cloud) requires MFA.', weight: 5, policy: true, type: 'Access' },
        { id: 'control_password', label: 'Formal password management and rotation policy is documented (NCA ECC Req).', weight: 4, policy: true, type: 'Governance' },
        { id: 'control_backup', label: 'Daily off-site backups are verified and tested quarterly.', weight: 5, policy: false, type: 'Technical' }, // Higher weight in KSA for CNI protection
        { id: 'control_training', label: 'Mandatory annual cybersecurity training for all staff (Arabic provided).', weight: 4, policy: false, type: 'Awareness' },
        { id: 'control_pdpl', label: 'A comprehensive Privacy Notice exists (KSA PDPL compliant).', weight: 3, policy: true, type: 'Privacy' },
        { id: 'control_threat', label: 'Active Intrusion Detection/Prevention System (IDS/IPS) is in use.', weight: 5, policy: false, type: 'Technical' }
    ],
    'QATAR': [ // Qatar: Focus on NIA Policy
        { id: 'control_mfa', label: 'MFA is implemented for ALL external service access (Email, VPN).', weight: 4, policy: true, type: 'Access' },
        { id: 'control_password', label: 'Documented procedure for user onboarding/offboarding.', weight: 3, policy: true, type: 'Governance' },
        { id: 'control_backup', label: 'A tested data recovery plan is documented and stored securely.', weight: 4, policy: false, type: 'Technical' },
        { id: 'control_training', label: 'Senior management has received cyber risk training in the last 6 months.', weight: 5, policy: false, type: 'Awareness' }, // Strong focus on leadership
        { id: 'control_pdpl', label: 'Compliance with Qatar's regulatory framework for data transfers.', weight: 4, policy: false, type: 'Privacy' },
        { id: 'control_vendor', label: 'Third-Party Vendor Risk Assessment conducted for cloud providers.', weight: 5, policy: false, type: 'Governance' } // Key focus on supply chain risk
    ]
};

// --- PHASE 3: UI and Logic Controllers ---

// Function to load the checklist based on the selected country
function loadFramework() {
    const country = document.getElementById('country-select').value;
    const currentFramework = FRAMEWORKS[country];
    const form = document.getElementById('compliance-form');
    
    // Clear the existing checklist items
    let formHTML = form.querySelector('p').outerHTML || '';
    formHTML = '<p style="font-size: 0.9em; color: #555;">Check the box if the control is **IN PLACE**.</p>';
    
    // Group controls by type for cleaner display (optional, but good UX)
    const groupedControls = currentFramework.reduce((acc, control) => {
        acc[control.type] = acc[control.type] || [];
        acc[control.type].push(control);
        return acc;
    }, {});
    
    // Inject new controls into the form
    for (const type in groupedControls) {
        formHTML += `<h2 style="margin-top: 30px;">${type} Controls (${country})</h2>`;
        groupedControls[type].forEach(control => {
            formHTML += `
                <div class="checklist-item">
                    <input type="checkbox" id="${control.id}" name="${control.id}" data-weight="${control.weight}" data-policy="${control.policy}">
                    <label for="${control.id}">${control.label}</label>
                </div>
            `;
        });
    }
    
    // Add the button back
    formHTML += '<button type="button" onclick="calculateScore()">Calculate Compliance Score</button>';
    form.innerHTML = formHTML;

    // Reset dashboard and report sections
    document.getElementById('current-score').textContent = '--';
    document.getElementById('risk-status').textContent = 'Calculating...';
    document.getElementById('remediation-report').style.display = 'none';
    
    updateTierBenefits(); // Update benefits when jurisdiction changes
}

// Function to update the tier benefit note
function updateTierBenefits() {
    const tier = document.getElementById('tier-select').value;
    const noteElement = document.getElementById('tier-benefit-note');
    let benefitText = '';

    if (tier === 'basic') {
        benefitText = 'Current: Checklist access only. Policy Generation is locked.';
        // Lock AI Policy Gen buttons (will be handled in calculateScore/generatePolicy)
    } else if (tier === 'premium') {
        benefitText = 'Current: AI Policy Generation and Automated Reminders UNLOCKED.';
    } else if (tier === 'audit') {
        benefitText = 'Current: ALL Premium features UNLOCKED + Final Report Expert Verification.';
    }
    noteElement.textContent = benefitText;
}

// Function to calculate the Compliance Score and Render the Report
function calculateScore() {
    const country = document.getElementById('country-select').value;
    const tier = document.getElementById('tier-select').value;
    let totalRiskWeight = 0;
    let achievedComplianceWeight = 0;
    let nonCompliantControls = [];

    const form = document.getElementById('compliance-form');
    const controls = form.querySelectorAll('[data-weight]');
    
    document.getElementById('policy-status').textContent = '';

    // 2. Loop through each control
    controls.forEach(control => {
        const weight = parseInt(control.getAttribute('data-weight'));
        totalRiskWeight += weight;

        if (!control.checked) {
            let actionText = '';
            // Assign specific actions based on compliance type
            if (control.getAttribute('data-policy') === 'true' && tier !== 'basic') {
                actionText = `Action: **Generate Policy** for this governance gap.`;
            } else if (control.getAttribute('data-policy') === 'true' && tier === 'basic') {
                 actionText = `Action: Locked in Basic Tier. Upgrade to **Premium** to generate policy.`;
            } else {
                actionText = 'Action: [Suggest Local IT Partner] for technical fix.';
            }
            
            nonCompliantControls.push({
                id: control.id,
                label: control.nextElementSibling.textContent,
                weight: weight,
                action: actionText
            });
        } else {
            achievedComplianceWeight += weight;
        }
    });

    // ... (rest of score calculation and dashboard update remains the same)

    let complianceScore = 0;
    if (totalRiskWeight > 0) {
        complianceScore = Math.round((achievedComplianceWeight / totalRiskWeight) * 100);
    }

    let riskStatus = '';
    let statusColor = '';
    if (complianceScore >= 75) {
        riskStatus = 'Optimal - Audit Ready';
        statusColor = 'green';
    } else if (complianceScore >= 50) {
        riskStatus = 'Medium Risk - Minor Gaps';
        statusColor = 'orange';
    } else {
        riskStatus = 'CRITICAL RISK - IMMEDIATE ACTION REQUIRED';
        statusColor = 'red';
    }

    document.getElementById('current-score').textContent = complianceScore;
    const riskStatusElement = document.getElementById('risk-status');
    riskStatusElement.textContent = riskStatus;
    riskStatusElement.style.color = statusColor;
    
    // 7. Render the Remediation Roadmap to the UI
    const reportSection = document.getElementById('remediation-report');
    const gapList = document.getElementById('gap-list');
    gapList.innerHTML = ''; 
    const policyButtons = document.getElementById('policy-buttons');
    
    // Ensure the policy buttons section exists (We'll add it dynamically or assume existence)
    // For now, we will assume the buttons are visible, and the logic in generatePolicy handles the lock
    
    // Inject the report content
    if (nonCompliantControls.length > 0) {
        nonCompliantControls.sort((a, b) => b.weight - a.weight); 
        nonCompliantControls.forEach(gap => {
            const gapItem = document.createElement('p');
            gapItem.innerHTML = `<strong>[Risk ${gap.weight}] ${gap.label}</strong><br><span style="color: #c82333;">${gap.action}</span>`;
            gapList.appendChild(gapItem);
        });
        reportSection.style.display = 'block';
    } else {
        gapList.innerHTML = '<p style="color: green; font-weight: bold;">Congratulations! All essential controls are in place. Your business is Audit Ready!</p>';
        reportSection.style.display = 'block';
    }
}

// Function 3: Simulates the AI Policy Generation (Adjusted for Tiers)
function generatePolicy(policyType) {
    const tier = document.getElementById('tier-select').value;
    const policyStatus = document.getElementById('policy-status');

    if (tier === 'basic') {
        policyStatus.style.color = 'red';
        policyStatus.innerHTML = `❌ **ACCESS DENIED.** Policy Generation requires the **Premium** or **Audit Ready** subscription tier. Please upgrade.`;
        return;
    }

    policyStatus.style.color = 'blue';
    policyStatus.textContent = `Generating ${policyType} Policy for ${document.getElementById('country-select').value}... (Simulating 3-second LLM processing...)`;

    // Simulated network delay using setTimeout (3 seconds)
    setTimeout(() => {
        policyStatus.style.color = 'green';
        policyStatus.innerHTML = `
            ✅ **SUCCESS!** Your Custom **${policyType} Enforcement Policy** is ready for **${document.getElementById('country-select').value}**.<br>
            <small>Leveraging AI for rapid drafting and Arabic translation.</small>
            <br><a href="#" style="color: #007bff; font-weight: bold;">[DOWNLOAD: Policy-${policyType}-v1.0-AR.pdf]</a>
        `;
    }, 3000); 
}

// Load the default framework (Bahrain) when the page first loads
window.onload = loadFramework;