import { QUIZZES } from './quizzes.config.js';

let currentTopicId = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let optionSelected = false;

// Initialize the quiz modal structure
const initQuizModalStructure = () => {
  let container = document.getElementById('quiz-modal-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'quiz-modal-container';
    document.body.appendChild(container);
    
    // Inject quiz.css dynamically if not already present
    if (!document.querySelector('link[href*="quiz.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      // Determine the correct path to css/quiz.css based on current location
      const pathPrefix = window.location.pathname.includes('/topics/') ? '../../' : '';
      link.href = pathPrefix + 'css/quiz.css';
      document.head.appendChild(link);
    }
  }
  
  if (container.innerHTML.trim() === '') {
    container.innerHTML = `
      <div class="quiz-overlay" id="quiz-overlay">
        <div class="quiz-modal">
          <div class="quiz-header">
            <div class="quiz-title" id="quiz-title">Knowledge Check</div>
            <button class="quiz-close-btn" id="quiz-close-btn" aria-label="Close Quiz">×</button>
          </div>
          <div class="quiz-progress-container">
            <div class="quiz-progress-fill" id="quiz-progress-fill"></div>
          </div>
          
          <!-- Question Body -->
          <div class="quiz-body" id="quiz-body">
            <div class="quiz-question-meta" id="quiz-question-meta">Question 1 of 3</div>
            <div class="quiz-question-text" id="quiz-question-text"></div>
            <div class="quiz-options" id="quiz-options"></div>
            <div class="quiz-explanation" id="quiz-explanation"></div>
          </div>

          <!-- Results Body -->
          <div class="quiz-results" id="quiz-results">
            <div class="quiz-score-circle">
              <span class="quiz-score-val" id="quiz-score-val">0%</span>
            </div>
            <div class="quiz-result-msg" id="quiz-result-msg"></div>
            <button class="btn-quiz-next show" id="btn-quiz-retry" style="margin-top:20px; display:inline-block;">Retry Quiz</button>
            <button class="btn-quiz-next show" id="btn-quiz-close-result" style="margin-top:10px; display:inline-block; background:var(--text-muted);">Close</button>
          </div>

          <div class="quiz-footer" id="quiz-footer">
            <button class="btn-quiz-next" id="btn-quiz-next">Next Question →</button>
            <button class="btn-quiz-finish" id="btn-quiz-finish">View Results</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('quiz-close-btn').addEventListener('click', closeQuiz);
    document.getElementById('quiz-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'quiz-overlay') closeQuiz();
    });
    document.getElementById('btn-quiz-next').addEventListener('click', nextQuestion);
    document.getElementById('btn-quiz-finish').addEventListener('click', showResults);
    document.getElementById('btn-quiz-retry').addEventListener('click', retryQuiz);
    document.getElementById('btn-quiz-close-result').addEventListener('click', closeQuiz);
  }
};

export const hasQuizForTopic = (topicId) => {
  return !!QUIZZES[topicId];
};

export const openQuiz = (topicId) => {
  if (!QUIZZES[topicId]) {
    console.error(`No quiz found for topic: ${topicId}`);
    return;
  }
  
  initQuizModalStructure();
  
  currentTopicId = topicId;
  currentQuestions = QUIZZES[topicId];
  currentQuestionIndex = 0;
  score = 0;
  optionSelected = false;

  document.getElementById('quiz-body').style.display = 'block';
  document.getElementById('quiz-footer').style.display = 'flex';
  document.getElementById('quiz-results').classList.remove('show');

  renderQuestion();
  
  const overlay = document.getElementById('quiz-overlay');
  overlay.classList.add('active');
};

const closeQuiz = () => {
  const overlay = document.getElementById('quiz-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
};

const renderQuestion = () => {
  optionSelected = false;
  const question = currentQuestions[currentQuestionIndex];
  const total = currentQuestions.length;

  // Update progress
  const progressPercent = (currentQuestionIndex / total) * 100;
  document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;

  // Update text
  document.getElementById('quiz-question-meta').textContent = `Question ${currentQuestionIndex + 1} of ${total}`;
  document.getElementById('quiz-question-text').textContent = question.question;

  // Render options
  const optionsContainer = document.getElementById('quiz-options');
  optionsContainer.innerHTML = '';
  
  question.options.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.innerHTML = `<div class="quiz-option-marker">${String.fromCharCode(65 + index)}</div> <span>${optText}</span>`;
    btn.onclick = () => selectOption(index, btn);
    optionsContainer.appendChild(btn);
  });

  // Reset explanation and buttons
  const expl = document.getElementById('quiz-explanation');
  expl.classList.remove('show');
  expl.textContent = question.explanation || '';
  
  document.getElementById('btn-quiz-next').classList.remove('show');
  document.getElementById('btn-quiz-finish').classList.remove('show');
};

const selectOption = (selectedIndex, buttonElement) => {
  if (optionSelected) return; // Prevent multiple selections
  optionSelected = true;

  const question = currentQuestions[currentQuestionIndex];
  const isCorrect = selectedIndex === question.correctIndex;
  
  if (isCorrect) score++;

  // Style buttons
  const optionsContainer = document.getElementById('quiz-options');
  Array.from(optionsContainer.children).forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === question.correctIndex) {
      btn.classList.add('correct');
    } else if (idx === selectedIndex && !isCorrect) {
      btn.classList.add('wrong');
    }
  });

  // Show explanation
  if (question.explanation) {
    document.getElementById('quiz-explanation').classList.add('show');
  }

  // Show next or finish button
  if (currentQuestionIndex < currentQuestions.length - 1) {
    document.getElementById('btn-quiz-next').classList.add('show');
  } else {
    // Fill progress bar to 100% since it's the last question
    document.getElementById('quiz-progress-fill').style.width = '100%';
    document.getElementById('btn-quiz-finish').classList.add('show');
  }
};

const nextQuestion = () => {
  if (currentQuestionIndex < currentQuestions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  }
};

const showResults = () => {
  document.getElementById('quiz-body').style.display = 'none';
  document.getElementById('quiz-footer').style.display = 'none';
  
  const resultsContainer = document.getElementById('quiz-results');
  resultsContainer.classList.add('show');

  const percent = Math.round((score / currentQuestions.length) * 100);
  document.getElementById('quiz-score-val').textContent = `${percent}%`;

  const msgElement = document.getElementById('quiz-result-msg');
  if (percent === 100) {
    msgElement.textContent = "Perfect! You've mastered this topic! 🏆";
    saveQuizProgress(currentTopicId, percent);
    if(window.showToast) window.showToast('Quiz passed! +50 XP', 'success');
  } else if (percent >= 70) {
    msgElement.textContent = "Great job! You have a solid understanding. 👍";
    saveQuizProgress(currentTopicId, percent);
  } else {
    msgElement.textContent = "Keep studying. Review the topic and try again! 📚";
  }
};

const retryQuiz = () => {
  openQuiz(currentTopicId);
};

const saveQuizProgress = (topicId, scorePercent) => {
  try {
    const scoresMap = JSON.parse(localStorage.getItem('java-learn-quizzes') || '{}');
    // Only save if it's a new high score
    if (!scoresMap[topicId] || scoresMap[topicId] < scorePercent) {
      scoresMap[topicId] = scorePercent;
      localStorage.setItem('java-learn-quizzes', JSON.stringify(scoresMap));
    }
  } catch (e) {
    console.error('Failed to save quiz progress', e);
  }
};
