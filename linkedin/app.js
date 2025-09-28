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
        
        // --- NEW: Humanization prompt added ---
        const HUMANIZATION_PROMPT = `
        The following are strict requirements for the content above:

        Grammatical rules:
        - No em dashes.
        - Active voice.
        - Concise, conversational sentences.
        - Use short transitional prompts to keep readers moving, such as “Here is why,” “Let’s break it down,” and “Next steps.”

        Banned words and phrases:
        Avoid every word or phrase in this list: Accordingly, Additionally, Arguably, Certainly, Consequently, Hence, However, Indeed, Moreover, Nevertheless, Nonetheless, Notwithstanding, Thus, Undoubtedly, Adept, Commendable, Dynamic, Efficient, Ever-evolving, Exciting, Exemplary, Innovative, Invaluable, Robust, Seamless, Synergistic, Thought-provoking, Transformative, Utmost, Vibrant, Vital, Efficiency, Innovation, Institution, Integration, Implementation, Landscape, Optimization, Realm, Tapestry, Transformation, Aligns, Augment, Delve, Embark, Facilitate, Maximize, Underscores, Utilize, A testament to, In conclusion, In summary, It's important to note/consider, It's worth noting that, On the contrary, This is not an exhaustive list, A journey of, A multitude of, A plethora of, Actionable insights, Adoption rate, Aforementioned, Agile, AI-powered, Ample opportunities, Amplify, Arduous, As a result, As such, At length, At the end of the day, Bandwidth, Based on the information provided, Basic, Best practices, Blockchain-enabled, Brand awareness, Broadly speaking, Burgeoning, Cannot be overstated, Capacity building, Captivating, Change management, Cloud-based, Cognizant, Collaborative environment, Competitive landscape, Complexity, Conceptualize, Conducting, Considerable, Continuous improvement, Core, Corporate social responsibility, Cost optimization, Craft, Critical, Crucial, Customer loyalty, Customer satisfaction, Customer-centric, Cutting-edge, Data-driven, Decision-makers, Deep dive, Deep dive into, Deep understanding, Deliverables, Delve into, Delved, Delving, Delving into the intricacies of, Demonstrates significant, Deployment plan, Digital realm, Digital transformation, Disruptive innovation, Domain expertise, Downtime, Drive, Driven approach, Driving innovation, Dynamic environment, Elevate, Embark on a journey, Embark on a voyage, Embarked, Emerging technologies, Empower, Enable, Encountered hurdles, Enhance, Enhancing, Enlightening, Enriches, Entails, Entrenched, Epicenter, Essential, Essentially, Esteemed, Ethical considerations, Excels, Expertise, Explore, Flourishing, Folks, For example, For instance, Foray, Foster, Foster innovation, Fostering, Fresh perspectives, From inception to execution, Fundamental, Fundamentally, Furthermore, Future-proof, Game changer, Game-changer, Generally speaking, Given that, Glean, Going forward, Golden ticket, Governance framework, Granular, Granular detail, Granular level, Granularly, Grasp, Groundbreaking, Growing recognition, Herein, Heretofore, High-level, Hinder, Holistic, Holistically, Impactful, Implementation strategy, Implications, Important to consider, In a sea of, In brief, In detail, In effect, In essence, In general, In light of, In other words, In particular, In practice, In terms of, In the dynamic world of, In the realm of, In theory, In today's rapidly evolving market, In today's world, Industry best practices, Influencers, Insights into, Issue resolution, It is important to note, It is worth noting, It's important to remember, Iteration, Kaleidoscope, Key, Key takeaways, Knowledge transfer, KPIs, Latency, Leverage, Linchpin, Low-level, Manifold, Market penetration, Market share, Market trends, Milestone, Mission-critical, Moving forward, Multifaceted, MVP, Namely, Navigating the landscape, Navigating the complexities of, New heights, Next-generation, Notable, Nuanced, Numerous, Offboarding, Offer a comprehensive, Offerings, On the ascent to, On the cutting edge, On the other hand, Onboarding, Operational efficiency, Operational excellence, Optimize, Pain point, Paradigm, Paradigm shift, Paramount, Particularly in areas, Performance optimization, Pervasive, Pivotal, Plethora, POC, Preemptively, Primary, Problem solving, Process optimization, Profitability, Profound, Promote, Pronged, Quality assurance, Quality control, Rapidly evolving, Reaching new heights, Recognize, Regulatory compliance, Relentless, Remarkable, Resonate, Resource allocation, Resource optimization, Revenue growth, Risk mitigation, Roadmap, ROI, Root cause analysis, Scalable, Scrum, Secondary, Shed light, Shedding light on, Showcasing, Significant, Significantly contributes, Simply put, SLA, Solution development, Specifically, Specifically speaking, Sprint, Stakeholders, State-of-the-art, Strategic alignment, Streamline, Strive, Strong presence, Subject matter experts, Substantial, Substantially, Sustainability, Synergistically, Synergy, Systemic, Tailor, TCO, Tertiary, That being said, The future of, The linchpin of, The next frontier, The power of, The road ahead, Thereby, Therefore, Therein, Thereof, Thought leaders, Thought leadership, Thrive, Thriving, Throughput, Time optimization, To clarify, To demonstrate, To elevate, To elucidate, To emphasize, To empower, To enhance, To enrich, To exemplify, To furnish, To highlight, To illustrate, To provide, To reiterate, To shed light on, To showcase, To summarize, To thrive, To underscore, To unleash, To unlock, Touchpoint, Transforming the way, Treasure trove, Ultimately, Uncharted waters, Undeniable, Understanding of your unique, Unleash, Unlock, Unparalleled, Uptime, User engagement, User experience, User feedback, User interface, Valuable, Value proposition, Value-added, Various, Vast, Well-crafted, Whilst, Whilst it is true, Widely recognized, With a keen eye on, With regards to.
        `;

        // --- MODIFIED: Prompt 2 now includes the humanization rules ---
        const PROMPT_2_TEMPLATE = (selectedIdea, anecdote) => `
        You are a Master LinkedIn Ghostwriter.
        Your task is to write 3 full LinkedIn post drafts based on the selected idea.
        Incorporate our agency's context: we are a Middle-of-Funnel (MoFu) agency fixing the gap between Marketing's MQLs and Sales' SQLs. Use relevant jargon (pipeline velocity, lead scoring, MQL, SQL, SLA).
        - SELECTED POST IDEA: ${selectedIdea}
        - PERSONAL ANECDOTES OR DATA: "${anecdote}"
        - DESIRED TONE: Authoritative, insightful, empathetic.
        Produce 3 distinct drafts: 1) A problem/solution draft, 2) A data-led story draft, and 3) A provocative "You're doing it wrong" angle draft.
        Format the output clearly with "--- DRAFT 1 ---", "--- DRAFT 2 ---", etc.
        ${HUMANIZATION_PROMPT}
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
            conversationHistory = [];

            let painPoint = painPointSelect.value === 'random' ? getRandomOption(painPointSelect) : painPointSelect.value;
            let department = departmentSelect.value === 'random' ? getRandomOption(departmentSelect) : departmentSelect.value;
            
            const prompt1 = PROMPT_1_TEMPLATE(painPoint, department, personaInput.value, goalSelect.value);
            
            conversationHistory.push({ role: 'user', content: prompt1 });

            const result = await callClaudeAPI(conversationHistory);

            if (result) {
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
                // --- MODIFIED: Changed from radio buttons to checkboxes ---
                ideas.forEach((ideaText, index) => {
                    const cleanIdeaText = ideaText.trim(); 
                    const checkId = `idea-${index}`;
                    const div = document.createElement('div');
                    div.className = 'idea-item';
                    div.innerHTML = `
                        <input type="checkbox" id="${checkId}" name="ideaCheckbox" value="${escape(cleanIdeaText)}">
                        <label for="${checkId}">${cleanIdeaText.replace(/\n/g, '<br>')}</label>
                    `;
                    ideasOutput.appendChild(div);
                });
                
                step2Section.classList.remove('hidden');
                prompt2Inputs.classList.add('hidden'); // Hide step 3 until a box is checked
                finalOutputSection.classList.add('hidden');
                postsOutput.innerHTML = '';
            }
        };
        
        // --- MODIFIED: This function now handles multiple checkbox selections ---
        const handleGeneratePosts = async () => {
            const selectedCheckboxes = document.querySelectorAll('input[name="ideaCheckbox"]:checked');

            if (selectedCheckboxes.length === 0) {
                alert('Please select at least one idea.');
                return;
            }
            
            postsOutput.innerHTML = ''; // Clear previous results before generating new ones
            finalOutputSection.classList.remove('hidden');
            const anecdote = anecdoteTextarea.value;

            // Use a for...of loop to handle async calls sequentially
            for (const checkbox of selectedCheckboxes) {
                const selectedIdea = unescape(checkbox.value);

                // Add a header for each set of generated drafts
                const ideaHeader = document.createElement('h3');
                const ideaFirstLine = selectedIdea.split('\n')[0].replace(/\*\*/g, '');
                ideaHeader.textContent = `Drafts for: "${ideaFirstLine}"`;
                ideaHeader.className = 'idea-results-header';
                postsOutput.appendChild(ideaHeader);
                
                const prompt2 = PROMPT_2_TEMPLATE(selectedIdea, anecdote);

                // Create a temporary message array for this specific call
                const messagesForThisCall = [...conversationHistory, { role: 'user', content: prompt2 }];
                
                const result = await callClaudeAPI(messagesForThisCall);

                if (result) {
                    const drafts = result.split(/--- DRAFT \d+ ---/);
                    
                    drafts.filter(d => d.trim()).forEach((draft, index) => {
                        const draftContainer = document.createElement('div');
                        draftContainer.className = 'post-draft';
                        
                        draftContainer.innerHTML = `
                            <div class="post-header">
                                <h4>Draft ${index + 1}</h4>
                                <button class="copy-btn">Copy</button>
                            </div>
                            <div class="post-content">${draft.trim().replace(/\n/g, '<br>')}</div>
                        `;
                        postsOutput.appendChild(draftContainer);
                    });
                } else {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'post-draft error-message';
                    errorDiv.textContent = 'Failed to generate drafts for this idea.';
                    postsOutput.appendChild(errorDiv);
                }
            }
            
            // Re-attach event listeners to all new copy buttons
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const content = e.target.closest('.post-draft').querySelector('.post-content').innerText;
                    navigator.clipboard.writeText(content).then(() => {
                        e.target.textContent = 'Copied!';
                        setTimeout(() => { e.target.textContent = 'Copy'; }, 2000);
                    });
                });
            });
        };

        generateIdeasBtn.addEventListener('click', handleGenerateIdeas);
        generatePostsBtn.addEventListener('click', handleGeneratePosts);
        
        // --- MODIFIED: Event listener now shows Step 3 if ANY checkbox is checked ---
        ideasOutput.addEventListener('change', (e) => {
            if (e.target.name === 'ideaCheckbox') {
                const anyChecked = document.querySelector('input[name="ideaCheckbox"]:checked');
                prompt2Inputs.classList.toggle('hidden', !anyChecked);
            }
        });

        populatePainPoints();
        populateContentGoals();

    } catch (error) {
        console.error("Failed to initialize the application:", error);
        alert("Error: Could not initialize the authentication service. Please check the developer console for details. This is often caused by incorrect Auth0 credentials in app.js or misconfigured URLs in the Auth0 dashboard.");
    }
};

main();