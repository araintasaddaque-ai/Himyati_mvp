// app.js

function calculateScore() {
    // 1. Initialize variables
    let totalRiskWeight = 0;   // The maximum possible score (if everything is compliant)
    let achievedComplianceWeight = 0; // The score achieved by the user
    let nonCompliantControls = []; // To list the gaps for the remediation report

    // Get the form element containing all the controls
    const form = document.getElementById('compliance-form');
    // Select ALL elements with the attribute data-weight (our compliance controls)
    const controls = form.querySelectorAll('[data-weight]');

    // 2. Loop through each control
    controls.forEach(control => {
        const weight = parseInt(control.getAttribute('data-weight'));
        totalRiskWeight += weight; // Sum up the maximum possible weight (Max Score)

        // 3. Check if the control is compliant (i.e., checkbox is checked)
        if (control.checked) {
            achievedComplianceWeight += weight; // Add the weight to the achieved score
        } else {
            // Control is NOT compliant; record the gap
            nonCompliantControls.push({
                id: control.id,
                label: control.nextElementSibling.textContent,
                weight: weight
            });
        }
    });

    // 4. Calculate the Final Compliance Score
    let complianceScore = 0;
    if (totalRiskWeight > 0) {
        complianceScore = Math.round((achievedComplianceWeight / totalRiskWeight) * 100);
    }

    // 5. Determine Risk Status based on the score
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

    // 6. Update the Score Dashboard (DOM manipulation)
    document.getElementById('current-score').textContent = complianceScore;
    
    const riskStatusElement = document.getElementById('risk-status');
    riskStatusElement.textContent = riskStatus;
    riskStatusElement.style.color = statusColor;
    
    // 7. Optional: Display the Remediation Roadmap (Console Log for now)
    console.log(`--- Himyati Remediation Roadmap ---`);
    console.log(`Calculated Score: ${complianceScore}%`);
    if (nonCompliantControls.length > 0) {
        console.log(`Non-Compliant Items (${nonCompliantControls.length} Gaps):`);
        nonCompliantControls.sort((a, b) => b.weight - a.weight); // Sort by highest risk first
        nonCompliantControls.forEach(gap => {
            console.log(`[Risk ${gap.weight}] ${gap.label}`);
        });
    } else {
        console.log("Congratulations! No compliance gaps found.");
    }
}
