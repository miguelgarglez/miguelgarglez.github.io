export type MemoryBlock = {
  id: string;
  title: string;
  content: string;
  source: 'manual' | 'github' | 'linkedin-snapshot' | 'note';
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  status: 'completed' | 'in_progress' | 'draft';
  visibility: 'public' | 'private';
  confidence: 'verified' | 'needs_review';
  priority: number;
};

export const memories: MemoryBlock[] = [
  {
    id: 'santander-product-onboarding-team',
    title: 'Moved to Santander business onboarding product team',
    content:
      "Miguel moved from frontend UI platform work into a final product team focused on Santander's business-account onboarding flows for Spain, Mexico, and the UK. This gives him closer exposure to product delivery, financial onboarding complexity, regional requirements, and cross-functional execution.",
    source: 'manual',
    tags: ['frontend', 'product', 'santander', 'onboarding', 'business-accounts'],
    createdAt: '2026-06-11',
    status: 'in_progress',
    visibility: 'public',
    confidence: 'verified',
    priority: 98,
  },
  {
    id: 'exponential-community-joined',
    title: 'Joined Exponential Community',
    content:
      'Miguel joined Exponential Community, part of Exponential Fellowship in Spain, to learn from the current technology and startup ecosystem and meet young builders with similar curiosity. He is not framing it as a founder commitment, but as a way to understand startup thinking, ambition, and modern technology perspectives.',
    source: 'manual',
    tags: ['startup', 'community', 'learning', 'technology', 'network'],
    createdAt: '2026-06-11',
    status: 'in_progress',
    visibility: 'public',
    confidence: 'verified',
    priority: 92,
  },
  {
    id: 'opencode-zen-chat-migration',
    title: 'Migrated profile chat to opencode Zen',
    content:
      'Miguel migrated the Cloudflare Worker backend of his public CV chat from OpenRouter free models to a provider-agnostic OpenAI-compatible setup using opencode Zen.',
    source: 'manual',
    tags: ['ai', 'agents', 'cloudflare', 'opencode', 'portfolio', 'backend'],
    createdAt: '2026-04-25',
    status: 'completed',
    visibility: 'public',
    confidence: 'verified',
    priority: 100,
  },
  {
    id: 'gpt-54-nano-latency-optimization',
    title: 'Improved chat latency with GPT 5.4 nano',
    content:
      'Miguel tested multiple model options for his profile chat and found GPT 5.4 nano to provide a major improvement in perceived response speed while remaining suitable for the grounded profile assistant use case.',
    source: 'manual',
    tags: ['ai', 'latency', 'model-selection', 'ux', 'portfolio'],
    createdAt: '2026-04-25',
    status: 'completed',
    visibility: 'public',
    confidence: 'verified',
    priority: 95,
  },
  {
    id: 'agentic-profile-chat-roadmap',
    title: 'Agentic profile chat roadmap',
    content:
      'Miguel is evolving his CV chat from a simple grounded assistant into a lightweight professional profile agent with intent detection, structured projects, curated memories, and agent activity UX.',
    source: 'manual',
    tags: ['agents', 'roadmap', 'portfolio', 'ai', 'product'],
    createdAt: '2026-04-25',
    status: 'in_progress',
    visibility: 'public',
    confidence: 'verified',
    priority: 90,
  },
  {
    id: 'google-genai-intensive-capstone',
    title: 'Google GenAI Intensive capstone',
    content:
      'Miguel completed the five-day Google GenAI Intensive, which ended with a capstone project. His RAG exposure from this was lightweight and practical: enough to understand the basic retrieval, embeddings, and grounded-answer workflow, but not positioned as deep production RAG experience.',
    source: 'manual',
    tags: ['rag', 'genai', 'ai', 'capstone', 'learning', 'google-genai-intensive'],
    createdAt: '2026-04-25',
    status: 'completed',
    visibility: 'public',
    confidence: 'verified',
    priority: 70,
  },
];
