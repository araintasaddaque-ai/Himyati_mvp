// app.js

// --- 1. MULTI-JURISDICTION FRAMEWORK DEFINITION ---
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
        { id: 'control_backup', label: 'Daily off-site backups are verified and tested quarterly.', weight: 5, policy: false, type: 'Technical' }, // Higher weight
        { id: 'control_training', label: 'Mandatory annual cybersecurity training for all staff (Arabic provided).', weight: 4, policy: false, type: 'Awareness' },
        { id: 'control_pdpl', label: 'A comprehensive Privacy Notice exists (KSA PDPL compliant).', weight: 3, policy: true, type: 'Privacy' },
        { id: 'control_threat', label: 'Active Intrusion Detection/Prevention System (IDS/IPS) is in use.', weight: 5, policy: false, type: 'Technical' }
    ],
    'QATAR': [ // Qatar: Focus on NIA Policy
        { id: 'control_mfa', label: 'MFA is implemented for ALL external service access (Email, VPN).', weight: 4, policy: true, type: 'Access' },
        { id: 'control_password', label: 'Documented procedure for user onboarding/offboarding.', weight: 3, policy: true, type: 'Governance' },
        { id: 'control_backup', label: 'A tested data recovery plan is documented and stored securely.', weight: 4, policy: false, type: 'Technical' },
        { id: 'control_training', label: 'Senior management has received cyber risk training in the last 6 months.', weight: 5, policy: false, type: 'Awareness' }, // Strong focus on leadership
        { id: 'control_pdpl', label: 'Compliance with Qatar’s regulatory framework for data transfers.', weight: 4, policy: false, type: 'Privacy' },
        { id: 'control_vendor', label: 'Third-Party Vendor Risk Assessment conducted for cloud providers.', weight: 5, policy: false, type: 'Governance' } // Key focus on supply chain risk
    ]
};

// --- 2. UI UPDATE FUNCTIONS ---

function updateTierBenefits() {
    const tier = document.getElementById('tier-select').value;
    const noteElement = document.getElementById('tier-benefit-note');
    let benefitText = '';

    if (tier === 'basic') {
        benefitText = 'Current: Checklist access only. AI Policy Generation is locked. 🔒';
    } else if (tier === 'premium') {
        benefitText = 'Current: AI Policy Generation and Automated Reminders UNLOCKED. 🔑';
    } else if (tier === 'audit') {
        benefitText = 'Current: ALL Premium features UNLOCKED + Final Report Expert Verification. ⭐';
    }
    noteElement.textContent = benefitText;
    
    // Also recalculate score to update action buttons logic based on tier
    calculateScore(); 
}

function loadFramework() {
    const country = document.getElementById('country-select').value;
    const currentFramework = FRAMEWORKS[country];
    const form = document.getElementById('compliance-form');
    
    // Group controls by type for cleaner display
    const groupedControls = currentFramework.reduce((acc, control) => {
        acc[control.type] = acc[control.type] || [];
        acc[control.type].push(control);
        return acc;
    }, {});
    
    let formHTML = '';
    
    // Inject new controls into the form
    for (const type in groupedControls) {
        formHTML += `<h2 style="margin-top: 30px;">${type} Controls (${country})</h2>`;
        groupedControls[type].forEach(control => {
            // Include data-policy to help determine which controls are policy-fixable
            formHTML += `
                <div class="checklist-item">
                    <input type="checkbox" id="${control.id}" name="${control.id}" data-weight="${control.weight}" data-policy="${control.policy}" onchange="calculateScore()">
                    <label for="${control.id}">${control.label}</label>
                </div>
            `;
        });
    }
    
    form.innerHTML = formHTML;

    // Reset score and report visibility
    document.getElementById('current-score').textContent = '0';
    document.getElementById('risk-status').textContent = 'Calculating...';
    document.getElementById('remediation-report').style.display = 'none';
}

// --- 3. CORE SCORING & REPORTING LOGIC ---

function calculateScore() {
    const country = document.getElementById('country-select').value;
    const tier = document.getElementById('tier-select').value;
    let totalRiskWeight = 0;
    let achievedComplianceWeight = 0;
    let nonCompliantControls = [];

    const form = document.getElementById('compliance-form');
    const controls = form.querySelectorAll('[data-weight]');
    
    document.getElementById('policy-status').textContent = '';

    // 2. Loop through each control to calculate score and identify gaps
    controls.forEach(control => {
        const weight = parseInt(control.getAttribute('data-weight'));
        totalRiskWeight += weight;

        if (!control.checked) {
            let actionText = '';
            
            // Logic to determine the call-to-action based on compliance need and tier
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

    // 4. Calculate the Final Compliance Score
    let complianceScore = 0;
    if (totalRiskWeight > 0) {
        complianceScore = Math.round((achievedComplianceWeight / totalRiskWeight) * 100);
    }

    // 5. Determine Risk Status and Color
    let riskStatus = '';
    let statusColor = '';
    if (complianceScore >= 85) {
        riskStatus = 'Optimal - Audit Ready';
        statusColor = 'green';
    } else if (complianceScore >= 50) {
        riskStatus = 'Medium Risk - Minor Gaps';
        statusColor = 'orange';
    } else {
        riskStatus = 'CRITICAL RISK - IMMEDIATE ACTION REQUIRED';
        statusColor = 'red';
    }

    // 6. Update the Score Dashboard (DOM manipulation)
    document.getElementById('current-score').textContent = complianceScore;
    const riskStatusElement = document.getElementById('risk-status');
    riskStatusElement.textContent = riskStatus;
    riskStatusElement.style.color = statusColor;
    
    // 7. Render the Remediation Roadmap to the UI
    const reportSection = document.getElementById('remediation-report');
    const gapList = document.getElementById('gap-list');
    gapList.innerHTML = ''; 

    if (nonCompliantControls.length > 0) {
        nonCompliantControls.sort((a, b) => b.weight - a.weight); 
        nonCompliantControls.forEach(gap => {
            const gapItem = document.createElement('p');
            gapItem.innerHTML = `<strong>[Risk ${gap.weight}] ${gap.label}</strong><br><span style="color: #c82333;">${gap.action}</span>`;
            gapList.appendChild(gapItem);
        });
        reportSection.style.display = 'block';
    } else {
        gapList.innerHTML = '<p style="color: green; font-weight: bold;">Congratulations! All essential controls are in place. Your business is Audit Ready! 🎉</p>';
        reportSection.style.display = 'block';
    }
}

// --- 4. AI FEATURE SIMULATION ---

function generatePolicy(policyType) {
    const tier = document.getElementById('tier-select').value;
    const country = document.getElementById('country-select').value;
    const policyStatus = document.getElementById('policy-status');

    if (tier === 'basic') {
        policyStatus.style.color = 'red';
        policyStatus.innerHTML = `❌ **ACCESS DENIED.** Policy Generation requires the **Premium** or **Audit Ready** subscription tier. Please upgrade.`;
        return;
    }

    policyStatus.style.color = 'blue';
    policyStatus.textContent = `Generating ${policyType} Policy for ${country}... (Simulating 3-second LLM processing...)`;

    // Simulated network delay using setTimeout (3 seconds)
    setTimeout(() => {
        policyStatus.style.color = 'green';
        policyStatus.innerHTML = `
            ✅ **SUCCESS!** Your Custom **${policyType} Enforcement Policy** is ready for **${country}**.<br>
            <small>Leveraging AI for rapid drafting and Arabic translation.</small>
            <br><a href="#" style="color: #007bff; font-weight: bold;">[DOWNLOAD: Policy-${policyType}-v1.0-AR.pdf]</a>
        `;
    }, 3000); 
}

// Initial page load functions
window.onload = function() {
    loadFramework(); 
    updateTierBenefits(); 
    calculateScore(); // Calculate initial score (should be low/zero)
};