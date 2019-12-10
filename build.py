#!/usr/bin/python3

if __name__ == '__main__':
    with open('style.css') as file:
        style = file.read()

    with open('script.js') as file:
        script = file.read()

    with open('page.html') as file:
        page = file.read()

    output = f'<style>\n{style}\n</style>\n\n<script>\n{script}\n</script>\n\n{page}'

    with open('output.html', 'w') as file:
        file.write(output)
