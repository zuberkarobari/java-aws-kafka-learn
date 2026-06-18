import os
import glob

directory = r'c:\zuber-projects\DONE\study-site\topics\checklists'
files = glob.glob(os.path.join(directory, 'day*.html'))
script_tag = '<script type="module" src="../../js/topic.js"></script>\n'

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '../../js/topic.js' not in content:
        # Insert just before </body>
        if '</body>' in content:
            new_content = content.replace('</body>', script_tag + '</body>')
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {os.path.basename(fpath)}")
