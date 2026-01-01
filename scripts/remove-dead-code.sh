#!/bin/bash
# High Surf Corp - Dead Code Removal Script
# This script removes unused files identified in the performance audit
# Total savings: ~2.7 MB

set -e
cd "$(dirname "$0")/.."

echo "High Surf Corp - Dead Code Removal"
echo "==================================="
echo ""

# Track total bytes removed
TOTAL=0

# Function to remove file and track size
remove_file() {
    if [ -f "$1" ]; then
        SIZE=$(stat -f%z "$1" 2>/dev/null || stat -c%s "$1" 2>/dev/null)
        rm -f "$1"
        TOTAL=$((TOTAL + SIZE))
        echo "✓ Removed: $1 ($SIZE bytes)"
    else
        echo "⊘ Skipped (not found): $1"
    fi
}

# Function to remove directory
remove_dir() {
    if [ -d "$1" ]; then
        rmdir "$1" 2>/dev/null && echo "✓ Removed directory: $1" || echo "⊘ Directory not empty: $1"
    fi
}

echo "Phase 1: Removing unused font..."
remove_file "dist/fonts/Boska-LightItalic.ttf"

echo ""
echo "Phase 2: Removing empty directories..."
remove_dir "dist/js/logs"

echo ""
echo "Phase 3: Removing placeholder SVGs..."
remove_file "dist/images/placeholder.svg"
remove_file "dist/images/rich-text-image-placeholder.svg"

echo ""
echo "Phase 4: Removing unused magicpattern images..."
remove_file "dist/images/magicpattern-bevXKKL7E9g-unsplash.jpg"
remove_file "dist/images/magicpattern-bevXKKL7E9g-unsplash-p-3200.jpg"
remove_file "dist/images/magicpattern-bevXKKL7E9g-unsplash-p-2600.jpg"
remove_file "dist/images/magicpattern-bevXKKL7E9g-unsplash-p-2000.jpg"
remove_file "dist/images/magicpattern-bevXKKL7E9g-unsplash-p-1600.jpg"
remove_file "dist/images/magicpattern-bevXKKL7E9g-unsplash-p-1080.jpg"
remove_file "dist/images/magicpattern-bevXKKL7E9g-unsplash-p-800.jpg"
remove_file "dist/images/magicpattern-bevXKKL7E9g-unsplash-p-500.jpg"
remove_file "dist/images/magicpattern-bevXKKL7E9g-unsplash-p-130x130q80.jpg"

echo ""
echo "Phase 5: Removing unused highsurf-corp-1 images..."
remove_file "dist/images/highsurf-corp-1.jpg"
remove_file "dist/images/highsurf-corp-1-p-800.jpg"
remove_file "dist/images/highsurf-corp-1-p-500.jpg"
remove_file "dist/images/highsurf-corp-1-p-130x130q80.jpg"

echo ""
echo "Phase 6: Removing unused AVIF images..."
remove_file "dist/images/High-Surf-Corp-012_1High Surf Corp-012.avif"
remove_file "dist/images/High-Surf-Corp-Merritt-Island_1High Surf Corp Merritt Island.avif"

echo ""
echo "==================================="
echo "Dead code removal complete!"
echo "Total bytes removed: $TOTAL"
echo "Total MB removed: $(echo "scale=2; $TOTAL / 1048576" | bc) MB"
