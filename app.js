const homeView = document.getElementById('heim-view');
const ekspGrid = document.getElementById('eksperiment-grid');
const oversiktView = document.getElementById('oversikt-view');
const stegView = document.getElementById('steg-view');
const rapportView = document.getElementById('rapport-view');

function showView(viewToShow) {
    window.speechSynthesis.cancel();
    const views = [loadingView, homeView, oversiktView, stegView, rapportView];
    views.forEach(view => view.classList.add('hidden'));
    viewToShow.classList.remove('hidden');
}

function initializeApp() {

    const startEksperimentBtn = document.getElementById('start-eksperiment-btn');
    const heimBtn = document.getElementById('heim-btn');
    const forrigeStegBtn = document.getElementById('forrige-steg-btn');
    const nesteStegBtn = document.getElementById('neste-steg-btn');
    const stegSvarInput = document.getElementById('steg-svar');
    const kopierRapportBtn = document.getElementById('kopier-rapport-btn');
    const rapportText = document.getElementById('rapport-text');

    const stegTilHeimBtn = document.getElementById('steg-til-heim-btn');
    const lesOppBtn = document.getElementById('les-opp-btn');
    const lesOppOversiktBtn = document.getElementById('les-opp-oversikt-btn');
    const lesRapportBtn = document.getElementById('les-opp-rapport-btn');
    const rapportTilStegBtn = document.getElementById('rapport-til-steg-btn');
    const rapportTilHeimBtn = document.getElementById('rapport-til-heim-btn');

    let eksp = null;
    let aktueltEksperiment = null;
    let aktueltStegIndex = 0;

    // --- localStorage-funksjonar ---
    function saveAnswersToLocalStorage() {
        // Hentar alle nøklar frå eksperiment-objektet dynamisk
        const eksperimentKeys = Object.keys(eksperiment);
        const lagraSvar = {};
        
        eksperimentKeys.forEach(key => {
            if (eksperiment[key] && eksperiment[key].steg) {
                lagraSvar[key] = eksperiment[key].steg.map(step => step.svar);
            }
        });
        
        localStorage.setItem('labAssistentSvar', JSON.stringify(lagraSvar));
    }

    function loadAnswersFromLocalStorage() {
        const savedAnswers = JSON.parse(localStorage.getItem('labAssistentSvar'));
        if (savedAnswers) {
            // Lastar alt som finst i localStorage
            const eksperimentKeys = Object.keys(eksperiment);
            eksperimentKeys.forEach(key => {
                if (savedAnswers[key] && eksperiment[key] && eksperiment[key].steg) {
                    eksperiment[key].steg.forEach((step, index) => {
                        step.svar = savedAnswers[key][index] || "";
                    });
                }
            });
        }
    }
    
    loadAnswersFromLocalStorage();
    // --- localStorage-funksjonar slutt ---


    // Funksjonar for å bytte visning

    function loadHeimView() {
        ekspGrid.innerHTML = '';
        for (const key in eksperiment){
            const exp = eksperiment[key];
            const kort = document.createElement('div');

            kort.dataset.eksperiment = key;
            kort.className = "bg-blue-100 p-6 rounded-lg shadow-md cursor-pointer hover:bg-blue-200 transition-colors duration-300 space-y-4";

            kort.innerHTML = `
                <h2 class="text-xl font-semibold text-gray-800">${exp.tittel}</h2>
                <img class="w-full max-w-md mx-auto rounded-lg shadow-md mb-6" src="${exp.foto}" alt="Eksperimentbilde">
                <p class="mt-2 text-gray-600">${exp.ingress}</p>
            `;

            kort.addEventListener('click', () => {
                loadExperimentOverview(key);
            })

            ekspGrid.appendChild(kort);
        }
    }

    function loadExperimentOverview(experimentKey) {
        aktueltEksperiment = eksperiment[experimentKey];
        if (!aktueltEksperiment) return;

        document.getElementById('eksperiment-tittel').textContent = aktueltEksperiment.tittel;
        document.getElementById('eksperiment-bilde').src = aktueltEksperiment.foto;
        document.getElementById('eksperiment-skildring').textContent = aktueltEksperiment.skildring;

        const utstyrList = document.getElementById('utstyrsliste');
        utstyrList.innerHTML = '';
        aktueltEksperiment.utstyr.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            utstyrList.appendChild(li);
        });

        const goalList = document.getElementById('maal-liste');
        goalList.innerHTML = '';
        aktueltEksperiment.maal.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            goalList.appendChild(li);
        });

        showView(oversiktView);
    }

    function loadStep(index) {
        const step = aktueltEksperiment.steg[index];
        if (!step) return;

        document.getElementById('step-tittel').textContent = step.tittel;
        document.getElementById('step-text').textContent = step.tekst;
        document.getElementById('step-question').textContent = step.sporsmal;

        const mediaContainer = document.getElementById('step-media');
        mediaContainer.innerHTML = ''; 

        if (step.bilde) {
            const img = document.createElement('img');
            img.src = step.bilde;
            img.alt = step.tittel;
            img.className = "w-full max-w-md mx-auto rounded-lg shadow-md mb-4"; 
            mediaContainer.appendChild(img);
        }
        
        stegSvarInput.value = step.svar || '';
        stegSvarInput.focus();
        
        forrigeStegBtn.classList.toggle('hidden', index === 0);
        if (index === aktueltEksperiment.steg.length - 1) {
            nesteStegBtn.innerHTML = '<i class="fa-solid fa-marker"></i> Generer rapport';
        } else {
            nesteStegBtn.innerHTML = 'Neste <i class="fa-solid fa-arrow-right"></i>';
        }

        showView(stegView);
    }

    function genererRapport() {
        let reportContent = `Lab-rapport: ${aktueltEksperiment.tittel}\n\n`;
        reportContent += `Mål:\n`;
        aktueltEksperiment.maal.forEach(goal => {
            reportContent += `- ${goal}\n`;
        });
        reportContent += `\nUtstyr:\n`;
        aktueltEksperiment.utstyr.forEach(item => {
            reportContent += `- ${item}\n`;
        });
        reportContent += `\nGjennomføring og resultater:\n`;

        aktueltEksperiment.steg.forEach(step => {
            reportContent += `\n${step.tittel}\n`;
            reportContent += `Spørsmål: ${step.sporsmal}\n`;
            reportContent += `Svar: ${step.svar}\n`;
        });

        rapportText.textContent = reportContent;
        showView(rapportView);
    }

    // Event listeners
    /*
    document.getElementById('syre-base-kort').addEventListener('click', () => {
        loadExperimentOverview("syre-base-titrering");
    });

    document.getElementById('dansande-rosiner-kort').addEventListener('click', () => {
        loadExperimentOverview("dansande-rosiner");
    });

    document.getElementById('papir-kort').addEventListener('click', () => {
        loadExperimentOverview("papirkromatografi");
    });
    
    document.getElementById('magnet-kort').addEventListener('click', () => {
        loadExperimentOverview("elektromagnet");
    });

    document.getElementById('osmose-kort').addEventListener('click', () => {
        loadExperimentOverview("osmose");
    });

    document.getElementById('vulkan-kort').addEventListener('click', () => {
        loadExperimentOverview("vulkan");
    });
    */

    startEksperimentBtn.addEventListener('click', () => {
        aktueltStegIndex = 0;
        loadStep(aktueltStegIndex);
    });

    heimBtn.addEventListener('click', () => {
        showView(homeView);
    });

    forrigeStegBtn.addEventListener('click', () => {
        aktueltEksperiment.steg[aktueltStegIndex].svar = stegSvarInput.value;
        saveAnswersToLocalStorage();

        aktueltStegIndex--;
        loadStep(aktueltStegIndex);
        
    });

    nesteStegBtn.addEventListener('click', () => {
        aktueltEksperiment.steg[aktueltStegIndex].svar = stegSvarInput.value;
        saveAnswersToLocalStorage(); 

        if (aktueltStegIndex < aktueltEksperiment.steg.length - 1) {
            aktueltStegIndex++;
            loadStep(aktueltStegIndex);
        } else {
            genererRapport();
        }
    });

    kopierRapportBtn.addEventListener('click', () => {
        const range = document.createRange();
        range.selectNodeContents(rapportText);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        try {
            document.execCommand('copy');
            alert('Rapporten er kopiert til utklippstavlen!');
        } catch (err) {
            console.error('Kunne ikke kopiere tekst: ', err);
        }
        selection.removeAllRanges();
    });

    stegTilHeimBtn.addEventListener('click', () => {
        showView(homeView);
    });

    lesOppBtn.addEventListener('click', () => {
        const tittel = document.getElementById('step-tittel').textContent;
        const text = document.getElementById('step-text').textContent;
        const question = document.getElementById('step-question').textContent;
        
        const textToRead = `${tittel}. ${text}. Spørsmål: ${question}`;

        window.speechSynthesis.cancel(); 
        
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'nb-NO';
        window.speechSynthesis.speak(utterance);
    });

    lesOppOversiktBtn.addEventListener('click', () => {
        const tittel = aktueltEksperiment.tittel;
        const text = aktueltEksperiment.skildring;
        const utstyr = aktueltEksperiment.utstyr.join(', ');
        const maal = aktueltEksperiment.maal.join(', ');
        
        const textToRead = `${tittel}. ${text}. Utstyr: ${utstyr}. Mål: ${maal}.`;

        window.speechSynthesis.cancel(); 
        
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'nb-NO';
        window.speechSynthesis.speak(utterance);
    });
    
    lesRapportBtn.addEventListener('click', () => {
        const reportContent = rapportText.textContent;
        
        window.speechSynthesis.cancel(); 
        
        const utterance = new SpeechSynthesisUtterance(reportContent);
        utterance.lang = 'nb-NO';
        window.speechSynthesis.speak(utterance);
    });

    rapportTilStegBtn.addEventListener('click', () => {
        loadStep(aktueltStegIndex);
    });

    rapportTilHeimBtn.addEventListener('click', () => {
        showView(homeView);
    });
    

    window.addEventListener('beforeunload', () => {
        localStorage.removeItem('labAssistentSvar');
    });
    loadHeimView();
    showView(homeView);
};
initializeApp();