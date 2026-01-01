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
      'Miguel Garcia is a Software Engineer based in Madrid, Spain. LinkedIn: linkedin.com/in/miguel-garciag. X (Twitter): x.com/mikio00o.',
    tags: ['contact', 'facts'],
    type: 'fact',
    lang: 'en',
  },
  {
    id: 'about',
    title: 'About Miguel',
    content:
      "I'm a product-minded software developer focused on delivering real business value through scalable, user-centered digital products. I make practical use of AI tools to optimize workflows, improve software quality, and boost team productivity, and I actively share best practices to help teams adopt them. I aim to keep a global view of the product, balancing engineering best practices, maintainability, and cross-team collaboration. I'm motivated to keep growing as a technical professional while contributing to projects where quality, innovation, and impact are the core.",
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
    id: 'experience-ods',
    title: 'Experience - Open Digital Services (Santander Group)',
    content:
      'Frontend UI Platform Engineer (Sep 2024 - Current). Contributed to a React and TypeScript UI component library aligned with the design system and white label solutions. Helped expand adoption to over 70% of frontend teams (several hundred developers). Collaborated with designers and developers on reusable components with strong performance and accessibility. Contributed to Kubit open source ecosystem, including a landing page and tools for UI design and development.',
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
    id: 'skills-frontend',
    title: 'Skills - Frontend Development',
    content:
      'React and TypeScript with UI component library development for 70+ teams. Design systems, including scalable tokens, components, and UI governance. Accessibility with WCAG compliance and inclusive interaction patterns.',
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
      'Flutter, including a Spotify API client. React Native mobile app development. Material-UI for modern UI components.',
    tags: ['skills', 'mobile', 'frontend'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'skills-devops',
    title: 'Skills - DevOps and Tools',
    content:
      'AWS (S3, EC2, deployment). CI/CD with GitHub Actions and Microsoft Azure pipelines. Docker and GraphQL for modern development tools and APIs.',
    tags: ['skills', 'devops', 'infra'],
    type: 'answer',
    lang: 'en',
  },
  {
    id: 'philosophy',
    title: 'Development philosophy',
    content:
      'Strong knowledge fundamentals are the key. Technologies and frameworks come and go; they are tools that help engineers fix business problems.',
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
