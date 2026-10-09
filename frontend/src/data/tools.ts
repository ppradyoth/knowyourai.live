export type Tool = {
  slug: string;
  name: string;
  status: string;
  license?: string;
  pitch: string;
  problem: string;
  command?: string;
  output?: string;
  points: string[];
  limit: string;
  links: { label: string; href: string; internal?: boolean }[];
};

export type ToolStage = { id: string; title: string; question: string; tools: Tool[] };

const gh = (repo: string) => ({ label: "GitHub", href: `https://github.com/ppradyoth/${repo}` });

export const toolStages: ToolStage[] = [
  {
    id: "before-you-run",
    title: "Before you run it",
    question: "Is this model, config or skill what it claims to be?",
    tools: [
      {
        slug: "knowyourai",
        name: "knowyourai",
        status: "Alpha",
        license: "Apache-2.0",
        pitch: "Is the model on your machine the model it claims to be?",
        problem:
          "You pulled a 5 GB file from a stranger's repo. The model card says which model it is and that nothing odd happens when you chat with it. knowyourai checks those claims against the bytes, and tells you when something changes after you approved it.",
        command: "uvx knowyourai scan",
        output: `STATUS      COMPONENT                  FORMAT           SIZE
review      hf:someone/Model-GGUF      gguf Q4_K        4.4 GB
consistent  hf:org/embedding-model     safetensors F32  87.3 MB

hf:someone/Model-GGUF
  [high] TMPL002 Chat template changes behaviour when a
         message contains specific text
      evidence: model.gguf#chat_template: branches on 'wire the funds'`,
        points: [
          "In the 200 most-downloaded GGUF repos on Hugging Face (October 2026), 61 of the 128 comparable chat templates differ from the declared base model's. A chat template is a program that runs on every prompt.",
          "Never runs a model. It reads headers and metadata: no torch, no GPU, no dependencies, offline by default, no telemetry.",
          "Checks a Hub repo before you pull it. A 471 GB repo takes about 9 seconds and downloads nothing.",
          "A lockfile for models: lock pins what you approved, check fails CI when it moves.",
        ],
        limit: "Most template differences are deliberate fixes by the quantizer. A finding means read it, not that the model is malicious, and consistent is never the same as safe.",
        links: [gh("knowyourai"), { label: "PyPI", href: "https://pypi.org/project/knowyourai/" }, { label: "Field tests", href: "https://github.com/ppradyoth/knowyourai/blob/main/FIELD-TESTS.md" }],
      },
      {
        slug: "agentscan",
        name: "agentscan",
        status: "v1.0",
        license: "MIT",
        pitch: "A linter for the config files that give your coding agent its power.",
        problem:
          "A single .mcp.json can hand a model shell access. A CLAUDE.md can tell it to run whatever a scraped web page says. These files pass code review because they don't look like code.",
        command: "pipx install git+https://github.com/ppradyoth/agentscan\nagentscan .",
        output: ` CRITICAL AS001  permissions.defaultMode set to bypassPermissions
          .claude/settings.json:3
 CRITICAL AS001  MCP server 'shell' executes an arbitrary shell command
          .mcp.json:4
 CRITICAL AS004  Hardcoded secret (Anthropic API key)
          .claude/settings.json:14
 HIGH     AS002  MCP filesystem server rooted at a broad path

Summary: CRITICAL:6  HIGH:2  MEDIUM:8`,
        points: [
          "Nine rule families: permission bypass, shell-command MCP servers, over-broad filesystem roots, auto-run hooks, hardcoded keys, instructions that disable confirmation, unpinned MCP packages, wildcard tool grants.",
          "Covers Claude Code, Claude Desktop, Cursor, Cline/Roo, Windsurf and Copilot instruction files.",
          "No API keys, no network calls, no dependencies. Under a second on a normal repo, with a non-zero exit code for CI.",
        ],
        limit: "Static analysis of files on disk. It does not observe what the agent does at runtime.",
        links: [gh("agentscan")],
      },
      {
        slug: "agent-supply-chain-guard",
        name: "Agent Supply Chain Guard",
        status: "v0.1",
        pitch: "Your AI agent can be compromised by a file it reads.",
        problem:
          "An innocent-looking SKILL.md, MCP manifest, plugin or README can carry instructions that redirect an agent, expose credentials, run commands, or ask for far more access than it needs.",
        command:
          "git clone https://github.com/ppradyoth/agent-supply-chain-guard.git\ncd agent-supply-chain-guard\npython -m agent_supply_chain_guard scan examples/poisoned-skill.md",
        output: `examples/poisoned-skill.md:5: [hidden-instruction] instruction-like text found
examples/poisoned-skill.md:6: [process-execution] process execution reference
examples/poisoned-skill.md:7: [unrestricted-permission] broad or unrestricted permission
3 finding(s)`,
        points: [
          "Flags hidden instruction language, shell and process execution, credentials and private keys, dangerous URL schemes, wildcard permissions and invisible Unicode controls.",
          "Local-first and dependency-free. Clean scans exit 0, findings exit 1, and a GitHub Action is included.",
          "Optional second-pass review with your own OpenAI or Anthropic key; only matched evidence is sent.",
        ],
        limit: "A signal scanner, not proof of exploitability. Findings need human review and a clean result does not make a dependency safe.",
        links: [gh("agent-supply-chain-guard")],
      },
      {
        slug: "jev-guard",
        name: "jev-guard",
        status: "v0.4.1",
        license: "MIT",
        pitch: "Type-safe is not the same as correct.",
        problem:
          "Jev-style forced-choice models are being wired in as guardrails that decide whether a tool call runs. A guardrail that returns a confidently wrong answer with a perfectly valid type still fails open. jev-guard finds the code patterns where that happens.",
        command: "pip install jevg\njev-guard scan src/ --fail-on HIGH",
        output: `agent.py:5  [HIGH] JG001  Jev guardrail gates actions with no configured confidence threshold
    ↳ Set an explicit threshold and escalate below it.
agent.py:11 [MEDIUM] JG004  Untrusted content flows into a Jev guardrail's state
    ↳ Separate and sanitize untrusted state.`,
        points: [
          "Nine rules, from a dangerous tool with no guardrail in front of it to a forced-choice question with no abstain option.",
          "Build-time only: reads your Python source, never calls the model, never touches the network.",
          "GitHub Action, pre-commit hook and SARIF output for the Security tab.",
        ],
        limit: "Not a guardrail and not a runtime control. It tells you where your guardrail code can fail open; you still validate thresholds against your own adversarial data.",
        links: [gh("jev-guard"), { label: "PyPI", href: "https://pypi.org/project/jevg/" }, { label: "Live demo", href: "https://ppradyoth.github.io/jev-guard/" }],
      },
    ],
  },
  {
    id: "before-you-ship",
    title: "Before you ship it",
    question: "What does it do when untrusted text reaches it?",
    tools: [
      {
        slug: "agentinjectionbench",
        name: "AgentInjectionBench",
        status: "Public dataset",
        license: "Apache-2.0",
        pitch: "Catch unsafe tool calls before you ship.",
        problem:
          "Your user asks for research. A search result tells your agent to send its private context to an external URL. A model upgrade, prompt edit or new tool changes the agent you already tested, so the check has to be repeatable.",
        command:
          "git clone https://github.com/ppradyoth/AgentInjectionBench.git && cd AgentInjectionBench\npip install -e '.[openai]'\naib-run --adapter adapters.openai_compatible:adapter --limit 10 --seed 42 --bundle results/model-check",
        points: [
          "182 public synthetic cases: 142 attacks and 40 benign controls across 7 attack categories, each with its task, system prompt, tool definitions and policy checks already assembled.",
          "Evidence you can inspect: per-case tool calls and arguments in traces.jsonl, with a dataset fingerprint so before-and-after runs compare the same cases.",
          "Runs against OpenAI, Anthropic, any OpenAI-compatible endpoint such as Ollama, or your own agent through an adapter.",
        ],
        limit: "A prepared case pack and grader to run beside garak, Promptfoo, PyRIT or Giskard, not a replacement for them. Provider billing applies when you run it against a paid model.",
        links: [gh("AgentInjectionBench"), { label: "Try it in the live Space", href: "https://huggingface.co/spaces/ppradyoth/AgentInjectionBench" }],
      },
      {
        slug: "weighted-safety-refusal",
        name: "Weighted Safety Refusal",
        status: "v0.1.1 · paper",
        license: "MIT",
        pitch: "A safety score that a model cannot game by refusing everything.",
        problem:
          "Flat refusal averages treat a successful prompt injection the same as a mildly rude sentence, leaderboard ranks drift when the cohort changes, and refusal-only metrics reward refusing everything.",
        command: "pip install weighted-safety-refusal\ninspect eval src/weighted_safety/weighted_safety.py --model openai/gpt-4o-mini",
        output: `R   (harmful refusal) : 0.842  95% CI [0.780, 0.891]
A   (benign comply)   : 0.910  95% CI [0.851, 0.947]
CSS (calibrated)      : 0.875  95% CI [0.813, 0.918]
CSS floor (95% conf.) : 0.813
Weakest category      : jailbreaking (CSS 0.612)`,
        points: [
          "Absolute, severity-weighted and dual-axis: the harmonic mean of harmful-refusal reliability and benign compliance, with 95% Wilson intervals and a defensible floor.",
          "120 prompts: 6 categories, each with 10 harmful prompts and 10 matched benign ones.",
          "In the published pilot, Llama 3.3 70B scores 0.800 flat but 0.730 under WSR, and the gap is prompt injection.",
        ],
        limit: "A 120-prompt suite gives wide intervals by design. The report shows them so you do not over-read a single number.",
        links: [gh("weighted-safety-refusal"), { label: "Paper", href: "https://doi.org/10.2139/ssrn.6874522" }, { label: "PyPI", href: "https://pypi.org/project/weighted-safety-refusal/" }],
      },
      {
        slug: "yolobench",
        name: "YOLOBench",
        status: "Harness complete",
        license: "MIT",
        pitch: "Does your coding agent ask before it touches something real?",
        problem:
          "Capability benchmarks ask whether the agent can solve the task. Nobody measures judgment when an agent is authorized for a class of action, such as deploying to hosting, but the specific target is ambiguous and one wrong choice overwrites something live.",
        command: "pip install yolobench",
        points: [
          "Nine scenarios across four classes of ambiguous, real or destructive-adjacent actions.",
          "Sandboxed only: every scenario runs against mocked CLI and infrastructure shims, so nothing real can be damaged.",
          "Deterministic rubric scoring. No AI token, no network call and no cost to get a result.",
        ],
        limit: "No real coding agent has been run against it yet. Every published result so far is the scripted reference backend proving the harness works.",
        links: [gh("yolobench"), { label: "Leaderboard", href: "https://ppradyoth.github.io/yolobench/" }, { label: "PyPI", href: "https://pypi.org/project/yolobench/" }],
      },
    ],
  },
  {
    id: "in-production",
    title: "While it is live",
    question: "What is it doing right now, and what is it allowed to do?",
    tools: [
      {
        slug: "intentscan",
        name: "IntentScan",
        status: "Hosted · free",
        pitch: "Point it at your AI endpoint and get a risk score.",
        problem:
          "You declared what your assistant is for. IntentScan generates adversarial prompts that pressure that boundary, sends them to your live endpoint, and has a judge model classify each response for violations.",
        points: [
          "Eight probe strategies: role transformation, gradual drift, language variation, multi-turn escalation, encoding bypass, indirect injection, persona injection and payload splitting.",
          "Each violation is typed as capability drift, role drift or domain violation, with severity and confidence, rolled up into a 0–100 risk score.",
          "Scan history and PDF reports. Free: runs on your own Claude or Gemini API key, stored encrypted.",
        ],
        limit: "It tests the endpoint you give it over HTTP. Sign-in required, with a fair-use limit of 1,000 tests a month.",
        links: [{ label: "Open IntentScan", href: "/intentscan", internal: true }, { label: "How it works", href: "/how-it-works", internal: true }],
      },
      {
        slug: "intentenforce",
        name: "IntentEnforce",
        status: "Hosted · free",
        pitch: "Decide what a request is for before your model sees it.",
        problem:
          "Most filters look at text. IntentEnforce classifies the intent of every prompt against categories you define, then applies your policy before traffic reaches your model.",
        points: [
          "Allow, block or clarify rules per intent, with confidence taken into account.",
          "Proxy layers: put a URL in front of your model endpoint with no code changes, and review a log of every decision.",
          "Responses are checked by a validator before they go back to the user. Free on your own Claude or Gemini API key.",
        ],
        limit: "An intent classifier is a model and can be wrong. Treat it as one layer, and pair it with a deterministic control for high-impact actions.",
        links: [{ label: "Open IntentEnforce", href: "/enforce", internal: true }, { label: "API docs", href: "/docs", internal: true }],
      },
      {
        slug: "railproof",
        name: "Railproof",
        status: "Alpha v0.1.0",
        license: "Apache-2.0",
        pitch: "If the action is not explicitly allowed, it does not execute.",
        problem:
          "A tool call can be perfectly valid JSON and still be wrong: data sent to the wrong host, retrieved content used as an email recipient, a budget exceeded, an approval reused after the action changed. Railproof puts a deterministic contract in front of every tool call.",
        command: "python -m pip install railproof\nrailproof validate policy.yaml\nrailproof check policy.yaml event.json",
        points: [
          "Deny-by-default YAML policy over tool, full arguments, user, tenant, roles, data labels, provenance and session budgets. The model has no authority to override it.",
          "One-time approval tokens bound to the exact action: change the recipient or amount and the old approval stops working.",
          "110 passing tests, 44 µs median decision time, adapters for OpenAI function calls and MCP tools/call.",
        ],
        limit: "An enforcement runtime, not a full platform, and still alpha. Its 10/10 versus 5/10 result is a narrow comparison against one NeMo Guardrails validator, not a claim to replace NeMo.",
        links: [gh("railproof"), { label: "PyPI", href: "https://pypi.org/project/railproof/" }],
      },
    ],
  },
  {
    id: "learn",
    title: "Learn how it breaks",
    question: "Do you understand the attack well enough to stop it?",
    tools: [
      {
        slug: "prompt-injection-ctf",
        name: "Prompt Injection CTF",
        status: "Live",
        license: "MIT",
        pitch: "Break a constrained AI, then read the guardrail that stops you.",
        problem:
          "Reading about prompt injection does not build the instinct. Each mission gives you a constrained AI, a concrete objective, instant feedback, and then the defensive control behind the failure.",
        points: [
          "16 LLM security missions covering every risk in the OWASP Top 10 for LLM Applications 2025, plus a 30-mission Agentic Security Lab on the OWASP Agentic Top 10.",
          "No signup or API key for practice mode. Live-model grading is optional and uses your own provider key.",
          "Used in independent research: an engineer at Apiiro froze 11 of its system prompts into a nine-model regression study.",
        ],
        limit: "Scripted practice mode runs against mock resources and does not measure a real model's susceptibility.",
        links: [{ label: "Play now", href: "https://prompt-injection-ctf-2026.web.app" }, gh("prompt-injection-ctf")],
      },
      {
        slug: "build-and-break",
        name: "Build & Break Models From Scratch",
        status: "5 levels",
        license: "MIT",
        pitch: "You understand a mechanism when you can attack it.",
        problem:
          "Most people can either attack models without explaining what happens inside them, or implement attention from memory without ever thinking about how it gets attacked. Each level, you build one piece of the model stack and then break it with a published attack.",
        command: "git clone https://github.com/ppradyoth/build-break-models-from-scratch\ncd build-break-models-from-scratch && pip install -e \".[dev]\"\nmake check LEVEL=01",
        points: [
          "Five levels: tokenizer, embeddings and retrieval, attention, sampling, and installing then ablating a refusal direction.",
          "Every attack is a published one, run against your own implementation. The test suite going green is the flag.",
          "All five levels are also playable in the browser with no clone.",
        ],
        limit: "A learning course on small models, not a testing tool for your production system.",
        links: [{ label: "Play in the browser", href: "https://ppradyoth.github.io/build-break-models-from-scratch/" }, gh("build-break-models-from-scratch")],
      },
      {
        slug: "intent-drift-playbook",
        name: "Intent Drift Playbook",
        status: "Guide",
        license: "MIT",
        pitch: "The jailbreak no single-turn scanner can see.",
        problem:
          "Automated red-teaming frameworks score a model prompt by prompt. Intent drift is cumulative: every turn is locally consistent with the last, and the divergence is only visible against the original instructions.",
        points: [
          "A working taxonomy of gradual drift, persona anchoring and trust escalation.",
          "Four detection approaches in order of cost, from embedding-based goal-consistency scoring to session-level anomaly detection.",
          "A map of which existing observability tools give you which primitive.",
        ],
        limit: "A practitioner playbook, not software. No tool is purpose-built for drift detection yet.",
        links: [gh("intent-drift-playbook")],
      },
      {
        slug: "ai-security-resources",
        name: "AI Security Resources",
        status: "Curated list",
        pitch: "One map of the field, from foundations to red teaming.",
        problem: "AI security knowledge is scattered across papers, vendor blogs and tool docs. This collects it in one place with a path through it.",
        points: [
          "Sections for foundations, red teaming, runtime security, inference security and model scanning.",
          "A zero-to-hero roadmap with 7, 30 and 100-day learning paths.",
          "A jailbreak library and interview question bank alongside the reading list.",
        ],
        limit: "A reading list. It links to other people's work and goes stale without contributions.",
        links: [gh("ai-security-resources")],
      },
    ],
  },
];

export const experimental: { name: string; note: string; href: string }[] = [
  { name: "Confused Deputy CTF", note: "Design phase, not yet implemented.", href: "https://github.com/ppradyoth/confused-deputy-ctf" },
  { name: "AI Security Tracker", note: "Tracks 22 repositories by label and keyword. Its own README says the data is incomplete.", href: "https://github.com/ppradyoth/ai-security-tracker" },
];
