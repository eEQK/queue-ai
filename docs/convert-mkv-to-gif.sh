#!/bin/bash
# Bash script to convert all MKV files in the current directory to high-quality GIFs using ffmpeg
# Place this script in the docs folder and run it from there

set -e

for mkv_file in *.mkv; do
    if [ -f "$mkv_file" ]; then
        # Get the base name without extension
        base_name="${mkv_file%.mkv}"
        output_file="${base_name}.gif"
        
        echo "Converting $mkv_file to $output_file ..."
        
        # High quality GIF conversion using ffmpeg with palette optimization
        # Step 1: Generate optimized palette
        ffmpeg -y -i "$mkv_file" -vf "fps=30,scale=1920:-1:flags=lanczos,palettegen=stats_mode=diff" "${base_name}_palette.png"
        
        # Step 2: Use the palette for high-quality GIF conversion
        ffmpeg -y -i "$mkv_file" -i "${base_name}_palette.png" -lavfi "fps=30,scale=1920:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" "$output_file"
        
        # Clean up temporary palette file
        rm "${base_name}_palette.png"
        
        echo "Done: $output_file"
    fi
done

echo "All conversions complete. MKV files are preserved."
