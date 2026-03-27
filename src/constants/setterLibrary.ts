import { MilestoneCategory } from '../types';

export interface LibrarySection {
  id: string;
  title: string;
  category: 'Foundations' | 'Standards' | 'Concepts' | 'Deep Dives' | 'Appendices';
  content: string;
  milestoneId?: string; // Optional link to a skill tree node
  tags?: string[];
}

export const SETTER_LIBRARY: LibrarySection[] = [
  {
    id: 'intro-purpose',
    title: 'Purpose of the Textbook',
    category: 'Foundations',
    content: `Climbing is hard. Routesetting is harder. Ask any setter about their upbringing in the craft, and you will likely hear some form of lackluster mentorship and guidance. 
    
    Because of the infinite complexities of climbing and the nature of our job, the learning process can quickly become convoluted, niche, and frustrating. Our goal is to make this learning process clear and progressive. Routesetting often feels overwhelming because it demands mastery of climbing movement, design theory, and hardware skills all while relying on physical wellbeing, safety protocols, and community engagement. 
    
    By breaking these masteries down into sections, this textbook helps new setters develop autonomy and strive for progression through the many avenues of setting. It is very important to remember that this is not a rigid rulebook. There is no “right” way to set climbs, and everyone approaches it differently. Instead, we wanted to create a living document to reference as you grow.`
  },
  {
    id: 'philosphy-joy',
    title: 'Routesetting Philosophy',
    category: 'Foundations',
    content: `Routesetters frequently lose the forest for the trees. Behind all the theory and experimentation is the simple fact that we screw plastic to a wall for a living and people find joy in that space. That joy is paramount. Without it we have no members, no money, and no job. 
    
    At the end of the day, people doing climbs is good. We will worry about unforced sequences, downgrades, upgrades, tall beta, craftsmanship, design theory, color theory, and how much our elbows and fingers hurt. But it is often the case that the climber getting to the top of the climb is a net positive. What joy!
    
    While pushing our craft and getting the work done is important, it is even more important that we keep our bodies healthy. Sustainability is the key to a long career in setting.`
  },
  {
    id: 'standards-orientation',
    title: 'Gym Orientation & Basics',
    category: 'Standards',
    content: `### Gym Tour Essentials
    - **Lounge & Office**: Where the magic happens (behind the scenes).
    - **Maintenance Closets**: Know where the vacuums and repair kits live.
    - **Emergency Action Plan (EAP)**: Know your fire escapes and AED locations. Don’t be afraid to call 911!
    
    ### Holds Room Protocol
    Sorting, washing, and personal storage are the backbone of a functional holds room. Cleanliness is not just for members; it's for the crew's sanity. 
    
    ### Maintenance Tasks
    - Cleaning holds (washing/organizing).
    - Maintaining system boards & spray walls.
    - Wall hardware & AB inspections.`
  },
  {
    id: 'standards-professionalism',
    title: 'Dress Code & Communication',
    category: 'Standards',
    content: `### Dress Code
    - **On Shift**: Movement Routesetter T-Shirt/Tank. Durable work pants or shorts. Closed-toe shoes mandatory.
    - **During Comps**: Official Routesetter shirt only.
    
    ### Communication Channels
    - **SMS/Text**: Primary channel for immediate updates, daily schedule changes, and crew coordination.
    - **Email**: Primary channel for official requests (HR, time off, policy updates). Check your Movement email routinely.
    
    ### Timekeeping (Humanity)
    - Timesheets must be reviewed by Monday at 7:00 AM (bi-weekly).
    - 30-minute unpaid lunch is mandatory for full shifts.
    - **Wellness Hours**: Full-time setters have 5 hours allotted for personal training/climbing within their 40-hour cap.`
  },
  {
    id: 'concept-feedback-loops',
    title: 'The Feedback Loop',
    category: 'Concepts',
    content: `Arguably the most important trait for refining sets is developing an internal feedback loop. We ask questions not only to clarify, but to verbalize a climber’s in-the-moment feeling and mesh that with the intended nature of the climb.
    
    ### Self-Critique Questions:
    - *“What can the climber do that isn’t what I want?”*
    - *“Why can they do it (is it easier, more secure, less off-balance)?”*
    - *“Does the sequence change the grade significantly if skipped?”*
    
    developing this self-critical dialogue saves time and makes forerunning significantly smoother.`
  },
  {
    id: 'concept-commercial-flow',
    title: 'Commercial Flow',
    category: 'Concepts',
    content: `Commercial flow is about building intuitive, ergonomic movement that feels "right" for the majority of users.
    
    It doesn't mean "easy"—it means the challenge is intended and consistent. Avoid "tweaky" moves unless they are the specific goal of the set. Focus on grip quality consistency across a grade (e.g., don't put a V8 crimp on a V2 jungle juice).`
  },
  {
    id: 'dive-stripping',
    title: 'Efficient Stripping',
    category: 'Deep Dives',
    content: `Slow is smooth, smooth is fast. 
    
    - **Boulders**: Screws on the way up, bolts on the way down.
    - **Ropes**: Take out screws in batches, then bolts. Avoid changing your bit constantly.
    - **Safety**: Rushing the strip results in dropped bolts and spin-out hazards. Maintain focus.`
  },
  {
    id: 'dive-shopping',
    title: 'Hold Shopping & Volume Work',
    category: 'Deep Dives',
    content: `A good shopping list includes a mix of:
    - Macros/Volumes for core shapes.
    - Match holds vs single hands.
    - Spike feet vs smeary/edge feet.
    
    **Pro Tip**: Pick from 1-3 different sets to maintain visual clarity and match textures. Mixing too many sets results in a "cluttered" look that loses commercial appeal.`
  }
];

export const RESOURCE_LINKS = [
  { label: 'Humanity (Scheduling)', url: 'https://movementgyms.humanity.com', icon: 'Clock' },
  { label: 'Routesetting SharePoint', url: 'https://elcapcom.sharepoint.com/sites/Routesetting_Home', icon: 'FileText' },
  { label: 'Shoe Stipend Program', url: 'https://elcapcom.sharepoint.com/sites/Routesetting_Home/SitePages/Routesetter-Shoe-Benefit-Program.aspx', icon: 'Zap' },
  { label: 'ERR Form (Reimbursement)', url: 'https://movementgyms.err.com', icon: 'DollarSign' }
];

export const ONBOARDING_CHECKLIST = [
  { id: 'tour', label: 'Gym/Holds Room Tour', category: 'Orientation' },
  { id: 'safety', label: 'EAP & AED Location Review', category: 'Safety' },
  { id: 'tools', label: 'Drill & Tool Safety Check', category: 'Workplace' },
  { id: 'humanity', label: 'Humanity Account Setup', category: 'Admin' },
  { id: 'comms', label: 'Movement Email Access', category: 'Admin' }
];
