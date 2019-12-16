#!/usr/bin/python3

from jinja2 import Template

if __name__ == '__main__':
    # Read input files
    with open('style.css') as file:
        style = file.read()

    with open('script.js') as file:
        script = file.read()

    with open('page.html') as file:
        page = file.read()

    with open('template.j2') as file:
        raw_template = file.read()

    # Create template
    template = Template(raw_template)
    html = template.render(
        style=style,
        script=script,
        page=page,
    )

    with open('output.html', 'w') as file:
        file.write(html)
