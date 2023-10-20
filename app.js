const fs = require('fs');
const express = require('express');
const app = express();

// 设置静态文件目录，以便浏览器可以访问icons文件夹
app.use('/icons', express.static('icons'));

app.get('/', (req, res) => {
    // 读取icons目录中的文件列表
    fs.readdir('./icons', (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        const icons = files.filter(file => file.endsWith('.svg'));

        // 生成HTML代码
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Skills Page</title>
            <style>
                /* CSS 样式用于布局和外观 */
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                }
                .skills {
                    margin: 20px;
                }
                .skill-icon {
                    width: 50px;
                    height: 50px;
                    margin: 10px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <h1>Skills</h1>
            <!-- 主题选择下拉菜单 -->
            <div>
                <label for="themeSelect">Theme:</label>
                <select id="themeSelect" onchange="updateMarkdown(selectedSkills)">
                    <option value="light" selected>Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>

            <div class="skills">
                <!-- 遍历 icons 文件夹中的 svg 文件作为技能供选择-->
                ${icons.map(icon => {
            if (icon.includes('Dark')) return '';
            const skill = icon.replace('.svg', '').toLocaleLowerCase().replace(/-(light|dark)$/, '');
            return `<img class="skill-icon" src="icons/${icon}" alt="${skill}" onclick="toggleSkill('${skill}')">`;
        }).join('')}
            </div>

            <!-- 用于显示 Markdown 图标的区域 -->
            <div id="markdown-output"></div>
            <!-- Newly added copy button -->
            <button id="copyButton">Copy Markdown</button>
            <script>
            // JavaScript 函数来切换技能状态并生成 Markdown 图标
            const selectedSkills = new Set();
            let selectedTheme = 'light'; // 默认主题为 light
            function toggleSkill(skill) {
                if (selectedSkills.has(skill)) {
                    selectedSkills.delete(skill);
                } else {
                    selectedSkills.add(skill);
                }
            
                // 更新 Markdown 图标
                updateMarkdown([...selectedSkills].join(','));
            }
            
        
            function updateMarkdown(skillList) {
                const themeSelect = document.getElementById('themeSelect').value;
                const markdown = \`[![My Skills](https://skillicons.dev/icons?i=\`+skillList+\`&theme=\`+themeSelect+\`)](https://skillicons.dev)\`;
            
                // 将 Markdown 图标显示在页面上
                document.getElementById('markdown-output').innerHTML = markdown;

                document.querySelectorAll('img').forEach(img => {
                    img.src = themeSelect == 'light' ? img.src.replace('Dark', 'Light') : img.src.replace('Light', 'Dark')
                })
            }

            
            // Add this code at the bottom of your page
                document.addEventListener('DOMContentLoaded', () => {
                const copyButton = document.getElementById('copyButton');
                copyButton.addEventListener('click', () => {
                    const markdown = document.getElementById('markdown-output').innerText;
                    navigator.clipboard.writeText(markdown).then(() => {
                    alert('Markdown has been copied to clipboard');
                    }).catch(err => {
                    alert('Failed to copy');
                    });
                });
                });

        </script>
        


        </body>
        </html>
        `;

        res.send(html);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
