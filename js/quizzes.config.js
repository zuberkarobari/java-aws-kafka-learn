export const QUIZZES = {
  // Key is the topic.id
  'java/java-basics': [
    {
      question: "Which of the following is NOT a primitive data type in Java?",
      options: ["int", "boolean", "String", "double"],
      correctIndex: 2,
      explanation: "String is a class in Java, not a primitive data type. Primitives include int, boolean, double, char, etc."
    },
    {
      question: "What is the size of an 'int' variable in Java?",
      options: ["8 bits", "16 bits", "32 bits", "64 bits"],
      correctIndex: 2,
      explanation: "An int in Java is a 32-bit signed two's complement integer."
    },
    {
      question: "Which keyword is used to allocate memory for a new object in Java?",
      options: ["malloc", "new", "allocate", "create"],
      correctIndex: 1,
      explanation: "The 'new' keyword is used to create an instance of a class, which allocates memory for it on the heap."
    }
  ],
  'java/java_operators': [
    {
      question: "Which of the following is the equality operator in Java?",
      options: ["=", "==", "===", "equals()"],
      correctIndex: 1,
      explanation: "'==' is the equality operator for primitives. '=' is for assignment, and 'equals()' is a method for comparing object contents."
    },
    {
      question: "What is the result of 10 % 3 in Java?",
      options: ["3", "1", "3.33", "0"],
      correctIndex: 1,
      explanation: "The modulus operator (%) returns the remainder of a division operation. 10 divided by 3 is 3 with a remainder of 1."
    }
  ],
  'java/oops': [
    {
      question: "Which OOP concept is achieved by using interfaces and abstract classes?",
      options: ["Encapsulation", "Polymorphism", "Abstraction", "Inheritance"],
      correctIndex: 2,
      explanation: "Abstraction hides the complex implementation details and only shows the essential features of the object."
    },
    {
      question: "Which keyword is used to inherit a class in Java?",
      options: ["implements", "extends", "inherits", "super"],
      correctIndex: 1,
      explanation: "The 'extends' keyword is used for class inheritance, while 'implements' is used for interfaces."
    }
  ],
  'java/multithreading': [
    {
      question: "Which method must be implemented by all threads created by implementing the Runnable interface?",
      options: ["start()", "run()", "main()", "execute()"],
      correctIndex: 1,
      explanation: "The Runnable interface requires the implementation of a single method: run()."
    },
    {
      question: "What is the purpose of the 'synchronized' keyword in Java?",
      options: ["To start a new thread", "To make a method run faster", "To prevent thread interference and memory consistency errors", "To stop a thread"],
      correctIndex: 2,
      explanation: "The 'synchronized' keyword ensures that only one thread can execute a block of code or a method at a time on a given object monitor."
    }
  ]
};
