const fs = require('fs');
const path = require('path');

const filesToWrap = [
  'questions and answers/java/java8_interview_prep (2).html',
  'questions and answers/java/multithreading_30qa.html',
  'questions and answers/spring boot/springboot_qa_p1.html',
  'questions and answers/microservices/microservices_top10.html',
  'questions and answers/dsa/dsa_top50_q1_5.html',
  'questions and answers/dsa/dsa_top50_q6_10.html',
  'questions and answers/dsa/dsa_top50_q11_15.html',
  'questions and answers/dsa/dsa_top50_q16_20.html',
  'questions and answers/dsa/dsa_top50_q21_25.html',
  'questions and answers/dsa/dsa_top50_q26_30.html',
  'aws/aws_day14_cloudwatch.html',
  'aws/aws_day15_cicd.html',
  'java/variables_data_types.html',
  'java/java_operators.html',
  'java/java_oop_concepts.html',
  'java/java_collections_framework.html',
  'java/java_streams_api.html'
];

filesToWrap.forEach(relPath => {
  const filePath = path.join(__dirname, '../topics', relPath);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Idempotency check: if it already imports topic.js, skip wrapping!
  if (content.includes('topic.js')) {
    console.log(`File already wrapped: ${relPath}`);
    return;
  }

  console.log(`Wrapping file: ${relPath}`);

  // Calculate dynamic relative path prefix based on segment depth
  const segments = ('topics/' + relPath).split('/');
  const depth = segments.length - 1; // number of parent directories
  const pathPrefix = '../'.repeat(depth);

  // 1. Inject Stylesheets in <head>
  const headEndIndex = content.indexOf('</head>');
  if (headEndIndex === -1) {
    console.error(`No </head> tag found in ${relPath}`);
    return;
  }
  
  const cssInjections = `
  <link rel="stylesheet" href="${pathPrefix}css/styles.css" />
  <link rel="stylesheet" href="${pathPrefix}css/topic.css" />
  `;
  content = content.slice(0, headEndIndex) + cssInjections + content.slice(headEndIndex);

  // 2. Inject <main id="topic-content"> right after <body>
  const bodyStartIndex = content.indexOf('<body>');
  if (bodyStartIndex === -1) {
    console.error(`No <body> tag found in ${relPath}`);
    return;
  }
  
  content = content.slice(0, bodyStartIndex + 6) + '\n  <main id="topic-content">\n' + content.slice(bodyStartIndex + 6);

  // 3. Inject </main> and the module script right before </body>
  const bodyEndIndex = content.indexOf('</body>');
  if (bodyEndIndex === -1) {
    console.error(`No </body> tag found in ${relPath}`);
    return;
  }
  
  const scriptInjections = `
  </main>
  <script type="module" src="${pathPrefix}js/topic.js"></script>
  `;
  content = content.slice(0, bodyEndIndex) + scriptInjections + content.slice(bodyEndIndex);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully wrapped ${relPath}!`);
});
