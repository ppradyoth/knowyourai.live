export interface ScanConfig {
  api_url: string;
  use_case: string;
  allowed_capabilities: string[];
  disallowed_capabilities: string[];
  languages: string[];
  num_tests: number;
}

export interface Analysis {
  violation: boolean;
  type: "capability_drift" | "role_drift" | "domain_violation" | "none";
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
  confidence: number;
}

export interface ViolationRecord {
  strategy:
    | "RoleTransformation"
    | "GradualDrift"
    | "LanguageVariation"
    | "MultiTurnEscalation"
    | "EncodingBypass"
    | "IndirectInjection"
    | "PersonaInjection"
    | "PayloadSplitting";
  prompt: string;
  response: string;
  analysis: Analysis;
}

export interface ScanResponse {
  summary: {
    total_tests: number;
    violations: number;
    risk_score: number;
  };
  violations: ViolationRecord[];
}

export interface EnforceConfig {
  allowed: string[];
  blocked: string[];
}

export interface EnforceRequest {
  prompt: string;
  target_api: string;
  config: EnforceConfig;
}

export interface EnforceResponse {
  intent: {
    label: string;
    confidence: number;
  };
  decision: "allow" | "block" | "clarify";
  response: string;
  validation: {
    safe: boolean;
  };
}

export interface AssessmentSource {
  id: string;
  name: string;
  kind: "report" | "knowledge" | "code" | "trace";
  content: string;
  role?: "general" | "report" | "system_prompt" | "business_rules" | "knowledge" | "architecture" | "tool_handler" | "authorization" | "retrieval" | "memory" | "conversation" | "tool_trace";
  trust_level?: "unspecified" | "first_party" | "untrusted" | "mixed";
  tested_system?: string;
  tested_version?: string;
  assessment_date?: string;
  finding_status?: "unknown" | "reported" | "owner_confirmed" | "fixed" | "retest_pending" | "rejected";
  notes?: string;
}

export interface AssessmentTool {
  name: string;
  purpose: string;
  effect: "unknown" | "read" | "write" | "execute" | "mixed";
  identity_scope: "unknown" | "per_user" | "per_tenant" | "shared_service";
  approval: "unknown" | "always" | "conditional" | "none";
  constraints: string;
}

export interface AssessmentContext {
  application_type: "unspecified" | "chatbot" | "rag" | "tool_agent" | "multi_agent" | "other";
  models: string;
  user_roles: string;
  workflow: string;
  entry_points: ("user_messages" | "uploaded_files" | "retrieved_documents" | "web_content" | "tool_results" | "agent_messages" | "persistent_memory")[];
  data_access: string;
  memory_and_handoffs: string;
  environment: string;
  observable_outcomes: ("responses" | "tool_calls" | "state_changes" | "retrieval_logs" | "approval_logs")[];
  tools: AssessmentTool[];
}

export interface AssessmentReference {
  source_id: string;
  line_start: number;
  line_end: number;
  quote: string;
}

export interface AssessmentRequest {
  name: string;
  purpose: string;
  allowed: string[];
  blocked: string[];
  sources: AssessmentSource[];
  scenario_count: number;
  context: AssessmentContext;
}

export interface AssessmentScenario {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  category: "intent_drift" | "prompt_injection" | "data_leakage" | "authorization" | "tool_misuse" | "memory_poisoning" | "other";
  evidence_status: "hypothesis" | "reported";
  objective: string;
  preconditions: string[];
  steps: { channel: "user" | "retrieved_content" | "tool_output" | "memory" | "handoff"; instruction: string }[];
  expected_safe_behavior: string;
  benign_control: string;
  grading_method: "state_assertion" | "tool_trace" | "manual_review" | "llm_judge";
  grading_criteria: string;
  boundary_ids: string[];
  references: AssessmentReference[];
}

export interface AssessmentResponse {
  name: string;
  status: "draft";
  execution_status: "not_run";
  context: AssessmentContext;
  sources: (Omit<AssessmentSource, "content"> & { sha256: string; line_count: number })[];
  plan: {
    overview: string;
    boundaries: { id: string; name: string; description: string; references: AssessmentReference[] }[];
    scenarios: AssessmentScenario[];
    assumptions: string[];
    coverage_gaps: string[];
    recommended_allowed: string[];
    recommended_blocked: string[];
  };
}
