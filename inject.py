with open('c:/zuber-projects/DONE/study-site/topics/spring-boot/microservices_fundamentals.html', 'r', encoding='utf-8') as f:
    content = f.read()

head_injection = """
    <link rel="stylesheet" href="../../css/styles.css" />
    <link rel="stylesheet" href="../../css/topic.css" />
"""

body_injection = """
    <script type="module" src="../../js/topic.js"></script>
"""

content = content.replace('</head>', head_injection + '</head>')
content = content.replace('</body>', body_injection + '</body>')

# Note: The component already has its own layout so we DO NOT wrap it in <main id="topic-content">
# This prevents js/topic.js from trying to render the global sidebar over it.

with open('c:/zuber-projects/DONE/study-site/topics/spring-boot/microservices_fundamentals.html', 'w', encoding='utf-8') as f:
    f.write(content)
