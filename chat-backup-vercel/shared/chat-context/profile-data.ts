export type ProfileBlock = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  type: 'fact' | 'story' | 'answer' | 'example';
  lang: 'es' | 'en';
};

export const profileSections: ProfileBlock[] = [
  {
    id: 'profile',
    title: 'Profile basics',
    content:
      'Miguel Garcia is a Software Engineer based in Madrid, Spain. He builds frontend systems, product-facing web experiences, and practical AI-enabled workflows. LinkedIn: linkedin.com/in/miguel-garciag. X (Twitter): x.com/miguel_garglez.',
    tags: ['contact', 'facts'],
    type: 'fact',
    lang: 'en',
  },
  {
    id: 'directory-page',
    title: 'Directory page overview',
    content:
      "Miguel's root page is a lightweight directory titled 'An index of projects, people, and ideas.' It works as an entry point to the things he builds and the work that inspires them. It currently highlights selected projects such as cv-chat, momentum, frontend_dual_layout_showcase, and kubit_react_charts, plus a curated list of inspiring people.",
    tags: ['directorio', 'proyectos', 'cultura'],
    type: 'fact',
    lang: 'en',
  },
  {
    id: 'directory-cv-chat',
    title: 'What cv-chat is inside the directory',
    content:
      'Within the directory, cv-chat is Miguel’s main professional website. It contains his profile, CV, experience, skills, and a grounded chat experience called profile_chat that answers questions based on curated profile data.',
    tags: ['directorio', 'proyectos', 'recruiting', 'contact'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'about',
    title: 'About Miguel',
    content:
      "I'm a product-minded software developer focused on delivering real business value through scalable, user-centered digital products. I use AI tools in practical ways to improve workflows, software quality, and team productivity, and I actively help others adopt what works. I try to keep a global view of the product, balancing engineering quality, maintainability, and cross-team collaboration. I'm especially motivated by work where quality, innovation, and measurable impact matter.",
    tags: ['trayectoria', 'motivacion', 'valores'],
    type: 'story',
    lang: 'en',
  },
  {
    id: 'qualities',
    title: 'Personal qualities',
    content:
      'Team player with a long history in federated football teams since age seven. Resilient and motivated by failure to keep improving. Fast learner with attention to detail and a proactive approach. Global mindset with English C1 level certified by the British Council (Aptis) and experience speaking in public.',
    tags: ['fortalezas', 'equipo', 'forma-de-trabajar'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'recruiter-value-proposition',
    title: 'Recruiter snapshot - Why Miguel',
    content:
      'Miguel combines product mindset, frontend platform execution, and strong collaboration habits. He brings a generalist mentality: he is motivated by solving real problems, does not back away from unfamiliar challenges, and is comfortable moving across product, quality, delivery, and technical depth as needed. He is especially valuable in environments that need consistent, accessible, high-performance interfaces without losing sight of adoption, delivery, and business value.',
    tags: ['recruiting', 'impacto', 'fortalezas', 'forma-de-trabajar'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'work-style',
    title: 'Work style and collaboration',
    content:
      'He works with a pragmatic, quality-first approach: clarify the problem, understand the product goal, break work into maintainable increments, communicate tradeoffs early, and ship with documentation and release discipline. He collaborates comfortably with engineers, QA, designers, and product stakeholders, especially when expectations are explicit and ownership is clear.',
    tags: ['forma-de-trabajar', 'equipo', 'valores', 'stakeholders', 'ownership'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'preferred-environments',
    title: 'Best environments for Miguel',
    content:
      'Miguel progresses most in environments with ownership, growth, and healthy ambition. He does his best work when teams care about product impact, high engineering standards, accessibility, and maintainability, while still making pragmatic decisions and moving with purpose. He is a strong fit for places where collaboration is healthy, feedback is direct, and quality is a shared responsibility rather than an afterthought.',
    tags: ['cultura', 'forma-de-trabajar', 'ownership', 'impacto', 'recruiting'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'generalist-mindset',
    title: 'Generalist mindset and approach to challenges',
    content:
      'Miguel sees himself as a generalist engineer whose job is to solve meaningful problems, not to stay inside a narrow box. He is diligent, capable, and willing to step into unfamiliar territory when the situation requires it. New challenges do not push him back; they motivate him to learn fast, structure the problem, and move the work forward with ownership and discipline.',
    tags: ['fortalezas', 'aprendizaje', 'proyectos', 'forma-de-trabajar', 'recruiting'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'preferred-collaborators',
    title: 'People Miguel likes working with',
    content:
      'He enjoys working with people who combine high standards with kindness: low-ego teammates who care about the craft, give direct feedback, communicate clearly, and want to solve problems together. He values colleagues who are reliable, collaborative, and motivated by helping the team improve, not by protecting status.',
    tags: ['equipo', 'cultura', 'valores', 'forma-de-trabajar', 'recruiting'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'leadership-and-ownership',
    title: 'Leadership and ownership examples',
    content:
      'At Open Digital Services, he leads implementation, maintenance, and refactoring of shared UI components used by web developers across Grupo Santander banks. At Jember, he co-led the recovery of a stalled test automation initiative and helped turn it into a practical regression asset with around 50% reduction in person-day cost. These examples reflect the type of ownership he wants to expand: technical direction that improves product delivery and raises the level of the team around him.',
    tags: ['liderazgo', 'impacto', 'proyectos', 'ownership', 'recruiting'],
    type: 'example',
    lang: 'en',
  },
  {
    id: 'communication',
    title: 'Communication and stakeholder management',
    content:
      'He is used to explaining technical decisions to different audiences. Examples include remote client demos at Electric-Save, cross-team coordination in QA and frontend contexts, and public speaking experience supported by an English C1 certification.',
    tags: ['comunicacion', 'equipo', 'clientes', 'stakeholders', 'recruiting'],
    type: 'example',
    lang: 'en',
  },
  {
    id: 'problem-solving-example',
    title: 'Problem-solving example',
    content:
      'At Jember, the test automation project had been inactive for more than two years. He partnered with another QA engineer to refactor and relaunch it, improving regression efficiency and reducing manual regression cost by about 50% in person days.',
    tags: ['impacto', 'proyectos', 'calidad', 'aprendizaje', 'recruiting'],
    type: 'example',
    lang: 'en',
  },
  {
    id: 'experience-ods',
    title: 'Experience - Open Digital Services (Santander Group)',
    content:
      'Frontend UI Platform Engineer (Sep 2024 - Current). Member of the Kubit Web UI components platform team, building and maintaining the component library used by web developers across Grupo Santander banks. Leads implementation, maintenance, and refactoring of UI components, ensuring consistency, performance, and accessibility across the product ecosystem. Contributes to the open-source charting library with new features and continuous improvements. Manages releases with semantic versioning, branch strategy, and Storybook documentation; supports Kubit public presence through product landing pages. Drives AI-enabled workflows with tools like GitHub Copilot, MCP servers, and context engineering to improve productivity, code quality, and collaborative development.',
    tags: ['experiencia', 'impacto', 'proyectos', 'frontend'],
    type: 'example',
    lang: 'en',
  },
  {
    id: 'experience-jember',
    title: 'Experience - Jember Engineering Solutions',
    content:
      'QA Software Engineer (Sep 2023 - Jul 2024). Coordinated with app frontend teams using agile methodologies. Reported hundreds of bugs, improving performance and UX. Co-led a refactor and relaunch of a test automation project, improving regression testing cost by about 50% in person days.',
    tags: ['experiencia', 'impacto', 'calidad', 'proyectos'],
    type: 'example',
    lang: 'en',
  },
  {
    id: 'experience-electric-save',
    title: 'Experience - Electric-Save',
    content:
      'Software Developer (Jan 2022 - May 2022). Worked directly with clients in a B2B startup, fixing issues and supporting customers. Built a web application proof of concept for a key client that advanced the proposal to the next selection stage. Led remote meetings to demo the product and drive growth.',
    tags: ['experiencia', 'impacto', 'proyectos', 'clientes'],
    type: 'example',
    lang: 'en',
  },
  {
    id: 'education',
    title: 'Education',
    content:
      'Masters Degree in Computer Science at Universidad Autonoma de Madrid (Sep 2022 - Feb 2024). Exchange program at Aalto University in Helsinki, Finland (Jan 2023 - Jun 2023). Bachelors Degree in Computer Science at Universidad Autonoma de Madrid (Sep 2018 - Jun 2022).',
    tags: ['educacion', 'trayectoria'],
    type: 'fact',
    lang: 'en',
  },
  {
    id: 'education-certifications',
    title: 'Courses and certifications',
    content:
      'Professional Scrum Master I (PSM I) — Scrum.org (Oct 2025). Credential: https://www.credly.com/badges/78c42e63-cb83-4914-8607-4073c40599a3/linked_in_profile. Animations on the Web — Emil Kowalski (Aug 2025). Credential: https://animations.dev/certificate/6372ea11-f38d-45be-9c2f-9817e68b90a6. Google GenAI Intensive — Kaggle (Apr 2025). Credential: https://www.kaggle.com/certification/badges/miguelgarglez/96. Responsible AI and Prompt Engineering (Online Course) — Founderz (Mar 2025). Credential: https://learn.founderz.com/certificate/curso-generacion-ia-comunidad-madrid/7ca969ab-1671-4608-9c40-8b87d3bbfddf. TOEIC - C1 CEFR Level — Capman Testing Solutions (Feb 2025). Credential: https://www.linkedin.com/in/miguel-garciag/details/certifications/. Full Stack Open — University of Helsinki (Apr 2024). Credential: https://studies.cs.helsinki.fi/stats/api/certificate/fullstackopen/en/db1060c383cd09cd6ab128fb5f864156.',
    tags: ['educacion', 'certificaciones', 'cursos'],
    type: 'fact',
    lang: 'en',
  },
  {
    id: 'skills-frontend',
    title: 'Skills - Frontend Development',
    content:
      'React and TypeScript with component libraries at scale. Design systems with tokens, components, and UI governance. Accessibility with WCAG compliance and inclusive patterns. Performance-focused UI quality, profiling, and optimization.',
    tags: ['skills', 'frontend', 'impacto'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'skills-backend',
    title: 'Skills - Backend and Data',
    content:
      'Python with Flask, Django, Pandas, NumPy, Matplotlib. Databases including SQL (PostgreSQL, SQLite) and NoSQL (MongoDB). Node.js with MERN stack experience.',
    tags: ['skills', 'backend', 'datos'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'skills-mobile',
    title: 'Skills - Mobile and Cross-Platform',
    content:
      'Flutter, including a Spotify API client. React Native mobile app development. Cross-platform UX and mobile interface patterns.',
    tags: ['skills', 'mobile', 'frontend'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'skills-devops',
    title: 'Skills - Engineering Tools and AI',
    content:
      'AI-assisted development with GitHub Copilot, MCP servers, and context engineering. CI/CD with GitHub Actions and Microsoft Azure pipelines. Cloud and APIs with AWS, Vercel, Cloudflare Workers, Docker, and GraphQL.',
    tags: ['skills', 'devops', 'infra'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'growth-areas',
    title: 'Growth areas and continuous improvement',
    content:
      'He is actively growing in two directions: deeper backend and system design breadth, and better leverage of AI workflows in day-to-day engineering. His approach is iterative: test ideas in real tasks, document what works, share practices, and standardize successful patterns with the team.',
    tags: ['debilidades', 'aprendizaje', 'futuro', 'forma-de-trabajar', 'recruiting'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'role-fit',
    title: 'Best fit roles and environments',
    content:
      'Best fit roles include frontend platform engineering, design systems, and product-facing frontend positions where accessibility, performance, and maintainability matter. He is particularly aligned with roles that combine technical depth, cross-functional influence, and visible product or business impact.',
    tags: ['recruiting', 'futuro', 'impacto', 'forma-de-trabajar', 'ownership'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'career-direction',
    title: 'Career direction and leadership ambition',
    content:
      'Miguel wants to grow into a technical leadership role with clear business influence. The direction he is aiming for is to help shape technical decisions, improve how teams deliver, contribute to product outcomes, and actively support other engineers as they grow. He is motivated by the idea of being a trusted technical leader who raises both the quality of the work and the level of the people around him.',
    tags: ['futuro', 'liderazgo', 'impacto', 'recruiting', 'ownership'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'availability',
    title: 'Availability and work setup',
    content:
      'Based in Madrid (CET/CEST) and open to discussing new opportunities, impactful projects, and collaborative engineering roles. The profile context does not define a strict preference across remote, hybrid, or onsite setups; for role details, interview process, and availability timing, reach out via LinkedIn or X.',
    tags: ['contact', 'disponibilidad', 'recruiting'],
    type: 'fact',
    lang: 'en',
  },
  {
    id: 'philosophy',
    title: 'Development philosophy',
    content:
      'Strong knowledge fundamentals are the key. Technologies and frameworks come and go; they are tools that help engineers solve business problems. What matters most is understanding the challenge, learning what is needed, and being capable of moving across disciplines when the problem demands it.',
    tags: ['valores', 'filosofia', 'impacto'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'contact',
    title: 'Contact and interests',
    content:
      'Open to discussing new opportunities, exciting projects, or conversations about technology and software engineering. Outside of coding, he is a sports enthusiast who has played football since age seven, enjoys staying physically active, reads software engineering blogs, explores new technologies, and seeks activities that foster personal growth.',
    tags: ['contact', 'intereses', 'cultura'],
    type: 'answer',
    lang: 'en',
  },
];
