import os
import re

# The correct color variables (specific list)
color_variables = {
  '--primary-color': '#24396E',
  '--primary-color-opacity': '#24396E00',
  '--primary-color-opacity2': '#24396EA8',
  '--primary-color-hover': '#24396E',
  '--secondary-color': '#24396E',
  '--text-primary': '#24396E',
  '--text-secondary': '#1d1e21',
  '--text-contrast': '#fff',
  '--background-light': '#f9fafb',
  '--background-white': '#ffffff',
  '--background-primary': '#4D70CC',
  '--background-secondary': '#4D70CC',
  '--background-light-color': '#FAF8F3',
  '--footer-background': '#24396E'
}

def is_incomplete_colors(content):
  # Find the :root section
  root_match = re.search(r':root\s*{([^}]*)}', content, re.DOTALL)
  if not root_match:
      return False

  root_content = root_match.group(1)

  # Check for incomplete declarations of our specific color variables
  for var_name in color_variables.keys():
      # Find the declaration for this variable
      var_match = re.search(f'{var_name}:\s*([^;]*);', root_content)
      if var_match:
          value = var_match.group(1).strip()
          # Consider it incomplete if empty or doesn't start with #
          if not value or (not value.startswith('#') and var_name != '--text-contrast'):
              return True
  return False

def fix_css_files(directory='.'):
  modified_files = []

  for root, _, files in os.walk(directory):
      for file in files:
          if file.endswith('.css'):
              file_path = os.path.join(root, file)

              with open(file_path, 'r', encoding='utf-8') as f:
                  content = f.read()

              if ':root' in content and is_incomplete_colors(content):
                  # Find the :root section
                  root_content = re.search(r':root\s*{([^}]*)}', content, re.DOTALL)
                  if root_content:
                      new_root_content = root_content.group(1)

                      # Replace each color variable individually
                      for var_name, value in color_variables.items():
                          # Replace existing declaration or add if missing
                          var_pattern = f'{var_name}:\s*[^;]*;'
                          var_replacement = f'{var_name}: {value};'

                          if re.search(var_pattern, new_root_content):
                              new_root_content = re.sub(var_pattern, var_replacement, new_root_content)
                          else:
                              # Add after the Colors comment if possible
                              if '/* Colors */' in new_root_content:
                                  new_root_content = new_root_content.replace('/* Colors */', f'/* Colors */\n  {var_replacement}')
                              else:
                                  new_root_content = new_root_content + f'\n  {var_replacement}'

                      # Replace the entire :root content
                      new_content = content.replace(root_content.group(1), new_root_content)

                      with open(file_path, 'w', encoding='utf-8') as f:
                          f.write(new_content)

                      modified_files.append(file_path)
                      print(f"Fixed: {file_path}")

  return modified_files

if __name__ == "__main__":
  modified_files = fix_css_files()

  print("\nSummary:")
  print(f"Total files modified: {len(modified_files)}")
  print("\nModified files:")
  for file in modified_files:
      print(file)