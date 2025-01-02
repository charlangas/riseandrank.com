import os
import csv

def find_matching_pairs(directory='.'):
  # Get all files in directory
  files = os.listdir(directory)

  # Create sets for html and css files
  html_files = {f.replace('.html', '') for f in files if f.endswith('.html')}
  css_files = {f.replace('.css', '') for f in files if f.endswith('.css')}

  # Find intersection of both sets to get matching pairs
  matching_pairs = sorted(list(html_files.intersection(css_files)))

  # Write to CSV
  output_file = 'matching_pairs.csv'
  with open(output_file, 'w', newline='') as f:
      writer = csv.writer(f)
      writer.writerow(['Base Name'])  # Header
      for pair in matching_pairs:
          writer.writerow([pair])

  print(f"Found {len(matching_pairs)} matching pairs")
  print(f"Results written to {output_file}")
  return matching_pairs

if __name__ == "__main__":
  pairs = find_matching_pairs()
  print("\nMatching pairs found:")
  for pair in pairs:
      print(pair)

# Created/Modified files during execution:
# - matching_pairs.csv