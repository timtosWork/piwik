#!/usr/bin/env bash

EXPECTED=$1
PROCESSED=$2

exiftool -all= -overwrite_original "$EXPECTED"
exiftool -all= -overwrite_original "$PROCESSED"

# compare the file byes before running ImageMagick
if cmp "$EXPECTED" "$PROCESSED"; then
    echo "samebytes";
    exit;
fi

compare -metric AE "$EXPECTED" "$PROCESSED" null:
