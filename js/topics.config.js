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
 * High-level learning pathways grouping the topic categories.
 */
export const PATHWAYS = {
  java: {
    id: 'java',
    title: 'Java',
    icon: '☕',
    description: 'Master Java from basic syntax to advanced concurrency, JVM internals, and design patterns.',
    categories: ['Fundamentals', 'Object-Oriented Programming', 'Core Java', 'Advanced', 'Java Interview Q&A', 'DSA Interview Q&A'],
  },
  springboot: {
    id: 'springboot',
    title: 'Spring Boot',
    icon: '🌱',
    description: 'Build enterprise-grade REST APIs, data layers with JPA, and secure endpoints with JWT.',
    categories: ['Spring Boot', 'Spring Boot Core Concepts', 'Web & REST API', 'Data & JPA', 'Transactions', 'Security', 'Cloud & Messaging', 'Spring Boot Interview Q&A'],
  },
  aws: {
    id: 'aws',
    title: 'AWS',
    icon: '☁️',
    description: 'Understand cloud foundations, secure access control with IAM, and deploy Spring Boot apps on EC2.',
    categories: ['AWS Cloud'],
  },
  kafka: {
    id: 'kafka',
    title: 'Kafka',
    icon: '🐿️',
    description: 'Master event-driven message streaming, partitions, replication, and Spring Kafka integration.',
    categories: ['Kafka Messaging', 'Kafka Interview Q&A'],
  },
  microservices: {
    id: 'microservices',
    title: 'Microservices',
    icon: '🕸️',
    description: 'Design resilient distributed architectures using Spring Cloud Eureka, Gateway, and Resilience4j.',
    categories: ['Microservices', 'Microservices Interview Q&A'],
  },
  interview: {
    id: 'interview',
    title: 'Interview Prep',
    icon: '💼',
    description: 'Crack senior backend interviews with 150+ high-frequency Q&As in Java, Spring Boot, Microservices, and DSA.',
    categories: ['Java Interview Q&A', 'Spring Boot Core Concepts', 'Web & REST API', 'Data & JPA', 'Transactions', 'Security', 'Cloud & Messaging', 'Spring Boot Interview Q&A', 'Microservices Interview Q&A', 'Kafka Interview Q&A', 'DSA Interview Q&A'],
  },
  studyplan: {
    id: 'studyplan',
    title: '60-Day Plan',
    icon: '📅',
    description: 'A day-by-day structured curriculum with daily targets, checklists, mentor deep dives, and mock interviews.',
    categories: ['Weeks 1–2: Core Java', 'Weeks 3–4: Advanced Java', 'Weeks 5–6: Spring Boot', 'Weeks 7–8: Microservices & Cloud', 'Weeks 9–10: System Design'],
  },
  keytopics: {
    id: 'keytopics',
    title: 'Key Topics',
    icon: '🔑',
    description: 'Deep dive into interactive visual simulators, system design masterclasses, and step-by-step animation reels.',
    categories: ['System Design & Architecture', 'Java Memory & Concurrency Reels', 'Design Patterns & Web Masterclasses'],
  },
  notes: {
    id: 'notes',
    title: 'My Notes',
    icon: '📝',
    description: 'Your personal scratchpad notes collected from all study checklists.',
    categories: ['My Notes'],
  },
  profile: {
    id: 'profile',
    title: 'My Profile',
    icon: '👤',
    description: 'View your account details, global progress, and synced data.',
    categories: []
  }
};

/**
 * Controls display order and registration of all topics.
 * Add a topic id here to make it appear everywhere on the site.
 * @type {string[]}
 */
export const TOPIC_ORDER = [
  // ── Fundamentals ──────────────────────────────────────────────
  'java-basics',
  'java/variables_data_types',
  'java/java_operators',

  // ── Object-Oriented Programming ───────────────────────────────
  'java/java_oop_concepts',

  // ── Core Java ─────────────────────────────────────────────────
  'java/java_collections_framework',
  'java/java_streams_api',

  // ── Advanced ──────────────────────────────────────────────────
  'multithreading',
  'java/java_21_modern_concurrency',

  // ── Java Interview Q&A ──────────────────────────────────────────
  'questions and answers/java/multithreading_30qa',
  'questions and answers/java/java8_interview_prep (2)',

  // ── DSA Interview Q&A ───────────────────────────────────────────
  'questions and answers/dsa/dsa_top50_q1_5',
  'questions and answers/dsa/dsa_top50_q6_10',
  'questions and answers/dsa/dsa_top50_q11_15',
  'questions and answers/dsa/dsa_top50_q16_20',
  'questions and answers/dsa/dsa_top50_q21_25',
  'questions and answers/dsa/dsa_top50_q26_30',

  // ── Spring Boot ───────────────────────────────────────────────
  'springboot',

  // ── Spring Boot Interview Q&A ──────────────────────────────────
  'questions and answers/spring boot/springboot_qa_p1',
  'spring-boot/spring_boot_internals',
  'spring-boot/stereotypes',
  'spring-boot/stereotype_annotations',
  'spring-boot/bean_scopes',
  'spring-boot/autowired_internals',
  'spring-boot/ambiguity_resolution',
  'spring-boot/request_lifecycle',
  'spring-boot/restcontroller',
  'spring-boot/request_mapping_annotations',
  'spring-boot/path_variable_vs_request_param',
  'spring-boot/global_error_handling',
  'spring-boot/spring_data_jpa',
  'spring-boot/jpa_lifecycle',
  'spring-boot/onetoone_mapping',
  'spring-boot/onetomany_mapping',
  'spring-boot/manytomany_mapping',
  'spring-boot/transactional_guide',
  'spring-boot/transaction_propagation',
  'spring-boot/rollback_mechanism',
  'spring-boot/spring_security',
  'spring-boot/authentication_vs_authorization',
  'spring-boot/jwt_authentication',
  'spring-boot/aws_day19_sqs_sns_eventbridge',


  // ── AWS Cloud ─────────────────────────────────────────────────
  'aws/aws_day1_full_session',
  'aws/aws_day2_ec2',
  'aws/aws_day3_s3',
  'aws/aws_day4_vpc',
  'aws/aws_day5_iam',
  'aws/aws_day6_cli_sdk',
  'aws/aws_day7_ec2_deep',
  'aws/aws_day8_alb_asg',
  'aws/aws_day9_rds',
  'aws/aws_day10_e2e_deployment',
  'aws/aws_day11_route53_cloudfront',
  'aws/aws_day12_ecs_docker',
  'aws/aws_day13_elasticache_dynamodb',
  'aws/aws_day14_cloudwatch',
  'aws/aws_day15_cicd',

  // ── Kafka Messaging ───────────────────────────────────────────
  'kafka/kafka-basics',
  'kafka/kafka-architecture',
  'kafka/spring-kafka',
  'kafka/what_is_consumer_group',

  // ── Kafka Interview Q&A ───────────────────────────────────────
  'questions and answers/kafka/kafka_top20',

  // ── Microservices ─────────────────────────────────────────────
  'microservices/service-discovery',
  'microservices/api-gateway',
  'microservices/resilience4j',

  // ── Microservices Interview Q&A ────────────────────────────────
  'questions and answers/microservices/microservices_top10',

  // ── 60-Day Study Plan Checklists ──────────────────────────────
  'checklists/day1',
  'checklists/day2',
  'checklists/day3',
  'checklists/day4',
  'checklists/day5',
  'checklists/day6',
  'checklists/day7',
  'checklists/day8',
  'checklists/day9',
  'checklists/day10',
  'checklists/day11',
  'checklists/day12',
  'checklists/day13',
  'checklists/day14',
  'checklists/day15',
  'checklists/day16',
  'checklists/day17',
  'checklists/day18',
  'checklists/day19',
  'checklists/day20',
  'checklists/day21',
  'checklists/day22',
  'checklists/day24',
  'checklists/day29',
  'checklists/day30',
  'checklists/day31',
  'checklists/day32',
  'checklists/day33',
  'checklists/day43',
  'checklists/day44',
  'checklists/day46',
  'checklists/day47',
  'checklists/day48',
  'checklists/day49',
  'checklists/day51',
  'checklists/day52',
  'checklists/day53',
  'checklists/day55',
  'checklists/day56',
  'checklists/day57',
  'checklists/day58',
  'checklists/day59',
  'checklists/day60',

  // ── Key Topics: System Design & Architecture ──────────────────
  'key-topics/acid_properties_masterclass',
  'key-topics/api_gateway_masterclass',
  'key-topics/api_rate_limiting_masterclass',
  'key-topics/client_server_model_architecture',
  'key-topics/enterprise_load_balancer_flow',
  'key-topics/enterprise_service_discovery_reel',
  'key-topics/fintech_resilience_masterclass',
  'key-topics/fintech_saga_pattern_masterclass',
  'key-topics/microservice_communication_masterclass',
  'key-topics/saga_pattern_flow',
  'key-topics/spring_cloud_gateway_flow',
  'key-topics/system_design_sandbox',

  // ── Key Topics: Java Memory & Concurrency Reels ──────────────
  'key-topics/concurrenthashmap_internals_reel',
  'key-topics/functional_interfaces_reel',
  'key-topics/hashmap_internal_flow_reel',
  'key-topics/java_8_aurora_reel',
  'key-topics/java_core_concepts_reel',
  'key-topics/java_memory_internals_reel',
  'key-topics/java_string_internals_reel',
  'key-topics/jvm_architecture_deep_dive',
  'key-topics/spring_bean_lifecycle_reel',

  // ── Key Topics: Design Patterns & Web Masterclasses ──────────
  'key-topics/enterprise_rest_masterclass',
  'key-topics/factory_patterns_masterclass',
  'key-topics/java_exceptions_masterclass',
  'key-topics/jwt_stateless_auth_flow',
  'key-topics/singleton_pattern_masterclass',
  'key-topics/spring_boot_3_tier_architecture',
  'key-topics/spring_boot_actuator_claude_theme',
  'key-topics/spring_boot_configuration_reel',
  'key-topics/spring_boot_request_flow',
  'key-topics/spring_boot_routing_engine',
  'key-topics/spring_mvc_routing_engine_reel',
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
  'java/variables_data_types': {
    category: 'Fundamentals',
    icon: '📦',
    title: 'Variables & Data Types',
    description: 'Learn about stack vs heap storage, primitive data types, default values, casting traps, and local type inference.',
  },
  'java/java_operators': {
    category: 'Fundamentals',
    icon: '➕',
    title: 'Java Operators',
    description: 'Master arithmetic, relational, logical, bitwise, assignment, and ternary operators, along with precedence rules.',
  },
  'java/java_oop_concepts': {
    category: 'Object-Oriented Programming',
    icon: '🧱',
    title: 'OOP Concepts',
    description: 'Understand the pillars of Object-Oriented Programming in Java: Inheritance, Polymorphism, Abstraction, and Encapsulation.',
  },
  'java/java_collections_framework': {
    category: 'Core Java',
    icon: '📚',
    title: 'Collections Framework',
    description: 'Deep dive into List, Set, Map, Queue implementations, performance complexity, and custom key hashing rules.',
  },
  'java/java_streams_api': {
    category: 'Core Java',
    icon: '🌊',
    title: 'Streams API',
    description: 'Master functional pipelines, lazy evaluation, intermediate and terminal operations, collectors, and parallel streams.',
  },
  'multithreading': {
    category: 'Advanced',
    icon: '🧵',
    description: 'Thread lifecycle, synchronization, and the Executor framework.',
  },
  'java/java_21_modern_concurrency': {
    category: 'Advanced',
    icon: '🚀',
    title: 'Java 21+ Modern Concurrency',
    description: 'Virtual Threads (Loom), Structured Concurrency, Scoped Values, and modern switch expressions.',
  },

  // ── Spring Boot ───────────────────────────────────────────────
  'springboot': {
    category: 'Spring Boot',
    icon: '🌱',
    description: 'Auto-configuration, starters, and building your first Spring app.',
  },


  // ─── AWS Cloud ─────────────────────────────────────────────────
  'aws/aws_day1_full_session': {
    category: 'AWS Cloud',
    icon: '☁️',
    title: 'Cloud Foundations & IAM',
    description: 'Understand Regions, AZs, Edge Locations, and secure root credentials.',
  },
  'aws/aws_day2_ec2': {
    category: 'AWS Cloud',
    icon: '💻',
    title: 'EC2 Virtual Machines',
    description: 'Provision virtual servers, AMIs, Key Pairs, and Security Groups.',
  },
  'aws/aws_day3_s3': {
    category: 'AWS Cloud',
    icon: '🗄️',
    title: 'S3 Object Storage',
    description: 'Master S3 internals, storage classes, encryption, bucket policies, and presigned URLs.',
  },
  'aws/aws_day4_vpc': {
    category: 'AWS Cloud',
    icon: '🌐',
    title: 'VPC Networking',
    description: 'Understand CIDR blocks, subnets, route tables, IGW, NAT Gateway, and VPC Endpoints.',
  },
  'aws/aws_day5_iam': {
    category: 'AWS Cloud',
    icon: '🔐',
    title: 'IAM Security Deep Dive',
    description: 'Deep dive into IAM policies, roles, user groups, evaluation logic, and cross-account access.',
  },
  'aws/aws_day6_cli_sdk': {
    category: 'AWS Cloud',
    icon: '🛠️',
    title: 'AWS CLI & Java SDK',
    description: 'Configure the AWS CLI, write SDK code in Java, and work with TransferManager.',
  },
  'aws/aws_day7_ec2_deep': {
    category: 'AWS Cloud',
    icon: '⚙️',
    title: 'EC2 Advanced Concepts',
    description: 'Explore Instance Metadata (IMDS), hibernation, placement groups, and EBS performance.',
  },
  'aws/aws_day8_alb_asg': {
    category: 'AWS Cloud',
    icon: '⚖️',
    title: 'ALB & Auto Scaling',
    description: 'Implement High Availability using Application Load Balancers and Auto Scaling Groups.',
  },
  'aws/aws_day9_rds': {
    category: 'AWS Cloud',
    icon: '💾',
    title: 'RDS Relational Database',
    description: 'Deploy managed databases with Multi-AZ replication, failovers, and read replicas.',
  },
  'aws/aws_day10_e2e_deployment': {
    category: 'AWS Cloud',
    icon: '🚀',
    title: 'E2E Spring Boot Deploy',
    description: 'Deploy a Spring Boot REST API from scratch on EC2 behind an ALB with systemd.',
  },
  'aws/aws_day11_route53_cloudfront': {
    category: 'AWS Cloud',
    icon: '📡',
    title: 'Route 53 & CloudFront',
    description: 'Domain management, DNS routing policies, ACM SSL, and CloudFront edge caching.',
  },
  'aws/aws_day12_ecs_docker': {
    category: 'AWS Cloud',
    icon: '📦',
    title: 'ECS & Docker Containers',
    description: 'Containerise Spring Boot, push to ECR, and run scalable container tasks with Fargate.',
  },
  'aws/aws_day13_elasticache_dynamodb': {
    category: 'AWS Cloud',
    icon: '⚡',
    title: 'ElastiCache & DynamoDB',
    description: 'Accelerate applications with Redis caching and learn DynamoDB schema design.',
  },
  'aws/aws_day14_cloudwatch': {
    category: 'AWS Cloud',
    icon: '📊',
    title: 'CloudWatch Deep Dive',
    description: 'Understand CloudWatch metrics storage, namespaces, custom EMF formatting, alarms, and Logs Insights queries.',
  },
  'aws/aws_day15_cicd': {
    category: 'AWS Cloud',
    icon: '🚀',
    title: 'CI/CD Pipelines on AWS',
    description: 'Understand continuous integration/continuous deployment pipelines with CodePipeline, CodeBuild, CodeDeploy, and Bitbucket integration.',
  },

  // ─── Kafka Messaging ───────────────────────────────────────────
  'kafka/what_is_consumer_group': {
    category: 'Kafka Messaging',
    icon: '👥',
    title: 'What is a Consumer Group?',
    description: 'Understand consumer groups, rebalancing, and parallel message processing in Kafka.',
  },
  'kafka/kafka-basics': {
    category: 'Kafka Messaging',
    icon: '🐿️',
    title: 'Kafka Basics & Setup',
    description: 'Introduction to publish-subscribe messaging, topics, and local environment setup.',
    isLocked: true,
  },
  'kafka/kafka-architecture': {
    category: 'Kafka Messaging',
    icon: '⚙️',
    title: 'Core Broker Architecture',
    description: 'Deep dive into partitions, offsets, consumer groups, and replication factors.',
    isLocked: true,
  },
  'kafka/spring-kafka': {
    category: 'Kafka Messaging',
    icon: '🌱',
    title: 'Spring Kafka Integration',
    description: 'Configure producers, consumers, serialisers, and error handlers in Spring Boot.',
    isLocked: true,
  },

  // ─── Kafka Interview Q&A ───────────────────────────────────────
  'questions and answers/kafka/kafka_top20': {
    category: 'Kafka Interview Q&A',
    icon: '🐿️',
    title: 'Kafka Top 20 Q&A',
    description: '20 critical questions on Kafka partitions, offsets, consumers, brokers, and architecture.',
  },

  // ─── Microservices ─────────────────────────────────────────────
  'microservices/service-discovery': {
    category: 'Microservices',
    icon: '🔍',
    title: 'Service Discovery (Eureka)',
    description: 'Register and locate microservices dynamically using Spring Cloud Eureka.',
    isLocked: true,
  },
  'microservices/api-gateway': {
    category: 'Microservices',
    icon: '🚪',
    title: 'API Gateway & Routing',
    description: 'Build a centralized routing entry point with Spring Cloud Gateway.',
    isLocked: true,
  },
  'microservices/resilience4j': {
    category: 'Microservices',
    icon: '🛡️',
    title: 'Fault Tolerance & Resiliency',
    description: 'Implement Circuit Breakers, Rate Limiters, and Retries with Resilience4j.',
    isLocked: true,
  },

  // ─── Java Interview Q&A ──────────────────────────────────────────
  'questions and answers/java/multithreading_30qa': {
    category: 'Java Interview Q&A',
    icon: '⚡',
    title: 'Multithreading Concurrency Q&A',
    description: '30 high-frequency multithreading and concurrency interview questions.',
  },
  'questions and answers/java/java8_interview_prep (2)': {
    category: 'Java Interview Q&A',
    icon: '☕',
    title: 'Java 8 Features Q&A',
    description: 'Complete guide to Streams, Lambda expressions, Optional, and functional interfaces.',
  },

  // ─── Spring Boot Interview Q&A ──────────────────────────────────
  'questions and answers/spring boot/springboot_qa_p1': {
    category: 'Spring Boot Interview Q&A',
    icon: '🌱',
    title: 'Spring Boot 50 Q&A',
    description: 'Deep-dive Q&As covering auto-configuration, WebFlux, security, and JPA.',
  },
'spring-boot/ambiguity_resolution': {
    category: 'Spring Boot Interview Q&A',
    icon: '🌱',
    title: 'Ambiguity Resolution',
    description: 'Learn about Ambiguity Resolution in Spring Boot.',
  },
  'spring-boot/authentication_vs_authorization': {
    category: 'Security',
    icon: '🌱',
    title: 'Authentication Vs Authorization',
    description: 'Learn about Authentication Vs Authorization in Spring Boot.',
  },
  'spring-boot/autowired_internals': {
    category: 'Spring Boot Core Concepts',
    icon: '🌱',
    title: 'Autowired Internals',
    description: 'Learn about Autowired Internals in Spring Boot.',
  },
  'spring-boot/aws_day19_sqs_sns_eventbridge': {
    category: 'Cloud & Messaging',
    icon: '🌱',
    title: 'Aws Day19 Sqs Sns Eventbridge',
    description: 'Learn about Aws Day19 Sqs Sns Eventbridge in Spring Boot.',
  },
  'spring-boot/bean_scopes': {
    category: 'Spring Boot Core Concepts',
    icon: '🌱',
    title: 'Bean Scopes',
    description: 'Learn about Bean Scopes in Spring Boot.',
  },
  'spring-boot/global_error_handling': {
    category: 'Web & REST API',
    icon: '🌱',
    title: 'Global Error Handling',
    description: 'Learn about Global Error Handling in Spring Boot.',
  },
  'spring-boot/jpa_lifecycle': {
    category: 'Data & JPA',
    icon: '🌱',
    title: 'Jpa Lifecycle',
    description: 'Learn about Jpa Lifecycle in Spring Boot.',
  },
  'spring-boot/jwt_authentication': {
    category: 'Security',
    icon: '🌱',
    title: 'Jwt Authentication',
    description: 'Learn about Jwt Authentication in Spring Boot.',
  },
  'spring-boot/manytomany_mapping': {
    category: 'Data & JPA',
    icon: '🌱',
    title: 'Manytomany Mapping',
    description: 'Learn about Manytomany Mapping in Spring Boot.',
  },
  'spring-boot/onetomany_mapping': {
    category: 'Data & JPA',
    icon: '🌱',
    title: 'Onetomany Mapping',
    description: 'Learn about Onetomany Mapping in Spring Boot.',
  },
  'spring-boot/onetoone_mapping': {
    category: 'Data & JPA',
    icon: '🌱',
    title: 'Onetoone Mapping',
    description: 'Learn about Onetoone Mapping in Spring Boot.',
  },
  'spring-boot/path_variable_vs_request_param': {
    category: 'Web & REST API',
    icon: '🌱',
    title: 'Path Variable Vs Request Param',
    description: 'Learn about Path Variable Vs Request Param in Spring Boot.',
  },
  'spring-boot/request_lifecycle': {
    category: 'Web & REST API',
    icon: '🌱',
    title: 'Request Lifecycle',
    description: 'Learn about Request Lifecycle in Spring Boot.',
  },
  'spring-boot/request_mapping_annotations': {
    category: 'Web & REST API',
    icon: '🌱',
    title: 'Request Mapping Annotations',
    description: 'Learn about Request Mapping Annotations in Spring Boot.',
  },
  'spring-boot/restcontroller': {
    category: 'Web & REST API',
    icon: '🌱',
    title: 'Restcontroller',
    description: 'Learn about Restcontroller in Spring Boot.',
  },
  'spring-boot/rollback_mechanism': {
    category: 'Transactions',
    icon: '🌱',
    title: 'Rollback Mechanism',
    description: 'Learn about Rollback Mechanism in Spring Boot.',
  },
  'spring-boot/spring_boot_internals': {
    category: 'Spring Boot Core Concepts',
    icon: '🌱',
    title: 'Spring Boot Internals',
    description: 'Learn about Spring Boot Internals in Spring Boot.',
  },
  'spring-boot/spring_data_jpa': {
    category: 'Data & JPA',
    icon: '🌱',
    title: 'Spring Data Jpa',
    description: 'Learn about Spring Data Jpa in Spring Boot.',
  },
  'spring-boot/spring_security': {
    category: 'Security',
    icon: '🌱',
    title: 'Spring Security',
    description: 'Learn about Spring Security in Spring Boot.',
  },
  'spring-boot/stereotype_annotations': {
    category: 'Spring Boot Core Concepts',
    icon: '🌱',
    title: 'Stereotype Annotations',
    description: 'Learn about Stereotype Annotations in Spring Boot.',
  },
  'spring-boot/stereotypes': {
    category: 'Spring Boot Core Concepts',
    icon: '🌱',
    title: 'Stereotypes',
    description: 'Learn about Stereotypes in Spring Boot.',
  },
  'spring-boot/transaction_propagation': {
    category: 'Transactions',
    icon: '🌱',
    title: 'Transaction Propagation',
    description: 'Learn about Transaction Propagation in Spring Boot.',
  },
  'spring-boot/transactional_guide': {
    category: 'Transactions',
    icon: '🌱',
    title: 'Transactional Guide',
    description: 'Learn about Transactional Guide in Spring Boot.',
  },

  // ─── Microservices Interview Q&A ────────────────────────────────
  'questions and answers/microservices/microservices_top10': {
    category: 'Microservices Interview Q&A',
    icon: '🕸️',
    title: 'Microservices Top 10 Q&A',
    description: '10 critical questions on service discovery, gateways, and resilience.',
  },

  // ─── DSA Interview Q&A ───────────────────────────────────────────
  'questions and answers/dsa/dsa_top50_q1_5': {
    category: 'DSA Interview Q&A',
    icon: '🧱',
    title: 'DSA Top 50: Q1–Q5 (Arrays & Two Pointers)',
    description: 'Two Sum, Best Time to Buy/Sell Stock, Container With Most Water, Longest Substring, Product of Array Except Self.',
  },
  'questions and answers/dsa/dsa_top50_q6_10': {
    category: 'DSA Interview Q&A',
    icon: '⚙️',
    title: 'DSA Top 50: Q6–Q10 (Arrays Advanced)',
    description: '3Sum, Maximum Subarray (Kadane\'s), Merge Intervals, Find the Duplicate Number, Rotate Array.',
  },
  'questions and answers/dsa/dsa_top50_q11_15': {
    category: 'DSA Interview Q&A',
    icon: '🛡️',
    title: 'DSA Top 50: Q11–Q15 (Stack & Binary Search)',
    description: 'Valid Parentheses, Min Stack, Binary Search, Search in Rotated Array, Find Minimum in Rotated Array.',
  },
  'questions and answers/dsa/dsa_top50_q16_20': {
    category: 'DSA Interview Q&A',
    icon: '🔗',
    title: 'DSA Top 50: Q16–Q20 (Linked Lists)',
    description: 'Linked List Cycle, Reverse Linked List, Merge Two Sorted Lists, Reorder List, Remove Nth Node From End.',
  },
  'questions and answers/dsa/dsa_top50_q21_25': {
    category: 'DSA Interview Q&A',
    icon: '⚡',
    title: 'DSA Top 50: Q21–Q25 (Dynamic Programming)',
    description: 'Climbing Stairs, House Robber, Coin Change, Longest Common Subsequence, Word Break.',
  },
  'questions and answers/dsa/dsa_top50_q26_30': {
    category: 'DSA Interview Q&A',
    icon: '🕸️',
    title: 'DSA Top 50: Q26–Q30 (Graphs BFS/DFS)',
    description: 'Number of Islands, Clone Graph, Pacific Atlantic Water Flow, Course Schedule, Surrounded Regions.',
  },
  'checklists/day1': {
    category: 'Weeks 1–2: Core Java',
    icon: '📅',
    title: 'Day 1: OOP, Memory & Keywords',
    description: 'JVM Memory (Stack vs Heap, String Pool), OOP pillars, static/final/transient/volatile, auto-boxing traps, exceptions.',
  },
  'checklists/day2': {
    category: 'Weeks 1–2: Core Java',
    icon: '📅',
    title: 'Day 2: Java 8 Features & Streams',
    description: 'Lambdas & Functional Interfaces (Predicate, Function, Consumer, Supplier), Streams intermediate/terminal ops, Optional.',
  },
  'checklists/day3': {
    category: 'Weeks 1–2: Core Java',
    icon: '📅',
    title: 'Day 3: Java 11–17 & Multithreading',
    description: 'Modern Java features (var, text blocks, records, sealed classes, pattern matching), Thread lifecycle, synchronized, wait/notify.',
  },
  'checklists/day4': {
    category: 'Weeks 1–2: Core Java',
    icon: '📅',
    title: 'Day 4: Collections Framework Internals',
    description: 'ArrayList and LinkedList internals, HashMap hashing, collision, resize, Java 8 tree, HashSet, LinkedHashMap, TreeMap, TreeSet.',
  },
  'checklists/day5': {
    category: 'Weeks 5–6: Spring Boot',
    icon: '📅',
    title: 'Day 5: Spring Boot & JPA Internals',
    description: 'Spring IoC, DI, Bean lifecycle, Spring Boot REST APIs, JPA and Hibernate (N+1 problem, fetch types, @Transactional).',
  },
  'checklists/day6': {
    category: 'Weeks 7–8: Microservices & Cloud',
    icon: '📅',
    title: 'Day 6: Microservices & Resilience',
    description: 'Microservices fundamentals, Resilience patterns (Circuit Breaker, Retry, Bulkhead, rate limiting), Distributed Transactions (Saga pattern).',
  },
  'checklists/day7': {
    category: 'Weeks 7–8: Microservices & Cloud',
    icon: '📅',
    title: 'Day 7: Apache Kafka Architecture',
    description: 'Kafka Brokers, Topics, Partitions, Offsets, Replication, Idempotent Producers, Consumer groups, offset commit strategies.',
  },
  'checklists/day8': {
    category: 'Weeks 7–8: Microservices & Cloud',
    icon: '📅',
    title: 'Day 8: AWS Deep Dive & Terraform',
    description: 'S3 storage, lifecycle, presigned URLs, IAM roles vs users, least privilege, EC2 virtual machines, launch templates, ASG scaling.',
  },
  'checklists/day9': {
    category: 'Weeks 5–6: Spring Boot',
    icon: '📅',
    title: 'Day 9: SQL Mastery & DB Optimization',
    description: 'Joins, subqueries, CTEs, Window functions (ROW_NUMBER, DENSE_RANK, LEAD, LAG), Indexing rules, covering indexes, composite indexes.',
  },
  'checklists/day10': {
    category: 'Weeks 3–4: Advanced Java',
    icon: '📅',
    title: 'Day 10: Generics, JMM & Consolidation',
    description: 'Generics PECS wildcards, type erasure, Java Memory Model happens-before rules, equals/hashCode contract, Phase 1 review.',
  },
  'checklists/day11': {
    category: 'Weeks 3–4: Advanced Java',
    icon: '📅',
    title: 'Day 11: Collections Framework Deep Dive',
    description: 'Collections Framework Deep Dive — Internals, Concurrency, Iterators & 80 Interview Q&A Cards.',
  },
  'checklists/day12': {
    category: 'Weeks 3–4: Advanced Java',
    icon: '📅',
    title: 'Day 12: Senior Java Design Patterns',
    description: 'Design Patterns — 12 Essential Patterns Every Senior Java Engineer Must Know.',
  },
  'checklists/day13': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 13: System Design Fundamentals',
    description: 'System Design Fundamentals — Scaling, CAP, Caching, Sharding, Rate Limiting & High-RPS Architecture.',
  },
  'checklists/day14': {
    category: 'Weeks 7–8: Microservices & Cloud',
    icon: '📅',
    title: 'Day 14: Microservices Patterns Part 2',
    description: 'Microservices Patterns Part 2 — Saga, CQRS, Event Sourcing, Outbox, Distributed Tracing & API Gateway.',
  },
  'checklists/day15': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 15: Phase 2 Full Review & Blitz',
    description: 'Collections, Design Patterns, System Design, Microservices Patterns — Full Review + 60-Question Blitz + Whiteboard Design.',
  },
  'checklists/day16': {
    category: 'Weeks 5–6: Spring Boot',
    icon: '📅',
    title: 'Day 16: Spring Boot Internals',
    description: 'Spring Boot Internals — Auto-Configuration, Bean Lifecycle, AOP, Actuator & Micrometer.',
  },
  'checklists/day17': {
    category: 'Weeks 5–6: Spring Boot',
    icon: '📅',
    title: 'Day 17: Spring Boot Testing Slices',
    description: 'Spring Boot Testing — Slices, Mocking, Testcontainers, WireMock & Testing Async/Transactional Code.',
  },
  'checklists/day18': {
    category: 'Weeks 5–6: Spring Boot',
    icon: '📅',
    title: 'Day 18: REST API Design & HTTP',
    description: 'REST API Design and HTTP Fundamentals.',
  },
  'checklists/day19': {
    category: 'Weeks 5–6: Spring Boot',
    icon: '📅',
    title: 'Day 19: Spring Security & JWT',
    description: 'Security — JWT, OAuth2, Spring Security, RBAC and Common Vulnerabilities.',
  },
  'checklists/day20': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 20: Spring Internals Review',
    description: 'Spring Boot Internals, Testing, REST API Design and Security — Full Review + 60-Question Blitz + Whiteboard Design.',
  },
  'checklists/day21': {
    category: 'Weeks 7–8: Microservices & Cloud',
    icon: '📅',
    title: 'Day 21: Advanced Kafka Operations',
    description: 'Advanced Kafka — Producers, Consumers, Exactly-Once, Kafka Streams and Operations.',
  },
  'checklists/day22': {
    category: 'Weeks 7–8: Microservices & Cloud',
    icon: '📅',
    title: 'Day 22: Advanced AWS Architectures',
    description: 'Advanced AWS — EC2, S3, RDS, Lambda, IAM, VPC and CloudWatch.',
  },
  'checklists/day24': {
    category: 'Weeks 3–4: Advanced Java',
    icon: '📅',
    title: 'Day 24: DSA Arrays & Strings',
    description: 'DSA — Arrays and Strings: Patterns for Interview Coding Rounds.',
  },
  'checklists/day29': {
    category: 'Weeks 3–4: Advanced Java',
    icon: '📅',
    title: 'Day 29: DSA Sorting & Binary Search',
    description: 'DSA — Sorting Algorithms and Binary Search Patterns.',
  },
  'checklists/day30': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 30: Mock Coding & Full Review',
    description: 'SQL, Arrays, Linked Lists, Trees, Graphs, Dynamic Programming and Sorting — Full Review + 60-Question Blitz + Mock Coding.',
  },
  'checklists/day31': {
    category: 'Weeks 7–8: Microservices & Cloud',
    icon: '📅',
    title: 'Day 31: Terraform Deep Dive',
    description: 'Terraform Deep Dive — Modules, State, Workspaces, Variables and Enterprise Patterns.',
  },
  'checklists/day32': {
    category: 'Weeks 7–8: Microservices & Cloud',
    icon: '📅',
    title: 'Day 32: Docker & Kubernetes Microservices',
    description: 'Docker and Kubernetes — Containers, Deployments, Services and Running Java Microservices.',
  },
  'checklists/day33': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 33: System Design — URL Shortener',
    description: 'System Design — URL Shortener End-to-End.',
  },
  'checklists/day43': {
    category: 'Weeks 7–8: Microservices & Cloud',
    icon: '📅',
    title: 'Day 43: Microservices Observability',
    description: 'Microservices Observability — OpenTelemetry, Distributed Tracing and Production Debugging.',
  },
  'checklists/day44': {
    category: 'Weeks 7–8: Microservices & Cloud',
    icon: '📅',
    title: 'Day 44: API Gateway Design Patterns',
    description: 'API Gateway Patterns — Spring Cloud Gateway, Rate Limiting, Circuit Breaking and Security.',
  },
  'checklists/day46': {
    category: 'Weeks 5–6: Spring Boot',
    icon: '📅',
    title: 'Day 46: WebFlux & Reactive Programming',
    description: 'WebFlux and Reactive Programming — Project Reactor, Backpressure and When to Use It.',
  },
  'checklists/day47': {
    category: 'Weeks 3–4: Advanced Java',
    icon: '📅',
    title: 'Day 47: Performance Tuning & Profiling',
    description: 'Performance Tuning — Profiling, Bottleneck Identification and JVM Optimisation.',
  },
  'checklists/day48': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 48: PostgreSQL Internals & MVCC',
    description: 'Database Deep Dive — PostgreSQL Internals, MVCC, Indexes and Query Optimisation.',
  },
  'checklists/day49': {
    category: 'Weeks 7–8: Microservices & Cloud',
    icon: '📅',
    title: 'Day 49: Resilience4j Patterns Deep Dive',
    description: 'Resilience Patterns — Resilience4j Deep Dive: Circuit Breaker, Bulkhead, Retry and Timeout.',
  },
  'checklists/day51': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 51: Mock Interview Round 1 — Coding',
    description: 'Full Mock Interview Round 1 — Coding (2 DSA Problems) and System Design.',
  },
  'checklists/day52': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 52: Mock Interview Round 2 — Java',
    description: 'Full Mock Interview Round 2 — Core Java and Spring Boot Deep Questions.',
  },
  'checklists/day53': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 53: Mock Interview Round 3 — Cloud',
    description: 'Full Mock Interview Round 3 — Kafka, AWS and Security Scenario Questions.',
  },
  'checklists/day55': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 55: Resume Narratives & Projects',
    description: 'Resume and Experience Narratives — Connecting Your Projects to Interview Answers.',
  },
  'checklists/day56': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 56: STAR Behavioral Interview Prep',
    description: 'Behavioural Interview Prep — STAR Stories, Leadership and Communication.',
  },
  'checklists/day57': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 57: Mock Interview Gap Analysis',
    description: 'Final Weak Spots — Personalised Revision Based on Your Mock Interview Gaps.',
  },
  'checklists/day58': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 58: Final Revision — Java & Spring',
    description: 'Final Revision Day 1 — Core Java, Collections, Spring Boot and Testing.',
  },
  'checklists/day59': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 59: Final Revision — Cloud & Design',
    description: 'Final Revision Day 2 — Kafka, AWS, Security, REST and System Design.',
  },
  'checklists/day60': {
    category: 'Weeks 9–10: System Design',
    icon: '📅',
    title: 'Day 60: Closing Mindset & Reference',
    description: 'Final Day — Interview Day Checklist, Master Reference and Closing Mindset.',
  },

  // ── Key Topics: System Design & Architecture ──────────────────
  'key-topics/acid_properties_masterclass': {
    category: 'System Design & Architecture',
    icon: '💾',
    title: 'ACID Properties Masterclass',
    description: 'Interactive visual simulator deep dive into transaction isolation, atomicity, consistency, and WAL logs.',
  },
  'key-topics/api_gateway_masterclass': {
    category: 'System Design & Architecture',
    icon: '🚧',
    title: 'API Gateway Masterclass',
    description: 'Master request routing, rate limiting, and centralized authentication for microservices.',
  },
  'key-topics/api_rate_limiting_masterclass': {
    category: 'System Design & Architecture',
    icon: '🚦',
    title: 'API Rate Limiting Masterclass',
    description: 'Token bucket, leaky bucket, and sliding window log concurrency controls.',
  },
  'key-topics/client_server_model_architecture': {
    category: 'System Design & Architecture',
    icon: '💻',
    title: 'Client-Server Architecture',
    description: 'Visualizing network flows, sockets, DNS lookup, and HTTP request-response cycles.',
  },
  'key-topics/enterprise_load_balancer_flow': {
    category: 'System Design & Architecture',
    icon: '⚖️',
    title: 'Enterprise Load Balancer Flow',
    description: 'Master Layer 4 vs Layer 7 load balancing, sticky sessions, and failover routing.',
  },
  'key-topics/enterprise_service_discovery_reel': {
    category: 'System Design & Architecture',
    icon: '🔍',
    title: 'Service Discovery Reel',
    description: 'Master dynamic registry architecture, client-side load balancing, and Eureka heartbeats.',
  },
  'key-topics/fintech_resilience_masterclass': {
    category: 'System Design & Architecture',
    icon: '🛡️',
    title: 'Fintech Resilience Masterclass',
    description: 'Master Circuit Breakers, Bulkheads, Retries, and Fallbacks under peak load.',
  },
  'key-topics/fintech_saga_pattern_masterclass': {
    category: 'System Design & Architecture',
    icon: '💸',
    title: 'Fintech Saga Pattern Masterclass',
    description: 'Design transaction workflows using Orchestration and Choreography Sagas.',
  },
  'key-topics/microservice_communication_masterclass': {
    category: 'System Design & Architecture',
    icon: '💬',
    title: 'Microservice Communication',
    description: 'Synchronous REST/gRPC vs asynchronous Kafka messaging protocols.',
  },
  'key-topics/saga_pattern_flow': {
    category: 'System Design & Architecture',
    icon: '🌊',
    title: 'Saga Pattern Architecture',
    description: 'Design transactional consistency across multiple distributed microservices.',
  },
  'key-topics/spring_cloud_gateway_flow': {
    category: 'System Design & Architecture',
    icon: '🛡️',
    title: 'Spring Cloud Gateway Flow',
    description: 'Explore filters, predicates, load balancing, and routing tables.',
  },
  'key-topics/system_design_sandbox': {
    category: 'System Design & Architecture',
    icon: '🏗️',
    title: 'System Design Sandbox',
    description: 'Interactive architecture builder. Drag 30 AWS/backend components, draw connections, run the resilience analyzer, and export your diagram as JSON.',
  },

  // ── Key Topics: Java Memory & Concurrency Reels ──────────────
  'key-topics/concurrenthashmap_internals_reel': {
    category: 'Java Memory & Concurrency Reels',
    icon: '🎞️',
    title: 'ConcurrentHashMap Internals Reel',
    description: 'Segment-based locking vs CAS node-level locking animations.',
  },
  'key-topics/functional_interfaces_reel': {
    category: 'Java Memory & Concurrency Reels',
    icon: '⚙️',
    title: 'Functional Interfaces Reel',
    description: 'Interactive animation covering Predicate, Function, Consumer, and Supplier.',
  },
  'key-topics/hashmap_internal_flow_reel': {
    category: 'Java Memory & Concurrency Reels',
    icon: '🗺️',
    title: 'HashMap Internals Reel',
    description: 'Visualize bucket arrays, hash collisions, linked lists, and red-black tree conversions.',
  },
  'key-topics/java_8_aurora_reel': {
    category: 'Java Memory & Concurrency Reels',
    icon: '🌅',
    title: 'Java 8 Features Reel',
    description: 'Master Lambda expressions, streams pipelines, and dynamic method references.',
  },
  'key-topics/java_core_concepts_reel': {
    category: 'Java Memory & Concurrency Reels',
    icon: '📚',
    title: 'Java Core Concepts Reel',
    description: 'Explore garbage collection phases, class loader hierarchies, and memory layers.',
  },
  'key-topics/java_memory_internals_reel': {
    category: 'Java Memory & Concurrency Reels',
    icon: '🧠',
    title: 'Java Memory Internals Reel',
    description: 'Explore Stack, Heap, Metaspace, and garbage collection mechanisms.',
  },
  'key-topics/java_string_internals_reel': {
    category: 'Java Memory & Concurrency Reels',
    icon: '🧵',
    title: 'Java String Internals Reel',
    description: 'Visualizing the String Constant Pool, immutability, and memory optimizations.',
  },
  'key-topics/jvm_architecture_deep_dive': {
    category: 'Java Memory & Concurrency Reels',
    icon: '⚙️',
    title: 'JVM Architecture Deep Dive',
    description: 'Interactive exploration of Class Loaders, Execution Engine, and JIT compiler.',
  },
  'key-topics/spring_bean_lifecycle_reel': {
    category: 'Java Memory & Concurrency Reels',
    icon: '♻️',
    title: 'Spring Bean Lifecycle Reel',
    description: 'Visualize instantiation, dependency injection, aware callbacks, and destruction.',
  },

  // ── Key Topics: Design Patterns & Web Masterclasses ──────────
  'key-topics/enterprise_rest_masterclass': {
    category: 'Design Patterns & Web Masterclasses',
    icon: '🌐',
    title: 'Enterprise REST Masterclass',
    description: 'Best practices for designing scalable, secure, and idempotent RESTful APIs.',
  },
  'key-topics/factory_patterns_masterclass': {
    category: 'Design Patterns & Web Masterclasses',
    icon: '🏭',
    title: 'Factory Patterns Masterclass',
    description: 'Visualizing Simple Factory, Factory Method, and Abstract Factory patterns.',
  },
  'key-topics/java_exceptions_masterclass': {
    category: 'Design Patterns & Web Masterclasses',
    icon: '⚠️',
    title: 'Java Exceptions Masterclass',
    description: 'Checked vs unchecked exceptions, custom hierarchies, and transaction rollbacks.',
  },
  'key-topics/jwt_stateless_auth_flow': {
    category: 'Design Patterns & Web Masterclasses',
    icon: '🔑',
    title: 'JWT Stateless Auth Flow',
    description: 'Visualizing access tokens, signatures, signature verification, and secure cookie storage.',
  },
  'key-topics/singleton_pattern_masterclass': {
    category: 'Design Patterns & Web Masterclasses',
    icon: '👤',
    title: 'Singleton Pattern Masterclass',
    description: 'Master thread-safe double-checked locking, enum Singletons, and reflection safety.',
  },
  'key-topics/spring_boot_3_tier_architecture': {
    category: 'Design Patterns & Web Masterclasses',
    icon: '🏢',
    title: 'Spring Boot 3-Tier Architecture',
    description: 'Explore Controller, Service, and Repository layers with clean DTO flow.',
  },
  'key-topics/spring_boot_actuator_claude_theme': {
    category: 'Design Patterns & Web Masterclasses',
    icon: '📈',
    title: 'Spring Boot Actuator Masterclass',
    description: 'Monitor application health, metrics, trace logging, and production endpoints.',
  },
  'key-topics/spring_boot_configuration_reel': {
    category: 'Design Patterns & Web Masterclasses',
    icon: '⚙️',
    title: 'Spring Boot Config Reel',
    description: 'Visualizing application properties, profiles, and configuration injection.',
  },
  'key-topics/spring_boot_request_flow': {
    category: 'Design Patterns & Web Masterclasses',
    icon: '📥',
    title: 'Spring Boot Request Flow',
    description: 'Trace the journey of an HTTP request from DispatcherServlet to the DB.',
  },
  'key-topics/spring_mvc_routing_engine_reel': {
    category: 'Design Patterns & Web Masterclasses',
    icon: '🗺️',
    title: 'Spring MVC Routing Engine',
    description: 'Trace DispatcherServlet, HandlerMapping, and ViewResolver logic.',
  },
  'key-topics/spring_boot_routing_engine': {
    category: 'Design Patterns & Web Masterclasses',
    icon: '🧭',
    title: 'Spring Boot Routing Engine',
    description: 'Master endpoint mapping, HTTP message converters, handler adapters, and filter interceptors.',
  },
};

