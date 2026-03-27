import { ApprenticeshipFramework } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// ── SEED DATA: NICOLE'S PACE (4 PHASES) ──────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

export const NICOLE_PACE_FRAMEWORK: ApprenticeshipFramework = {
  id: 'nicole-pace',
  name: "Approach B: Pace",
  author: "Nicole Baviera",
  description: "Focuses on volume and autonomy first, then refines quality.",
  phases: [
    {
      id: 'p1',
      name: 'Phase 1: Training & Foundations',
      description: 'Acquiring setting skills and learning the pace.',
      milestoneIds: ['m1', 'm2', 'm3', 'm4', 'm5'],
      exitCriteriaDescriptions: [
        'Set 4 boulders comfortably in a day while matching pace',
        'Set 2 routes comfortably in a day while matching pace',
        'Understands WAH system and is comfortable under supervision'
      ]
    },
    {
      id: 'p2',
      name: 'Phase 2: Movement & Design',
      description: 'Refining skills and improving product quality.',
      milestoneIds: ['m6', 'm7', 'm8'],
      exitCriteriaDescriptions: [
        'Mastered WAH systems (no longer needs supervision)',
        'Fulfilled specific commercial flow assignments'
      ]
    },
    {
      id: 'p3',
      name: 'Phase 3: Efficiency & Consistency',
      description: 'Tackling complex assignments at pace.',
      milestoneIds: ['m9', 'm10'],
      exitCriteriaDescriptions: [
        'Mastered hold selection and intensity management',
        'Consistently delivers high-quality skeletons'
      ]
    },
    {
      id: 'p4',
      name: 'Phase 4: Style & Autonomy',
      description: 'Amplifying the skillset to F3+ level.',
      milestoneIds: ['m11'],
      exitCriteriaDescriptions: [
        'Valued crew member who goes above and beyond',
        'Ready for promotion to F3 or higher'
      ]
    }
  ],
  milestones: [
    {
      id: 'm1',
      category: 'Movement',
      title: 'Ergonomically Comfy',
      description: 'Create a climb that feels natural and intuitive.',
      reflectionPrompt: 'What makes a climb feel comfortable and intuitive?',
      prerequisites: [],
      libraryId: 'movement-fundamentals'
    },
    {
      id: 'm2',
      category: 'Workflow',
      title: 'Zone Setup',
      description: 'Knowledge of setting up a zone and general considerations.',
      prerequisites: []
    },
    {
      id: 'm3',
      category: 'Safety',
      title: 'Tool Safety',
      description: 'Proper use of drills, ladders, bits, and PPE.',
      prerequisites: [],
      libraryId: 'foundations-safety'
    },
    {
      id: 'm4',
      category: 'Speed',
      title: 'The 4-Boulder Pace',
      description: 'Hit the benchmark of 4 boulders in a setting day.',
      prerequisites: ['m1']
    },
    {
      id: 'm5',
      category: 'Maintenance',
      title: 'Stripping Efficiency',
      description: 'Stripping routes safely and efficiently.',
      prerequisites: []
    },
    {
      id: 'm6',
      category: 'Movement',
      title: 'Heel Hook Intuition',
      description: 'Set a moderate climb where a heel hook is intuitive.',
      reflectionPrompt: 'What motivates the climber to place a heel hook here?',
      prerequisites: ['m1'],
      libraryId: 'concept-feedback-loops'
    },
    {
      id: 'm7',
      category: 'Aesthetics',
      title: 'The Visual Spark',
      description: 'Design a climb that invites the user from across the room.',
      prerequisites: []
    },
    {
      id: 'm8',
      category: 'Safety',
      title: 'WAH Mastery',
      description: 'Mastery of Work-At-Height systems (Ropes).',
      prerequisites: ['m3']
    },
    {
      id: 'm9',
      category: 'Coordination',
      title: 'Skate Move',
      description: 'Set a simple skate that must be done dynamically.',
      prerequisites: ['m6']
    },
    {
      id: 'm10',
      category: 'Movement',
      title: 'Complex Skeletons',
      description: 'Set high quality skeletons that are eye-catching and intentional.',
      prerequisites: ['m7']
    },
    {
      id: 'm11',
      category: 'Other',
      title: 'Style Awareness',
      description: 'Understand and use other crew members individual styles as a tool.',
      prerequisites: ['m9', 'm10']
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// ── SEED DATA: LUKE'S QUALITY (3 PHASES) ─────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

export const LUKE_QUALITY_FRAMEWORK: ApprenticeshipFramework = {
  id: 'luke-quality',
  name: "Approach A: Quality",
  author: "Luke Sherlock",
  description: "Slow is smooth. Focuses on movement fundamentals before speed/ropes.",
  phases: [
    {
      id: 'q1',
      name: 'Phase 1: Fundamentals & Flow',
      description: 'Mastering the drill and movement on a ladder.',
      milestoneIds: ['qm1', 'qm2', 'qm3'],
      exitCriteriaDescriptions: [
        'Set 4 boulders in a day for the first time',
        'Fulfilled commercial flow assignments'
      ]
    },
    {
      id: 'q2',
      name: 'Phase 2: Efficiency & Verticality',
      description: 'Introduce WAH and standard pace.',
      milestoneIds: ['qm4', 'qm5'],
      exitCriteriaDescriptions: [
        'Stripped and set a zone at usual crew pace',
        'Basic WAH proficiency'
      ]
    },
    {
      id: 'q3',
      name: 'Phase 3: Style & Autonomy',
      description: 'Aesthetics and volume utility.',
      milestoneIds: ['qm6', 'qm7'],
      exitCriteriaDescriptions: [
        'Explored setting at/beyond project limit',
        'Tagged the set for a day'
      ]
    }
  ],
  milestones: [
    {
      id: 'qm1',
      category: 'Movement',
      title: 'Movement Fundamentals',
      description: 'Understanding the Why behind basic sequences.',
      prerequisites: [],
      libraryId: 'movement-fundamentals'
    },
    {
      id: 'qm2',
      category: 'Other',
      title: 'Drill Competence',
      description: 'Mastering the tool on a ladder.',
      prerequisites: []
    },
    {
      id: 'qm3',
      category: 'Workflow',
      title: 'Cognitive Load Focus',
      description: 'Setting 2-3 boulders without the distraction of ropes.',
      prerequisites: ['qm1']
    },
    {
      id: 'qm4',
      category: 'Safety',
      title: 'WAH Introduction',
      description: 'Learning to not die on a rope.',
      prerequisites: ['qm2']
    },
    {
      id: 'qm5',
      category: 'Speed',
      title: 'Standard Quota',
      description: 'Matching typical crew pace (4+ boulders).',
      prerequisites: ['qm3']
    },
    {
      id: 'qm6',
      category: 'Aesthetics',
      title: 'Aesthetic Range',
      description: 'Exploring various visual styles.',
      prerequisites: ['qm5']
    },
    {
      id: 'qm7',
      category: 'Other',
      title: 'Tagging the Set',
      description: 'Assigning grades and tags (side-by-side with Head Setter).',
      prerequisites: ['qm6']
    }
  ]
};

export const GLOBAL_TEMPLATES: ApprenticeshipFramework[] = [
  NICOLE_PACE_FRAMEWORK,
  LUKE_QUALITY_FRAMEWORK
];
