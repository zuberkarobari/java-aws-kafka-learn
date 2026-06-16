import re

def transpile(tsx_path, html_path):
    with open(tsx_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the custom styles
    styles_match = re.search(r'const globalStyles = `(.*?)`;', content, re.DOTALL)
    styles = styles_match.group(1) if styles_match else ""

    # Extract the different views
    views = {}
    view_names = ["MonolithVsMicroservices", "ProsAndCons", "WhenNotToUse", "DecompositionStrategies", "DatabasePerService"]
    
    for view in view_names:
        # Match `const Name = () => (` until `);`
        match = re.search(rf'const {view} = \(\) => \((.*?)\n\);\n', content, re.DOTALL)
        if match:
            views[view] = match.group(1)
        else:
            # Maybe it uses `AnimatedSection>`
            match = re.search(rf'const {view} = \(\) => \((.*?)</AnimatedSection>\n\);', content, re.DOTALL)
            if match:
                views[view] = match.group(1) + "</AnimatedSection>"
    
    # Process each view:
    # 1. className -> class
    # 2. Badge replacement
    # 3. AnimatedSection replacement
    # 4. Icon replacements
    # 5. style={{...}} -> string styles (approximate, only a few exist)
    
    colors = {
        "blue": "bg-blue-500/10 text-blue-400 border-blue-500/20",
        "green": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        "red": "bg-rose-500/10 text-rose-400 border-rose-500/20",
        "purple": "bg-purple-500/10 text-purple-400 border-purple-500/20",
        "yellow": "bg-amber-500/10 text-amber-400 border-amber-500/20",
        "pink": "bg-pink-500/10 text-pink-400 border-pink-500/20"
    }
    
    def process_jsx(jsx):
        jsx = jsx.replace('className=', 'class=')
        
        # Badge
        jsx = re.sub(r'<Badge color="([^"]+)">([^<]+)</Badge>', lambda m: f'<span class="px-3 py-1 rounded-full text-xs font-semibold border {colors.get(m.group(1), colors["blue"])}">{m.group(2)}</span>', jsx)
        jsx = re.sub(r'<Badge>([^<]+)</Badge>', lambda m: f'<span class="px-3 py-1 rounded-full text-xs font-semibold border {colors["blue"]}">{m.group(1)}</span>', jsx)
        
        # AnimatedSection
        jsx = re.sub(r'<AnimatedSection delay="([^"]+)">', r'<div class="animate-fade-up \1">', jsx)
        jsx = re.sub(r'<AnimatedSection>', r'<div class="animate-fade-up">', jsx)
        jsx = jsx.replace('</AnimatedSection>', '</div>')
        
        # Icons <Layout size={16} /> -> <i data-lucide="layout" width="16" height="16"></i>
        # Convert CamelCase to dash-case
        def icon_repl(m):
            name = re.sub(r'(?<!^)(?=[A-Z])', '-', m.group(1)).lower()
            attrs = m.group(2)
            # extract size
            size_m = re.search(r'size={(\d+)}', attrs)
            size = size_m.group(1) if size_m else "24"
            # extract class
            class_m = re.search(r'class="([^"]+)"', attrs)
            cls = f' class="{class_m.group(1)}"' if class_m else ""
            return f'<i data-lucide="{name}" width="{size}" height="{size}"{cls}></i>'
            
        jsx = re.sub(r'<([A-Z][a-zA-Z]+)([^>]*)/>', icon_repl, jsx)
        
        # Maps like map((item, i) => ...) are tricky. We have to evaluate them or hardcode.
        # Since evaluating JS in Python is hard, let's just let the browser do it? No, browser can't do React.
        # So I will just use a simpler HTML template and insert the content!
        return jsx

    # Actually, a much easier approach is to use babel standalone and just render the component!
    # I can write an HTML file that includes Babel, React, ReactDOM, and Tailwind CSS.
    # We can load Lucide icons using a script.
    
    html_template = f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <title>Microservices Fundamentals</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- We will map lucide icons to a global object -->
    <style>
    {styles}
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" data-type="module">
        const {{ useState, useEffect }} = React;
        
        // Mock lucide-react imports by using window.lucide
        // We will create wrapper components for all icons used
        const createIcon = (name) => (props) => {{
            const ref = React.useRef(null);
            React.useEffect(() => {{
                if (ref.current) {{
                    window.lucide.createIcons({{
                        icons: {{ [name]: window.lucide.icons[name] }},
                        nameAttr: 'data-lucide',
                        root: ref.current.parentElement
                    }});
                }}
            }}, [props]);
            return <i data-lucide={{name}} className={{props.className}} style={{{{width: props.size || 24, height: props.size || 24}}}} ref={{ref}}></i>;
        }};

        const Layers = createIcon('Layers');
        const Split = createIcon('Split');
        const ThumbsUp = createIcon('ThumbsUp');
        const ThumbsDown = createIcon('ThumbsDown');
        const AlertTriangle = createIcon('AlertTriangle');
        const Database = createIcon('Database');
        const Server = createIcon('Server');
        const Layout = createIcon('Layout');
        const Cpu = createIcon('Cpu');
        const Globe = createIcon('Globe');
        const ShieldAlert = createIcon('ShieldAlert');
        const GitMerge = createIcon('GitMerge');
        const Network = createIcon('Network');
        const Box = createIcon('Box');
        const ArrowRight = createIcon('ArrowRight');
        const Code2 = createIcon('Code2');
        const TerminalSquare = createIcon('TerminalSquare');

        // Original TSX Content below (with imports removed)
{content[content.find('// --- CUSTOM STYLES'):].replace('export default function App', 'function App')}

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
"""

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_template)

transpile('c:/zuber-projects/DONE/study-site/topics/spring-boot/microservices_fundamentals.tsx', 'c:/zuber-projects/DONE/study-site/topics/spring-boot/microservices_fundamentals.html')
