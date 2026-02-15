#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Font subsetting script
Uses fonttools to subset your font file based on characters in the poetry database

Usage:
    python scripts/subset-font.py /path/to/your-font.ttf [--output output-name.ttf]

Requirements:
    pip install fonttools brotli

Examples:
    # Default output is poetry-font.ttf
    python scripts/subset-font.py ~/Downloads/NotoSerifCJK-Regular.ttf
    
    # Custom output file name
    python scripts/subset-font.py ~/Downloads/font.ttf --output custom-font.ttf
"""

import os
import sys
import argparse
import subprocess
from fontTools.subset import main as subset_main

# Python 2/3 compatibility
try:
    unicode
except NameError:
    # Python 3
    unicode = str

def get_file_size_mb(filepath):
    """Get file size in MB"""
    size_bytes = os.path.getsize(filepath)
    return size_bytes / (1024 * 1024), size_bytes

def format_size(size_bytes):
    """Format file size for display"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return "{:.2f} {}".format(size_bytes, unit)
        size_bytes /= 1024
    return "{:.2f} TB".format(size_bytes)

def read_chars_file(chars_file):
    """Read character file"""
    try:
        # Python 2/3 compatible file reading
        try:
            with open(chars_file, 'r', encoding='utf-8') as f:
                return f.read().strip()
        except TypeError:
            # Python 2 doesn't support encoding parameter
            with open(chars_file, 'r') as f:
                return f.read().strip().decode('utf-8')
    except (IOError, OSError):
        print("ERROR: Character file not found: " + chars_file)
        print("Please run: node scripts/extract-chars.js")
        sys.exit(1)

def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(
        description='Subset font file based on characters in the poetry database',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python scripts/subset-font.py ~/Downloads/NotoSerifCJK-Regular.ttf
  python scripts/subset-font.py ~/Downloads/font.ttf --output custom.ttf
        '''
    )
    
    parser.add_argument('font_file', help='Path to the source font file')
    parser.add_argument('--output', '-o', default='assets/poetry-font.ttf',
                        help='Output filename (default: assets/poetry-font.ttf)')
    parser.add_argument('--chars', default='assets/chars-all.txt',
                        help='Character file path (default: assets/chars-all.txt)')
    parser.add_argument('--format', '-f', choices=['ttf', 'woff2', 'both'],
                        default='both',
                        help='Output format (default: both - generate both TTF and WOFF2)')
    parser.add_argument('--verbose', '-v', action='store_true',
                        help='Show detailed information')
    
    args = parser.parse_args()
    
    # Validate input file
    if not os.path.exists(args.font_file):
        print("ERROR: Font file not found: " + args.font_file)
        sys.exit(1)
    
    # Read character file
    chars = read_chars_file(args.chars)
    
    # Get original file size
    print("Starting font subsetting...")
    print("Source font: " + args.font_file)
    original_size, original_bytes = get_file_size_mb(args.font_file)
    print("Original file size: " + format_size(original_bytes))
    print("Character count: " + str(len(chars)))
    
    # Ensure output directory exists
    output_dir = os.path.dirname(args.output)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Generate TTF format
    if args.format in ['ttf', 'both']:
        output_ttf = args.output if args.output.endswith('.ttf') else args.output.replace('.woff2', '.ttf')
        print("\nGenerating TTF file... (" + output_ttf + ")")
        
        try:
            # Use fonttools subset functionality
            import tempfile
            try:
                # Python 3 with encoding support
                with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', encoding='utf-8', delete=False) as f:
                    f.write(chars)
                    temp_chars_file = f.name
            except TypeError:
                # Python 2 without encoding support
                with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                    if isinstance(chars, unicode):
                        f.write(chars.encode('utf-8'))
                    else:
                        f.write(chars)
                    temp_chars_file = f.name
            
            try:
                subset_args = [
                    args.font_file,
                    '--text-file=' + temp_chars_file,
                    '--output-file=' + output_ttf,
                ]
                
                subset_main(subset_args)
                
                if os.path.exists(output_ttf):
                    ttf_size, ttf_bytes = get_file_size_mb(output_ttf)
                    compression = 100 - (ttf_bytes * 100 // original_bytes)
                    print("SUCCESS: TTF generated!")
                    print("  File size: " + format_size(ttf_bytes))
                    print("  Compression: " + str(compression) + "%")
                else:
                    print("ERROR: TTF file was not generated")
            finally:
                if os.path.exists(temp_chars_file):
                    os.unlink(temp_chars_file)
                    
        except Exception as e:
            print("ERROR: TTF generation failed: " + str(e))
            if args.verbose:
                import traceback
                traceback.print_exc()
    
    # Generate WOFF2 format
    if args.format in ['woff2', 'both'] and os.path.exists(output_ttf if args.format == 'both' else args.output):
        source_file = output_ttf if args.format == 'both' else args.output
        output_woff2 = source_file.replace('.ttf', '.woff2') if source_file.endswith('.ttf') else args.output.replace('.ttf', '.woff2')
        
        print("\nConverting to WOFF2 format... (" + output_woff2 + ")")
        
        try:
            # Try to use woff2_compress (Python 2/3 compatible)
            try:
                # Python 3 with subprocess.run
                import subprocess as sp
                check_result = sp.run(['which', 'woff2_compress'], capture_output=True)
                woff2_available = check_result.returncode == 0
            except (AttributeError, TypeError):
                # Python 2 - use call instead
                woff2_available = subprocess.call(['which', 'woff2_compress'], 
                                                 stdout=subprocess.PIPE, 
                                                 stderr=subprocess.PIPE) == 0
            
            if woff2_available:
                try:
                    # Python 3
                    result = sp.run(
                        ['woff2_compress', source_file],
                        capture_output=True,
                        text=True
                    )
                    result_code = result.returncode
                except (AttributeError, NameError):
                    # Python 2
                    result_code = subprocess.call(['woff2_compress', source_file])
                
                if result_code == 0 and os.path.exists(output_woff2):
                    woff2_size, woff2_bytes = get_file_size_mb(output_woff2)
                    compression = 100 - (woff2_bytes * 100 // original_bytes)
                    print("SUCCESS: WOFF2 generated!")
                    print("  File size: " + format_size(woff2_bytes))
                    print("  Compression: " + str(compression) + "%")
                else:
                    print("WARNING: WOFF2 generation failed, install woff2: brew install woff2")
            else:
                print("WARNING: woff2_compress not found, skipping WOFF2 generation")
                print("  Install: brew install woff2")
        except Exception as e:
            print("WARNING: WOFF2 generation failed: " + str(e))
    
    print("\nNext steps:")
    print("1. Check output files:")
    if args.format in ['ttf', 'both']:
        print("   - " + (output_ttf if args.format == 'both' else args.output))
    if args.format in ['woff2', 'both']:
        print("   - " + (output_woff2 if args.format == 'both' else args.output))
    print("\n2. Put the font file into assets/fonts/ directory")
    print("3. Configure expo-font plugin in app.json")
    print("4. Use custom font in React Native code")
    
    print("\nFont subsetting completed!")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\nUser interrupted")
        sys.exit(130)
    except Exception as e:
        print("ERROR: " + str(e))
        if '-v' in sys.argv or '--verbose' in sys.argv:
            import traceback
            traceback.print_exc()
        sys.exit(1)
