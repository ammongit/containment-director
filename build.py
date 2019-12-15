#!/usr/bin/python3

from htmlmin import Minifier
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
    output = template.render(
        style=style,
        script=script,
        page=page,
    )

    minifier = Minifier(
        remove_comments=True,
        remove_empty_space=True,
        remove_all_empty_space=True,
        reduce_boolean_attributes=True,
        remove_optional_attribute_quotes=False,
        keep_pre=True,
    )

    html = minifier.minify(output)

    with open('output.html', 'w') as file:
        file.write(html)
