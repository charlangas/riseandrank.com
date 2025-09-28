const main = async () => {
    try {
        let auth0Client = null;

        // --- AUTH0 CONFIGURATION ---
        auth0Client = await auth0.createAuth0Client({
            domain: 'dev-658pplz7hlkua00p.us.auth0.com',
            clientId: 'SSfHzCrn2NXoAqaYaRjbwrX7AYhISamg',
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
        document.getElementById('login-btn').addEventListener('click', () => { auth0Client.loginWithRedirect(); });
        document.getElementById('logout-btn').addEventListener('click', () => {
            auth0Client.logout({ logoutParams: { returnTo: window.location.href } });
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

        // --- FULL PROMPT & CONTEXT INTEGRATION ---

        const PAIN_POINTS_CONTEXT = `
Context:

What “tier-two titan” means here: a large enterprise (global or multi-region) — not a small startup, but not the FAANGs. Think: hundreds-to-tens-of-thousands of employees, complex buying committees, annual marketing budgets comfortably ≥ $1M, established sales orgs (SDRs, AEs, sales ops), multi-product portfolios, and multi-month to multi-year sales cycles.

Where a pipeline activation / middle-of-funnel (MoFu) agency sits: between TOFU (awareness / traffic / lead capture) and BOFU (deal negotiation/close). The focus is turning captured demand into sales-ready opportunities and accelerating pipeline velocity and quality.

Approach: identify specific pain → show measurable impacts → root causes → targeted agency interventions → deliverables & KPIs. No vague platitudes — concrete workstreams and outputs.

Executive summary (one line)

A pipeline-activation / MoFu agency solves the gap between “we have leads” and “we have qualified, engaged opportunities.” It fixes lead quality, timing, personalization, sales enablement, measurement, and routing so Sales converts more of the same marketing volume into revenue faster and Marketing can prove pipeline impact.

Sales department — Specific pain points & how an MoFu agency solves them
1) Poor lead quality / too many low-value leads
2) Low conversion from lead → SQL (sales-qualified lead)
3) Slow or inconsistent follow-up / time to first contact
4) Lack of contextual lead intelligence for reps
5) Poorly aligned sales playbooks and messaging
6) Leads fall out of the funnel (no persistent re-engagement)
7) Inefficient handoffs and accountability (no SLA)
8) Suboptimal demos and discovery
9) Poor insight into buyer intent & account health
10) Difficulty scaling outbound personalization

Marketing department — Specific pain points & how an MoFu agency solves them
1) Poor MOFU content — not tailored to moving buyers deeper
2) No reliable attribution of pipeline to marketing
3) Data fragmentation & tech debt
4) Inability to run effective MOFU experiments
5) Low influence on pipeline and revenue conversations
6) Wasteful spend on channels that don’t yield sales
7) Content pipeline is slow and unscalable for personalization
8) No clear playbook connecting campaigns to sales outcomes
        `;

        const PROMPT_1_FULL = `
SYSTEM ROLE 
You are a LinkedIn Content Strategist and Viral Growth Expert, specializing in B2B marketing and sales alignment for large enterprise companies ("tier-two titans"). Your primary function is to generate a diverse list of specific, actionable post ideas engineered for high engagement with VPs of Sales, CMOs, and Heads of Demand Gen. Your entire methodology is based on the core principles and the expanded catalog of post types detailed below. 

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
- **Type 1: Agree or Disagree**
- **Type 8: Run a Poll**
- **Type 9: This vs. That / Would You Rather**
- **Type 29: Crowdsource a List**
- **Type 28: Fun Game / Trivia**

**Group B: Storytelling & Emotion-Based**
- **Type 7: The Best/Bad Boss Story**
- **Type 14: Someone Was Wronged**
- **Type 27: Doing The Unexpected**
- **Type 4: Work vs. Personal Life**
- **Type 60: The Values Post**

**Group C: Value & Expertise-Based**
- **Type 36: The Mistakes Listicle**
- **Type 89: Reveal Your Process**
- **Type 18: Pro Tips**
- **Type 87: Answer a Common Question (AMA)**
- **Type 96: 10-Minute Tweaks**

**Group D: Community & Connection-Based**
- **Type 20: The Shout-Out Post**
- **Type 40: Let's Connect Post**
- **Type 5: The Free Advertising Post**

**Group E: Format-Driven Posts**
- **Type 23: The Document Post**
- **Type 2: The Before & After Post**
- **Type 11: The Screenshot Post**
- **Type 13: The Movie Script / Dialogue Post**
- **Type 43: The Flow Chart Post**

**Group F: Personal Brand & Journey Posts**
- **Type 6: The Failure Story**
- **Type 17: All The Jobs I've Had Post**
- **Type 15: Things I've Learned (Birthday Post)**
- **Type 10: What Impresses You vs. Doesn't**
- **Type 54: The Secret Sauce/Superpower Post**

**Group G: Hook, Curation & Provocation Posts**
- **Type 42: I Call BS / Contrarian Take**
- **Type 12: The Quote Post**
- **Type 24: Study/Data Summary**
- **Type 33: News & Holiday Jacking**
- **Type 25: The Curiosity Hook Post**
- **Type 34: "Signs You Are a..." Post**

---

## THE TASK

NON-NEGOTIABLES

1) You MUST base every idea on a specific post type from the **EXPANDED CATALOG**. You must explicitly name the group and type.
2) You MUST frame each post idea to address the specified \`PRIMARY PAIN POINT\` from the perspective of the \`TARGET DEPARTMENT\`.
3) You MUST incorporate the **CORE PRINCIPLES**, ensuring each idea has a strong hook, a clear engagement path, and provides tangible value.
4) You MUST generate a diverse set of ideas, using at least one type from at least five of the seven groups (A, B, C, D, E, F, G).

OUTPUTS

Produce a numbered list of post ideas. For EACH idea, provide the following metadata:

- **Post Title / Hook:** A compelling, scroll-stopping headline or first sentence for the post.
- **Recommended Post Type:** The group, name, and number of the strategy from the catalog.
- **Key Angle / Rationale:** A 1-2 sentence explanation of why this angle will resonate with the target persona by agitating their specific pain and positioning the author as a credible expert.
- **Primary Call-to-Engagement (CTE):** The specific action you want the audience to take in the comments.
`;

        const PROMPT_2_FULL = `
SYSTEM ROLE

You are a Master LinkedIn Ghostwriter and Direct Response Copywriter, specializing in writing for a senior B2B audience of Sales and Marketing leaders at enterprise companies. Your expertise lies in applying the specific LinkedIn post structures from the guide below, while infusing the copy with the expert-level context of a pipeline activation agency.

---

## AGENCY CONTEXT & PAIN POINTS

- **Our Audience:** VPs of Sales/Marketing & Directors of Ops/Demand Gen at "tier-two titans" (large, non-FAANG enterprises).
- **Our Role:** We are a Middle-of-Funnel (MoFu) agency. We fix the gap between Marketing's leads (MQLs) and Sales' qualified opportunities (SQLs).
- **Core Pain Points We Solve:**
    - **For Sales:** Poor lead quality, low MQL→SQL conversion, slow lead follow-up, lack of lead intelligence, misaligned sales playbooks, funnel leakage.
    - **For Marketing:** Ineffective MoFu content, no reliable pipeline attribution, fragmented data/tech, inability to experiment, low influence on revenue.
- **Our Language (Jargon to Use):** Pipeline activation, pipeline velocity, lead scoring, enrichment, nurture sequences, SLA, MQL, SAL, SQL, multi-touch attribution, tech stack audit, ABM, ICP, ACV, CAC.
- **Our Solutions (The "Fix"):** We implement lead scoring models, build persona-based nurture tracks, automate lead routing, create sales enablement assets (battlecards, scripts), build attribution dashboards, and operationalize SLAs.

---

## POST STRUCTURE & TEMPLATE GUIDE 

This guide provides the core structure for key post types. For any post type not explicitly listed, you must infer the best structure based on its name, its strategic group, and the general principles of a strong hook, value delivery, and a clear Call-to-Engagement (CTE).

**Group C: Value & Expertise-Based**
* **Type 36: The Mistakes Listicle:**
    1.  Hook: "X Bad Mistakes That Make Good People [Quit/Fail/etc.]" 
    2.  Create a numbered list of 5-10 mistakes.
    3.  (Optional but recommended) Leave the last number blank.
    4.  CTE: "What's the biggest mistake I missed? Add it to the list in the comments." 
* **Type 89: Reveal Your Process:**
    1.  Hook: "My writing process, revealed:" or "Here's a free content strategy:" 
    2.  List the steps in a simple, numbered or bulleted format.
    3.  End with a generous statement like "You can steal this. I don't need credit."
    4.  CTE: "Feel free to steal it and let me know if it works for you!" 

---

## THE TASK

NON-NEGOTIABLES

1) You MUST write from the perspective of a MoFu agency expert, using the terminology, pain points, and solutions from the **AGENCY CONTEXT & PAIN POINTS** knowledge base.
2) You MUST strictly adhere to the structure for the given \`Post Type\` as outlined in the **POST STRUCTURE & TEMPLATE GUIDE**.
3) For post types not explicitly detailed, you must infer the best structure based on the type's name and its strategic group.
4) You MUST use LinkedIn-optimized formatting: short paragraphs, ample white space, and a clear hook and CTE.
5) You MUST incorporate the user-provided \`Personal Anecdotes or Data\` to make posts concrete and credible. If none are provided, use placeholders like \`[Insert specific client metric, e.g., 'reduced time-to-first-contact from 24 hours to 45 minutes']\`.

WORKFLOW & REASONING (SHOW YOUR WORK)

1) **Deconstruct the Idea:** Identify the core hook, the pain point, and the required CTE from the selected idea.
2) **Reference the Template Guide & Context:** Select the correct post structure and weave in the specific language and solutions from the \`AGENCY CONTEXT\` knowledge base.
3) **Drafting Loop - Create Variants:**
    - **Draft 1 (The Problem/Solution):** A clear, direct draft that outlines a common pain point and the strategic fix.
    - **Draft 2 (The Data-Led Story):** A version that opens with a compelling statistic or the provided anecdote to make the problem tangible.
    - **Draft 3 (The "You're Doing It Wrong" Angle):** A provocative draft that challenges a common industry practice related to the pain point.

OUTPUTS

Produce the requested number of drafts, clearly separated by "--- DRAFT 1 ---", etc.
`;

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

        const CONTENT_GOALS = [
            "Generate discovery calls for our diagnostic audit",
            "Build credibility and authority in our niche",
            "Get prospects to download a strategic asset (e.g., a template or guide)",
            "Increase post reach and audience engagement",
            "Start conversations with ideal customer profiles (ICPs)"
        ];

        // --- FUNCTIONS ---
        const showLoading = (show) => {
            loadingIndicator.classList.toggle('hidden', !show);
        };
        
        const populatePainPoints = () => {
            const salesPainPoints = PAIN_POINTS_CONTEXT.match(/Sales department — Specific pain points & how an MoFu agency solves them\n([\s\S]*?)\n\nMarketing department/)[1].trim().split('\n').map(line => line.replace(/^\d+\)\s*/, ''));
            const marketingPainPoints = PAIN_POINTS_CONTEXT.match(/Marketing department — Specific pain points & how an MoFu agency solves them\n([\s\S]*?)$/)[1].trim().split('\n').map(line => line.replace(/^\d+\)\s*/, ''));
            const allPainPoints = [...salesPainPoints, ...marketingPainPoints];
            
            painPointSelect.innerHTML = '<option value="random">-- Random --</option>';
            allPainPoints.forEach(point => {
                if (point.trim() === '') return;
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
                    headers: { 'content-type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ messages })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || `API Error: ${response.status}`);
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
            
            const finalPrompt1 = `
<context>
${PAIN_POINTS_CONTEXT}
</context>

<instructions>
${PROMPT_1_FULL}
</instructions>

Here are the specific inputs for this task:
- **PRIMARY PAIN POINT:** "${painPoint}"
- **TARGET DEPARTMENT:** "${department}"
- **TARGET PERSONA:** "${personaInput.value}"
- **CONTENT GOAL:** "${goalSelect.value}"
- **TONE OF VOICE:** Authoritative, insightful, empathetic to their pain, slightly provocative.
- **NUMBER OF IDEAS:** 7
---
BEGIN.
            `;
            
            conversationHistory.push({ role: 'user', content: finalPrompt1 });
            const result = await callClaudeAPI(conversationHistory);

            if (result) {
                conversationHistory.push({ role: 'assistant', content: result });
                let startIndex = result.search(/\d+\.\s*Post Title \/ Hook:/);
                if (startIndex === -1) { startIndex = 0; }
                const ideaListText = result.substring(startIndex);
                const ideas = ideaListText.trim().split(/\n\s*(?=\d+\.\s*Post Title \/ Hook:)/).filter(Boolean);

                if (ideas.length === 0 || (ideas.length === 1 && ideas[0].length > 400)) {
                    alert("Could not parse individual ideas from the API response. Please try again or check the console for the raw output.");
                    console.error("Failed to parse. Raw API response:", result);
                    return;
                }

                ideasOutput.innerHTML = ''; 
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
                prompt2Inputs.classList.add('hidden');
                finalOutputSection.classList.add('hidden');
                postsOutput.innerHTML = '';
            }
        };
        
        const handleGeneratePosts = async () => {
            const selectedCheckboxes = document.querySelectorAll('input[name="ideaCheckbox"]:checked');
            if (selectedCheckboxes.length === 0) {
                alert('Please select at least one idea.');
                return;
            }
            
            postsOutput.innerHTML = ''; 
            finalOutputSection.classList.remove('hidden');
            const anecdote = anecdoteTextarea.value;

            for (const checkbox of selectedCheckboxes) {
                const selectedIdea = unescape(checkbox.value);
                const finalPrompt2 = `
<instructions>
${PROMPT_2_FULL}
</instructions>

<humanization_rules>
${HUMANIZATION_PROMPT}
</humanization_rules>

Here are the specific inputs for this task:
- **SELECTED POST IDEA:** ${selectedIdea}
- **TARGET PERSONA RECAP:** "${personaInput.value}"
- **PERSONAL ANECDOTES OR DATA:** "${anecdote}"
- **DESIRED TONE:** Authoritative, insightful, empathetic to their pain, slightly provocative.
- **NUMBER OF DRAFTS:** 3
---
BEGIN.
                `;

                const messagesForThisCall = [{ role: 'user', content: finalPrompt2 }];
                const result = await callClaudeAPI(messagesForThisCall);

                if (result) {
                    const ideaHeader = document.createElement('h3');
                    const ideaFirstLine = selectedIdea.split('\n')[0];
                    ideaHeader.textContent = `Drafts for: ${ideaFirstLine}`;
                    ideaHeader.className = 'idea-results-header';
                    postsOutput.appendChild(ideaHeader);

                    const drafts = result.split(/--- DRAFT \d+ ---/);
                    drafts.filter(d => d.trim()).forEach((draft, index) => {
                        const draftContainer = document.createElement('div');
                        draftContainer.className = 'post-draft';
                        draftContainer.innerHTML = `
                            <div class="post-header"><h4>Draft ${index + 1}</h4><button class="copy-btn">Copy</button></div>
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
        alert("Error: Could not initialize the application. Please check the developer console for details.");
    }
};

main();