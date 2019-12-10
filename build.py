#!/usr/bin/python3

if __name__ == '__main__':
    with open('script.js') as file:
        script = file.read()

    with open('page.html') as file:
        page = file.read()

    output = f'<script>\n{script}\n</script>\n{page}'

    with open('output.html', 'w') as file:
        file.write(output)
