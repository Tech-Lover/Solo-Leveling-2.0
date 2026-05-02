const guardianVerses = [
    "Commit your work to the Lord, and your plans will be established. - Proverbs 16:3",
    "keep your heart with all vigilance, for from it flow the springs of life. - Proverbs 4:23",
    "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope. - Jeremiah 29:11",
    "For God has not given us a spirit of fear, but of power and of love and of a sound mind. - 2 Timothy 1:7",
    "Set your minds on things that are above, not on things that are on earth. - Colossians 3:2",
];

// this is the object that will everthing for my app. if it is not here, the app will have no idea that it exists.
let gameState = {
    player: {
        name: "B'yte",
        rank: "E-Rank",
        level: 1,
        xp: 0,
        requiredXp: 100,
    },

    skills: [
        { id: "coding", level: 1, xp: 0, color: "#f06cfa" },
        { id: "fitness", level: 1, xp: 0, color: "#6cfaf0" }
    ],
    logs: [
        { text: "System Initialised...", type: "system" }
    ]
};

// this is going to be the render function, it will update the screen with the current game state. it will be called every time the game state changes.
function render() {
    // it will be updating the player's stats
    document.getElementById('player-level').innerText = `LVL. ${gameState.player.level}`;
    document.getElementById('player-rank').innerText = gameState.player.rank;

    // it will be updating the xp bar (this is option A the resetting bar)
    const xpPercent =(gameState.player.xp / gameState.player.requiredXp) * 100;
    document.getElementById('xp-fill').style.width = `${xpPercent}%`;

    // this will be updating the System Log
    const logContainer = document.getElementById('system-log');
    logContainer.innerHTML = gameState.logs.map(log => `<div class="log-entry">> ${log.text}</div>`).join('');

    // auto-scrolling to the bottom of the log
    logContainer.scrollTop = logContainer.scrollHeight;
}

// this is the function that will be handling all the math for leveling up, it will be called every time the player gains xp.
function gainXp(amount) {
    gameState.player.xp += amount;
    addlog(`Gained ${amount} XP,`);

    // checks for level up
    if (gameState.player.xp >= gameState.player.requiredXP) {
        gameState.player.level++;
        gameState.player.xp -= gameState.player.requiredXp; // it keeps the remainder of the xp after leveling up
        gameState.player.requiredXp = Math.floor(gameState.player.requiredXp * 1.5); // makes it harder next time
        addLog(`LEVEL UP! You are now Level ${gameState.player.level}`, "success");
    }

    render(); // this is for updating the screen immediately after gaining xp
}

function addLog(message) {
    gameState.logs.push({ text: message });
    if (gameState.logs.length > 10) gameState.logs.shift(); // it keeps the log short
}

// the Global State: The "source of Truth" for the entire app. It holds all the data and is the single source of truth 
// for the app's state. 
// Whenever we want to change something in the app, we change it here and then call render() to update the UI.
let state = {
    player: {
        name: "B'yte",
        rank: "E-Rank",
        level: 1,
        title: "Newcomer",
        xp: 0,
        nextLevelXp: 100,
        isDebuffed: false,
        redemptionTaskActive: false,
        redemptionTaskDescription: "",
        debuffMultiplier: 1.0, // 1.0 = 100% efficiency
        history: [0,0,0,0,0,0,0], //it will store XP earned each day
        lastLoginDate: new Date().toLocaleDateString(), // this will be used to track daily
        //  activity and reset the history if a new day is detected
        failuresLogged: 0,
        redemptions: 0,
        questsCompleted: 0,
        streak: 0,
        bestStreak: 0,
        bossHp: 1000,
        maxBossHp: 1000,
        affinityXp: 15,
        affinityRank: "Friendly Acquaintance"

    },
    
     buffs: [
        {
            name: "Inspiration",
            source: "New Girl",
            effect: "+10% Focus to work/Coding",
            status: "Active",
        }
    ],
    skills: [
        { id: "coding", name: "CODING", level: 1, xp: 0, max: 100},
        { id: "fitness", name: "FITNESS", level: 1, xp: 0, max:100},
        { id: "skating", name: "SKATING", level: 1, xp: 0, max:100},
        { id: "social", name: "SOCIAL", level: 1, xp: 0, max:100},
        { id: "violin", name: "VIOLIN", level: 1, xp: 0, max:100}, 
        { id: "poetry", name: "POETRY", level: 1, xp: 0, max:100}
    ],
    logs: ["System Initialized...", "Welcome, Player."],

    quests: [
        { id: 1, text: "Push the boundaries (Coding)", xp: 50, completed: false },
        { id: 2, text: "Physical Training (Fitness)", xp:30, completed: false }
    ]
};

function redeemPlayer() {
    if (!state.player.isDebuffed) {
        state.logs.push("SYSTEM: No active debuffs found.");
        return;
    }

    // this creates a confirmation prompt to make sure the player has completed the task before redeeming
    if (confirm(`Did you complete your quest: ${state.player.redemptionTaskDescription}?`)) {

    state.player.isDebuffed = false;
    state.player.debuffMultiplier = 1.0; // this will restore normal XP gain
    state.player.redemptionTaskActive = false;

    state.player.redemptions++;

    state.logs.push(`SYSTEM: Redemption successful. Buffs restored.`);
    } else {
        state.logs.push(`SYSTEM: Redemption failed. Quest still active.`);
    }
    saveSystemData();
    renderAll();
}


// this is the render engine, it takes the current state and updates the UI accordingly. 
// It is called every time the state changes.
function renderAll() {
    // 1. Updates the Profile Card
    document.getElementById('display-level').innerText = state.player.level;
    document.getElementById('display-rank').innerText = state.player.rank;
    document.getElementById('current-xp').innerText = state.player.xp;
    document.getElementById('target-xp').innerText = state.player.nextLevelXp;

    //calculate efficiency
    const failures = state.player.failuresLogged || 0;
    const redemptions = state.player.redemptions || 0;
    const efficiency = failures > 0 ? Math.round((redemptions / failures) * 100) : 100;

    document.getElementById('stat-failures').innerText = failures;
    document.getElementById('stat-redemptions').innerText = redemptions;
    document.getElementById('stat-efficiency').innerText = efficiency + "%";

    // 2. Update the Main XP Bar
    const xpPercent = (state.player.xp / state.player.nextLevelXp) * 100;
    document.getElementById('xp-bar-fill').style.width = `${xpPercent}%`;

    const xpBarFill = document.getElementById('xp-bar-fill');

    if (state.player.isDebuffed) {
        xpBarFill.style.background = "var(--danger)"; // red color for debuff from the CSS code
        xpBarFill.style.boxShadow = "0 0 15px #ff4d4d";
    } else {
        xpBarFill.style.background = "var(--accent-purple)";
        xpBarFill.style.boxShadow = "0 0 10px var(--accent-purple)";
    }

    const questDisplay = document.getElementById('active-quest');
    if (state.player.isDebuffed) {
        questDisplay.innerText = `ACTIVE PENALTY: ${state.player.redemptionTaskDescription}`;
    } else {
        questDisplay.innerText = "";
    }

    // 3. Update the System log (the last 5 entries)
    const logBox = document.getElementById('system-log');
    logBox.innerHTML = state.logs.slice(-6).map(msg => {
        let color = "#fff"; // default white
        if (msg.includes("!!")) color = "#ff4d4d"; // red for warnings
        if (msg.includes("LEVEL UP")) color = "#00ffaa"; // green for level ups
        if (msg.includes("GUARDIAN")) color = "#5ce1e6"; // cyan for guardian verses
        if (msg.includes("SUCCESS")) color = "#00ffaa"; // green for successes
        return `<div class="log-entry" style="color: ${color};">> ${msg}</div>`;
    }).join('');
    logBox.scrollTop = logBox.scrollHeight;

    // 4. Updates the skill bars (option C: relative comparison)
    const skillContainer = document.getElementById('skills-container');
    // find the highest level to compare others against
    const maxLevel = Math.max(...state.skills.map(s => s.level));

    skillContainer.innerHTML = state.skills.map(skill => {
        const width = (skill.level / maxLevel) * 100;
        return `
            <div class="skill-item">
                <div class="skill-info"><span>${skill.name}</span><span class="skill-lv">LVL ${skill.level}</span></div>
                <div class="skill-bar-bg"><div class="skill-bar-fill" style="width: ${width}%;"></div></div>
            </div>
        `;
    }).join('');

    renderHeader(); // Update phase title
    renderHabitChart(); // this will update the habit chart based on the history data
    renderQuests();
    updateRankAndTitle();
    renderAnalysis();
    renderBossUI();
    renderBuffs();
    renderLog();
    renderAffinity();
}

function renderHabitChart() {
    const habitBars = document.querySelectorAll('.habit-bar');
    const maxDayXp = Math.max(...state.player.history, 100); //scales the  bars relative to my best day

    state.player.history.forEach((dayXp, index) => {
        if (habitBars[index]) {
            const heightPercent = (dayXp / maxDayXp) * 100;
            habitBars[index].style.height = `${heightPercent}%`;

             //for visual polish, i will add a glow effect to the best day
            if (index === state.player.history.length - 1) {
                habitBars[index].style.boxShadow = "0 0 15px var(--accent-purple";
                habitBars[index].style.opacity = "1";
            }
        }
    });
}

function renderHabitChart() {
    const habitBars = document.querySelectorAll('.habit-bar');
    console.log("System found " + habitBars.length + " habit bars."); // check this in the console

    const historyData = state.player.history || [0,0,0,0,0,0];
    const maxDayXp = Math.max(...historyData, 100);

    historyData.forEach((dayXp, index) => {
        if (habitBars[index]) {
            const heightPercent = (dayXp / maxDayXp) * 100;
            habitBars[index].style.height = heightPercent + "%";
            console.log(`Day ${index} height set to: ${heightPercent}%`);
        }
    });
}

// this is for the CLI input, it will be called when the player submits a command.
const cliInput = document.getElementById('cli-input');

cliInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const command = cliInput.value.toLowerCase().trim();
        processCommand(command);
        cliInput.value = ''; // it clears the input after processing the command
    }
});

function processCommand(inputString) {

    const cmd = inputString.toLowerCase().trim();
    const args = inputString.split(' '); // example: ["train", "coding", "20"]

    if (cmd.includes('new girl') || cmd.includes('feeling') || cmd.includes('crush')) {
        // Trigger the protocol
        const randomIndex = Math.floor(Math.random() *
    guardianVerses.length);
        const verse = guardianVerses[randomIndex];

         state.logs.push(`[GUARDIAN PROTOCOL]: ${verse}`);
        // document.body.style.backgroundColor = "rgba(92, 255, 230, 0.1)";
        // setTimeout(() => document.body.style.backgroundColor = "transparent", 300);
        triggerpenalty(); // the screen shakes to snap me out of the thought and
    //  back to the system

    }

    if (cmd.startsWith('train')) {
        const skillId = args[1];
        const amount = parseInt(args[2]);
        trainSkill(skillId, amount);
    }
    else if (cmd.startsWith('add xp')) {
        const amount = parseInt(args[2]);
        addPlayerXp(amount);
    }
    else if (cmd === 'system reset') {
        if (confirm("WARNING: Initializing System Wipe. All progress will be lost. Proceed?")) {
            localStorage.removeItem('soloLevelingData'); // this will delete the save file
            location.reload(); // this will refresh the page to start fresh
        }
    }
    else if (cmd.startsWith('fail')) {
        const reason = cmd.replace('fail ', '');
        // 1. increments my failure counts for my analysis card
        state.player.failuresLogged++;
        
        state.player.streak = 0;

        // 2. triggers the penalty logic
        updateBossBattle('heal');
        triggerpenalty(reason);

        state.logs.push(`LOGGED FAILURE: ${reason}`);
        state.logs.push("SYSTEM: Streak has been reset to 0.");
    }
    else if (cmd === 'redeem') {
        // i will make this harder by requiring a task completion
        redeemPlayer();
    }
    else if (cmd === 'damage') {
        updateBossBattle('damage');
    }
    else if (cmd.startsWith('log feelings')) {
        // this one checks if Coding and Fitness tasks are done today
        const codingLvl = state.skills.find(s => s.name === "Coding").level;
        //sconst codingLvl = codingSkill ? codingSkill.level : 0;

        if (codingLvl < 2) {
            state.logs.push("!! ACCESS DENIED: Complete 'Software Engineering' modules first.");
            triggerpenalty();
        } else {
            const feeling = cmd.replace('log feelings ', '');
            state.logs.push(`> [DATA STORED]: ${feeling}. Affinity stabilized.`);
            // logic to incremment affinity subtly
        }
        if (cmd.startsWith('log interaction')) {
            const bonus = 5; // this is the bonus affinity XP for interactions
            state.player.affinityXp = Math.min(100, (state.player.affinityXp || 0) +
        bonus);

        // Update affinity rank based on XP thresholds
        if (state.player.affinityXp >= 50) state.player.affinityRank = "Close Friend";
        if (state.player.affinityXp >= 90) state.player.affinityRank = "Soul Bond";

        state.logs.push(`[SYSTEM]: Rapport increased. Interaction Health +${bonus}%`);

        if (cmd.startsWith('talked to her') || cmd.includes('affinity')) {
            updateAffinity(5, "Natural Conversation recorded");
        }
        else if (cmd.startsWith('coincidence')) {
            updateAffinity(2, "Coincidence detected");
        }
        else if (cmd.startsWith('helped her') || cmd.includes('help')) {
            updateAffinity(5, "Helpful interaction recorded");
        }
        else if (cmd.startsWith('told her goodbye') || cmd.includes('goodbye')) {
            updateAffinity(5, "Farewell interaction logged");
        }
        else if (cmd.startsWith('overthink about her') || cmd.includes('overthink')) {
            triggerpenalty("Overthinking about her");
        }

        // triggeer the sprite reaction we made!
        triggerSpriteReaction();
        }
        renderAll();
    }

    if (cmd.includes('new girl') || cmd.includes('feeling')) {
        triggerGuardianVerse();
        // this helps to make sure that everytime I think about the girl,
        // the system points me back to the verses.
    }

    else if (cmd.includes('talked to her') || cmd.includes('interaction')) {
        updateAffinity(5, "Natural Conversation recorded");
    }

    else if (cmd.includes('coincidence')) {
        updateAffinity(2, "Coincidence detected");
    }

    // Brief cyberpunk glitch flash effect on the log panel when a command is entered
    const logBox = document.getElementById('system-log');
    logBox.classList.remove('flash-glitch');
    void logBox.offsetWidth;
    logBox.classList.add('flash-glitch');
    logBox.addEventListener('animationend', () => {
        logBox.classList.remove('flash-glitch');
    }, { once: true });

    // ... you can add more commands here like "rankup", "clear logs", etc.
    saveSystemData();
    renderAll();
}
 //{
    // this is for simple Command Parser
   // if (cmd.startsWith('add xp')) {
        //const amount = parseInt(cmd.split(' ')[2]);
        //if (!isNaN(amount)) {
      //      addPlayerXp(amount);
     //   }
  //  } else if (cmd === 'help') {
       // state.logs.push("Commands: 'add xp [num]', 'clear', 'rankup'");
  //  } else {
   //     state.logs.push(`Unknown command: ${cmd}`);
   // }
  //  renderAll();
//}

// the leveking logic
function addPlayerXp(amount) {
    // Apply debuff multiplier first
    const actualGain = Math.floor(amount * state.player.debuffMultiplier);
    state.player.xp += actualGain;

    // track for the chart
    state.player.history[state.player.history.length - 1] += actualGain;

    // checks for level up
    if (state.player.xp >= state.player.nextLevelXp) {
        state.player.level++;
        state.player.xp -= state.player.nextLevelXp;
        state.player.nextLevelXp = Math.floor(state.player.nextLevelXp * 1.3);
        state.logs.push(`SYSTEM: Level Up! Current Level: ${state.player.level}`);

        //Bonus: Update Rank every 10 levels
        if (state.player.level >=10) state.player.rank = "D";
        if (state.player.level >=25) state.player.rank = "C";
        saveSystemData(); // it saves the game state after leveling up
    }

    // Log the gain
    if (state.player.isDebuffed) {
        state.logs.push(`[DEBUFFED] Only gained ${actualGain} XP.`);
    } else {
        state.logs.push(`Synthesized +${actualGain} XP.`);
    }
}

// the initial render call to display the starting state of the game
renderAll();

function saveSystemData() {
    localStorage.setItem('soloLevelingData', JSON.stringify(state));
}

function loadSystemData() {
    const savedData = localStorage.getItem('soloLevelingData');
    if (savedData) {
        state = JSON.parse(savedData);

        // Ensure history exists, default to the initial data if not saved
        if (!state.player.history)  state.player.history = [20,50,80,40,90,60,85];

        // ---NEW: Check for midnight reset here ---
        checkDailyReset();
        
        renderAll();
    }
}

// call load on startup to restore previous state
loadSystemData();

function trainSkill(id, amount) {
    const skill = state.skills.find(s => s.id === id);
    if (skill) {
        skill.xp += amount;
        state.logs.push(`Skill [${skill.name}] gained ${amount} XP.`);

        // this is the Skill Leveling Logic (option B: Mastery)
        if (skill.xp >= skill.max) {
            skill.level++;
            skill.xp = 0;
            skill.max = Math.floor(skill.max * 1.2);
            state.logs.push(`SKILL UP: ${skill.name} is now LVL ${skill.level}!`);
        }
        saveSystemData();
    } else {
        state.logs.push(`Error: Skill '${id}' not found`);
    } 
}

const penanceTasks = [
    "Complete 20 Pushups",
    "Read 10 Pages of a Book",
    "Clean My workspace",
    "no Social Media for 2 Hours",
];

function triggerpenalty(reason = "Mental Distraction") {
    state.player.isDebuffed = true;
    state.player.debuffMultiplier = 0.5; // this will make xp gain 50% less effective hence
    //  i will be gaining only 50% XP

    // picks a random task from the penanca list and sets it as the redemption task
    const randomTask = penanceTasks[Math.floor(Math.random() * penanceTasks.length)];
    state.player.redemptionTaskActive = true;
    state.player.redemptionTaskDescription = randomTask;

    state.logs.push(`!! PENALTY TRIGGERED: ${reason} !!`);
    state.logs.push(`SYSTEM: XP gain reduced by 50% until Redemption.`);
    state.logs.push(`REDEMPTION QUEST: ${randomTask}`);

    // makes the dashboard red and shake
    const mainUI = document.querySelector('.app-container');

    //playing a glitch sound
    // name of the audio('glitch.mp3')
    //audio.play()

    if(mainUI) {
        mainUI.classList.add('system-error-glitch');
        setTimeout(() => {
            mainUI.classList.remove('system-error-glitch');
        }, 1000);
    }

    if (mainUI) {
         mainUI.classList.add('system-error-glitch');
         // removes it after the animation
        setTimeout(() => {
            mainUI.classList.remove('system-error-glitch');
         }, 1000);
    }

    const logDisplay = document.getElementById('log-output');
    if (logDisplay) {
        // triggers the visual effect
        logDisplay.classList.add('glitch-state');

        // removes the effect after the animation duration
        setTimeout(() => {
            logDisplay.classList.remove('glitch-state');
        }, 1000);
    }

    saveSystemData();
    renderAll();
}

function checkDailyReset() {
    const today = new Date().toLocaleDateString();

    if (state.lastLoginDate !== today) {
        // 1.calculate how many days have passed
        // this will handle if I haven't opened the app for 2 days
        state.player.history.push(0);

        //2. keeps the history at exactly 7 days
        if (state.player.history.length > 7) {
            state.player.history.shift();
        }

        // 3. Update the date to today
        state.lastLoginDate = today;

        state.logs.push("SYSTEM: New day detected. History shifted.");
        updateBossBattle('damage');
        saveSystemData();
    }
}

function completeQuest(questId) {
    const quest = state.quests.find(q => String(q.id) === String(questId));
    if (quest && !quest.completed) {
        quest.completed = true;
        state.player.questsCompleted++;
        state.player.streak++;
        if (state.player.streak > state.player.bestStreak) {
            state.player.bestStreak = state.player.streak;
        }

        // the Bonus logic: +2% bonus for every streak point (max 20%)
        const streakBonus = Math.min(state.player.streak * 2, 20);
        const finalXp = quest.xp + Math.floor(quest.xp * (streakBonus / 100));

        //It will be rewarding me
        addPlayerXp(finalXp);
        state.logs.push(`QUEST COMPLETE: ${quest.text} (+${finalXp} XP)`);

        saveSystemData();
        renderAll();

        // It will be removing the completed quest after 2 seconds for a clean look
        setTimeout(() => {
            state.quests = state.quests.filter(q => q.id !== questId);
            saveSystemData();
            renderAll();
        }, 2000);

    }
}

function renderQuests() {
    const questList = document.getElementById('quest-list');
    if (!questList) return;

    questList.innerHTML = state.quests.map(quest => `
        <div class="quest-item ${quest.completed ? 'done' : ''}"
        onclick="completeQuest(${quest.id})">
        <div class="quest-text">
            <span class="quest-bullet">◈</span> ${quest.text}
        </div>
        <div class="quest-reward">+${quest.xp} XP</div>
        </div>
    `).join('');
}

// function for adding a new quest via input
function addNewQuest() {
    const input = document.getElementById('quest-input');
    const text = input.value.trim();

    if (text !== "") {
        const newQuest = {
            id: Date.now(), //unique ID based on time
            text: text,
            xp: 20, // the default XP
            completed: false
        };

        state.quests.push(newQuest);
        input.value = ""; // clear input
        saveSystemData();
        renderAll();
    }
}

document.getElementById('quest-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // helps to stop reloading
        addNewQuest();
    }
});

function updateRankAndTitle() {
    const oldTitle = state.player.title;
    const lvl = state.player.level;

    // the rank logic
    if (lvl >= 10 && lvl < 20) state.player.rank = "D-Rank";
    else if (lvl >= 20 && lvl < 40) state.player.rank = "C-Rank";
    else if (lvl >= 40 && lvl < 60) state.player.rank = "B-Rank";
    else if (lvl >= 60) state.player.rank = "A-Rank";

    // Title Logic
    if (lvl >= 5 && lvl < 15) state.player.title = "Stray Dog";
    else if (lvl >= 15 && lvl < 30) state.player.title = "One Who Overcomes";
    else if (lvl >= 30) state.player.title = "System Architect";

    //Update the HTML display
    document.getElementById('display-rank').innerText = state.player.rank;
    document.getElementById('display-title').innerText = state.player.title;

    // check if the title changed
    if (oldTitle !== state.player.title) {
        triggerSystemOverlay(`TITLE ACQUIRED`, `You are now known as: ${state.player.title}`);
    }
}

function triggerSystemOverlay(title, msg) {
    const overlay = document.getElementById('system-overlay');
    document.getElementById('overlay-title').innerText = title;
    document.getElementById('new-title-name').innerText = state.player.title;

    overlay.classList.remove('overlay-hidden');
    overlay.classList.remove('overlay-visbile');
}

function closeOverlay() {
    const overlay = document.getElementById('system-overlay');
    overlay.classList.add('overlay-hidden');
    overlay.classList.remove('overlay-visible');
}

function renderAnalysis() {
    const totalActions = state.player.questsCompleted + state.player.failuresLogged;

    // effciency = (completed Quests / Total Actions) * 100
    let efficiency = 100;
    if (totalActions > 0) {
        efficiency = Math.round((state.player.questsCompleted / totalActions) * 100);
    }

    const effElement = document.getElementById('stat-efficiency');

    effElement.innerText = efficiency + "%";
    document.getElementById('stat-failures').innerText = state.player.failuresLogged;
    document.getElementById('stat-redemptions').innerText = state.player.redemptions;
    document.getElementById('stat-streak').innerText = state.player.streak;

    const analysisCard = document.querySelector('.analysis-card');
    if (state.player.streak >= 5) {
        analysisCard.classList.add('streak-glow');
    } else {
        analysisCard.classList.remove('streak-glow');
    }

    if (efficiency <= 30) {
        effElement.style.color = "#ff4d4d"; // danger red
        effElement.style.textShadow = "0 0 10px #ff4d4d";
    } else if (efficiency <= 70) {
        effElement.style.color = "#bc6ff1"; // System Purple
        effElement.style.textShadow = "none";
    } else {
        effElement.style.color = "#00ffaa"; // Success green
        effElement.style.textShadow = "0 0 10px #00ffaa";
    }

}

function updateBossBattle(actionType) {
    console.log('updateBossBattle called with:', actionType);
    if (actionType === 'damage') {
        // Each clean day deals 50 damage (this is where I will de adjusting the difficulty)
        state.player.bossHp = Math.max(0, state.player.bossHp - 50);
        spawnDamageNumber(50, 'damage');
        console.log('Boss HP after damage:', state.player.bossHp);
        triggerDamageAnimation();
    
    } else if (actionType === 'heal') {
        // failing heals the boss by 200 HP
        state.player.bossHp = Math.min(state.player.maxBossHp, state.player.bossHp + 200);
        spawnDamageNumber(200, 'heal');
        console.log('Boss HP after heal:', state.player.bossHp);
        triggerHealAnimation();
    }
    saveSystemData();
    renderBossUI();
}

function triggerDamageAnimation() {
    const sprite = document.querySelector('.boss-sprite');
    if (!sprite) return;
    
    sprite.style.animation = 'none';
    // Trigger reflow to restart animation
    void sprite.offsetWidth;
    sprite.style.animation = 'boss-hit 0.3s ease-out';
}

function triggerHealAnimation () {
    const sprite = document.querySelector('.boss-sprite');
    if (!sprite) return;
    
    sprite.style.animation = 'none';
    // Trigger reflow to restart animation
    void sprite.offsetWidth;
    sprite.style.animation = 'boss-heal 0.3s ease-out';
}

function renderBoss() {
    const hpFill = document.getElementById('boss-hp-fill');
    const hpText = document.getElementById('boss-hp-val');
    const percent = (state.player.bossHp / state.player.maxBossHp) * 100;

    hpFill.style.width = percent + "%";
    hpText.innerText = state.player.bossHp;

    // the visual change: the boss turns red when low on HP
    const sprite = document.querySelector('.boss-sprite');
    if (percent < 20) {
        sprite.style.background = "radial-gradient(circle, #000 30%, #ff4d4d 100%)";
    }
}

function renderBossUI() {
    const hpFill = document.getElementById('boss-hp-fill');
    const hpText = document.getElementById('boss-hp-val');
    const container = document.querySelector('.hp-bar-container');

    if (!hpFill || !hpText) {
        console.error('Boss HP elements not found');
        return;
    }

    // calculate percentage
    const percent = (state.player.bossHp / state.player.maxBossHp) * 100;
    console.log('Boss HP:', state.player.bossHp, 'Percent:', percent);

    // to move the bar
    hpFill.style.width = percent + "%";

    // update the text
    hpText.innerText = state.player.bossHp;

    if (percent <= 20) {
        container.classList.add('critical-state');
        hpFill.style.filter = "saturate(2) brightness(1.5)";
    } else {
        container.classList.remove('critical-state');
        hpFill.style.filter = "none";
    }

    // visual: change bar color to yellow/orange as it gets lower
    if (percent < 25) {
        hpFill.classList.add('low-hp-bar');
    } else {
        hpFill.classList.remove('low-hp-bar');
    }
}

function spawnDamageNumber(amount, type = 'damage') {
    const container = document.getElementById('damage-container');
    const num = document.createElement('div');

    num.className = 'damage-number';
    if (type === 'heal') {
        num.style.color = "#00ffaa"; // green for healing
        num.style.textShadow = "0 0 10px #00ffaa, 2px 2px #000";
        num.innerText = `+${amount}`;
    } else {
        num.innerText = `-${amount}`;
    }

    // add a tiny bit of random horizontal offset for visual variety
    const offset = Math.floor(Math.random() * 40) - 20; // -20 to +20 px
    num.style.left = `calc(50% + ${offset}px)`;

    container.appendChild(num);

    // clean up the element after animation ends
    setTimeout(() => {
        num.remove();
    }, 800);
}

function renderHeader() {
    const titleElement = document.getElementById('phase-title');
    if (!titleElement) return;
    
    // Update phase based on level
    if (state.player.level < 10) {
        titleElement.innerText = "PHASE: THE AWAKENING";
        titleElement.style.color = "var(--accent-purple)";
    } else if (state.player.level < 25) {
        titleElement.innerText = "PHASE: GROWTH";
        titleElement.style.color = "var(--accent-cyan)";
    } else {
        titleElement.innerText = "PHASE: MASTERY";
        titleElement.style.color = "var(--accent-gold)";
    }
}

function renderBuffs() {
    const container = document.getElementById('buffs-container');
    if (!container) return;

    container.innerHTML = state.buffs.map(buff => `
        <div class="buff-icon" title="${buff.effect}">
            <span class="buff-sparkle">✨</span> ${buff.name}
        </div>
    `).join('');
}

function triggerGuardianVerse() {
    // picks a random verse
    const randomIndex = Math.floor(Math.random() * guardianVerses.length);
    const verse = guardianVerses[randomIndex];

    // log it to the system Log with a unique color
    state.logs.push(`[GUARDIAN PROTOCOL]: ${verse}`);

    // optional play a sound effect here for extra impact or a subtle screen flash
    renderAll();
}

function renderLog() {
    const logContainer = document.getElementById('system-log-content');
    if (!logContainer) return;

    // we reserve it so the newset log is at the bottom, and we want to keep it scrolled to the bottom
    logContainer.innerHTML = state.logs.map(log => {
        // it applies different colours based on the key words
        let color = "#fff";
        if (log.includes("!")) color = "#ff4d4d"; // red for warnings
        if (log.includes("GUARDIAN")) color = "#5ce1e6"; // cyan for guardian verses
        if (log.includes("SUCCESS")) color = "#00ffaa"; // green for successes

        return `<p style="color: ${color}; margin: 5px 0;">> ${log}</p>`;
    }).join('');

    // auto-scroll to the bottom
    setTimeout(() => {
        const logContainer = document.getElementById('system-log-content');
        logContainer.scrollTo({
            top: logContainer.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
}

function updateAffinity(amount, message) {
    //1. to increase the XP
    state.player.affinityXp = Math.min(100, (state.player.affinityXp || 0) +
amount);

//2. add to the mini-log inside the card
const afflog = document.getElementById('affinity-log');
if (afflog) {
    afflog.innerHTML = `<p>> [SYSTEM]: ${message}. Rapport +${amount}.</p>`;
}

// targets the sprite
const sprite = document.querySelector('.pixel-girl-sprite');

if (sprite) {
    // adds a reaction class
    sprite.classList.add('sprite-react');

    // removes it after the animation duration (assuming 1s)
    setTimeout(() => {
        sprite.classList.remove('sprite-react');
    }, 500);
}

// 3. adds to the main system log too
state.logs.push(`AFFINITY UP: ${message}`);

saveSystemData();
renderAll();
}

function renderAffinity() {
    const heartFill = document.getElementById('affinity-fill-hearts');
    const rank = document.getElementById('affinity-rank');
    const heartValText = document.getElementById('affinity-hearts-val');

    if (!heartFill || !heartValText || !rank) return;

    // converts XP percentage to heart count (3)
    const heartCount = Math.floor((state.player.affinityXp || 0) / 10);

    // update the visual gauge (using the full % for smooth movement)
    heartFill.style.width = state.player.affinityXp + "%";

    // updates the numerical text
    heartValText.innerText = heartCount;

    // change color when getting higher
    if (heartCount > 7) {
        heartFill.style.background = "linear-gradient(90deg, #ff00ff, #ff007f)"; // vibrant pink gradient
    }

   // if (heartFill) heartFill.style.width = state.player.affinityXp + "%";

    // logic to change rank based on XP
  //  if (state.player.affinityXp > 50) {
    //    state.player.affinityRank = "close Associate";
      //  if (rank) rank.innerText = state.player.affinityRank;
    //}
}

function triggerSpriteReaction() {
    const sprite = document.querySelector('.pixel-girl-sprite');
    if (sprite) {
        sprite.classList.add('sprite-react');

        setTimeout(() => {
            sprite.classList.remove('sprite-react');
        }, 500);
    }
}