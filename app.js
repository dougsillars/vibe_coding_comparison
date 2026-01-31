// Slider value updates
const energySlider = document.getElementById('energy');
const focusSlider = document.getElementById('focus');
const stressSlider = document.getElementById('stress');

const energyValue = document.getElementById('energyValue');
const focusValue = document.getElementById('focusValue');
const stressValue = document.getElementById('stressValue');

energySlider.addEventListener('input', (e) => {
    energyValue.textContent = e.target.value;
});

focusSlider.addEventListener('input', (e) => {
    focusValue.textContent = e.target.value;
});

stressSlider.addEventListener('input', (e) => {
    stressValue.textContent = e.target.value;
});

// Submit button
document.getElementById('submitBtn').addEventListener('click', () => {
    const energy = parseInt(energySlider.value);
    const focus = parseInt(focusSlider.value);
    const stress = parseInt(stressSlider.value);

    showResults(energy, focus, stress);
});

// Check in again button
document.getElementById('checkInAgain').addEventListener('click', () => {
    document.getElementById('results').classList.add('hidden');
    document.getElementById('checkInForm').classList.remove('hidden');
    
    // Reset sliders
    energySlider.value = 5;
    focusSlider.value = 5;
    stressSlider.value = 5;
    energyValue.textContent = '5';
    focusValue.textContent = '5';
    stressValue.textContent = '5';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

function showResults(energy, focus, stress) {
    // Hide form, show results
    document.getElementById('checkInForm').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');

    // Update visual bars
    document.getElementById('energyBar').style.width = `${energy * 10}%`;
    document.getElementById('focusBar').style.width = `${focus * 10}%`;
    document.getElementById('stressBar').style.width = `${stress * 10}%`;

    // Update metric values
    document.getElementById('energyResult').textContent = `${energy}/10`;
    document.getElementById('focusResult').textContent = `${focus}/10`;
    document.getElementById('stressResult').textContent = `${stress}/10`;

    // Calculate overall score (energy + focus - stress, normalized to 10)
    const overallScore = Math.round(((energy + focus + (11 - stress)) / 3));
    document.getElementById('overallScore').textContent = overallScore;

    // Generate insight
    const insight = generateInsight(energy, focus, stress, overallScore);
    document.getElementById('insightText').textContent = insight;

    // Scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function generateInsight(energy, focus, stress, overall) {
    // High performers (overall >= 8)
    if (overall >= 8) {
        if (stress <= 3) {
            return "You're in the zone. High energy, strong focus, and low stress—this is your sweet spot. Tackle your biggest challenges today.";
        } else if (stress <= 6) {
            return "You're performing well despite some stress. Channel that energy into focused work, but remember to take breaks.";
        } else {
            return "You're pushing hard and it shows. Your energy and focus are high, but watch that stress level. Consider what you can delegate or defer.";
        }
    }

    // Moderate overall (5-7)
    if (overall >= 5) {
        if (energy <= 4 && stress >= 7) {
            return "Low energy plus high stress is a tough combo. This might be a day for lighter tasks and self-care. Tomorrow is another chance.";
        } else if (focus <= 4) {
            return "Your mind might be scattered today. Try time-boxing small tasks or taking a walk to reset. You don't need to force it.";
        } else if (stress >= 7) {
            return "The stress is real today. Focus on what truly matters and let go of the rest. You're doing better than you think.";
        } else if (energy <= 4) {
            return "Energy is low but stress is manageable. This might be a good day for planning, thinking, or catching up on easier tasks.";
        } else {
            return "You're in the middle ground—not bad, not great. Pick one meaningful thing to accomplish and call it a win.";
        }
    }

    // Lower overall (< 5)
    if (stress >= 8) {
        return "The stress is overwhelming right now. Please take a step back. Talk to someone, take a break, or tackle just one small thing. You matter more than the work.";
    } else if (energy <= 3 && focus <= 3) {
        return "Everything feels hard today, and that's okay. Rest if you can. When you're ready, start with the tiniest step forward.";
    } else if (energy <= 3) {
        return "Your battery is drained. If possible, rest. If not, go easy on yourself and focus on just showing up—that's enough for today.";
    } else {
        return "Today is tough, but you're still here. Be kind to yourself, do what you can, and remember: tomorrow is a fresh start.";
    }
}

// Save check-in data to localStorage (optional feature for future history tracking)
function saveCheckIn(energy, focus, stress, overall) {
    const checkIn = {
        date: new Date().toISOString(),
        energy,
        focus,
        stress,
        overall
    };

    const history = JSON.parse(localStorage.getItem('dailyPulseHistory') || '[]');
    history.push(checkIn);
    
    // Keep only last 30 days
    if (history.length > 30) {
        history.shift();
    }
    
    localStorage.setItem('dailyPulseHistory', JSON.stringify(history));
}
