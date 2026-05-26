/**
 * topics.config.js — Single source of truth for topic registration
 *
 * HOW TO ADD A NEW TOPIC:
 * 1. Add the topic's id (filename without .html) to TOPIC_ORDER at the right position
 * 2. Optionally add metadata to TOPIC_META (category, icon, description)
 * 3. That's it — navigation, cards, breadcrumbs all update automatically
 *
 * Auto-generated defaults (no metadata needed):
 *   id: 'streams-api' → title: 'Streams API', file: 'streams-api.html', category: 'Fundamentals'
 */

/**
 * Controls display order and registration of all topics.
 * Add a topic id here to make it appear everywhere on the site.
 * @type {string[]}
 */
export const TOPIC_ORDER = [
  // ── Fundamentals ──────────────────────────────────────────────
  'java-basics',
  'variables-and-data-types',
  'operators',
  'control-flow',
  'methods',
  'arrays',

  // ── Object-Oriented Programming ───────────────────────────────
  'oops',
  'inheritance',
  'polymorphism',
  'abstraction',
  'encapsulation',
  'interfaces',

  // ── Core Java ─────────────────────────────────────────────────
  'exception-handling',
  'collections',
  'generics',
  'streams-api',
  'lambda-expressions',
  'optional',

  // ── Advanced ──────────────────────────────────────────────────
  'multithreading',
  'concurrency',
  'jvm-internals',
  'memory-management',
  'design-patterns',

  // ── Spring Boot ───────────────────────────────────────────────
  'springboot',
  'spring-rest-api',
  'spring-data-jpa',
  'spring-security',
];

/**
 * Optional metadata overrides for topics.
 * Keys are topic ids (matching TOPIC_ORDER entries).
 * Any field omitted here will be auto-generated from the id.
 *
 * @type {Object.<string, {category?: string, icon?: string, description?: string, title?: string}>}
 */
export const TOPIC_META = {
  // ── Fundamentals ──────────────────────────────────────────────
  'java-basics': {
    category: 'Fundamentals',
    icon: '☕',
    description: 'JVM, JDK, JRE, Hello World, and the basics of Java.',
  },
  'variables-and-data-types': {
    category: 'Fundamentals',
    icon: '📦',
    description: 'Primitive types, reference types, type casting, and constants.',
  },
  'operators': {
    category: 'Fundamentals',
    icon: '➕',
    description: 'Arithmetic, relational, logical, bitwise, and ternary operators.',
  },
  'control-flow': {
    category: 'Fundamentals',
    icon: '🔀',
    description: 'if/else, switch, for, while, do-while, break, and continue.',
  },
  'methods': {
    category: 'Fundamentals',
    icon: '🔧',
    description: 'Method declarations, parameters, return types, and overloading.',
  },
  'arrays': {
    category: 'Fundamentals',
    icon: '🗃️',
    description: '1D/2D arrays, array iteration, and common array operations.',
  },

  // ── Object-Oriented Programming ───────────────────────────────
  'oops': {
    category: 'Object-Oriented Programming',
    icon: '🧱',
    description: 'Classes, objects, constructors, and the four pillars of OOP.',
  },
  'inheritance': {
    category: 'Object-Oriented Programming',
    icon: '🧬',
    description: 'Extending classes, super keyword, and method overriding.',
  },
  'polymorphism': {
    category: 'Object-Oriented Programming',
    icon: '🦋',
    description: 'Compile-time and runtime polymorphism in Java.',
  },
  'abstraction': {
    category: 'Object-Oriented Programming',
    icon: '🎭',
    description: 'Abstract classes and the purpose of hiding implementation details.',
  },
  'encapsulation': {
    category: 'Object-Oriented Programming',
    icon: '🔒',
    description: 'Access modifiers, getters, setters, and data hiding.',
  },
  'interfaces': {
    category: 'Object-Oriented Programming',
    icon: '🔌',
    description: 'Interface definitions, default methods, and multiple inheritance.',
  },

  // ── Core Java ─────────────────────────────────────────────────
  'exception-handling': {
    category: 'Core Java',
    icon: '⚠️',
    description: 'try/catch/finally, checked vs unchecked, and custom exceptions.',
  },
  'collections': {
    category: 'Core Java',
    icon: '📚',
    description: 'List, Set, Map, Queue — the Java Collections Framework.',
  },
  'generics': {
    category: 'Core Java',
    icon: '🧩',
    description: 'Type parameters, bounded wildcards, and generic methods.',
  },
  'streams-api': {
    category: 'Core Java',
    icon: '🌊',
    description: 'Stream pipeline, filter, map, reduce, and collectors.',
  },
  'lambda-expressions': {
    category: 'Core Java',
    icon: 'λ',
    description: 'Functional interfaces, lambda syntax, and method references.',
  },
  'optional': {
    category: 'Core Java',
    icon: '❓',
    description: 'Avoiding NullPointerException with Optional<T>.',
  },

  // ── Advanced ──────────────────────────────────────────────────
  'multithreading': {
    category: 'Advanced',
    icon: '🧵',
    description: 'Thread lifecycle, synchronization, and the Executor framework.',
  },
  'concurrency': {
    category: 'Advanced',
    icon: '⚡',
    description: 'CompletableFuture, atomic variables, and concurrent collections.',
  },
  'jvm-internals': {
    category: 'Advanced',
    icon: '⚙️',
    description: 'Class loading, bytecode, JIT compilation, and the JVM architecture.',
  },
  'memory-management': {
    category: 'Advanced',
    icon: '🧠',
    description: 'Heap, stack, garbage collection algorithms, and memory leaks.',
  },
  'design-patterns': {
    category: 'Advanced',
    icon: '🏛️',
    description: 'Singleton, Factory, Observer, Strategy, and other GoF patterns.',
  },

  // ── Spring Boot ───────────────────────────────────────────────
  'springboot': {
    category: 'Spring Boot',
    icon: '🌱',
    description: 'Auto-configuration, starters, and building your first Spring app.',
  },
  'spring-rest-api': {
    category: 'Spring Boot',
    icon: '🔗',
    description: 'REST controllers, request mapping, and response handling.',
  },
  'spring-data-jpa': {
    category: 'Spring Boot',
    icon: '🗄️',
    description: 'Repositories, entities, JPQL queries, and database integration.',
  },
  'spring-security': {
    category: 'Spring Boot',
    icon: '🛡️',
    description: 'Authentication, authorization, JWT, and securing REST endpoints.',
  },
};
