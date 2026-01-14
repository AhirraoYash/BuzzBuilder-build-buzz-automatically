
import type { LinkedInPost } from './types';

export const MOCK_POSTS: LinkedInPost[] = [
  {
    id: 1,
    author: 'Elena Voyager',
    headline: 'AI Ethicist & Future of Work Strategist',
    avatarUrl: 'https://picsum.photos/seed/elena/100/100',
    content: 'The intersection of AI and human creativity is not a zero-sum game. It\'s a symbiotic relationship where technology amplifies our innate abilities. I\'ve seen this firsthand while working on projects that leverage generative models to create stunning visual art. The future is collaborative. #AI #Creativity #FutureOfWork',
    likes: 2458,
    comments: 312,
    viralityScore: 92,
  },
  {
    id: 2,
    author: 'Marcus Aurelius Chen',
    headline: 'Founder @ QuantumLeap | Scaling B2B SaaS to the stars',
    avatarUrl: 'https://picsum.photos/seed/marcus/100/100',
    content: 'We just closed our Series B at QuantumLeap, and I couldn\'t be more proud of the team. The journey from a garage startup to a 50-person company has been a rollercoaster. Key takeaway: obsess over your customer, not your competition. That\'s the only metric that matters. Onwards and upwards! #SaaS #StartupLife #VentureCapital',
    likes: 5601,
    comments: 874,
    viralityScore: 98,
  },
  {
    id: 3,
    author: 'Sophia Kinetic',
    headline: 'Lead Product Designer | Ex-Google, Ex-Meta',
    avatarUrl: 'https://picsum.photos/seed/sophia/100/100',
    content: 'A good design system is like a well-organized library. It provides consistency, clarity, and efficiency. But a great design system also allows for evolution and creativity. It\'s a living document, not a rigid set of rules. How does your team balance consistency and innovation? #DesignSystems #ProductDesign #UIUX',
    likes: 1203,
    comments: 156,
    viralityScore: 78,
  },
];
