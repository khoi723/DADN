// init firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getDatabase, ref, child, onValue, set } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
const config = { databaseURL: 'https://dadn252-default-rtdb.asia-southeast1.firebasedatabase.app/' };
initializeApp(config);
const dbRef = ref(getDatabase());

// Track warning trigger states
let hasTriggeredOverMoistureWarning = false;
let hasShownWateringNeeded = false;
let isMotorRunning = false;

// Function to check moisture against automatic mode settings
function checkMoistureCondition(moistureValue) {
    const onCondition = document.getElementById('onCondition')?.value || 'above';
    const onValue = parseFloat(document.getElementById('onValue')?.value || 40);
    const offCondition = document.getElementById('offCondition')?.value || 'below';
    const offValue = parseFloat(document.getElementById('offValue')?.value || 55);
    const moisture = parseFloat(moistureValue);
    
    // Check if moisture violates turn on condition (need watering)
    const needsWatering = onCondition === 'above' ? moisture < onValue : moisture > onValue;
    
    // Check if moisture violates turn off condition (over-moisture)
    const isOverMoisture = offCondition === 'above' ? moisture < offValue : moisture > offValue;
    
    return { needsWatering, isOverMoisture };
}

// Function to update MOTOR status on Firebase
export function updateMotorStatus(status) {
    const motorStatusRef = child(dbRef, 'MOTOR/status');
    set(motorStatusRef, status)
        .then(() => {
            console.log('Motor status updated to:', status);
        })
        .catch((error) => {
            console.error('Error updating motor status:', error);
        });
}

// Function to handle watering - turns on motor
export function startWatering() {
    updateMotorStatus(1);
}

// Function to stop watering - turns off motor
export function stopWatering() {
    updateMotorStatus(0);
}
export function updateMoistureWarning(moistureValue) {
    const { needsWatering, isOverMoisture } = checkMoistureCondition(moistureValue);
    
    if (isOverMoisture) {
        // Moisture reached upper limit - STOP watering
        if (isMotorRunning) {
            stopWatering();
            isMotorRunning = false;
            if (window.hideWateringNeededIcon) window.hideWateringNeededIcon();
            hasShownWateringNeeded = false;
        }
        // Show warning
        if (!hasTriggeredOverMoistureWarning) {
            const offCondition = document.getElementById('offCondition')?.value || 'below';
            const offValue = document.getElementById('offValue')?.value || '55';
            const warningMessage = `Moisture is too high (${offCondition} ${offValue}%)`;
            if (window.showMoistureWarning) window.showMoistureWarning(moistureValue, warningMessage);
            hasTriggeredOverMoistureWarning = true;
        }
    } else if (needsWatering) {
        // Moisture below lower limit - START watering
        if (!isMotorRunning) {
            startWatering();
            isMotorRunning = true;
            if (window.showWateringNeededIcon) window.showWateringNeededIcon(moistureValue);
            hasShownWateringNeeded = true;
        }
        // Clear warning if it was showing
        if (hasTriggeredOverMoistureWarning) {
            if (window.closeMoistureWarning) window.closeMoistureWarning();
            hasTriggeredOverMoistureWarning = false;
        }
    } else {
        // Moisture between lower and upper limit - KEEP motor running
        // Motor continues running until it reaches upper limit (isOverMoisture)
        // Clear warning if it was showing
        if (hasTriggeredOverMoistureWarning) {
            if (window.closeMoistureWarning) window.closeMoistureWarning();
            hasTriggeredOverMoistureWarning = false;
        }
    }
}

// event-handler methods
export function page_Load() {
    onValue(child(dbRef, 'DHT11'), (snapshot) => {
    snapshot.forEach((child) => {
        if (child.key === 'temp') {
        document.getElementById('lblTemp').innerText = child.val();
        }
        if (child.key === 'humi') {
        document.getElementById('lblHumidity').innerText = child.val();
        }
    });
    });
    onValue(child(dbRef, 'SOIL'), (snapshot) => {
    snapshot.forEach((child) => {
        if (child.key === 'moist') {
        const moistureValue = child.val();
        document.getElementById('lblMoisture').innerText = moistureValue;
        // Check moisture condition whenever value updates
        updateMoistureWarning(moistureValue);
        }
    });
    });
}

// Make functions accessible globally
window.page_Load = page_Load;
window.updateMoistureWarning = updateMoistureWarning;
window.updateMotorStatus = updateMotorStatus;
window.startWatering = startWatering;
window.stopWatering = stopWatering;