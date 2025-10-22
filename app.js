// app.js

// Function 1: Calculates the Compliance Score and Renders the Report to the UI
function calculateScore() {
    let totalRiskWeight = 0;
    let achievedComplianceWeight = 0;
    let nonCompliantControls = [];

    const form = document.getElementById('compliance-form');
    const controls = form.querySelectorAll('[data-weight]');
    
    // Reset status area
    document.getElementById('policy-status').textContent = '';

    // 2. Loop through each control
    controls.forEach(control => {
        const weight = parseInt(control.getAttribute('data-weight'));
        totalRiskWeight += weight;

        if (!control.checked) {
            // Control is NOT compliant; record the gap and assign action (simulated)
            let actionText = '';
            if (control.id === 'control_mfa' || control.id === 'control_password') {
                actionText = 'Action: Use AI Policy Generator below!';
            } else {
                actionText = 'Action: [Suggest Local IT Partner]';
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

    // 6. Update the Score Dashboard
    document.getElementById('current-score').textContent = complianceScore;
    const riskStatusElement = document.getElementById('risk-status');
    riskStatusElement.textContent = riskStatus;
    riskStatusElement.style.color = statusColor;
    
    // 7. Render the Remediation Roadmap to the UI
    const reportSection = document.getElementById('remediation-report');
    const gapList = document.getElementById('gap-list');
    gapList.innerHTML = ''; // Clear previous results

    if (nonCompliantControls.length > 0) {
        // Sort by highest risk first (descending order)
        nonCompliantControls.sort((a, b) => b.weight - a.weight); 
        
        nonCompliantControls.forEach(gap => {
            const gapItem = document.createElement('p');
            gapItem.innerHTML = `<strong>[Risk ${gap.weight}] ${gap.label}</strong><br><span style="color: #c82333;">${gap.action}</span>`;
            gapList.appendChild(gapItem);
        });
        reportSection.style.display = 'block'; // Show the report section
    } else {
        gapList.innerHTML = '<p style="color: green; font-weight: bold;">Congratulations! All essential controls are in place. Your business is Audit Ready!</p>';
        // Show the report section even if compliant, but hide policy generation if not needed
        reportSection.style.display = 'block'; 
        document.querySelector('h3').style.display = 'none'; 
        document.querySelectorAll('button[onclick^="generatePolicy"]').forEach(btn => btn.style.display = 'none');
    }
}

// Function 2: Simulates the AI Policy Generation (The Core Disruption)
function generatePolicy(policyType) {
    const policyStatus = document.getElementById('policy-status');
    policyStatus.style.color = 'blue';
    policyStatus.textContent = `Generating ${policyType} Policy... Please wait. (Simulating API call to LLM...)`;

    // Simulated network delay using setTimeout (3 seconds)
    setTimeout(() => {
        policyStatus.style.color = 'green';
        policyStatus.innerHTML = `
            ✅ **SUCCESS!** Your Custom **${policyType} Enforcement Policy** is ready.<br>
            <small>Automatically drafted based on Bahrain NCSC standards and translated to Arabic.</small>
            <br><a href="#" style="color: #007bff; font-weight: bold;">[DOWNLOAD: Policy-v1.0-AR.pdf]</a>
        `;
    }, 3000); // 3-second delay
}