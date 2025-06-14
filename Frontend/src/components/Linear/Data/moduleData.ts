import { LucideIcon } from "lucide-react";

export type ModuleType = 
  | 'JEE Accelerator' 
  | 'Formula Fusion' 
  | '3D Explorer' 
  | 'Proof Builder' 
  | 'Numerical Navigator';

export interface ModuleData {
  id: string;
  name: string;
  type: ModuleType;
  title?: string; // Make optional since steam store uses name
  description: string;
  icon: LucideIcon | string; // Allow both LucideIcon and string
  content: any;
  timestamp: number; // Fix: was missing type
  topic?: string; // Add topic field used in steam store
}

export const moduleData: ModuleData[] = [
  {
    id: 'jee-1',
    name: 'JEE Main Physics Problems',
    type: 'JEE Accelerator',
    title: 'JEE Main Physics Problems',
    description: 'Curated previous year problems with detailed solutions',
    icon: '📚',
    timestamp: 30,
    topic: 'Physics',
    content: {
      problems: [
        {
          id: 'p1',
          year: 2023,
          question: 'A particle moves in a straight line with velocity given by v = 3t² - 12t + 9 m/s. What is the displacement of the particle in the first 4 seconds?',
          solution: `Step 1: Displacement is integral of velocity w.r.t time
          s = ∫v dt = ∫(3t² - 12t + 9) dt
          Step 2: Integrate term by term
          s = t³ - 6t² + 9t + C
          Step 3: At t=0, displacement=0 ⇒ C=0
          Step 4: At t=4s
          s = (4)³ - 6(4)² + 9(4) = 64 - 96 + 36 = 4m`,
          difficulty: 'Medium',
          topic: 'Kinematics',
          timeRequired: 8,
          marks: 4,
          similarProblems: [
            'A particle moves... (JEE 2022)',
            'Velocity given by v=2t³... (JEE 2021)'
          ]
        },
        {
          id: 'p2',
          year: 2022,
          question: 'A parallel plate capacitor with plate area A and separation d has capacitance C. If a dielectric slab of thickness t and dielectric constant K is inserted, what is the new capacitance?',
          solution: `Step 1: Original capacitance C = ε₀A/d
          Step 2: After inserting dielectric, the capacitor can be considered as two capacitors in series
          Step 3: C1 = ε₀A/(d-t) and C2 = Kε₀A/t
          Step 4: Equivalent capacitance C_eq = (C1 C2)/(C1 + C2) = [ε₀A/(d-t) * Kε₀A/t] / [ε₀A/(d-t) + Kε₀A/t]
          Step 5: Simplify: C_eq = ε₀A / [t/K + (d-t)]`,
          difficulty: 'Hard',
          topic: 'Electrostatics',
          timeRequired: 12,
          marks: 6,
          similarProblems: [
            'Capacitor with two dielectrics... (JEE 2021)',
            'Spherical capacitor with dielectric... (JEE 2020)'
          ]
        },
        {
          id: 'p3',
          year: 2023,
          question: 'A ray of light is incident at 60° on a prism of angle 45°. If the ray suffers minimum deviation, calculate the refractive index of the prism material.',
          solution: `Step 1: For minimum deviation, i = (A + δₘ)/2
          Step 2: Given i = 60°, A = 45°
          Step 3: 60 = (45 + δₘ)/2 ⇒ 120 = 45 + δₘ ⇒ δₘ = 75°
          Step 4: Using formula μ = sin[(A + δₘ)/2] / sin(A/2)
          Step 5: μ = sin(60°) / sin(22.5°) = (√3/2) / 0.3827 ≈ 1.2247`,
          difficulty: 'Medium',
          topic: 'Optics',
          timeRequired: 10,
          marks: 5,
          similarProblems: [
            'Prism with A=60°... (JEE 2022)',
            'Deviation in prism... (JEE 2021)'
          ]
        }
      ],
      topics: [
        { name: 'Mechanics', problemCount: 48, weightage: 35 },
        { name: 'Electrodynamics', problemCount: 42, weightage: 30 },
        { name: 'Modern Physics', problemCount: 30, weightage: 20 },
        { name: 'Thermodynamics', problemCount: 25, weightage: 15 }
      ],
      years: [2023, 2022, 2021, 2020, 2019],
      stats: {
        totalProblems: 145,
        solved: 78,
        accuracy: 84
      }
    }
  },
  {
    id: 'formula-1',
    name: 'Electromagnetic Field Equations',
    type: 'Formula Fusion',
    title: 'Electromagnetic Field Equations',
    description: 'Step-by-step derivation of Maxwell\'s equations',
    icon: '∫',
    timestamp: 60,
    topic: 'Physics',
    content: {
      derivations: [
        {
          id: 'd1',
          title: 'Gauss\'s Law for Electricity',
          steps: [
            {
              step: 1,
              equation: '∮ E · dA = Q_enclosed / ε₀',
              explanation: 'The flux through a closed surface is proportional to the charge enclosed'
            },
            {
              step: 2,
              equation: '∇ · E = ρ / ε₀',
              explanation: 'Differential form using divergence theorem'
            },
            {
              step: 3,
              equation: 'Consider point charge: E = k q / r²',
              explanation: 'Field of a point charge'
            },
            {
              step: 4,
              equation: 'Flux through sphere: E × 4πr² = q / ε₀',
              explanation: 'Verification for spherical symmetry'
            }
          ],
          applications: [
            'Calculating electric fields of symmetric charge distributions',
            'Determining charge enclosed by a surface'
          ],
          complexity: 3,
          timeRequired: 15
        },
        {
          id: 'd2',
          title: 'Faraday\'s Law of Induction',
          steps: [
            {
              step: 1,
              equation: '∮ E · dl = -dΦ_B / dt',
              explanation: 'EMF around a closed loop equals negative rate of change of magnetic flux'
            },
            {
              step: 2,
              equation: '∇ × E = -∂B/∂t',
              explanation: 'Differential form using Stokes\' theorem'
            },
            {
              step: 3,
              equation: 'Consider changing B-field in a loop',
              explanation: 'Induced EMF opposes change in flux'
            },
            {
              step: 4,
              equation: 'Lenz\'s Law: direction of induced current',
              explanation: 'Conservation of energy principle'
            }
          ],
          applications: [
            'Electric generators and transformers',
            'Induction motors',
            'Magnetic braking systems'
          ],
          complexity: 4,
          timeRequired: 20
        }
      ],
      equationDatabase: [
        {
          name: 'Maxwell\'s Equations',
          equations: [
            '∇·E = ρ/ε₀',
            '∇·B = 0',
            '∇×E = -∂B/∂t',
            '∇×B = μ₀J + μ₀ε₀∂E/∂t'
          ]
        },
        {
          name: 'Wave Equations',
          equations: [
            '∇²E - μ₀ε₀ ∂²E/∂t² = 0',
            '∇²B - μ₀ε₀ ∂²B/∂t² = 0'
          ]
        }
      ],
      categories: [
        { name: 'Electromagnetism', derivationCount: 12 },
        { name: 'Mechanics', derivationCount: 18 },
        { name: 'Quantum Physics', derivationCount: 9 },
        { name: 'Thermodynamics', derivationCount: 7 }
      ]
    }
  },
  {
    id: '3d-1',
    name: 'Organic Chemistry Structures',
    type: '3D Explorer',
    title: 'Organic Chemistry Structures',
    description: 'Interactive 3D models of organic molecules',
    icon: '⚛️',
    timestamp: 90,
    topic: 'Chemistry',
    content: {
      molecules: [
        {
          id: 'm1',
          name: 'Glucose (C₆H₁₂O₆)',
          formula: 'C₆H₁₂O₆',
          structureType: 'Cyclic',
          bonds: [
            { atoms: [0,1], type: 'single', length: 1.54 },
            { atoms: [1,2], type: 'single', length: 1.54 },
            { atoms: [2,3], type: 'single', length: 1.54 },
            { atoms: [3,4], type: 'single', length: 1.54 },
            { atoms: [4,5], type: 'single', length: 1.54 },
            { atoms: [5,0], type: 'single', length: 1.54 }
          ],
          atoms: [
            { element: 'C', position: [0,0,0], charge: 0 },
            { element: 'C', position: [1.54,0,0], charge: 0 },
            { element: 'C', position: [2.31,1.33,0], charge: 0 },
            { element: 'C', position: [1.54,2.66,0], charge: 0 },
            { element: 'C', position: [0,2.66,0], charge: 0 },
            { element: 'C', position: [-0.77,1.33,0], charge: 0 },
            { element: 'O', position: [0,3.82,0], charge: 0 }
          ],
          properties: {
            molecularWeight: 180.16,
            density: 1.54,
            meltingPoint: 146,
            boilingPoint: 150
          },
          isomers: ['α-D-glucose', 'β-D-glucose'],
          functionalGroups: ['Hydroxyl', 'Aldehyde']
        },
        {
          id: 'm2',
          name: 'Benzene (C₆H₆)',
          formula: 'C₆H₆',
          structureType: 'Aromatic',
          bonds: [
            { atoms: [0,1], type: 'double', length: 1.40 },
            { atoms: [1,2], type: 'single', length: 1.40 },
            { atoms: [2,3], type: 'double', length: 1.40 },
            { atoms: [3,4], type: 'single', length: 1.40 },
            { atoms: [4,5], type: 'double', length: 1.40 },
            { atoms: [5,0], type: 'single', length: 1.40 }
          ],
          atoms: [
            { element: 'C', position: [0,0,0], charge: 0 },
            { element: 'C', position: [1.4,0,0], charge: 0 },
            { element: 'C', position: [2.1,1.21,0], charge: 0 },
            { element: 'C', position: [1.4,2.42,0], charge: 0 },
            { element: 'C', position: [0,2.42,0], charge: 0 },
            { element: 'C', position: [-0.7,1.21,0], charge: 0 }
          ],
          properties: {
            molecularWeight: 78.11,
            density: 0.879,
            meltingPoint: 5.5,
            boilingPoint: 80.1
          },
          isomers: ['None'],
          functionalGroups: ['Aromatic ring']
        }
      ],
      categories: [
        { name: 'Organic Compounds', moleculeCount: 42 },
        { name: 'Inorganic Compounds', moleculeCount: 28 },
        { name: 'Biomolecules', moleculeCount: 35 },
        { name: 'Polymers', moleculeCount: 19 }
      ],
      tools: [
        { name: 'Rotate', icon: '🔄', description: 'Rotate molecule in 3D space' },
        { name: 'Zoom', icon: '🔍', description: 'Zoom in/out on molecule' },
        { name: 'Measure', icon: '📏', description: 'Measure bond lengths and angles' },
        { name: 'Orbital View', icon: '🪐', description: 'Show electron orbitals' }
      ]
    }
  },
  {
    id: 'proof-1',
    name: 'Number Theory Proofs',
    type: 'Proof Builder',
    title: 'Number Theory Proofs',
    description: 'Construct rigorous mathematical proofs step by step',
    icon: '𝛿',
    timestamp: 120,
    topic: 'Mathematics',
    content: {
      theorems: [
        {
          id: 't1',
          name: 'Fundamental Theorem of Arithmetic',
          statement: 'Every integer greater than 1 can be represented uniquely as a product of prime numbers',
          difficulty: 'Advanced',
          steps: [
            {
              step: 1,
              statement: 'Existence: Show every integer n>1 has a prime factorization',
              explanation: 'Use strong induction on n. Base case: n=2 is prime. Inductive step: if n is prime, done; else n=ab with 1<a,b<n, apply induction to a and b.'
            },
            {
              step: 2,
              statement: 'Uniqueness: Assume two factorizations n=p₁p₂...pᵣ = q₁q₂...qₛ',
              explanation: 'Show that the primes must be the same up to order. Use Euclid\'s lemma: if p|ab then p|a or p|b.'
            },
            {
              step: 3,
              statement: 'Since p₁ divides n, p₁ divides some qᵢ, so p₁ = qᵢ',
              explanation: 'Cancel p₁ and qᵢ and continue by induction on the number of factors.'
            }
          ],
          relatedTheorems: ['Euclid\'s Lemma', 'Bezout\'s Identity'],
          applications: ['Cryptography', 'Algebraic number theory'],
          timeRequired: 25
        },
        {
          id: 't2',
          name: 'Pythagorean Theorem',
          statement: 'In a right-angled triangle, the square of the hypotenuse equals the sum of squares of the other two sides',
          difficulty: 'Intermediate',
          steps: [
            {
              step: 1,
              statement: 'Consider a right triangle with sides a,b and hypotenuse c',
              explanation: 'Label the vertices A,B,C with right angle at C'
            },
            {
              step: 2,
              statement: 'Construct squares on each side',
              explanation: 'Form squares with areas a², b², c²'
            },
            {
              step: 3,
              statement: 'Rearrange the areas',
              explanation: 'Show that a² + b² = c² by geometric dissection'
            }
          ],
          relatedTheorems: ['Law of Cosines', 'Euclidean distance'],
          applications: ['Geometry', 'Trigonometry', 'Vector spaces'],
          timeRequired: 15
        }
      ],
      categories: [
        { name: 'Number Theory', theoremCount: 18 },
        { name: 'Geometry', theoremCount: 24 },
        { name: 'Algebra', theoremCount: 16 },
        { name: 'Calculus', theoremCount: 12 }
      ],
      proofMethods: [
        { name: 'Direct Proof', examples: 42 },
        { name: 'Contradiction', examples: 28 },
        { name: 'Induction', examples: 35 },
        { name: 'Combinatorial', examples: 19 }
      ]
    }
  },
  {
    id: 'numerical-1',
    name: 'Engineering Mathematics',
    type: 'Numerical Navigator',
    title: 'Engineering Mathematics',
    description: 'Solve complex engineering calculations with step-by-step guidance',
    icon: '🧮',
    timestamp: 150,
    topic: 'Engineering',
    content: {
      problems: [
        {
          id: 'n1',
          title: 'Heat Transfer in a Rod',
          description: 'Calculate temperature distribution in a 1m rod with ends at 0°C and 100°C',
          equation: '∂T/∂t = α ∂²T/∂x²',
          method: 'Finite Difference Method',
          steps: [
            {
              step: 1,
              equation: 'Discretize: Δx = 0.1m, Δt = 0.01s',
              explanation: 'Divide rod into 10 segments'
            },
            {
              step: 2,
              equation: 'T_i^{n+1} = T_i^n + (αΔt/Δx²)(T_{i+1}^n - 2T_i^n + T_{i-1}^n)',
              explanation: 'Explicit finite difference scheme'
            },
            {
              step: 3,
              equation: 'Set α = 1.2×10^{-5} m²/s',
              explanation: 'Thermal diffusivity of steel'
            },
            {
              step: 4,
              equation: 'Apply boundary conditions: T(0,t)=0°C, T(1,t)=100°C',
              explanation: 'Constant temperature ends'
            },
            {
              step: 5,
              equation: 'Initial condition: T(x,0)=0°C',
              explanation: 'Uniform initial temperature'
            }
          ],
          solution: 'After 100s: T(0.5) ≈ 48.7°C',
          parameters: {
            Δx: [0.1, 0.05, 0.01],
            Δt: [0.01, 0.005, 0.001],
            α: [1.2e-5, 1.1e-5, 1.3e-5]
          },
          accuracy: 0.01,
          timeRequired: 8
        },
        {
          id: 'n2',
          title: 'Beam Deflection Calculation',
          description: 'Calculate maximum deflection of a simply supported beam with central load',
          equation: 'd²y/dx² = M/EI',
          method: 'Integration Method',
          steps: [
            {
              step: 1,
              equation: 'M = (P/2)x for 0≤x≤L/2',
              explanation: 'Bending moment equation'
            },
            {
              step: 2,
              equation: 'EI d²y/dx² = (P/2)x',
              explanation: 'Differential equation of deflection curve'
            },
            {
              step: 3,
              equation: 'Integrate: EI dy/dx = (P/4)x² + C₁',
              explanation: 'First integration'
            },
            {
              step: 4,
              equation: 'Integrate again: EI y = (P/12)x³ + C₁x + C₂',
              explanation: 'Second integration'
            },
            {
              step: 5,
              equation: 'Apply BC: y(0)=0 ⇒ C₂=0',
              explanation: 'Boundary condition at support'
            },
            {
              step: 6,
              equation: 'Symmetry: dy/dx(L/2)=0 ⇒ C₁ = -PL²/16',
              explanation: 'Slope at center is zero'
            }
          ],
          solution: 'y_max = -PL³/(48EI) at x=L/2',
          parameters: {
            P: [1000, 5000, 10000],
            L: [2, 3, 4],
            E: [200e9, 210e9],
            I: [4.5e-6, 5.2e-6]
          },
          accuracy: 0.001,
          timeRequired: 12
        }
      ],
      methods: [
        { 
          name: 'Numerical Integration', 
          examples: [
            'Trapezoidal Rule',
            'Simpson\'s Rule',
            'Gaussian Quadrature'
          ] 
        },
        { 
          name: 'Root Finding', 
          examples: [
            'Bisection Method',
            'Newton-Raphson',
            'Secant Method'
          ] 
        },
        { 
          name: 'ODE Solvers', 
          examples: [
            'Euler Method',
            'Runge-Kutta',
            'Adams-Bashforth'
          ] 
        }
      ],
      domains: [
        { name: 'Mechanical Engineering', problemCount: 35 },
        { name: 'Electrical Engineering', problemCount: 28 },
        { name: 'Civil Engineering', problemCount: 42 },
        { name: 'Chemical Engineering', problemCount: 19 }
      ]
    }
  }
];

export const allModules = moduleData.map(module => ({
  id: module.id,
  type: module.type,
  title: module.title || module.name,
  description: module.description,
  icon: module.icon
}));