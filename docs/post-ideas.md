# Post ideas

Editorial backlog for the personal site's posts.

## Personal knowledge base series

### Published

- **Keeping my context outside the agent**
  - Introduces the personal knowledge base, its connection to Andrej Karpathy's LLM Wiki pattern, the current workflow, and the value of continuity across agents.

### Planned

#### Before my knowledge base could help me, it had to interview me

A short follow-up about the initial setup. Before relying on the knowledge base, Miguel took time to reflect on his profession, goals, preferences, and way of working. An agent asked successive questions, and Miguel reviewed and refined the resulting context.

Points to cover:

- Why importing sources was not enough to make the system personal.
- The initial interview and the kinds of questions that were useful.
- Why the setup took time but improved the starting context.
- The importance of reviewing the agent's interpretations instead of accepting them automatically.
- How that initial picture can evolve without becoming a permanent definition of the person.

#### Capturing ideas into my knowledge base with an Apple Shortcut

A visual tutorial about the low-friction, asynchronous capture workflow.

```text
Share sheet
-> Apple Shortcut
-> Private GitHub issue
-> Agent processing queue
-> Knowledge base update
```

Points to cover:

- Why capture and processing happen at different times.
- How the Shortcut creates an issue in the private GitHub repository.
- What information the issue contains.
- What the agent does when it processes the queue.
- Screenshots of the share sheet, Shortcut actions, resulting issue, and final knowledge-base update.
- Privacy, permissions, and practical limitations.

## Publishing order

1. Keeping my context outside the agent.
2. Before my knowledge base could help me, it had to interview me.
3. Capturing ideas into my knowledge base with an Apple Shortcut.

When the second post is published, add a formal series entry in `src/data/post-series.ts` and connect the published posts with `series` and `seriesOrder` frontmatter.
