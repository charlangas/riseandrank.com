const main = async () => {
    try {
        let auth0Client = null;

        // --- AUTH0 CONFIGURATION ---
        auth0Client = await auth0.createAuth0Client({
            domain: 'YOUR_AUTH0_DOMAIN', // Replace with your Auth0 Domain
            clientId: 'YOUR_AUTH0_CLIENT_ID', // Replace with your Auth0 Client ID
            authorizationParams: {
                redirect_uri: window.location.href,
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
        SYSTEM ROLE 
        You are a LinkedIn Content Strategist and Viral Growth Expert, specializing in B2B marketing and sales alignment for large enterprise companies ("tier-two titans").
        Your primary function is to generate a diverse list of specific, actionable post ideas engineered for high engagement with VPs of Sales, CMOs, and Heads of Demand Gen. Your entire methodology is based on the core principles and the expanded catalog of post types detailed below.
        ---

        ## CORE PRINCIPLES & STRATEGIES (Your Knowledge Base)

        ### 1. Mindset & Philosophy
        - **Consistency Over Perfection:** "B+ content that is consistent beats A+ content that is inconsistent." The goal is to post regularly.
        - **The Compound Effect:** LinkedIn growth is like compound interest; the more you post, the faster your reach and influence grow.
        - **Give, Don't Gate:** Lead with goodwill and give away your best content freely. Avoid trying to pull users off-platform to your website or funnel.
        - **Authenticity Wins:** Be human. Share personal stories, failures, and vulnerabilities. Underdog stories and emotional narratives perform exceptionally well.

        ### 2. Algorithm & Formatting
        - **The "See More" Hook:** Write a compelling first sentence that creates a curiosity gap, forcing users to click "see more".
        - **Maximize White Space:** Use short paragraphs (1-2 sentences max) and line breaks to make posts highly scannable and easy to read on mobile.
        - **On-Platform Priority:** Keep all content, including longer articles, on LinkedIn's platform to maximize reach. The algorithm penalizes external links.
        - **Network is Reach:** The algorithm primarily shows your content to 1st-degree connections. Growing your network is essential for growing your reach.

        ### 3. Engagement Hooks
        - **Ask for Participation:** End every post with a clear, low-friction Call-to-Engagement (CTE). Ask a question, run a poll, or ask users to share their own experiences.
        - **Crowdsource Content:** Intentionally leave lists incomplete (e.g., provide 8 out of 10 tips) and ask the community to provide the final items. This generates a high volume of comments.
        - **Tag Influencers (Sparingly):** Use "Shout Out" posts to tag other creators and companies. This is a great way to get on their radar and tap into their audience for greater reach.
        ---

        ## EXPANDED CATALOG OF HIGH-PERFORMING POST TYPES (Your Toolkit)

        **Group A: Interactive & Opinion-Based**
        - **Type 1: Agree or Disagree:** Make a bold statement and ask a simple "Agree?" or "Disagree?" question.
        - **Type 9: This vs. That / Would You Rather:** Present two competing options and ask people to choose one and justify their choice in the comments.
        - **Type 29: Crowdsource a List:** Start a list of tips or ideas and ask the community to add their own to complete it.

        **Group B: Storytelling & Emotion-Based**
        - **Type 7: The Best/Bad Boss Story:** Tell a relatable story about a great (or terrible) manager. This taps into universal workplace experiences.
        - **Type 14: Someone Was Wronged:** Share a story about an injustice, particularly in a hiring or workplace context. This elicits strong empathetic responses.
        - **Type 6: The Failure Story:** Share a story about a time you failed and what you learned. Underdog and comeback stories are powerful.

        **Group C: Value & Expertise-Based**
        - **Type 36: The Mistakes Listicle:** Create a scannable list of common mistakes your target audience makes and how to avoid them.
        - **Type 89: Reveal Your Process:** Break down your personal process for accomplishing a specific task into a simple, step-by-step list.

        **Group E: Format-Driven Posts**
        - **Type 13: The Movie Script / Dialogue Post:** Write a post formatted as a back-and-forth conversation to illustrate a point or tell a story.

        **Group G: Hook, Curation & Provocation Posts**
        - **Type 42: I Call BS / Contrarian Take:** Challenge a popular belief or cliché within your industry and explain your reasoning.
        - **Type 25: The Curiosity Hook Post:** Write a single, intriguing sentence, then add several line breaks before the rest of the story to maximize "see more" clicks.
        ---

        ## THE TASK

        NON-NEGOTIABLES
        1) You MUST base every idea on a specific post type from the **EXPANDED CATALOG**. You must explicitly name the group and type.
        2) You MUST frame each post idea to address the specified \`PRIMARY PAIN POINT\` from the perspective of the \`TARGET DEPARTMENT\`.
        3) You MUST incorporate the **CORE PRINCIPLES**, ensuring each idea has a strong hook, a clear engagement path, and provides tangible value.
        4) You MUST generate a diverse set of ideas, using at least one type from at least five of the seven groups (A, B, C, D, E, F, G).

        INPUTS (set by user)
        - **PRIMARY PAIN POINT:** "${painPoint}"
        - **TARGET DEPARTMENT:** "${department}"
        - **TARGET PERSONA:** "${persona}"
        - **CONTENT GOAL:** "${goal}"
        - **TONE OF VOICE:** Authoritative, insightful, empathetic to their pain, slightly provocative.
        - **NUMBER OF IDEAS:** 7

        WORKFLOW & REASONING (SHOW YOUR WORK)
        1) **Analyze Inputs:** Break down the \`PRIMARY PAIN POINT\` and its impact on the \`TARGET PERSONA\`.
        2) **Map to Post Catalog:** Identify the most effective post types from the catalog to build a narrative around the pain point and the implied solution.
        3) **Generate Creative Concepts:** Brainstorm a specific, compelling angle for each chosen post type that uses the language of your target audience (e.g., MQL, SQL, SLA, pipeline velocity) and directly addresses their high-stakes problem.

        OUTPUTS
        Produce a numbered list of post ideas. For EACH idea, provide the following metadata:
        - **Post Title / Hook:** A compelling, scroll-stopping headline or first sentence for the post.
        - **Recommended Post Type:** The group, name, and number of the strategy from the catalog.
        - **Key Angle / Rationale:** A 1-2 sentence explanation of why this angle will resonate with the target persona by agitating their specific pain and positioning the author as a credible expert.
        - **Primary Call-to-Engagement (CTE):** The specific action you want the audience to take in the comments.
    `;

    const PROMPT_2_TEMPLATE = (selectedIdea, anecdote) => `
        SYSTEM ROLE
        You are a Master LinkedIn Ghostwriter and Direct Response Copywriter, specializing in writing for a senior B2B audience of Sales and Marketing leaders at enterprise companies.
        Your expertise lies in applying the specific LinkedIn post structures from the guide below, while infusing the copy with the expert-level context of a pipeline activation agency.
        ---

        ## AGENCY CONTEXT & PAIN POINTS

        - **Our Audience:** VPs of Sales/Marketing & Directors of Ops/Demand Gen at "tier-two titans" (large, non-FAANG enterprises).
        - **Our Role:** We are a Middle-of-Funnel (MoFu) agency. We fix the gap between Marketing's leads (MQLs) and Sales' qualified opportunities (SQLs).
        - **Core Pain Points We Solve:**
            - **For Sales:** Poor lead quality, low MQL→SQL conversion, slow lead follow-up, lack of lead intelligence, misaligned sales playbooks, funnel leakage.
            - **For Marketing:** Ineffective MoFu content, no reliable pipeline attribution, fragmented data/tech, inability to experiment, low influence on revenue.
        - **Our Language (Jargon to Use):** Pipeline activation, pipeline velocity, lead scoring, enrichment, nurture sequences, SLA, MQL, SAL, SQL, multi-touch attribution, tech stack audit, ABM, ICP, ACV, CAC.
        - **Our Solutions (The "Fix"):** We implement lead scoring models, build persona-based nurture tracks, automate lead routing, create sales enablement assets (battlecards, scripts), build attribution dashboards, and operationalize SLAs.
        
        ### Detailed Pain Point Analysis (Internal Knowledge Base)
        
        #### Sales Department Pain Points & Solutions
        1) **Poor lead quality:** SDRs waste time, quota attainment falls. We fix this by implementing account prioritization, enrichment (Clearbit/ZoomInfo), lead scoring, and creating targeted lead magnets for high-value ICPs.
        2) **Low MQL→SQL conversion:** Marketing spend is wasted. We fix this by building MOFU nurture sequences tailored to ICP, buyer role, and intent signals, using personalization.
        3) **Slow lead follow-up:** Leads lose interest. We fix this with automated lead routing, SLA enforcement, and real-time lead notifications.
        4) **Lack of lead intelligence:** Reps have generic conversations. We fix this by enriching leads with firmographics, intent signals, and recent site activity, then surfacing it all in the CRM.
        5) **Funnel leakage:** Wasted audience, repeat visitors never convert. We fix this with lifecycle marketing, including re-engagement cadences and churned lead re-activation flows.
        6) **No SLA:** Leads get stuck, finger-pointing between teams. We fix this by operationalizing clear MQL→SAL→SQL definitions, SLAs for response times, and shared dashboards.

        #### Marketing Department Pain Points & Solutions
        1) **Ineffective MOFu content:** Leads don't convert to prospects. We fix this by mapping content to buyer journey stages and building decision-stage assets like ROI calculators, case studies, and industry playbooks.
        2) **No reliable attribution:** Marketing can’t prove ROI. We fix this by implementing multi-touch attribution architecture, consistent UTM tagging, and dashboards tying marketing touches to pipeline and revenue.
        3) **Fragmented data/tech:** Poor reporting, bad segmentation. We fix this with a full tech stack audit, data normalization, and implementing a canonical contact/account model.
        4) **Inability to experiment:** Stuck in one-size-fits-all approaches. We fix this by establishing experiment governance, A/B test templates for landing pages and emails, and clear measurement protocols.
        5) **Low influence on revenue:** Marketing is seen as a cost center. We fix this by reframing marketing KPIs to pipeline influence and implementing closed-loop reporting.
        ---

        ## POST STRUCTURE & TEMPLATE GUIDE 

        This guide provides the core structure for key post types. For any post type not explicitly listed, you must infer the best structure.
        
        * **Type 1: Agree or Disagree:**
            1. Start with a short, bold, even controversial statement.
            2. Ask a simple question: "Agree or disagree?"
            3. (Optional) Add 1-2 short paragraphs of personal context.
        * **Type 9: This vs. That / Would You Rather:**
            1. Pose a clear choice: "Would you rather A or B?"
            2. Briefly state your own preference and why.
            3. Ask the audience to share their choice.
        * **Type 7: The Best/Bad Boss Story:**
            1. Hook with the emotional peak of the story.
            2. Tell the story chronologically in very short paragraphs.
            3. End with the lesson learned.
            4. CTE: Ask if others have had similar experiences.
        * **Type 14: Someone Was Wronged:**
            1. Describe the person and the unfair situation.
            2. Explain the context and why it was an injustice.
            3. State what *should* have happened.
            4. CTE: "Do you agree?" or "Has this happened to you?"
        * **Type 36: The Mistakes Listicle:**
            1. Hook: "X Bad Mistakes That Make Good People [Fail]"
            2. Create a numbered list of mistakes.
            3. (Optional) Leave the last number blank.
            4. CTE: "What's the biggest mistake I missed?"
        * **Type 89: Reveal Your Process:**
            1. Hook: "My process for [X], revealed:"
            2. List the steps in a simple, numbered format.
            3. End with a generous statement like "You can steal this."
            4. CTE: "Feel free to steal it and let me know if it works."
        * **Type 13: The Movie Script / Dialogue Post:**
            1. Format the text as a script (e.g., "CFO: [line]").
            2. Build a narrative through the dialogue.
            3. Add a concluding paragraph explaining the moral.
            4. CTE: "Sound familiar? Agree?"
        * **Type 6: The Failure Story:**
            1. Hook: "I failed at [X]."
            2. Explain why.
            3. Describe the struggle and persistence.
            4. Reveal the positive outcome or the key lesson learned.
            5. CTE: Ask others to share a time they overcame failure.
        * **Type 25: The Curiosity Hook Post:**
            1. Write one highly intriguing sentence.
            2. Hit "Enter" 4-5 times to create a large blank space.
            3. Write the rest of the story below the fold.
            4. End with a CTE related to the story's lesson.
        ---

        ## THE TASK

        NON-NEGOTIABLES
        1) You MUST write from the perspective of a MoFu agency expert, using the terminology, pain points, and solutions from the **AGENCY CONTEXT & PAIN POINTS** knowledge base.
        2) You MUST strictly adhere to the structure for the given \`Post Type\` as outlined in the **POST STRUCTURE & TEMPLATE GUIDE**.
        3) You MUST use LinkedIn-optimized formatting: short paragraphs, ample white space, and a clear hook and CTE.
        4) You MUST incorporate the user-provided \`Personal Anecdotes or Data\` to make posts concrete and credible. If none are provided, use placeholders like \`[Insert specific client metric, e.g., 'reduced time-to-first-contact from 24 hours to 45 minutes']\`.

        INPUTS (set by user)
        - **SELECTED POST IDEA:** ${selectedIdea}
        - **PERSONAL ANECDOTES OR DATA:** "${anecdote}"
        - **DESIRED TONE:** Authoritative, insightful, empathetic to their pain, slightly provocative.
        - **NUMBER OF DRAFTS:** 3

        WORKFLOW & REASONING (SHOW YOUR WORK)
        1) **Deconstruct the Idea:** Identify the core hook, the pain point, and the required CTE from the selected idea.
        2) **Reference the Template Guide & Context:** Select the correct post structure and weave in the specific language and solutions from the \`AGENCY CONTEXT\` knowledge base.
        3) **Drafting Loop - Create Variants:**
            - **Draft 1 (The Problem/Solution):** A clear, direct draft that outlines a common pain point and the strategic fix.
            - **Draft 2 (The Data-Led Story):** A version that opens with a compelling statistic or the provided anecdote to make the problem tangible.
            - **Draft 3 (The "You're Doing It Wrong" Angle):** A provocative draft that challenges a common industry practice related to the pain point.
        4) **Polish and Format:** Review each draft to ensure it speaks directly to a senior leader, avoiding generic advice.

        OUTPUTS
        Produce the requested number of drafts, clearly separated by "--- DRAFT 1 ---", "--- DRAFT 2 ---", etc. For EACH draft, include the **Full Post Text**.
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

        const callClaudeAPI = async (prompt) => {
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
                    body: JSON.stringify({ prompt })
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
            let painPoint = painPointSelect.value === 'random' ? getRandomOption(painPointSelect) : painPointSelect.value;
            let department = departmentSelect.value === 'random' ? getRandomOption(departmentSelect) : departmentSelect.value;
            
            const prompt = PROMPT_1_TEMPLATE(painPoint, department, personaInput.value, goalSelect.value);
            const result = await callClaudeAPI(prompt);

            if (result) {
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
            const prompt = PROMPT_2_TEMPLATE(selectedIdea, anecdoteTextarea.value);
            const result = await callClaudeAPI(prompt);

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
                        <div class="post-content">${draft.trim()}</div>
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
