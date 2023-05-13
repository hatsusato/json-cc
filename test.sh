#!/bin/bash

cd "${BASH_SOURCE%/*}"
while read f; do
  diff -u <(yarn -s main "$f") <(./compile.sh "$f")
done < <(find tests -name '*.c')
