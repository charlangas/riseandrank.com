const main = async () => {
    try {
        let auth0Client = null;

        // --- AUTH0 CONFIGURATION ---
        auth0Client = await auth0.createAuth0Client({
            domain: 'dev-658pplz7hlkua00p.us.auth0.com', // Replace with your Auth0 Domain
            clientId: 'SSfHzCrn2NXoAqaYaRjbwrX7AYhISamg', // Replace with your Auth0 Client ID
            authorizationParams: {
                redirect_uri: 'https://riseandrank.com/linkedin/',
            },
        });

        // --- AUTH0 LOGIN FLOW ---
        const loginView = document.getElementById('login-view');
        const toolWrapper = document.getElementById('tool-wrapper');
        const userEmailSpan = document.getElementById('user-email');

        const isAuthenticated = await auth0Client.isAuthenticated();

        if (isAuthenticated) {
            loginView.classList.add('hidden');
            toolWrapper.classList.remove('hidden');
            const user = await auth0Client.getUser();
            if (user) userEmailSpan.textContent = user.email;
        } else if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
            await auth0Client.handleRedirectCallback();
            window.history.replaceState({}, document.title, window.location.pathname);
            loginView.classList.add('hidden');
            toolWrapper.classList.remove('hidden');
            const user = await auth0Client.getUser();
            if (user) userEmailSpan.textContent = user.email;
        } else {
            loginView.classList.remove('hidden');
            toolWrapper.classList.add('hidden');
        }

        // --- AUTH0 EVENT LISTENERS ---
        document.getElementById('login-btn').addEventListener('click', () => {
            auth0Client.loginWithRedirect();
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            auth0Client.logout({
                logoutParams: {
                    returnTo: window.location.href,
                },
            });
        });
        
        // --- TOOL JAVASCRIPT ---
        const painPointSelect = document.getElementById('primary-pain-point');
        const departmentSelect = document.getElementById('target-department');
        const personaInput = document.getElementById('target-persona');
        const goalSelect = document.getElementById('content-goal');
        const generateIdeasBtn = document.getElementById('generate-ideas-btn');
        const ideasOutput = document.getElementById('ideas-output');
        const step2Section = document.getElementById('step-2-section');
        const prompt2Inputs = document.getElementById('prompt-2-inputs');
        const anecdoteTextarea = document.getElementById('personal-anecdote');
        const generatePostsBtn = document.getElementById('generate-posts-btn');
        const finalOutputSection = document.getElementById('final-output-section');
        const postsOutput = document.getElementById('posts-output');
        const loadingIndicator = document.getElementById('loading-indicator');

        const API_URL = '/.netlify/functions/generate-content';
        
        // This variable will store the entire conversation.
        let conversationHistory = [];

        const PAIN_POINTS = [
            "Poor lead quality / too many low-value leads",
            "Low conversion from lead to SQL",
            "Slow or inconsistent follow-up",
            "Lack of contextual lead intelligence for reps",
            "No reliable attribution of pipeline to marketing",
            "Content pipeline is slow and unscalable for personalization",
            "Inefficient handoffs and accountability (no SLA)"
        ];
        const CONTENT_GOALS = [
            "Generate discovery calls for our diagnostic audit",
            "Build credibility and authority in our niche",
            "Get prospects to download a strategic asset (e.g., a template or guide)",
            "Increase post reach and audience engagement",
            "Start conversations with ideal customer profiles (ICPs)"
        ];

        const PROMPT_1_TEMPLATE = (painPoint, department, persona, goal) => `
        You are a LinkedIn Content Strategist for B2B marketing.
        Your task is to generate 7 specific, high-engagement post ideas based on the following inputs.
        - PRIMARY PAIN POINT: "${painPoint}"
        - TARGET DEPARTMENT: "${department}"
        - TARGET PERSONA: "${persona}"
        - CONTENT GOAL: "${goal}"
        - TONE OF VOICE: Authoritative, insightful, empathetic.
        For each idea, provide a compelling "Post Title / Hook", the "Recommended Post Type" (e.g., Story, Listicle, Contrarian Take), a "Key Angle / Rationale", and a "Primary Call-to-Engagement (CTE)".
        `;

        const PROMPT_2_TEMPLATE = (selectedIdea, anecdote) => `
        You are a Master LinkedIn Ghostwriter.
        Your task is to write 3 full LinkedIn post drafts based on the selected idea.
        Incorporate our agency's context: we are a Middle-of-Funnel (MoFu) agency fixing the gap between Marketing's MQLs and Sales' SQLs. Use relevant jargon (pipeline velocity, lead scoring, MQL, SQL, SLA).
        - SELECTED POST IDEA: ${selectedIdea}
        - PERSONAL ANECDOTES OR DATA: "${anecdote}"
        - DESIRED TONE: Authoritative, insightful, empathetic.
        Produce 3 distinct drafts: 1) A problem/solution draft, 2) A data-led story draft, and 3) A provocative "You're doing it wrong" angle draft.
        Format the output clearly with "--- DRAFT 1 ---", "--- DRAFT 2 ---", etc.
        `;

        // --- FUNCTIONS ---
        const showLoading = (show) => {
            loadingIndicator.classList.toggle('hidden', !show);
        };

        const populatePainPoints = () => {
            painPointSelect.innerHTML = '<option value="random">-- Random --</option>';
            PAIN_POINTS.forEach(point => {
                const option = document.createElement('option');
                option.value = point;
                option.textContent = point;
                painPointSelect.appendChild(option);
            });
        };

        const populateContentGoals = () => {
            goalSelect.innerHTML = '';
            CONTENT_GOALS.forEach(goal => {
                const option = document.createElement('option');
                option.value = goal;
                option.textContent = goal;
                goalSelect.appendChild(option);
            });
        };

        const getRandomOption = (selectElement) => {
            const options = Array.from(selectElement.options).filter(opt => opt.value && opt.value !== 'random');
            return options[Math.floor(Math.random() * options.length)].value;
        };

        const callClaudeAPI = async (messages) => {
            if (!await auth0Client.isAuthenticated()) {
                alert('Session expired. Please log in again.');
                return null;
            }

            const token = await auth0Client.getTokenSilently();

            showLoading(true);
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    // Sends the full 'messages' array to the backend.
                    body: JSON.stringify({ messages })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || `API Error: ${response.status}`);
                }
                return data.content;
            } catch (error) {
                alert(`An error occurred: ${error.message}`);
                return null;
            } finally {
                showLoading(false);
            }
        };

        const handleGenerateIdeas = async () => {
            // Reset history for a new conversation.
            conversationHistory = [];

            let painPoint = painPointSelect.value === 'random' ? getRandomOption(painPointSelect) : painPointSelect.value;
            let department = departmentSelect.value === 'random' ? getRandomOption(departmentSelect) : departmentSelect.value;
            
            const prompt1 = PROMPT_1_TEMPLATE(painPoint, department, personaInput.value, goalSelect.value);
            
            // Add the user's first message to the history.
            conversationHistory.push({ role: 'user', content: prompt1 });

            const result = await callClaudeAPI(conversationHistory);

            if (result) {
                // Add the AI's response to the history to maintain context.
                conversationHistory.push({ role: 'assistant', content: result });

                let startIndex = result.search(/1\.\s*\*\*Post Title/);
                if (startIndex === -1) { 
                    startIndex = result.search(/\*\*Post Title/);
                }
                if (startIndex === -1) { startIndex = 0; }
                
                const ideaListText = result.substring(startIndex);
                const ideas = ideaListText.trim().split(/\n\s*(?=\d+\.\s*\*\*Post Title)/).filter(Boolean);

                if (ideas.length === 0) {
                    alert("Could not parse ideas from the API response. Please try again.");
                    return;
                }

                ideasOutput.innerHTML = ''; 
                ideas.forEach((ideaText, index) => {
                    const cleanIdeaText = ideaText.trim(); 
                    const radioId = `idea-${index}`;
                    const div = document.createElement('div');
                    div.className = 'idea-item';
                    div.innerHTML = `
                        <input type="radio" id="${radioId}" name="selectedIdea" value="${escape(cleanIdeaText)}">
                        <label for="${radioId}">${cleanIdeaText.replace(/\n/g, '<br>')}</label>
                    `;
                    ideasOutput.appendChild(div);
                });
                
                const radioId = 'idea-random';
                const div = document.createElement('div');
                div.className = 'idea-item';
                div.innerHTML = `
                    <input type="radio" id="${radioId}" name="selectedIdea" value="random">
                    <label for="${radioId}"><strong>-- I'm Feeling Lucky (Pick One for Me) --</strong></label>
                `;
                ideasOutput.appendChild(div);

                step2Section.classList.remove('hidden');
                finalOutputSection.classList.add('hidden');
                postsOutput.innerHTML = '';
            }
        };
        
        const handleGeneratePosts = async () => {
            let selectedValue = document.querySelector('input[name="selectedIdea"]:checked')?.value;

            if (!selectedValue) {
                alert('Please select an idea first.');
                return;
            }

            if (selectedValue === 'random') {
                const allIdeaRadios = document.querySelectorAll('input[name="selectedIdea"]:not([value="random"])');
                const randomRadio = allIdeaRadios[Math.floor(Math.random() * allIdeaRadios.length)];
                selectedValue = randomRadio.value;
            }

            const selectedIdea = unescape(selectedValue);
            const prompt2 = PROMPT_2_TEMPLATE(selectedIdea, anecdoteTextarea.value);

            // Add the user's second message to the existing history.
            conversationHistory.push({ role: 'user', content: prompt2 });
            
            // Send the entire conversation history to the API.
            const result = await callClaudeAPI(conversationHistory);

            if (result) {
                postsOutput.innerHTML = '';
                const drafts = result.split(/--- DRAFT \d+ ---/);
                
                drafts.filter(d => d.trim()).forEach((draft, index) => {
                    const draftContainer = document.createElement('div');
                    draftContainer.className = 'post-draft';
                    
                    draftContainer.innerHTML = `
                        <div class="post-header">
                            <h3>Draft ${index + 1}</h3>
                            <button class="copy-btn">Copy</button>
                        </div>
                        <div class="post-content">${draft.trim().replace(/\n/g, '<br>')}</div>
                    `;
                    postsOutput.appendChild(draftContainer);
                });
                
                finalOutputSection.classList.remove('hidden');
                document.querySelectorAll('.copy-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const content = e.target.closest('.post-draft').querySelector('.post-content').innerText;
                        navigator.clipboard.writeText(content).then(() => {
                            e.target.textContent = 'Copied!';
                            setTimeout(() => { e.target.textContent = 'Copy'; }, 2000);
                        });
                    });
                });
            }
        };

        generateIdeasBtn.addEventListener('click', handleGenerateIdeas);
        generatePostsBtn.addEventListener('click', handleGeneratePosts);
        ideasOutput.addEventListener('change', (e) => {
            if (e.target.name === 'selectedIdea') {
                prompt2Inputs.classList.remove('hidden');
            }
        });

        populatePainPoints();
        populateContentGoals();

    } catch (error) {
        console.error("Failed to initialize the application:", error);
        alert("Error: Could not initialize the authentication service. Please check the developer console for details. This is often caused by incorrect Auth0 credentials in app.js or misconfigured URLs in the Auth0 dashboard.");
    }
};

// Start the application
main();